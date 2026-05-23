import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, Plus } from "lucide-react";
import { Link } from "wouter";
import { useAccount, useChainId, useReadContract, useWriteContract, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import toast from "react-hot-toast";

import { TokenAvatar } from "../components/TokenAvatar";
import { TokenSelectModal } from "../components/TokenSelectModal";
import { SwapSettings } from "../components/SwapSettings";

import { getTokens, findTokenBySymbol, type Token } from "../data/tokens";
import {
  getContracts,
  ROUTER_ABI,
  ERC20_ABI,
  explorerTx,
  ZERO_ADDRESS,
} from "../lib/contracts";
import {
  parseUnits, formatUnits, formatDisplay,
  applySlippage, deadlineTimestamp,
} from "../lib/decimal-utils";
import { useHistoryStore } from "../store/useHistoryStore";

type ModalSide = 0 | 1 | null;

const FEE_TIERS = [
  { label: "0.01%", bps: 1,   desc: "Best for stable pairs"  },
  { label: "0.05%", bps: 5,   desc: "Best for stable pairs"  },
  { label: "0.30%", bps: 30,  desc: "Best for most pairs"    },
  { label: "1.00%", bps: 100, desc: "Best for exotic pairs"  },
];

export function AddLiquidityPage() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();

  const [token0, setToken0]   = useState<Token | null>(() => findTokenBySymbol("USDC",  chainId) ?? null);
  const [token1, setToken1]   = useState<Token | null>(() => findTokenBySymbol("ELMS",  chainId) ?? null);
  const [modal,  setModal]    = useState<ModalSide>(null);

  const [amt0, setAmt0]           = useState("");
  const [amt1, setAmt1]           = useState("");
  const [feeTier, setFeeTier]     = useState(2);
  const [settingsOpen, setSettings] = useState(false);
  const [slippageBps, setSlippage]  = useState(50);
  const [deadlineMin, setDeadline]  = useState(20);
  const [quoteRefreshSec,   setQuoteRefresh]       = useState(30);
  const [recipientAddress,  setRecipientAddress]   = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { add } = useHistoryStore();

  let contracts: ReturnType<typeof getContracts> | null = null;
  try { contracts = getContracts(chainId); } catch {}

  /* balances */
  const { data: bal0 } = useBalance({
    address, token: token0?.isNative ? undefined : token0?.address,
    query: { enabled: !!address && !!token0 },
  });
  const { data: bal1 } = useBalance({
    address, token: token1?.isNative ? undefined : token1?.address,
    query: { enabled: !!address && !!token1 },
  });

  /* allowances */
  const { data: allow0 } = useReadContract({
    address: token0?.address as `0x${string}`,
    abi: ERC20_ABI, functionName: "allowance",
    args: address && contracts ? [address, contracts.router] : undefined,
    query: { enabled: !!address && !!token0 && !token0.isNative && !!contracts },
  });
  const { data: allow1 } = useReadContract({
    address: token1?.address as `0x${string}`,
    abi: ERC20_ABI, functionName: "allowance",
    args: address && contracts ? [address, contracts.router] : undefined,
    query: { enabled: !!address && !!token1 && !token1.isNative && !!contracts },
  });

  const { writeContractAsync } = useWriteContract();

  const handleSelect = (t: Token) => {
    if (modal === 0) {
      if (token1?.address === t.address) setToken1(token0);
      setToken0(t); setAmt0(""); setAmt1("");
    } else {
      if (token0?.address === t.address) setToken0(token1);
      setToken1(t); setAmt0(""); setAmt1("");
    }
  };

  const handleAdd = async () => {
    if (!isConnected || !token0 || !token1 || !amt0 || !amt1 || !contracts || !address) return;
    setIsSubmitting(true);
    const id = toast.loading("Waiting for confirmation…");
    try {
      const a0 = parseUnits(amt0, token0.decimals);
      const a1 = parseUnits(amt1, token1.decimals);
      const min0 = applySlippage(a0, slippageBps);
      const min1 = applySlippage(a1, slippageBps);
      const dl   = BigInt(deadlineTimestamp(deadlineMin));

      /* approve token0 if needed */
      if (!token0.isNative && (allow0 as bigint ?? 0n) < a0) {
        toast.loading("Approving token 0…", { id });
        await writeContractAsync({ address: token0.address, abi: ERC20_ABI, functionName: "approve", args: [contracts.router, a0 * 2n] });
      }
      /* approve token1 if needed */
      if (!token1.isNative && (allow1 as bigint ?? 0n) < a1) {
        toast.loading("Approving token 1…", { id });
        await writeContractAsync({ address: token1.address, abi: ERC20_ABI, functionName: "approve", args: [contracts.router, a1 * 2n] });
      }

    toast.loading("Adding liquidity…", { id });

    const tokenA = token0.address;
    const tokenB = token1.address;

    const hash = await writeContractAsync({
      address: contracts.router,
      abi: ROUTER_ABI,
      functionName: "addLiquidity",
      args: [tokenA, tokenB, a0, a1, min0, min1, address, dl],
    });
     // ── Record in history ──────────────────────────────────────
    add({
        id:          `add_liquidity-${Date.now()}`,
        type:        "add_liquidity",
        status:      "confirmed",
        chainId,
        network:     "ARC Testnet",
        timestamp:   Date.now(),
        txHash:      hash,
        explorerUrl: explorerTx(chainId, hash),
        amountIn:    amt0,
        symbolIn:    token0.symbol,
        amountOut:   amt1,
        symbolOut:   token1.symbol,
        feeDisplay:  `${FEE_TIERS[feeTier].label} fee`,
      });
      // ──────────────────────────────────────────────────────────


    toast.success(
      <span>
        Liquidity added! {amt0} {token0.symbol} + {amt1} {token1.symbol}
        <br/>
        <a 
          href={explorerTx(chainId, hash)} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="underline text-blue-400 text-xs"
        >
          View on ARC Scan ↗
        </a>
      </span>,
      { id, duration: 8000 }
    );
      setAmt0(""); setAmt1("");
    } catch (err: any) {
      toast.error(err?.shortMessage ?? err?.message ?? "Transaction failed", { id });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* button state */
  const ready = isConnected && token0 && token1 && amt0 && amt1 && parseFloat(amt0) > 0 && parseFloat(amt1) > 0;

  return (
    <main className="relative z-10 flex justify-center px-4 py-8"
          style={{ minHeight: "calc(100vh - 68px)", paddingTop: "calc(68px + 24px)" }}>
      <div className="w-full animate-fade-up" style={{ maxWidth: 520 }}>

        {/* Card */}
        <div className="swap-card p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link href="/pool">
                <span className="w-8 h-8 rounded-xl bg-surface2 flex items-center justify-center
                              text-text2 hover:bg-surface3 hover:text-text1 transition-all duration-150 cursor-pointer">
                  <ArrowLeft size={16} />
                </span>
              </Link>
              <h2 className="text-[20px] font-bold">Add Liquidity</h2>
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

          {/* Token pair selectors */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {([0, 1] as const).map(idx => {
              const tok = idx === 0 ? token0 : token1;
              return (
                <div key={idx}>
                  <p className="text-[12px] font-semibold text-text2 uppercase tracking-wide mb-2">
                    Token {idx + 1}
                  </p>
                  <button onClick={() => setModal(idx)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5
                                rounded-2xl border text-[15px] font-semibold cursor-pointer
                                transition-all duration-150
                                ${tok
                                  ? "bg-surface2 border-border1 text-text1 hover:bg-surface3"
                                  : "text-white border-transparent"}`}
                    style={!tok ? { background: "#fc72ff", boxShadow: "0 0 12px rgba(252,114,255,0.35)" } : undefined}
                  >
                    <span className="flex items-center gap-2">
                      {tok && <TokenAvatar token={tok} size={20} />}
                      {tok ? tok.symbol : "Select"}
                    </span>
                    <ChevronDown size={14} className="text-text2" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Fee tier */}
          <p className="text-[12px] font-semibold text-text2 uppercase tracking-wide mb-2">Fee tier</p>
          <div className="grid grid-cols-4 gap-2 mb-5">
            {FEE_TIERS.map((f, i) => (
              <button key={i} onClick={() => setFeeTier(i)}
                className={`fee-card ${feeTier === i ? "active" : ""}`}>
                <div className={`text-[13px] font-bold ${feeTier === i ? "text-pink" : "text-text1"}`}>{f.label}</div>
                <div className="text-[10px] text-text2 mt-0.5 leading-tight">{f.desc}</div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-border1 mb-5" />

          {/* Deposit amounts */}
          <p className="text-[12px] font-semibold text-text2 uppercase tracking-wide mb-3">Deposit amounts</p>
          <div className="space-y-2 mb-5">
            {([0, 1] as const).map(idx => {
              const tok = idx === 0 ? token0 : token1;
              const val = idx === 0 ? amt0 : amt1;
              const set = idx === 0 ? setAmt0 : setAmt1;
              const bal = idx === 0 ? bal0 : bal1;
              return (
                <div key={idx} className="token-box">
                  <span className="block text-[13px] font-medium text-text2 mb-2">Token {idx + 1}</span>
                  <div className="flex items-center gap-3">
                    <input type="number" placeholder="0" value={val}
                      onChange={e => set(e.target.value)}
                      className="amount-input" style={{ fontSize: 24 }} />
                    <div className="flex items-center gap-2 px-3 py-2 rounded-2xl
                                    bg-surface3 text-[14px] font-semibold text-text1 flex-shrink-0">
                      {tok ? <><TokenAvatar token={tok} size={20} />{tok.symbol}</> : <span className="text-text2">—</span>}
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[13px] text-text2">
                      {val ? `$${(parseFloat(val) * 1.001).toFixed(2)}` : "—"}
                    </span>
                    {bal && (
                      <span className="text-[13px] text-text2">
                        Balance: {formatDisplay(bal.value, tok?.decimals ?? 18)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action */}
          {!isConnected ? (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button onClick={openConnectModal} className="action-btn connect">Connect wallet</button>
              )}
            </ConnectButton.Custom>
          ) : (
            <button
              onClick={ready ? handleAdd : undefined}
              disabled={!ready}
              className={`action-btn ${ready ? "ready" : "disabled"}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow inline-block" />
                  Confirming…
                </span>
              ) : !token0 || !token1 ? "Select tokens"
                : !amt0 || !amt1    ? "Enter amounts"
                : "Add Liquidity"}
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
