/**
 * pages/WrapUnwrap.tsx
 * Handles USDC → wUSDC (deposit) and wUSDC → USDC (withdraw)
 * as documented in the README: "Wrap/unwrap flows"
 */
import React, { useState } from "react";
import { ArrowDown } from "lucide-react";
import { useAccount, useChainId, useWriteContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import toast from "react-hot-toast";

import { useTokenBalance }  from "../hooks/useTokenBalance";
import { findTokenBySymbol } from "../data/tokens";
import { getContracts, WETH_ABI, explorerTx } from "../lib/contracts";
import { parseUnits, deadlineTimestamp }        from "../lib/decimal-utils";

export function WrapUnwrapPage() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const [mode, setMode]  = useState<"wrap" | "unwrap">("wrap");
  const [amt,  setAmt]   = useState("");
  const [busy, setBusy]  = useState(false);

  let contracts: ReturnType<typeof getContracts> | null = null;
  try { contracts = getContracts(chainId); } catch {}

  const nativeToken  = findTokenBySymbol("USDC",  chainId) ?? null;
  const wrappedToken = findTokenBySymbol("wUSDC", chainId) ?? null;

  const fromToken = mode === "wrap" ? nativeToken  : wrappedToken;
  const toToken   = mode === "wrap" ? wrappedToken : nativeToken;

  const { raw: fromBal, display: fromDisplay } = useTokenBalance(address, fromToken);
  const { display: toDisplay }                  = useTokenBalance(address, toToken);

  const { writeContractAsync } = useWriteContract();

  const handle = async () => {
    if (!isConnected || !contracts || !amt || !address) return;
    const amtBig = parseUnits(amt, 18);
    setBusy(true);
    const id = toast.loading(`${mode === "wrap" ? "Wrapping" : "Unwrapping"}…`);
    try {
      let hash: string;
      if (mode === "wrap") {
        hash = await writeContractAsync({
          address:      contracts.wNative,
          abi:          WETH_ABI,
          functionName: "deposit",
          value:        amtBig,
        });
      } else {
        hash = await writeContractAsync({
          address:      contracts.wNative,
          abi:          WETH_ABI,
          functionName: "withdraw",
          args:         [amtBig],
        });
      }
      toast.success(
        <span>
          {mode === "wrap" ? `Wrapped ${amt} USDC → wUSDC` : `Unwrapped ${amt} wUSDC → USDC`}
          <br/>
          <a href={explorerTx(chainId, hash)} target="_blank" rel="noreferrer"
             className="underline text-blue-400 text-xs">View on ARC Scan ↗</a>
        </span>,
        { id, duration: 6000 }
      );
      setAmt("");
    } catch (err: any) {
      toast.error(err?.shortMessage ?? err?.message ?? "Transaction failed", { id });
    } finally {
      setBusy(false);
    }
  };

  const ready = isConnected && !!amt && parseFloat(amt) > 0 && !!contracts;

  return (
    <main className="relative z-10 flex items-center justify-center px-4"
          style={{ minHeight: "calc(100vh - 68px)", paddingTop: "68px" }}>
      <div className="w-full" style={{ maxWidth: 460 }}>
        <div className="swap-card animate-fade-up">

          {/* Mode toggle */}
          <div className="flex items-center px-4 pt-4 pb-0 gap-0.5">
            {(["wrap","unwrap"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setAmt(""); }}
                className={`px-4 py-2 rounded-2xl border-none cursor-pointer capitalize
                            text-[15px] font-semibold transition-all duration-150
                            ${mode===m ? "text-text1" : "bg-transparent text-text2 hover:text-text1"}`}>
                {m}
              </button>
            ))}
          </div>

          {/* Inputs */}
          <div className="p-2 space-y-0.5">
            <div className="token-box">
              <span className="block text-[13px] font-medium text-text2 mb-2">
                {mode === "wrap" ? "USDC" : "wUSDC"}
              </span>
              <div className="flex items-center gap-2">
                <input type="number" min="0" placeholder="0" value={amt}
                  onChange={e => setAmt(e.target.value)} className="amount-input"/>
                <div className="token-pill-btn selected">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center
                                  text-[10px] font-bold text-white"
                       style={{ background: `linear-gradient(135deg,${fromToken?.color ?? "#9b9b9b,#5d5d5d"})` }}>
                    {fromToken?.symbol[0]}
                  </div>
                  {fromToken?.symbol}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[13px] text-text2">—</span>
                {isConnected && <span className="text-[13px] text-text2">Balance: {fromDisplay}</span>}
              </div>
            </div>

            <div className="flex justify-center items-center h-0 relative z-10">
              <button onClick={() => setMode(m => m === "wrap" ? "unwrap" : "wrap")}
                className="swap-arrow"><ArrowDown size={18}/></button>
            </div>

            <div className="token-box">
              <span className="block text-[13px] font-medium text-text2 mb-2">
                {mode === "wrap" ? "wUSDC" : "USDC"}
              </span>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="0" readOnly value={amt} className="amount-input"/>
                <div className="token-pill-btn selected">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center
                                  text-[10px] font-bold text-white"
                       style={{ background: `linear-gradient(135deg,${toToken?.color ?? "#9b9b9b,#5d5d5d"})` }}>
                    {toToken?.symbol[0]}
                  </div>
                  {toToken?.symbol}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[13px] text-text2">—</span>
                {isConnected && <span className="text-[13px] text-text2">Balance: {toDisplay}</span>}
              </div>
            </div>
          </div>

          <div className="px-3 pb-1">
            <div className="info-row">
              <span className="info-label">Rate</span>
              <span className="info-val">1 : 1</span>
            </div>
            <div className="info-row">
              <span className="info-label">Network fee</span>
              <span className="info-val">~$0.01</span>
            </div>
          </div>

          <div className="p-2 pt-1">
            {!isConnected ? (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button onClick={openConnectModal} className="action-btn connect">Connect wallet</button>
                )}
              </ConnectButton.Custom>
            ) : (
              <button onClick={ready ? handle : undefined}
                disabled={!ready}
                className={`action-btn ${ready ? "ready" : "disabled"}`}>
                {busy
                  ? <span className="flex items-center justify-center gap-3">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow inline-block"/>
                      Confirming…
                    </span>
                  : !amt || parseFloat(amt) <= 0 ? "Enter an amount"
                  : mode === "wrap" ? `Wrap USDC → wUSDC` : `Unwrap wUSDC → USDC`}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
