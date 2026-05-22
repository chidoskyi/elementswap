import React, { useRef, useEffect } from "react";
import { X, Settings2 } from "lucide-react";

interface Props {
  open:               boolean;
  onToggle:           () => void;
  slippageBps:        number;
  setSlippage:        (v: number) => void;
  deadlineMin:        number;
  setDeadline:        (v: number) => void;
  quoteRefreshSec:    number;
  setQuoteRefresh:    (v: number) => void;
  recipientAddress:   string;
  setRecipientAddress:(v: string) => void;
}

const PRESETS = [
  { label: "Auto", bps: 50   },
  { label: "0.1%", bps: 10  },
  { label: "0.5%", bps: 50  },
  { label: "1%",   bps: 100 },
];

export function SwapSettings({
  open, onToggle,
  slippageBps, setSlippage,
  deadlineMin, setDeadline,
  quoteRefreshSec, setQuoteRefresh,
  recipientAddress, setRecipientAddress,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) onToggle();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open, onToggle]);

  const isPreset = PRESETS.some(p => p.bps === slippageBps);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className={`w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer
                    transition-all duration-150
                    ${open ? "bg-surface2 text-text1" : "bg-transparent text-text2 hover:bg-surface2 hover:text-text1"}`}
      >
        <Settings2 size={18} />
      </button>

      {open && (
        <div className="settings-panel animate-slide-down" style={{ top: "46px" }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[15px] font-bold">Settings</span>
            <button onClick={onToggle}
              className="text-text2 hover:text-text1 transition-colors bg-transparent border-none cursor-pointer">
              <X size={15} />
            </button>
          </div>

          {/* Slippage */}
          <p className="text-[12px] font-semibold text-text2 uppercase tracking-wide mb-2">
            Slippage tolerance
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => setSlippage(p.bps)}
                className={`px-3 py-2 rounded-xl text-[13px] font-medium border cursor-pointer
                            transition-all duration-150 font-[Inter,sans-serif]
                            ${slippageBps === p.bps && isPreset
                              ? "border-[rgba(252,114,255,0.5)] bg-[rgba(252,114,255,0.1)] text-pink"
                              : "border-border1 bg-surface2 text-text2 hover:text-text1"}`}>
                {p.label}
              </button>
            ))}
            <div className="flex items-center gap-1 px-3 py-2 rounded-xl border border-border1 bg-surface2 flex-1 min-w-[80px]">
              <input
                type="number" min="0.01" max="50" step="0.1"
                placeholder="Custom"
                value={!isPreset ? (slippageBps / 100).toFixed(2) : ""}
                onChange={e => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v) && v > 0 && v <= 50) setSlippage(Math.round(v * 100));
                }}
                className="bg-transparent border-none outline-none text-text1 text-[13px] w-full"
              />
              <span className="text-text3 text-[13px]">%</span>
            </div>
          </div>

          {/* Warning */}
          {slippageBps > 100 && (
            <div className="mb-4 px-3 py-2 rounded-xl border border-yellow/30 bg-yellow/10 text-yellow text-[12px]">
              ⚠ High slippage — your transaction may be front-run
            </div>
          )}

          {/* Deadline */}
          <p className="text-[12px] font-semibold text-text2 uppercase tracking-wide mb-2">
            Transaction deadline
          </p>
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border1 bg-surface2 w-28">
              <input
                type="number" min="1" max="1440" value={deadlineMin}
                onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v > 0) setDeadline(v); }}
                className="bg-transparent border-none outline-none text-text1 text-[13px] w-full"
              />
            </div>
            <span className="text-text2 text-[13px]">minutes</span>
          </div>

          {/* ── Divider ── */}
          <div className="h-px mb-5" style={{ background: "var(--border1)" }} />

          {/* Quote Refresh Interval */}
          <p className="text-[14px] font-bold mb-1" style={{ color: "var(--text1)" }}>
            Quote Refresh Interval (seconds)
          </p>
          <div className="flex items-center gap-0 rounded-2xl border border-border1 overflow-hidden mb-2"
               style={{ background: "var(--surface2)" }}>
            <input
              type="number" min="5" max="300" value={quoteRefreshSec}
              onChange={e => {
                const v = parseInt(e.target.value);
                if (!isNaN(v) && v >= 5 && v <= 300) setQuoteRefresh(v);
              }}
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium px-4 py-3"
              style={{ color: "var(--text1)" }}
            />
            <span className="px-4 py-3 text-[14px] font-medium border-l"
                  style={{ color: "var(--text2)", borderColor: "var(--border1)",
                           background: "var(--surface3)" }}>
              seconds
            </span>
          </div>
          <p className="text-[13px] mb-5" style={{ color: "var(--text2)" }}>
            How often to refresh swap quotes automatically.
          </p>

          {/* Recipient Address */}
          <p className="text-[14px] font-bold mb-1" style={{ color: "var(--text1)" }}>
            Recipient Address <span className="text-[12px] font-medium" style={{ color: "var(--text3)" }}>(Optional)</span>
          </p>
          <div className="rounded-2xl border border-border1 overflow-hidden mb-2"
               style={{ background: "var(--surface2)" }}>
            <input
              type="text"
              value={recipientAddress}
              onChange={e => setRecipientAddress(e.target.value)}
              placeholder="0x... (leave empty to send to your wallet)"
              className="w-full bg-transparent border-none outline-none text-[13px] px-4 py-3"
              style={{ color: "var(--text1)" }}
              spellCheck={false}
            />
          </div>
          <p className="text-[13px]" style={{ color: "var(--text2)" }}>
            Send tokens to a different address after swap.
          </p>
        </div>
      )}
    </div>
  );
}