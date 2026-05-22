import React, { useEffect, useState } from "react";
import { ArrowDown, ChevronDown } from "lucide-react";
import { useAccount, useChainId, useWriteContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import toast from "react-hot-toast";

import { TokenAvatar }      from "../components/TokenAvatar";
import { TokenSelectModal } from "../components/TokenSelectModal";
import { SwapSettings }     from "../components/SwapSettings";
import { useSwapQuote }     from "../hooks/useSwapQuote";
import { useApprove }       from "../hooks/useApprove";
import { useTokenBalance }  from "../hooks/useTokenBalance";

import { findTokenBySymbol, type Token } from "../data/tokens";
import { getContracts, ROUTER_ABI, explorerTx } from "../lib/contracts";
import { parseUnits, deadlineTimestamp } from "../lib/decimal-utils";

type ModalSide = "sell" | "buy" | null;
type Tab = "swap" | "limit" | "buy" | "send";

export function SwapPage() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();

  const [sell, setSell] = useState<Token | null>(() => findTokenBySymbol("USDC",  5042002) ?? null);
  const [buy,  setBuy]  = useState<Token | null>(() => findTokenBySymbol("ACHS", 5042002) ?? null);
  const [modal, setModal]       = useState<ModalSide>(null);
  const [sellAmt, setSellAmt]   = useState("");
  const [tab, setTab]           = useState<Tab>("swap");
  const [settingsOpen,      setSettingsOpen]      = useState(false);
  const [slippageBps,       setSlippage]           = useState(50);
  const [deadlineMin,       setDeadline]           = useState(20);
  const [quoteRefreshSec,   setQuoteRefresh]       = useState(30);
  const [recipientAddress,  setRecipientAddress]   = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  let contracts: ReturnType<typeof getContracts> | null = null;
  try { contracts = getContracts(chainId); } catch {}

  const { raw: sellRaw, display: sellDisplay } = useTokenBalance(address, sell);
  const { display: buyDisplay }                 = useTokenBalance(address, buy);
  const quote = useSwapQuote(sell, buy, sellAmt, slippageBps);
  const { needsApprove, approve } = useApprove(sell, contracts?.router, address);
  const { writeContractAsync } = useWriteContract();

  /* ── Auto-refresh quote ────────────────────────────── */
  useEffect(() => {
    if (!sellAmt || !sell || !buy) return;
    const id = setInterval(() => {
      setSellAmt(prev => prev ? prev : prev);   // nudge to retrigger hook
    }, quoteRefreshSec * 1000);
    return () => clearInterval(id);
  }, [quoteRefreshSec, sellAmt, sell?.address, buy?.address]);

  const flip = () => { setSell(buy); setBuy(sell); setSellAmt(""); };

  const handleSelect = (t: Token) => {
    if (modal === "sell") { if (buy?.address === t.address) setBuy(sell); setSell(t); setSellAmt(""); }
    else                  { if (sell?.address === t.address) setSell(buy); setBuy(t); }
  };

  const handleSwap = async () => {
    if (!isConnected || !sell || !buy || !sellAmt || !contracts || !address) return;
    if (quote.error || !quote.amountOutRaw) { toast.error(quote.error ?? "No quote"); return; }
    setIsSubmitting(true);
    const id = toast.loading("Waiting for confirmation…");
    try {
      const amtIn  = parseUnits(sellAmt, sell.decimals);
      const amtMin = (quote.amountOutRaw * BigInt(10000 - slippageBps)) / 10000n;
      const dl     = BigInt(deadlineTimestamp(deadlineMin));
      const path   = quote.path.length >= 2 ? quote.path : ([sell.address, buy.address] as `0x${string}`[]);
      // Use custom recipient if set, otherwise send to connected wallet
      const recipient = (recipientAddress.startsWith("0x") && recipientAddress.length === 42
        ? recipientAddress
        : address) as `0x${string}`;
      if (!sell.isNative && needsApprove(amtIn)) {
        toast.loading("Approving…", { id });
        await approve(amtIn * 2n);
      }
      toast.loading("Swapping…", { id });
      const hash = await writeContractAsync({
        address: contracts.router, abi: ROUTER_ABI,
        functionName: "swapExactTokensForTokens",
        args: [amtIn, amtMin, path, recipient, dl],
      });
      toast.success(
        <span>Swapped {sellAmt} {sell.symbol} → {quote.amountOut} {buy.symbol}<br/>
          <a href={explorerTx(chainId, hash)} target="_blank" rel="noreferrer" className="underline text-blue-400 text-xs">View on ARC Scan ↗</a>
        </span>, { id, duration: 8000 }
      );
      setSellAmt("");
    } catch (err: any) {
      toast.error(err?.shortMessage ?? err?.message ?? "Swap failed", { id });
    } finally { setIsSubmitting(false); }
  };

  const sellNum = parseFloat(sellAmt) || 0;
  type BS = "connect"|"select"|"enter"|"loading"|"no_route"|"ready";
  const st = (): BS => {
    if (!isConnected)           return "connect";
    if (!sell || !buy)          return "select";
    if (!sellAmt||sellNum<=0)   return "enter";
    if (quote.loading||isSubmitting) return "loading";
    if (quote.error)            return "no_route";
    return "ready";
  };
  const bs = st();
  const showInfo = !!quote.amountOut && !quote.error && sellNum > 0;
  const impCls = quote.priceImpact>5?"high":quote.priceImpact>1?"mid":"low";

  return (
    <main className="relative z-10 flex items-center justify-center px-4"
          style={{ minHeight:"calc(100vh - 68px)", paddingTop:"68px" }}>
      <div className="w-full" style={{ maxWidth:460 }}>
        <div className="swap-card animate-fade-up">

          {/* Tabs */}
          <div className="flex items-center justify-between px-4 pt-4 pb-0">
            <div className="flex gap-0.5">
              {(["swap","limit","buy","send"] as Tab[]).map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  className={`px-4 py-2 rounded-2xl border-none cursor-pointer capitalize text-[15px] font-semibold transition-all duration-150
                    ${tab===t?"text-text1 bg-white/[0.05]":"bg-transparent text-text2 hover:text-text1"}`}>{t}</button>
              ))}
            </div>
            <SwapSettings open={settingsOpen} onToggle={()=>setSettingsOpen(v=>!v)}
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

          {/* Inputs */}
          <div className="p-2 space-y-0.5">
            <div className="token-box">
              <span className="block text-[13px] font-medium text-text2 mb-2">Sell</span>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="0" value={sellAmt} min="0"
                  onChange={e=>setSellAmt(e.target.value)} className="amount-input"/>
                <TokenPill token={sell} onClick={()=>setModal("sell")}/>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[13px] text-text2">{sellNum>0?`$${(sellNum*1.0001).toFixed(2)}`:"—"}</span>
                <div className="flex items-center gap-2">
                  {isConnected&&sell&&<span className="text-[13px] text-text2">Balance: {sellDisplay}</span>}
                  {isConnected&&sellRaw>0n&&(
                    <button onClick={()=>setSellAmt(sellDisplay)}
                      className="text-[12px] font-semibold text-pink border-none cursor-pointer px-2 py-0.5 rounded-lg"
                      style={{background:"rgba(252,114,255,0.10)"}}
                      onMouseEnter={e=>(e.currentTarget.style.background="rgba(252,114,255,0.20)")}
                      onMouseLeave={e=>(e.currentTarget.style.background="rgba(252,114,255,0.10)")}>MAX</button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center h-0 relative z-10">
              <button onClick={flip} className="swap-arrow"><ArrowDown size={18}/></button>
            </div>
            <div className="token-box">
              <span className="block text-[13px] font-medium text-text2 mb-2">Buy</span>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="0" readOnly
                  value={quote.loading?"…":(quote.amountOut||"")} className="amount-input"/>
                <TokenPill token={buy} onClick={()=>setModal("buy")}/>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[13px] text-text2">{quote.amountOut?`$${(parseFloat(quote.amountOut)*0.9999).toFixed(2)}`:"—"}</span>
                {isConnected&&buy&&<span className="text-[13px] text-text2">Balance: {buyDisplay}</span>}
              </div>
            </div>
          </div>

          {/* Info */}
          {showInfo&&(
            <div className="px-3 pb-1">
              <div className="info-row"><span className="info-label">Rate</span><span className="info-val">{quote.rate}</span></div>
              <div className="info-row"><span className="info-label">Price impact</span>
                <span className={`info-val ${impCls}`}>{quote.priceImpact<0.01?"<0.01%":`${quote.priceImpact.toFixed(2)}%`}</span></div>
              <div className="info-row"><span className="info-label">Min. received</span>
                <span className="info-val">{quote.minReceived} {buy?.symbol}</span></div>
              {quote.path.length>2&&<div className="info-row"><span className="info-label">Route</span>
                <span className="info-val">{sell?.symbol} → wUSDC → {buy?.symbol}</span></div>}
              <div className="info-row"><span className="info-label">Network fee</span><span className="info-val">~$0.02</span></div>
            </div>
          )}
          {quote.error&&sellNum>0&&(
            <div className="mx-3 mb-2 px-3 py-2 rounded-xl text-[13px] text-red"
                 style={{background:"rgba(255,79,79,0.08)",border:"1px solid rgba(255,79,79,0.2)"}}>
              {quote.error}
            </div>
          )}

          {/* Button */}
          <div className="p-2 pt-1">
            {bs==="connect"?(
              <ConnectButton.Custom>{({openConnectModal})=>(
                <button onClick={openConnectModal} className="action-btn connect">Connect wallet</button>
              )}</ConnectButton.Custom>
            ):(
              <button onClick={bs==="ready"?handleSwap:undefined} disabled={bs!=="ready"}
                className={`action-btn ${bs==="ready"?"ready":"disabled"}`}>
                {(bs==="loading"||isSubmitting)?(
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow inline-block"/>
                    {isSubmitting?"Confirming…":"Fetching quote…"}
                  </span>
                ):bs==="select"?"Select a token"
                 :bs==="enter"?"Enter an amount"
                 :bs==="no_route"?"Insufficient liquidity"
                 :`Swap ${sell?.symbol??""} for ${buy?.symbol??""}`}
              </button>
            )}
          </div>
        </div>
      </div>
      <TokenSelectModal open={!!modal} onClose={()=>setModal(null)}
        onSelect={handleSelect} exclude={modal==="sell"?buy:sell}/>
    </main>
  );
}

function TokenPill({ token, onClick }: { token: Token | null; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`token-pill-btn ${token?"selected":"unselected"}`}>
      {token?(<><TokenAvatar token={token} size={24}/>{token.symbol}</>):"Select token"}
      <ChevronDown size={14} className="text-text2 ml-0.5"/>
    </button>
  );
}