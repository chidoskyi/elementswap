// src/pages/Bridge.tsx
// Real USDC bridge using Circle App Kit (CCTP)
// Bridges USDC between ARC Testnet and other supported testnets

import React, { useState } from "react";
import { ArrowDown, ChevronDown, ExternalLink, CheckCircle, Loader } from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import toast from "react-hot-toast";
import { BRIDGE_CHAINS, type BridgeChain } from "../data/chains";
import { bridgeUSDC } from "../lib/bridge";
import { useHistoryStore } from "../store/useHistoryStore";

/* ── Chain selector ──────────────────────────────────────── */
function ChainDropdown({
  selected, onSelect, exclude,
}: { selected: BridgeChain; onSelect: (c: BridgeChain) => void; exclude?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl border cursor-pointer text-[14px] font-semibold transition-all duration-150"
        style={{ background: "var(--surface3)", borderColor: "var(--border2)", color: "var(--text1)" }}
      >
        <img src={selected.flag} alt={selected.name} className="w-5 h-5 rounded-full" />
        {selected.name}
        <ChevronDown size={13} style={{ color: "var(--text2)" }} />
      </button>
      {open && (
        <div
          className="absolute left-0 top-11 rounded-2xl border z-50 overflow-hidden min-w-[200px]"
          style={{ background: "var(--surface1)", borderColor: "var(--border2)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}
        >
          {BRIDGE_CHAINS.filter(c => c.id !== exclude).map(c => (
            <button
              key={c.id}
              onClick={() => { onSelect(c); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 border-none cursor-pointer text-[14px] text-left font-medium transition-colors duration-100"
              style={{
                background: selected.id === c.id ? "var(--surface2)" : "transparent",
                color: "var(--text1)",
                borderBottom: "1px solid var(--border1)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
              onMouseLeave={e => (e.currentTarget.style.background = selected.id === c.id ? "var(--surface2)" : "transparent")}
            >
              <img src={c.flag} alt={c.name} className="w-4 h-4 rounded-full" />
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-[11px]" style={{ color: "var(--text2)" }}>USDC bridge supported</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Step indicator ──────────────────────────────────────── */
interface Step {
  name: string;
  state: string;
  txHash?: string;
  explorerUrl?: string;
}

function StepList({ steps, explorer }: { steps: Step[]; explorer: string }) {
  if (!steps.length) return null;
  return (
    <div className="mx-3 mb-3 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border2)" }}>
      {steps.map((s, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3"
          style={{ background: "var(--surface2)", borderBottom: i < steps.length - 1 ? "1px solid var(--border1)" : "none" }}
        >
          {s.state === "success" ? (
            <CheckCircle size={16} style={{ color: "var(--green)", flexShrink: 0 }} />
          ) : s.state === "pending" ? (
            <Loader size={16} className="animate-spin" style={{ color: "var(--pink)", flexShrink: 0 }} />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: "var(--border2)" }} />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold capitalize" style={{ color: "var(--text1)" }}>{s.name}</div>
            {s.txHash && (
              <div className="text-[11px] truncate font-mono" style={{ color: "var(--text3)" }}>
                {s.txHash.slice(0, 20)}…
              </div>
            )}
          </div>
          {s.explorerUrl && (
            <a href={s.explorerUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={13} style={{ color: "var(--text3)" }} />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export function BridgePage() {
  const { isConnected } = useAccount();
  const { add } = useHistoryStore();

  const [fromChain, setFromChain] = useState<BridgeChain>(BRIDGE_CHAINS[0]);
  const [toChain,   setToChain]   = useState<BridgeChain>(BRIDGE_CHAINS[1]);
  const [amount, setAmount]       = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [steps, setSteps]         = useState<Step[]>([]);

  const numAmt = parseFloat(amount) || 0;

  const flip = () => {
    setFromChain(toChain);
    setToChain(fromChain);
    setAmount("");
    setSteps([]);
  };

  const handleBridge = async () => {
    if (!isConnected || numAmt <= 0) return;
    setSubmitting(true);
    setSteps([]);

    const toastId = toast.loading(`Bridging ${amount} USDC from ${fromChain.name}…`);

    try {
      const result = await bridgeUSDC({
        fromChainId: fromChain.id,
        toChainId:   toChain.id,
        amount:      numAmt.toFixed(2),
      });

      setSteps(result.steps);

      const successStep = result.steps.find(s => s.explorerUrl);

      add({
        id: `bridge-${Date.now()}`,
        type: "bridge",
        status: "confirmed",
        chainId: fromChain.id,
        network: fromChain.name,
        timestamp: Date.now(),
        amountIn:  amount,
        symbolIn:  "USDC",
        toChain:   toChain.name,
        feeDisplay: "CCTP fee",
        explorerUrl: successStep?.explorerUrl ?? `${fromChain.explorer}`,
      });
      

      toast.success(
        <span>
          Bridged {amount} USDC<br />
          <span className="text-[12px]" style={{ color: "#9b9b9b" }}>
            {fromChain.name} → {toChain.name}
          </span>
        </span>,
        { id: toastId, duration: 8000 }
      );

      setAmount("");
    } catch (err: any) {
      console.error("Bridge error:", err);
      toast.error(err?.message ?? "Bridge failed. Try again.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="relative z-10 flex items-center justify-center px-4"
      style={{ minHeight: "calc(100vh - 68px)", paddingTop: "68px" }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div
          className="rounded-3xl border shadow-card animate-fade-up"
          style={{ background: "var(--surface1)", borderColor: "var(--border1)" }}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-bold" style={{ color: "var(--text1)" }}>Bridge</h2>
              <span
                className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(64,182,107,0.15)", color: "var(--green)" }}
              >
                Live via CCTP
              </span>
            </div>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text2)" }}>
              Transfer USDC across chains — powered by Circle&apos;s CCTP protocol
            </p>
          </div>

          <div className="p-3 space-y-1">
            {/* From */}
            <div className="rounded-2xl p-4" style={{ background: "var(--surface2)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-medium" style={{ color: "var(--text2)" }}>From</span>
                <ChainDropdown
                  selected={fromChain}
                  onSelect={c => { setFromChain(c); setSteps([]); }}
                  exclude={toChain.id}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  min="0"
                  onChange={e => setAmount(e.target.value)}
                  className="flex-1 min-w-0 w-0 text-[28px] font-medium bg-transparent border-none outline-none"
                  style={{ color: "var(--text1)" }}
                />
                {/* Token badge — always USDC */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-[15px]"
                  style={{ background: "var(--surface3)", color: "var(--text1)" }}
                >
                  <img 
                    src="/img/logos/usdc.webp" 
                    alt="USDC"
                    className="w-5 h-5 rounded-full"
                  />
                  USDC
                </div>
              </div>
              {numAmt > 0 && (
                <p className="text-[12px] mt-2" style={{ color: "var(--text2)" }}>
                  ≈ ${numAmt.toFixed(2)}
                </p>
              )}
            </div>

            {/* Flip */}
            <div className="flex justify-center items-center h-0 relative z-10">
              <button
                onClick={flip}
                className="w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-200"
                style={{ background: "var(--surface2)", border: "4px solid var(--surface1)", color: "var(--text2)" }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--surface3)";
                  e.currentTarget.style.transform = "rotate(180deg)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "var(--surface2)";
                  e.currentTarget.style.transform = "rotate(0deg)";
                }}
              >
                <ArrowDown size={18} />
              </button>
            </div>

            {/* To */}
            <div className="rounded-2xl p-4" style={{ background: "var(--surface2)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-medium" style={{ color: "var(--text2)" }}>To</span>
                <ChainDropdown
                  selected={toChain}
                  onSelect={c => { setToChain(c); setSteps([]); }}
                  exclude={fromChain.id}
                />
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 text-[28px] font-medium"
                  style={{ color: numAmt > 0 ? "var(--text1)" : "var(--text3)" }}
                >
                  {numAmt > 0 ? numAmt.toFixed(6) : "0"}
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-[15px]"
                  style={{ background: "var(--surface3)", color: "var(--text1)" }}
                >
                  <img 
                    src="/img/logos/usdc.webp" 
                    alt="USDC"
                    className="w-5 h-5 rounded-full"
                  />
                  USDC
                </div>
              </div>
              {numAmt > 0 && (
                <p className="text-[12px] mt-2" style={{ color: "var(--text2)" }}>
                  ≈ ${numAmt.toFixed(2)} · arrives in ~2–5 min
                </p>
              )}
            </div>
          </div>

          {/* Info row */}
          {numAmt > 0 && (
            <div
              className="mx-3 mb-2 px-3 py-3 rounded-2xl space-y-2"
              style={{ background: "var(--surface2)" }}
            >
              {[
                ["Protocol",     "Circle CCTP"],
                ["Route",        `${fromChain.name} → ${toChain.name}`],
                ["Token",        "USDC only"],
                ["Est. time",    "2–5 minutes"],
                ["Bridge fee",   "Network gas only"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-[13px]" style={{ color: "var(--text2)" }}>{k}</span>
                  <span className="text-[13px] font-medium" style={{ color: "var(--text1)" }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Step progress */}
          <StepList steps={steps} explorer={fromChain.explorer} />

          {/* Action */}
          <div className="p-3 pt-1">
            {!isConnected ? (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="w-full py-[18px] rounded-[20px] border-none cursor-pointer font-semibold text-[18px] text-white"
                    style={{ background: "#fc72ff", boxShadow: "0 0 20px rgba(252,114,255,0.3)" }}
                  >
                    Connect wallet
                  </button>
                )}
              </ConnectButton.Custom>
            ) : (
              <button
                onClick={numAmt > 0 && !isSubmitting ? handleBridge : undefined}
                disabled={numAmt <= 0 || isSubmitting}
                className="w-full py-[18px] rounded-[20px] border-none cursor-pointer font-semibold text-[18px] transition-all duration-200"
                style={
                  numAmt > 0 && !isSubmitting
                    ? { background: "#fc72ff", color: "#fff", boxShadow: "0 0 20px rgba(252,114,255,0.3)" }
                    : { background: "var(--surface2)", color: "var(--text3)", cursor: "not-allowed" }
                }
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                    Bridging…
                  </span>
                ) : numAmt <= 0
                  ? "Enter an amount"
                  : `Bridge USDC to ${toChain.name}`}
              </button>
            )}
          </div>
        </div>

        {/* Supported chains strip */}
        <div className="mt-4 text-center">
          <p className="text-[12px] mb-2" style={{ color: "var(--text3)" }}>Supported testnet chains</p>
          <div className="flex items-center justify-center gap-3 flex-wrap px-4">
            {BRIDGE_CHAINS.map(c => (
              <div key={c.id} className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--text3)" }}>
                <img src={c.flag} alt={c.name} className="w-4 h-4 rounded-full" />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}