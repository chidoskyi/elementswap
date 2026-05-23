import React, { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useAccount, useChainId, useReadContract, useWriteContract, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import toast from "react-hot-toast";

import { TokenAvatar } from "../components/TokenAvatar";
import { TokenSelectModal } from "../components/TokenSelectModal";
import { SwapSettings } from "../components/SwapSettings";

import { findTokenBySymbol, type Token } from "../data/tokens";
import { getContracts, ROUTER_ABI, ERC20_ABI, PAIR_ABI, explorerTx } from "../lib/contracts";
import { parseUnits, formatDisplay, applySlippage, deadlineTimestamp } from "../lib/decimal-utils";
import { getPairAddress } from "../lib/pool-utils";

type ModalSide = 0 | 1 | null;
const PCT_OPTS = [25, 50, 75, 100];

export function RemoveLiquidityPage() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();

  const [token0, setToken0]     = useState<Token | null>(() => findTokenBySymbol("USDC", chainId) ?? null);
  const [token1, setToken1]     = useState<Token | null>(() => findTokenBySymbol("ACHS", chainId) ?? null);
  const [modal,  setModal]      = useState<ModalSide>(null);
  const [pct,    setPct]        = useState(50);   // percentage to remove
  const [settingsOpen, setSettings] = useState(false);
  const [slippageBps, setSlippage]  = useState(50);
  const [deadlineMin, setDeadline]  = useState(20);
  const [quoteRefreshSec,   setQuoteRefresh]       = useState(30);
  const [recipientAddress,  setRecipientAddress]   = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  let contracts: ReturnType<typeof getContracts> | null = null;
  try { contracts = getContracts(chainId); } catch {}

  /* LP token balance */
  const [pairAddress, setPairAddress] = useState<`0x${string}` | null>(null);

  React.useEffect(() => {
    if (token0 && token1 && chainId) {
      getPairAddress(chainId, token0.address, token1.address).then(addr => setPairAddress(addr));
    }
  }, [token0, token1, chainId]);

  const { data: lpBalance } = useBalance({
    address, token: pairAddress ?? undefined,
    query: { enabled: !!address && !!pairAddress },
  });

  const { data: lpAllowance } = useReadContract({
    address: pairAddress ?? "0x0000000000000000000000000000000000000000",
    abi: PAIR_ABI, functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!pairAddress },
  });

  const { writeContractAsync } = useWriteContract();

  const lpAmt = lpBalance
    ? (lpBalance.value * BigInt(pct)) / 100n
    : 0n;

  const handleSelect = (t: Token) => {
    if (modal === 0) { if (token1?.address === t.address) setToken1(token0); setToken0(t); }
    else             { if (token0?.address === t.address) setToken0(token1); setToken1(t); }
    setPairAddress(null);
  };

  const handleRemove = async () => {
    if (!isConnected || !token0 || !token1 || !contracts || !address || !pairAddress || lpAmt === 0n) return;
    setIsSubmitting(true);
    const id = toast.loading("Waiting for confirmation…");
    try {
      const dl = BigInt(deadlineTimestamp(deadlineMin));
      const min0 = applySlippage(10000n, slippageBps); // simplified — real app reads reserves
      const min1 = applySlippage(10000n, slippageBps);

      /* Approve LP token */
      toast.loading("Approving LP token…", { id });
      await writeContractAsync({
        address:      pairAddress,
        abi:          PAIR_ABI,
        functionName: "approve",
        args:         [contracts.router, lpAmt],
      });

      /* Remove liquidity */
      toast.loading("Removing liquidity…", { id });
      const hash = await writeContractAsync({
        address:      contracts.router,
        abi:          ROUTER_ABI,
        functionName: "removeLiquidity",
        args:         [token0.address, token1.address, lpAmt, min0, min1, address, dl],
      });
      

      toast.success(
        <span>
          Removed {pct}% liquidity from {token0.symbol}/{token1.symbol}
          <br/>
          <a href={explorerTx(chainId, hash)} target="_blank" rel="noreferrer" className="underline text-blue-400 text-xs">View on ARC Scan ↗</a>
        </span>,
        { id, duration: 8000 }
      );
      setPct(50);
    } catch (err: any) {
      toast.error(err?.shortMessage ?? err?.message ?? "Transaction failed", { id });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ready = isConnected && token0 && token1 && pairAddress && (lpBalance?.value ?? 0n) > 0n;

  return (
    <main className="relative z-10 flex justify-center px-4"
          style={{ minHeight: "calc(100vh - 68px)", paddingTop: "calc(68px + 24px)" }}>
      <div className="w-full animate-fade-up" style={{ maxWidth: 520 }}>
        <div className="swap-card p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link href="/pool">
                <a className="w-8 h-8 rounded-xl bg-surface2 flex items-center justify-center
                              text-text2 hover:bg-surface3 hover:text-text1 transition-all duration-150 cursor-pointer">
                  <ArrowLeft size={16} />
                </a>
              </Link>
              <h2 className="text-[20px] font-bold">Remove Liquidity</h2>
            </div>
            <SwapSettings
              open={settingsOpen} onToggle={() => setSettings(v => !v)}
              slippageBps={slippageBps} 
              setSlippage={setSlippage} 
              deadlineMin={deadlineMin} 
              setDeadline={setDeadline} 
              setQuoteRefresh={setQuoteRefresh} 
              quoteRefreshSec={quoteRefreshSec} 
              recipientAddress={recipientAddress}
              setRecipientAddress={setRecipientAddress}
            />
          </div>

          {/* Token pair */}
          <p className="text-[12px] font-semibold text-text2 uppercase tracking-wide mb-2">Select pair</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {([0, 1] as const).map(idx => {
              const tok = idx === 0 ? token0 : token1;
              return (
                <button key={idx} onClick={() => setModal(idx)}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5
                              rounded-2xl border text-[15px] font-semibold cursor-pointer
                              transition-all duration-150
                              ${tok ? "bg-surface2 border-border1 text-text1 hover:bg-surface3" : "text-white border-transparent"}`}
                  style={!tok ? { background: "#fc72ff" } : undefined}
                >
                  <span className="flex items-center gap-2">
                    {tok && <TokenAvatar token={tok} size={20} />}
                    {tok ? tok.symbol : "Select"}
                  </span>
                  <ChevronDown size={14} className="text-text2" />
                </button>
              );
            })}
          </div>

          {/* LP Balance */}
          {pairAddress && (
            <div className="mb-5 px-4 py-3 rounded-2xl bg-surface2 border border-border1">
              <div className="flex justify-between">
                <span className="text-[13px] text-text2">Your LP tokens</span>
                <span className="text-[13px] font-medium text-text1">
                  {lpBalance ? formatDisplay(lpBalance.value, 18) : "0"}
                </span>
              </div>
              {!pairAddress && (
                <p className="text-[12px] text-text3 mt-1">No pair found for these tokens</p>
              )}
            </div>
          )}

          {/* Percentage slider */}
          <p className="text-[12px] font-semibold text-text2 uppercase tracking-wide mb-3">Amount to remove</p>
          <div className="mb-2 px-4 py-5 rounded-2xl bg-surface2 border border-border1 text-center">
            <span className="text-[48px] font-bold text-text1">{pct}%</span>
          </div>
          <input type="range" min="1" max="100" value={pct}
            onChange={e => setPct(Number(e.target.value))}
            className="w-full mb-3 accent-pink"
            style={{ accentColor: "#fc72ff" }}
          />
          <div className="grid grid-cols-4 gap-2 mb-5">
            {PCT_OPTS.map(p => (
              <button key={p} onClick={() => setPct(p)}
                className={`py-2 rounded-xl text-[13px] font-semibold border cursor-pointer
                            transition-all duration-150
                            ${pct === p
                              ? "border-[rgba(252,114,255,0.5)] bg-[rgba(252,114,255,0.1)] text-pink"
                              : "border-border1 bg-surface2 text-text2 hover:text-text1"}`}>
                {p}%
              </button>
            ))}
          </div>

          {/* You will receive */}
          {pairAddress && lpBalance && lpBalance.value > 0n && (
            <div className="mb-5 px-4 py-4 rounded-2xl bg-surface2 border border-border1 space-y-2">
              <p className="text-[12px] font-semibold text-text2 uppercase tracking-wide">You will receive</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {token0 && <TokenAvatar token={token0} size={22} />}
                  <span className="text-[14px] font-medium">{token0?.symbol}</span>
                </div>
                <span className="text-[14px] font-medium text-text2">Estimated</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {token1 && <TokenAvatar token={token1} size={22} />}
                  <span className="text-[14px] font-medium">{token1?.symbol}</span>
                </div>
                <span className="text-[14px] font-medium text-text2">Estimated</span>
              </div>
            </div>
          )}

          {/* Action */}
          {!isConnected ? (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button onClick={openConnectModal} className="action-btn connect">Connect wallet</button>
              )}
            </ConnectButton.Custom>
          ) : (
            <button
              onClick={ready ? handleRemove : undefined}
              disabled={!ready}
              className={`action-btn ${ready ? "ready" : "disabled"}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow inline-block" />
                  Confirming…
                </span>
              ) : !token0 || !token1 ? "Select tokens"
                : !pairAddress      ? "No pair found"
                : (lpBalance?.value ?? 0n) === 0n ? "No LP tokens"
                : "Remove Liquidity"}
            </button>
          )}
        </div>
      </div>

      <TokenSelectModal
        open={modal !== null}
        onClose={() => setModal(null)}
        onSelect={handleSelect}
        exclude={modal === 0 ? token1 : token0}
      />
    </main>
  );
}
