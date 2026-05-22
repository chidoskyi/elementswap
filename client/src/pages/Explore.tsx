import React, { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ColorAvatar } from "../components/TokenAvatar";

const STATS = [
  { label: "AchSwap volume (24H)", val: "$1.24M", chg: "+12.4%", up: true  },
  { label: "Total Value Locked",   val: "$8.76M", chg: "+3.1%",  up: true  },
  { label: "24H transactions",     val: "4,291",  chg: "+8.7%",  up: true  },
  { label: "Active pairs",         val: "47",     chg: "-0.2%",  up: false },
];

const TOKENS = [
  { r:1, s:"USDC",  n:"USD Coin",        c:"#2775CA,#5bc4f5", p:"$1.00",     ch:"+0.01%", v:"$890K",  tvl:"$4.3M",  up:true  },
  { r:2, s:"ETH",   n:"Wrapped Ether",   c:"#627EEA,#a1b4f5", p:"$3,241.00", ch:"+1.23%", v:"$1.1M",  tvl:"$8.2M",  up:true  },
  { r:3, s:"WBTC",  n:"Wrapped Bitcoin", c:"#F7931A,#f5b965", p:"$62,400",   ch:"-0.80%", v:"$320K",  tvl:"$1.9M",  up:false },
  { r:4, s:"ACHS",  n:"AchSwap Token",   c:"#fc72ff,#ff5c87", p:"$0.0432",   ch:"+5.34%", v:"$67K",   tvl:"$2.6M",  up:true  },
  { r:5, s:"wUSDC", n:"Wrapped USDC",    c:"#7b61ff,#4c82fb", p:"$0.9998",   ch:"-0.02%", v:"$210K",  tvl:"$3.1M",  up:false },
  { r:6, s:"USDT",  n:"Tether USD",      c:"#26A17B,#57d9a3", p:"$1.001",    ch:"+0.00%", v:"$440K",  tvl:"$1.2M",  up:true  },
  { r:7, s:"DAI",   n:"Dai Stablecoin",  c:"#F4B731,#f8d580", p:"$0.9996",   ch:"-0.04%", v:"$78K",   tvl:"$0.8M",  up:false },
];

const POOLS = [
  { r:1, t0:"USDC",c0:"#2775CA,#5bc4f5", t1:"ACHS", c1:"#fc72ff,#ff5c87", fee:"0.30%", tvl:"$2.41M", apr:"18.6%", v:"$890K"  },
  { r:2, t0:"ETH", c0:"#627EEA,#a1b4f5", t1:"USDC", c1:"#2775CA,#5bc4f5", fee:"0.05%", tvl:"$3.12M", apr:"6.8%",  v:"$1.1M"  },
  { r:3, t0:"USDC",c0:"#2775CA,#5bc4f5", t1:"wUSDC",c1:"#7b61ff,#4c82fb", fee:"0.01%", tvl:"$1.87M", apr:"4.2%",  v:"$214K"  },
  { r:4, t0:"WBTC",c0:"#F7931A,#f5b965", t1:"USDC", c1:"#2775CA,#5bc4f5", fee:"0.05%", tvl:"$980K",  apr:"3.4%",  v:"$320K"  },
  { r:5, t0:"ACHS",c0:"#fc72ff,#ff5c87", t1:"wUSDC",c1:"#7b61ff,#4c82fb", fee:"0.30%", tvl:"$743K",  apr:"12.1%", v:"$67K"   },
];

type Tab = "tokens" | "pools";

