import React, { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { getTokens, commonTokensByChain, type Token } from "../data/tokens";
import { TokenAvatar } from "./TokenAvatar";
import { formatDisplay } from "../lib/decimal-utils";

interface Props {
  open:     boolean;
  onClose:  () => void;
  onSelect: (t: Token) => void;
  exclude?: Token | null;
}

export function TokenSelectModal({ open, onClose, onSelect, exclude }: Props) {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const [q, setQ] = useState("");

  const allTokens = useMemo(() => getTokens(chainId), [chainId]);
  const common    = useMemo(() =>
    (commonTokensByChain[chainId] ?? [])
      .map(s => allTokens.find(t => t.symbol === s))
      .filter((t): t is Token => !!t && t.address !== exclude?.address),
    [allTokens, chainId, exclude]
  );

  const filtered = useMemo(() => {
    const lq = q.toLowerCase();
    return allTokens.filter(t => {
      if (t.address === exclude?.address) return false;
      if (!lq) return true;
      return t.symbol.toLowerCase().includes(lq)
          || t.name.toLowerCase().includes(lq)
          || t.address.toLowerCase().includes(lq);
    });
  }, [allTokens, q, exclude]);

  const pick = (t: Token) => { onSelect(t); setQ(""); onClose(); };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
      onClick={e => { if (e.target === e.currentTarget) { setQ(""); onClose(); } }}
    >
      <div className="token-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <h3 className="text-[17px] font-bold">Select a token</h3>
          <button
            onClick={() => { setQ(""); onClose(); }}
            className="w-8 h-8 rounded-xl bg-surface2 text-text2 hover:bg-surface3 hover:text-text1
                       flex items-center justify-center transition-all duration-150 border-none cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface2 border border-border1
                          focus-within:border-[rgba(252,114,255,0.3)] transition-all duration-150">
            <Search size={14} className="text-text2 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search name or paste address"
              className="flex-1 bg-transparent border-none outline-none text-text1 text-[15px]
                         placeholder:text-text3 font-[Inter,sans-serif]"
            />
          </div>
        </div>

        {/* Common tokens */}
        {!q && common.length > 0 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {common.map(t => (
              <button key={t.address} onClick={() => pick(t)}
                className="flex items-center gap-2 px-3 py-2 rounded-pill border border-border1
                           bg-surface2 text-text1 text-[13px] font-medium cursor-pointer
                           hover:border-border2 hover:bg-surface3 transition-all duration-150">
                <TokenAvatar token={t} size={18} />
                {t.symbol}
              </button>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-border1 mx-5" />

        {/* List */}
        <div className="overflow-y-auto flex-1 px-2 py-2">
          {filtered.length === 0
            ? <p className="text-center text-text2 text-sm py-10">No tokens found</p>
            : filtered.map(t => (
              <TokenRow
                key={t.address}
                token={t}
                connected={isConnected}
                onClick={() => pick(t)}
              />
            ))
          }
        </div>
      </div>
    </div>
  );
}

function TokenRow({ token, connected, onClick }: {
  token: Token; connected: boolean; onClick: () => void;
}) {
  const mockBal = connected ? (Math.random() * 500).toFixed(4) : null;
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-[10px] rounded-2xl text-left
                 hover:bg-surface2 border border-transparent hover:border-border1
                 transition-all duration-150 cursor-pointer bg-transparent">
      <TokenAvatar token={token} size={36} />
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-text1">{token.symbol}</div>
        <div className="text-[13px] text-text2 truncate">{token.name}</div>
      </div>
      {mockBal && (
        <div className="text-right">
          <div className="text-[14px] font-medium text-text1">{mockBal}</div>
          <div className="text-[12px] text-text2">
            ${(Number(mockBal) * (Math.random() + 0.5)).toFixed(2)}
          </div>
        </div>
      )}
    </button>
  );
}
