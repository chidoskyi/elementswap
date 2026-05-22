import React, { useState, useMemo } from "react";
import { ChevronDown, Search, ArrowRight, Info } from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import toast from "react-hot-toast";
import { COUNTRIES, type Country } from "../data/countries";
import { useHistoryStore } from "../store/useHistoryStore";

const SEND_TOKENS = [
  { symbol: "USDC", name: "USD Coin",  color: "#2775CA,#5bc4f5" },
  { symbol: "EURC", name: "Euro Coin", color: "#003399,#4c82fb" },
];

function CountryPicker({
  selected, onSelect,
}: { selected: Country; onSelect: (c: Country) => void }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() =>
    COUNTRIES.filter(c =>
      !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.currency.toLowerCase().includes(query.toLowerCase())
    ), [query]
  );

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border cursor-pointer
                   font-semibold text-[15px] transition-all duration-150 min-w-[160px]"
        style={{ background: "var(--surface3)", borderColor: "var(--border2)", color: "var(--text1)" }}>
        <span className="text-[20px]">{selected.flag}</span>
        <span className="flex-1 text-left">{selected.name}</span>
        <ChevronDown size={13} style={{ color: "var(--text2)" }}/>
      </button>

      {open && (
        <div className="absolute left-0 top-12 rounded-2xl border z-50 overflow-hidden"
             style={{
               background: "var(--surface1)", borderColor: "var(--border2)",
               boxShadow: "0 24px 64px rgba(0,0,0,0.5)", width: 260,
             }}>
          {/* Search */}
          <div className="p-3 border-b" style={{ borderColor: "var(--border1)" }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                 style={{ background: "var(--surface2)" }}>
              <Search size={13} style={{ color: "var(--text2)" }}/>
              <input autoFocus type="text" placeholder="Search country…" value={query}
                onChange={e => setQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[13px] w-full"
                style={{ color: "var(--text1)" }}/>
            </div>
          </div>
          {/* List */}
          <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {filtered.map(c => (
              <button key={c.code} onClick={() => { onSelect(c); setOpen(false); setQuery(""); }}
                className="w-full flex items-center gap-3 px-4 py-3 border-none cursor-pointer
                           text-left transition-colors duration-100"
                style={{
                  background: selected.code === c.code ? "var(--surface2)" : "transparent",
                  borderBottom: "1px solid var(--border1)",
                  color: "var(--text1)",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
                onMouseLeave={e => (e.currentTarget.style.background =
                  selected.code === c.code ? "var(--surface2)" : "transparent")}>
                <span className="text-[20px]">{c.flag}</span>
                <div>
                  <div className="text-[14px] font-medium">{c.name}</div>
                  <div className="text-[11px]" style={{ color: "var(--text2)" }}>{c.currency}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SendPage() {
  const { isConnected } = useAccount();
  const { add } = useHistoryStore();

  const [country,   setCountry]   = useState<Country>(COUNTRIES[0]);
  const [token,     setToken]     = useState(SEND_TOKENS[0]);
  const [tokenOpen, setTokenOpen] = useState(false);
  const [amount,    setAmount]    = useState("");
  const [method,    setMethod]    = useState<"bank" | "mobile">("bank");
  const [step,      setStep]      = useState<1 | 2>(1);
  const [isSubmitting, setSubmitting] = useState(false);

  /* Recipient fields */
  const [recipientName,    setRecipientName]    = useState("");
  const [bankAccount,      setBankAccount]      = useState("");
  const [bankName,         setBankName]         = useState("");
  const [mobileNumber,     setMobileNumber]     = useState("");
  const [mobileProvider,   setMobileProvider]   = useState("");

  const numAmt   = parseFloat(amount) || 0;
  const rate     = token.symbol === "EURC" ? (country.rateEURC ?? country.rateUSDC * 1.08) : country.rateUSDC;
  const fee      = numAmt > 0 ? Math.max(0.01, numAmt * (country.feePercent / 100)) : 0;
  const netAmt   = numAmt - fee;
  const localAmt = netAmt * rate;
  const canNext  = numAmt >= country.minUSDC;

  const handleSend = async () => {
    if (!isConnected || !canNext || isSubmitting) return;
    setSubmitting(true);
    const id = toast.loading(`Sending ${amount} ${token.symbol} to ${country.name}…`);
    try {
      await new Promise(r => setTimeout(r, 2500));
      const ref = "ACH-" + Math.random().toString(36).slice(2, 8).toUpperCase();

      add({
        id: `send-${Date.now()}`,
        type: "send",
        status: "confirmed",
        chainId: 5042002,
        network: "ARC Testnet",
        timestamp: Date.now(),
        amountIn:  amount,
        symbolIn:  token.symbol,
        toCountry: `${country.flag} ${country.name}`,
        recipient: recipientName || bankAccount || mobileNumber,
        feeDisplay: `$${fee.toFixed(2)}`,
      });

      toast.success(
        <span>
          Sent {amount} {token.symbol} → {country.flag} {country.name}
          <br/>
          <span className="text-[12px]" style={{ color: "#9b9b9b" }}>
            Ref: {ref} · {country.symbol}{localAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })} arriving
          </span>
        </span>,
        { id, duration: 10000 }
      );
      setAmount(""); setStep(1);
      setRecipientName(""); setBankAccount(""); setMobileNumber("");
    } catch {
      toast.error("Transfer failed. Try again.", { id });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative z-10 flex items-center justify-center px-4 py-8"
          style={{ minHeight: "calc(100vh - 68px)", paddingTop: "calc(68px + 16px)" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div className="rounded-3xl border shadow-card animate-fade-up"
             style={{ background: "var(--surface1)", borderColor: "var(--border1)" }}>

          {/* Header */}
          <div className="px-5 pt-5 pb-2">
            <h2 className="text-[18px] font-bold" style={{ color: "var(--text1)" }}>Send Money</h2>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text2)" }}>
              Transfer crypto to 18+ countries as local currency
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 px-5 pb-4">
            {[1, 2].map(s => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold"
                       style={{
                         background: step >= s ? "#fc72ff" : "var(--surface2)",
                         color:      step >= s ? "#fff"     : "var(--text3)",
                       }}>
                    {s}
                  </div>
                  <span className="text-[13px] font-medium"
                        style={{ color: step >= s ? "var(--text1)" : "var(--text3)" }}>
                    {s === 1 ? "Amount" : "Recipient"}
                  </span>
                </div>
                {s < 2 && (
                  <div className="flex-1 h-px" style={{ background: "var(--border1)" }}/>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="p-3">

            {/* ── STEP 1: Amount + Country ── */}
            {step === 1 && (
              <div className="space-y-3">
                {/* You send */}
                <div className="rounded-2xl p-4" style={{ background: "var(--surface2)" }}>
                  <span className="block text-[13px] font-medium mb-2" style={{ color: "var(--text2)" }}>
                    You send
                  </span>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="0" value={amount} min="0"
                      onChange={e => setAmount(e.target.value)}
                      className="flex-1 min-w-0 w-0 text-[28px] font-medium border-none outline-none bg-transparent"
                      style={{ color: "var(--text1)" }}/>

                    {/* Token selector */}
                    <div className="relative">
                      <button onClick={() => setTokenOpen(v => !v)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border-none cursor-pointer font-semibold text-[15px]"
                        style={{ background: "var(--surface3)", color: "var(--text1)" }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                             style={{ background: `linear-gradient(135deg,${token.color})` }}>
                          {token.symbol[0]}
                        </div>
                        {token.symbol}
                        <ChevronDown size={12} style={{ color: "var(--text2)" }}/>
                      </button>
                      {tokenOpen && (
                        <div className="absolute right-0 top-11 rounded-2xl border z-50 overflow-hidden"
                             style={{ background: "var(--surface1)", borderColor: "var(--border2)",
                                      boxShadow: "0 20px 60px rgba(0,0,0,0.5)", minWidth: 140 }}>
                          {SEND_TOKENS.map(t => (
                            <button key={t.symbol} onClick={() => { setToken(t); setTokenOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3 border-none cursor-pointer text-[14px]"
                              style={{
                                background: token.symbol === t.symbol ? "var(--surface2)" : "transparent",
                                borderBottom: "1px solid var(--border1)", color: "var(--text1)", textAlign: "left",
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
                              onMouseLeave={e => (e.currentTarget.style.background =
                                token.symbol === t.symbol ? "var(--surface2)" : "transparent")}>
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
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
                  </div>
                  {numAmt > 0 && (
                    <p className="text-[12px] mt-2" style={{ color: "var(--text2)" }}>
                      Fee: ${fee.toFixed(2)} ({country.feePercent}%) · Min: ${country.minUSDC}
                    </p>
                  )}
                </div>

                {/* Recipient gets */}
                <div className="rounded-2xl p-4" style={{ background: "var(--surface2)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-medium" style={{ color: "var(--text2)" }}>
                      Recipient gets
                    </span>
                    <CountryPicker selected={country} onSelect={setCountry}/>
                  </div>
                  <div className="text-[28px] font-medium" style={{ color: numAmt > 0 ? "var(--text1)" : "var(--text3)" }}>
                    {numAmt > 0
                      ? `${country.symbol}${localAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : `${country.symbol}0`}
                  </div>
                  <p className="text-[12px] mt-1" style={{ color: "var(--text2)" }}>
                    Rate: 1 {token.symbol} = {country.symbol}{rate.toLocaleString()}
                  </p>
                </div>

                {/* Delivery method */}
                {country.methods.length > 1 && (
                  <div className="flex gap-2">
                    {country.methods.map(m => (
                      <button key={m.id} onClick={() => setMethod(m.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl
                                   border cursor-pointer font-medium text-[13px] transition-all"
                        style={{
                          background: method === m.id ? "rgba(252,114,255,0.1)" : "var(--surface2)",
                          borderColor: method === m.id ? "rgba(252,114,255,0.45)" : "var(--border1)",
                          color: method === m.id ? "#fc72ff" : "var(--text2)",
                        }}>
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Rates banner */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                     style={{ background: "rgba(76,130,251,0.08)", border: "1px solid rgba(76,130,251,0.15)" }}>
                  <Info size={13} style={{ color: "#4c82fb", flexShrink: 0 }}/>
                  <p className="text-[12px]" style={{ color: "var(--text2)" }}>
                    Rates updated every 60s · Delivery within 1–2 hours
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP 2: Recipient details ── */}
            {step === 2 && (
              <div className="space-y-3">
                <div className="rounded-2xl p-4" style={{ background: "var(--surface2)" }}>
                  <p className="text-[13px] font-medium mb-3" style={{ color: "var(--text2)" }}>
                    Sending {amount} {token.symbol} → {country.flag} {country.name}
                  </p>
                  {/* Summary row */}
                  <div className="flex items-center justify-between py-2 border-b"
                       style={{ borderColor: "var(--border1)" }}>
                    <span className="text-[13px]" style={{ color: "var(--text2)" }}>They receive</span>
                    <span className="text-[14px] font-bold" style={{ color: "#40b66b" }}>
                      {country.symbol}{localAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* Full name */}
                <Field label="Recipient full name" value={recipientName}
                  onChange={setRecipientName} placeholder="John Doe"/>

                {method === "bank" ? (
                  <>
                    <Field label="Bank name"
                      value={bankName} onChange={setBankName}
                      placeholder={country.banks?.[0] ?? "Bank name"}
                      dropdown={country.banks}/>
                    <Field label="Account number / IBAN"
                      value={bankAccount} onChange={setBankAccount}
                      placeholder="e.g. 0123456789"/>
                  </>
                ) : (
                  <>
                    <Field label="Mobile provider"
                      value={mobileProvider} onChange={setMobileProvider}
                      placeholder={country.mobileMoney?.[0] ?? "Provider"}
                      dropdown={country.mobileMoney}/>
                    <Field label="Mobile number"
                      value={mobileNumber} onChange={setMobileNumber}
                      placeholder="+234 800 000 0000"/>
                  </>
                )}
              </div>
            )}
          </div>

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
            ) : step === 1 ? (
              <button onClick={() => canNext && setStep(2)} disabled={!canNext}
                className="w-full py-[18px] rounded-[20px] border-none font-semibold text-[18px]
                           transition-all duration-200 flex items-center justify-center gap-2"
                style={canNext
                  ? { background: "#fc72ff", color: "#fff", cursor: "pointer",
                      boxShadow: "0 0 20px rgba(252,114,255,0.3)" }
                  : { background: "var(--surface2)", color: "var(--text3)", cursor: "not-allowed" }}>
                {canNext ? <>Continue <ArrowRight size={18}/></> : `Min ${country.minUSDC} ${token.symbol}`}
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-[18px] rounded-[20px] border-none cursor-pointer
                             font-semibold text-[16px] transition-all duration-150"
                  style={{ background: "var(--surface2)", color: "var(--text2)" }}>
                  Back
                </button>
                <button
                  onClick={handleSend}
                  disabled={!recipientName || (!bankAccount && !mobileNumber) || isSubmitting}
                  className="flex-[2] py-[18px] rounded-[20px] border-none cursor-pointer
                             font-semibold text-[18px] transition-all duration-200"
                  style={!recipientName || (!bankAccount && !mobileNumber) || isSubmitting
                    ? { background: "var(--surface2)", color: "var(--text3)", cursor: "not-allowed" }
                    : { background: "#fc72ff", color: "#fff",
                        boxShadow: "0 0 20px rgba(252,114,255,0.3)" }}>
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white
                                       rounded-full animate-spin inline-block"/>
                      Sending…
                    </span>
                  ) : `Send ${amount} ${token.symbol}`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Country strip */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {COUNTRIES.slice(0, 10).map(c => (
            <button key={c.code} onClick={() => setCountry(c)}
              className="text-[18px] cursor-pointer transition-transform duration-100 border-none bg-transparent"
              title={c.name}
              style={{ transform: country.code === c.code ? "scale(1.3)" : "scale(1)" }}>
              {c.flag}
            </button>
          ))}
          <span className="text-[12px]" style={{ color: "var(--text3)" }}>+{COUNTRIES.length - 10} more</span>
        </div>
      </div>
    </main>
  );
}

function Field({
  label, value, onChange, placeholder, dropdown,
}: {
  label: string; value: string;
  onChange: (v: string) => void;
  placeholder: string; dropdown?: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-wide mb-1.5"
         style={{ color: "var(--text2)" }}>
        {label}
      </p>
      <div className="relative flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all"
           style={{ background: "var(--surface2)", borderColor: "var(--border1)" }}>
        <input type="text" placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-[15px]"
          style={{ color: "var(--text1)" }}/>
        {dropdown && dropdown.length > 0 && (
          <>
            <button onClick={() => setOpen(v => !v)}
              className="border-none cursor-pointer p-1 rounded-lg bg-transparent"
              style={{ color: "var(--text2)" }}>
              <ChevronDown size={14}/>
            </button>
            {open && (
              <div className="absolute left-0 top-full mt-1 rounded-2xl border z-50 overflow-hidden w-full"
                   style={{ background: "var(--surface1)", borderColor: "var(--border2)",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
                {dropdown.map(d => (
                  <button key={d} onClick={() => { onChange(d); setOpen(false); }}
                    className="w-full px-4 py-3 text-left text-[14px] border-none cursor-pointer"
                    style={{
                      color: "var(--text1)", background: "transparent",
                      borderBottom: "1px solid var(--border1)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    {d}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
