import React, { useState, useMemo } from "react";
import { ArrowDown, ChevronDown, Info } from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import toast from "react-hot-toast";
import { BRIDGE_CHAINS, getChain, type BridgeChain, type BridgeToken } from "../data/chains";
import { useHistoryStore } from "../store/useHistoryStore";

/* ── Bridge route estimates ──────────────────────────────── */
const BRIDGE_TIME: Record<string, string> = {
  "5042002-1":     "15–25 min",  "1-5042002":     "15–25 min",
  "5042002-137":   "5–10 min",   "137-5042002":   "5–10 min",
  "1-137":         "8–15 min",   "137-1":         "8–15 min",
  "1-42161":       "2–5 min",    "42161-1":       "2–5 min",
  "1-10":          "2–5 min",    "10-1":          "2–5 min",
  "1-8453":        "3–7 min",    "8453-1":        "3–7 min",
};
function bridgeTime(from: number, to: number) {
  return BRIDGE_TIME[`${from}-${to}`] ?? "10–30 min";
}
function bridgeFee(fromId: number, toId: number, amount: number): number {
  const base = fromId === 5042002 || toId === 5042002 ? 0.003 : 0.002;
  return Math.max(0.5, amount * base);
}

/* ── Chain selector dropdown ─────────────────────────────── */
function ChainDropdown({
  selected, onSelect, exclude,
}: { selected: BridgeChain; onSelect: (c: BridgeChain) => void; exclude?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl border cursor-pointer
                   text-[14px] font-semibold transition-all duration-150"
        style={{
          background: "var(--surface3)", borderColor: "var(--border2)",
          color: "var(--text1)",
        }}>
        <img src={selected.flag} alt={selected.name} className="w-5 h-5 rounded-full" />
        {selected.name}
        <ChevronDown size={13} style={{ color: "var(--text2)" }}/>
      </button>
      {open && (
        <div className="absolute left-0 top-11 rounded-2xl border z-50 overflow-hidden min-w-[180px]"
             style={{ background: "var(--surface1)", borderColor: "var(--border2)",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          {BRIDGE_CHAINS.filter(c => c.id !== exclude).map(c => (
            <button key={c.id} onClick={() => { onSelect(c); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 border-none cursor-pointer
                         text-[14px] text-left font-medium transition-colors duration-100"
              style={{
                background: selected.id === c.id ? "var(--surface2)" : "transparent",
                color: "var(--text1)",
                borderBottom: "1px solid var(--border1)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
              onMouseLeave={e => (e.currentTarget.style.background =
                selected.id === c.id ? "var(--surface2)" : "transparent")}>
              <img src={c.flag} alt={c.name} className="w-4 h-4 rounded-full" />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Token selector ──────────────────────────────────────── */
function TokenDropdown({
  selected, tokens, onSelect,
}: { selected: BridgeToken; tokens: BridgeToken[]; onSelect: (t: BridgeToken) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border-none cursor-pointer
                   font-semibold text-[15px] transition-all duration-150"
        style={{ background: "var(--surface3)", color: "var(--text1)" }}>
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
             style={{ background: `linear-gradient(135deg,${selected.color})` }}>
          {selected.symbol[0]}
        </div>
        {selected.symbol}
        <ChevronDown size={12} style={{ color: "var(--text2)" }}/>
      </button>
      {open && (
        <div className="absolute right-0 top-10 rounded-2xl border z-50 overflow-hidden min-w-[150px]"
             style={{ background: "var(--surface1)", borderColor: "var(--border2)",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          {tokens.map(t => (
            <button key={t.address + t.symbol} onClick={() => { onSelect(t); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 border-none cursor-pointer
                         text-[14px] text-left font-medium transition-colors duration-100"
              style={{
                background: selected.symbol === t.symbol ? "var(--surface2)" : "transparent",
                color: "var(--text1)",
                borderBottom: "1px solid var(--border1)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
              onMouseLeave={e => (e.currentTarget.style.background =
                selected.symbol === t.symbol ? "var(--surface2)" : "transparent")}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                   style={{ background: `linear-gradient(135deg,${t.color})` }}>
                {t.symbol[0]}
              </div>
              <div>
                <div className="font-semibold">{t.symbol}</div>
                <div className="text-[11px]" style={{ color: "var(--text2)" }}>{t.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function BridgePage() {
  const { isConnected, address } = useAccount();
  const { add } = useHistoryStore();

  const [fromChain, setFromChain] = useState<BridgeChain>(BRIDGE_CHAINS[0]);
  const [toChain,   setToChain]   = useState<BridgeChain>(BRIDGE_CHAINS[1]);
  const [fromToken, setFromToken] = useState<BridgeToken>(BRIDGE_CHAINS[0].tokens[0]);
  const [toToken,   setToToken]   = useState<BridgeToken>(BRIDGE_CHAINS[1].tokens[1]);
  const [amount, setAmount]       = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const numAmt  = parseFloat(amount) || 0;
  const fee     = numAmt > 0 ? bridgeFee(fromChain.id, toChain.id, numAmt) : 0;
  const receive = numAmt > 0 ? numAmt - fee : 0;
  const time    = bridgeTime(fromChain.id, toChain.id);
  const showInfo = numAmt > 0;

  const flip = () => {
    setFromChain(toChain); setToChain(fromChain);
    setFromToken(toToken); setToToken(fromToken);
    setAmount("");
  };

  const handleBridge = async () => {
    if (!isConnected || numAmt <= 0) return;
    setSubmitting(true);
    const id = toast.loading(`Bridging ${amount} ${fromToken.symbol}…`);
    try {
      await new Promise(r => setTimeout(r, 2200)); // simulated
      const mockHash = "0x" + Math.random().toString(16).slice(2).padEnd(64, "0").slice(0, 40) + "…";

      add({
        id: `bridge-${Date.now()}`,
        type: "bridge",
        status: "confirmed",
        chainId: fromChain.id,
        network: fromChain.name,
        timestamp: Date.now(),
        amountIn:  amount,
        symbolIn:  fromToken.symbol,
        toChain:   toChain.name,
        feeDisplay: `$${fee.toFixed(2)}`,
        explorerUrl: `${fromChain.explorer}/tx/${mockHash}`,
      });

      toast.success(
        <span>Bridged {amount} {fromToken.symbol} → {toChain.name}<br/>
          <span className="text-[12px]" style={{ color: "#9b9b9b" }}>
            ~{receive.toFixed(4)} {toToken.symbol} arriving in {time}
          </span>
        </span>,
        { id, duration: 8000 }
      );
      setAmount("");
    } catch {
      toast.error("Bridge failed. Try again.", { id });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative z-10 flex items-center justify-center px-4"
          style={{ minHeight: "calc(100vh - 68px)", paddingTop: "68px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div className="rounded-3xl border shadow-card animate-fade-up"
             style={{ background: "var(--surface1)", borderColor: "var(--border1)" }}>

          {/* Header */}
          <div className="px-5 pt-5 pb-1">
            <h2 className="text-[18px] font-bold" style={{ color: "var(--text1)" }}>Bridge</h2>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text2)" }}>
              Move tokens across chains instantly
            </p>
          </div>

          <div className="p-3 space-y-1">
            {/* From */}
            <div className="rounded-2xl p-4" style={{ background: "var(--surface2)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-medium" style={{ color: "var(--text2)" }}>From</span>
                <ChainDropdown selected={fromChain} onSelect={c => { setFromChain(c); setFromToken(c.tokens[0]); }} exclude={toChain.id}/>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="0" value={amount} min="0"
                  onChange={e => setAmount(e.target.value)}
                  className="flex-1 min-w-0 w-0 text-[28px] font-medium bg-transparent
                             border-none outline-none"
                  style={{ color: "var(--text1)" }}/>
                <TokenDropdown selected={fromToken} tokens={fromChain.tokens} onSelect={setFromToken}/>
              </div>
              {numAmt > 0 && (
                <p className="text-[12px] mt-2" style={{ color: "var(--text2)" }}>
                  ≈ ${numAmt.toFixed(2)}
                </p>
              )}
            </div>

            {/* Flip arrow */}
            <div className="flex justify-center items-center h-0 relative z-10">
              <button onClick={flip}
                className="w-10 h-10 rounded-full flex items-center justify-center border-none
                           cursor-pointer transition-all duration-200"
                style={{
                  background: "var(--surface2)",
                  border: "4px solid var(--surface1)",
                  color: "var(--text2)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--surface3)";
                  e.currentTarget.style.transform = "rotate(180deg)";
                  e.currentTarget.style.color = "var(--text1)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "var(--surface2)";
                  e.currentTarget.style.transform = "rotate(0deg)";
                  e.currentTarget.style.color = "var(--text2)";
                }}>
                <ArrowDown size={18}/>
              </button>
            </div>

            {/* To */}
            <div className="rounded-2xl p-4" style={{ background: "var(--surface2)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-medium" style={{ color: "var(--text2)" }}>To</span>
                <ChainDropdown selected={toChain} onSelect={c => { setToChain(c); setToToken(c.tokens[0]); }} exclude={fromChain.id}/>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 text-[28px] font-medium"
                     style={{ color: numAmt > 0 ? "var(--text1)" : "var(--text3)" }}>
                  {numAmt > 0 ? receive.toFixed(6) : "0"}
                </div>
                <TokenDropdown selected={toToken} tokens={toChain.tokens} onSelect={setToToken}/>
              </div>
              {numAmt > 0 && (
                <p className="text-[12px] mt-2" style={{ color: "var(--text2)" }}>
                  ≈ ${receive.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Info */}
          {showInfo && (
            <div className="mx-3 mb-2 px-3 py-3 rounded-2xl space-y-2"
                 style={{ background: "var(--surface2)" }}>
              {[
                ["Bridge fee",   `$${fee.toFixed(2)} (~${(fee / numAmt * 100).toFixed(2)}%)`],
                ["You receive",  `${receive.toFixed(6)} ${toToken.symbol}`],
                ["Est. time",    time],
                ["Route",        `${fromChain.name} → ${toChain.name}`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-[13px]" style={{ color: "var(--text2)" }}>{k}</span>
                  <span className="text-[13px] font-medium" style={{ color: "var(--text1)" }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action */}
          <div className="p-3 pt-1">
            {!isConnected ? (
              <ConnectButton.Custom>{({ openConnectModal }) => (
                <button onClick={openConnectModal}
                  className="w-full py-[18px] rounded-[20px] border-none cursor-pointer
                             font-semibold text-[18px] text-white"
                  style={{ background: "#fc72ff", boxShadow: "0 0 20px rgba(252,114,255,0.3)" }}>
                  Connect wallet
                </button>
              )}</ConnectButton.Custom>
            ) : (
              <button onClick={numAmt > 0 ? handleBridge : undefined}
                disabled={numAmt <= 0 || isSubmitting}
                className="w-full py-[18px] rounded-[20px] border-none cursor-pointer
                           font-semibold text-[18px] transition-all duration-200"
                style={numAmt > 0 && !isSubmitting
                  ? { background: "#fc72ff", color: "#fff", boxShadow: "0 0 20px rgba(252,114,255,0.3)" }
                  : { background: "var(--surface2)", color: "var(--text3)", cursor: "not-allowed" }}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white
                                     rounded-full animate-spin inline-block"/>
                    Bridging…
                  </span>
                ) : numAmt <= 0
                  ? "Enter an amount"
                  : `Bridge ${fromToken.symbol} to ${toChain.name}`}
              </button>
            )}
          </div>
        </div>

        {/* Supported chains strip */}
        <div className="mt-4 flex items-center justify-center gap-3 flex-wrap px-4">
          {BRIDGE_CHAINS.map(c => (
            <div key={c.id} className="flex items-center gap-1.5 text-[12px]"
                 style={{ color: "var(--text3)" }}>
              <img src={c.flag} alt={c.name} className="w-4 h-4 rounded-full" />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
