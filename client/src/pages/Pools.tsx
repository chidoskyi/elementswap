import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Plus, Search, RefreshCw } from "lucide-react";
import { useChainId } from "wagmi";

import { ColorAvatar } from "../components/TokenAvatar";
import { fetchAllPools, type PoolInfo } from "../lib/pool-utils";
import { formatDisplay } from "../lib/decimal-utils";
import { findToken } from "../data/tokens";

export function PoolsPage() {
  const chainId = useChainId();
  const [pools, setPools]       = useState<PoolInfo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState("");
  const [filter, setFilter]     = useState<"all" | "my">("all");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAllPools(chainId);
      setPools(data);
    } catch { /* RPC may fail on testnet */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [chainId]);

  const filtered = pools.filter(p => {
    const q = query.toLowerCase();
    return !q || p.symbol0.toLowerCase().includes(q) || p.symbol1.toLowerCase().includes(q);
  });

  return (
    <main className="relative z-10 flex flex-col items-center px-4 pb-20"
          style={{ minHeight: "calc(100vh - 68px)", paddingTop: "calc(68px + 28px)" }}>
      <div className="w-full" style={{ maxWidth: 900 }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3 animate-fade-up">
          <h2 className="text-[26px] font-bold">Positions</h2>
          <div className="flex items-center gap-2">
            <button onClick={load}
              className="w-10 h-10 rounded-2xl bg-surface1 border border-border1 flex items-center justify-center
                         text-text2 hover:text-text1 hover:bg-surface2 transition-all duration-150 cursor-pointer">
              <RefreshCw size={16} className={loading ? "animate-spin-slow" : ""} />
            </button>
          <Link href="/pool/add">
            <span className="btn-pink px-5 py-3 text-[14px] no-underline">
              <Plus size={16} /> New position
            </span>
          </Link>
          </div>
        </div>

        {/* Table card */}
        <div className="table-card animate-fade-up" style={{ animationDelay: "0.1s" }}>

          {/* Card header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border1 flex-wrap gap-y-3">
            <div className="flex gap-1">
              {(["all", "my"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-[14px] font-medium capitalize border-none cursor-pointer
                              transition-all duration-150
                              ${filter === f ? "bg-surface2 text-text1" : "bg-transparent text-text2 hover:text-text1"}`}>
                  {f === "all" ? "All pools" : "My positions"}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-surface2 border border-border1">
              <Search size={14} className="text-text2 flex-shrink-0" />
              <input
                type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search pools…"
                className="bg-transparent border-none outline-none text-text1 text-[13px] w-36
                           placeholder:text-text3"
              />
            </div>
          </div>

          {/* Column headers */}
          <div className="table-row grid"
               style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "10px 20px",
                        cursor: "default", background: "transparent" }}>
            <span className="text-[12px] font-semibold text-text3 uppercase tracking-wide">Pool</span>
            <span className="text-[12px] font-semibold text-text3 uppercase tracking-wide">Reserve 0</span>
            <span className="text-[12px] font-semibold text-text3 uppercase tracking-wide hidden md:block">Reserve 1</span>
            <span className="text-[12px] font-semibold text-text3 uppercase tracking-wide hidden md:block">LP Supply</span>
            <span className="text-[12px] font-semibold text-text3 uppercase tracking-wide">Actions</span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-3 py-16 text-text2">
              <RefreshCw size={18} className="animate-spin-slow" />
              <span className="text-[14px]">Fetching pools from ARC Testnet…</span>
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-[40px] mb-3">🏊</p>
              <p className="text-[16px] font-semibold text-text1 mb-2">No pools found</p>
              <p className="text-[14px] text-text2 mb-5">
                {pools.length === 0
                  ? "No pairs deployed on this chain yet"
                  : "No pools match your search"}
              </p>
              <Link href="/pool/add">
                <span className="btn-pink px-5 py-3 text-[14px] no-underline inline-flex">
                  <Plus size={16} /> Create first pool
                </span>
              </Link>
            </div>
          )}

          {/* Pool rows */}
          {!loading && filtered.map(pool => (
            <PoolRow key={pool.pairAddress} pool={pool} chainId={chainId} />
          ))}
        </div>
      </div>
    </main>
  );
}

function PoolRow({ pool, chainId }: { pool: PoolInfo; chainId: number }) {
  const t0 = findToken(pool.token0, chainId);
  const t1 = findToken(pool.token1, chainId);
  const dec0 = t0?.decimals ?? 18;
  const dec1 = t1?.decimals ?? 18;

  return (
    <div className="table-row grid items-center"
         style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "15px 20px" }}>

      {/* Pair */}
      <div className="flex items-center gap-3">
        {/* Overlapping avatars */}
        <div className="relative flex-shrink-0" style={{ width: 48, height: 28 }}>
          <div className="absolute left-0 z-10" style={{ borderRadius: "50%", border: "2px solid #1c1c1c" }}>
            <ColorAvatar symbol={pool.symbol0} color={pool.color0} size={28} />
          </div>
          <div className="absolute z-0" style={{ left: 16, borderRadius: "50%", border: "2px solid #1c1c1c" }}>
            <ColorAvatar symbol={pool.symbol1} color={pool.color1} size={28} />
          </div>
        </div>
        <div>
          <div className="text-[14px] font-bold text-text1">
            {pool.symbol0}/{pool.symbol1}
          </div>
          <div className="text-[11px] font-mono text-text3">
            {pool.pairAddress.slice(0, 10)}…
          </div>
        </div>
      </div>

      {/* Reserve 0 */}
      <span className="text-[14px] font-medium text-text1">
        {formatDisplay(pool.reserve0, dec0)}
      </span>

      {/* Reserve 1 */}
      <span className="text-[14px] font-medium text-text1 hidden md:block">
        {formatDisplay(pool.reserve1, dec1)}
      </span>

      {/* LP Supply */}
      <span className="text-[14px] font-medium text-text1 hidden md:block">
        {formatDisplay(pool.totalSupply, 18)}
      </span>

    {/* Actions */}
    <div className="flex gap-2">
      <Link href="/pool/add">
        <span className="px-3 py-1.5 rounded-xl text-[12px] font-semibold cursor-pointer no-underline
                        transition-all duration-150"
              style={{ background: "rgba(252,114,255,0.1)", border: "1px solid rgba(252,114,255,0.25)", color: "#fc72ff" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(252,114,255,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(252,114,255,0.1)")}
        >
          Add
        </span>
      </Link>
      <Link href="/pool/remove">
        <span className="px-3 py-1.5 rounded-xl text-[12px] font-semibold cursor-pointer no-underline
                        transition-all duration-150 text-text2"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
        >
          Remove
        </span>
      </Link>
    </div>
    </div>
  );
}