export function ExplorePage() {
  const [tab, setTab] = useState<Tab>("tokens");

  return (
    <main className="relative z-10 flex flex-col items-center px-4 pb-20"
          style={{ minHeight: "calc(100vh - 68px)", paddingTop: "calc(68px + 28px)" }}>
      <div className="w-full" style={{ maxWidth: 1100 }}>

        {/* Title */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-[32px] font-bold mb-1">Explore</h1>
          <p className="text-text2 text-[15px]">Real-time data from ARC Testnet</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 mb-10 animate-fade-up"
             style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
          {STATS.map((s, i) => (
            <div key={s.label} className="table-card p-5"
                 style={{ animationDelay: `${i * 0.06}s` }}>
              <p className="text-[13px] text-text2 mb-2">{s.label}</p>
              <p className="text-[26px] font-bold mb-1">{s.val}</p>
              <span className={`flex items-center gap-1 text-[13px] font-medium ${s.up ? "text-green" : "text-red"}`}>
                {s.up ? <TrendingUp size={13}/> : <TrendingDown size={13}/>} {s.chg}
              </span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5">
          {(["tokens","pools"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-2xl text-[15px] font-medium capitalize border-none cursor-pointer
                          transition-all duration-150
                          ${tab === t ? "bg-surface1 text-text1" : "bg-transparent text-text2 hover:text-text1"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tokens table */}
        {tab === "tokens" && (
          <div className="table-card animate-fade-up">
            <div className="table-row grid"
                 style={{ gridTemplateColumns:"40px 2fr 1fr 1fr 1fr 1fr", padding:"12px 20px",
                          cursor:"default", background:"transparent" }}>
              {["#","Token","Price","1D Change","Volume 24H","TVL"].map(h => (
                <span key={h} className="text-[12px] font-semibold text-text3 uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {TOKENS.map((t, i) => (
              <div key={t.s} className="table-row grid items-center"
                   style={{ gridTemplateColumns:"40px 2fr 1fr 1fr 1fr 1fr", padding:"14px 20px",
                            animationDelay:`${i*0.04}s` }}>
                <span className="text-[13px] text-text3">{t.r}</span>
                <div className="flex items-center gap-3">
                  <ColorAvatar symbol={t.s} color={t.c} size={36} />
                  <div>
                    <div className="text-[14px] font-bold">{t.s}</div>
                    <div className="text-[12px] text-text2">{t.n}</div>
                  </div>
                </div>
                <span className="text-[14px] font-medium">{t.p}</span>
                <span className={`text-[13px] font-semibold ${t.up ? "text-green" : "text-red"}`}>{t.ch}</span>
                <span className="text-[14px] font-medium">{t.v}</span>
                <span className="text-[14px] font-medium">{t.tvl}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pools table */}
        {tab === "pools" && (
          <div className="table-card animate-fade-up">
            <div className="table-row grid"
                 style={{ gridTemplateColumns:"40px 2fr 1fr 1fr 1fr", padding:"12px 20px",
                          cursor:"default", background:"transparent" }}>
              {["#","Pool","TVL","APR","Volume 24H"].map(h => (
                <span key={h} className="text-[12px] font-semibold text-text3 uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {POOLS.map((p, i) => (
              <div key={i} className="table-row grid items-center"
                   style={{ gridTemplateColumns:"40px 2fr 1fr 1fr 1fr", padding:"14px 20px" }}>
                <span className="text-[13px] text-text3">{p.r}</span>
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0" style={{ width:44, height:28 }}>
                    <div className="absolute left-0 z-10" style={{ borderRadius:"50%", border:"2px solid #1c1c1c" }}>
                      <ColorAvatar symbol={p.t0} color={p.c0} size={28}/>
                    </div>
                    <div className="absolute z-0" style={{ left:16, borderRadius:"50%", border:"2px solid #1c1c1c" }}>
                      <ColorAvatar symbol={p.t1} color={p.c1} size={28}/>
                    </div>
                  </div>
                  <div>
                    <div className="text-[14px] font-bold">{p.t0}/{p.t1}</div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                          style={{ background:"rgba(252,114,255,0.1)", color:"#fc72ff" }}>
                      {p.fee}
                    </span>
                  </div>
                </div>
                <span className="text-[14px] font-medium">{p.tvl}</span>
                <span className="text-[14px] font-semibold text-green">{p.apr}</span>
                <span className="text-[14px] font-medium">{p.v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
