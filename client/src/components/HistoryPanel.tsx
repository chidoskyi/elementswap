import React from "react";
import {
  X, ExternalLink, CheckCircle, XCircle,
  ArrowRightLeft, ArrowUpDown, Globe, TrendingUp, Layers,
} from "lucide-react";
import { useHistoryStore, type HistoryEntry, type TxType } from "../store/useHistoryStore";

/* ── Type metadata ───────────────────────────────────────── */
const TYPE_META: Record<TxType, { label: string; icon: React.ReactNode; color: string }> = {
  swap:             { label: "Swap",           icon: <ArrowRightLeft size={13}/>, color: "#fc72ff" },
  bridge:           { label: "Bridge",         icon: <Layers size={13}/>,         color: "#4c82fb" },
  send:             { label: "Send",           icon: <Globe size={13}/>,           color: "#40b66b" },
  add_liquidity:    { label: "Add Liquidity",  icon: <TrendingUp size={13}/>,     color: "#f5a623" },
  remove_liquidity: { label: "Remove Liq.",    icon: <ArrowUpDown size={13}/>,    color: "#f5a623" },
  wrap:             { label: "Wrap",           icon: <ArrowUpDown size={13}/>,    color: "#9b9b9b" },
  unwrap:           { label: "Unwrap",         icon: <ArrowUpDown size={13}/>,    color: "#9b9b9b" },
  yield_deposit:    { label: "Yield Deposit",  icon: <TrendingUp size={13}/>,     color: "#40b66b" },
  yield_withdraw:   { label: "Yield Withdraw", icon: <ArrowUpDown size={13}/>,    color: "#f5a623" },
};

/* ── Status icon ─────────────────────────────────────────── */
function StatusIcon({ status }: { status: HistoryEntry["status"] }) {
  if (status === "confirmed")
    return <CheckCircle size={14} style={{ color: "#40b66b" }} />;
  if (status === "failed")
    return <XCircle size={14} style={{ color: "#ff4f4f" }} />;
  return (
    <div
      className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
      style={{ borderColor: "rgba(252,114,255,0.3)", borderTopColor: "#fc72ff" }}
    />
  );
}

/* ── Relative time ───────────────────────────────────────── */
function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000)    return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ms).toLocaleDateString();
}

/* ── Amount description line ─────────────────────────────── */
function amountLine(e: HistoryEntry): string {
  if (e.type === "bridge") return `${e.amountIn} ${e.symbolIn} → ${e.toChain ?? ""}`;
  if (e.type === "send")   return `${e.amountIn} ${e.symbolIn} → ${e.toCountry ?? ""}`;
  if (e.amountOut)         return `${e.amountIn} ${e.symbolIn} → ${e.amountOut} ${e.symbolOut}`;
  return `${e.amountIn} ${e.symbolIn}`;
}

/* ── Explorer / reference link ───────────────────────────── */
function TxLink({ e }: { e: HistoryEntry }) {
  // On-chain tx: show "View" → block explorer
  if (e.explorerUrl) {
    return (
      <a
        href={e.explorerUrl}
        target="_blank" rel="noreferrer"
        className="flex items-center gap-0.5 text-[11px] no-underline"
        style={{ color: "var(--pink, #fc72ff)" }}
      >
        <ExternalLink size={10} /> View
      </a>
    );
  }
  // Send (off-chain): show the Kudi Arc reference number
  if (e.reference) {
    return (
      <span className="text-[11px] font-mono" style={{ color: "var(--text3)" }}>
        {e.reference}
      </span>
    );
  }
  return null;
}

/* ── Single row ──────────────────────────────────────────── */
function TxRow({ e }: { e: HistoryEntry }) {
  // Guard: unknown type won't crash the list
  const meta = TYPE_META[e.type] ?? {
    label: e.type,
    icon:  <ArrowUpDown size={13} />,
    color: "#9b9b9b",
  };

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 border-b transition-colors duration-150"
      style={{ borderColor: "var(--border1)" }}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${meta.color}18`, color: meta.color }}
      >
        {meta.icon}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold" style={{ color: "var(--text1)" }}>
            {meta.label}
          </span>
          <StatusIcon status={e.status} />
        </div>

        {e.amountIn && (
          <div className="text-[12px] mt-0.5 truncate" style={{ color: "var(--text2)" }}>
            {amountLine(e)}
          </div>
        )}

        {e.recipient && (
          <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--text3)" }}>
            → {e.recipient}
          </div>
        )}

        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px]" style={{ color: "var(--text3)" }}>
            {timeAgo(e.timestamp)}
          </span>
          {e.feeDisplay && (
            <span className="text-[11px]" style={{ color: "var(--text3)" }}>
              · fee {e.feeDisplay}
            </span>
          )}
          <TxLink e={e} />
        </div>
      </div>
    </div>
  );
}

/* ── Panel ───────────────────────────────────────────────── */
export function HistoryPanel() {
  const { entries, panelOpen, setPanelOpen, clear } = useHistoryStore();
  const pending = entries.filter((e) => e.status === "pending").length;

  return (
    <>
      {/* Backdrop */}
      {panelOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setPanelOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
        style={{
          width: "100%", maxWidth: 380,
          background:   "var(--surface1)",
          borderLeft:   "1px solid var(--border2)",
          boxShadow:    "-20px 0 60px rgba(0,0,0,0.4)",
          transform:    panelOpen ? "translateX(0)" : "translateX(100%)",
          transition:   "transform 0.3s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border1)" }}
        >
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-bold" style={{ color: "var(--text1)" }}>
              History
            </h3>
            {pending > 0 && (
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(252,114,255,0.15)", color: "#fc72ff" }}
              >
                {pending} pending
              </span>
            )}
            <span className="text-[11px]" style={{ color: "var(--text3)" }}>
              {entries.length > 0 ? `${entries.length} tx` : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <button
                onClick={clear}
                className="text-[12px] border-none cursor-pointer px-2 py-1 rounded-lg transition-all"
                style={{ color: "var(--text3)", background: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4f4f")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setPanelOpen(false)}
              className="w-8 h-8 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all"
              style={{ background: "var(--surface2)", color: "var(--text2)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface3)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface2)")}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Entry list */}
        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 pb-16">
              <div className="text-[40px]">📋</div>
              <p className="text-[15px] font-semibold" style={{ color: "var(--text1)" }}>
                No transactions yet
              </p>
              <p className="text-[13px] text-center px-8" style={{ color: "var(--text2)" }}>
                Swaps, bridges, and sends will appear here
              </p>
            </div>
          ) : (
            entries.map((e) => <TxRow key={e.id} e={e} />)
          )}
        </div>
      </div>
    </>
  );
}