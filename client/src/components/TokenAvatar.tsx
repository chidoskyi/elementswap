import React, { useState } from "react";
import type { Token } from "../data/tokens";

export function TokenAvatar({ token, size = 28, className = "" }: {
  token: Token; size?: number; className?: string;
}) {
  const [err, setErr] = useState(false);
  const style = { width: size, height: size };

  if (!err && token.logoURI) {
    return (
      <img
        src={token.logoURI} alt={token.symbol}
        style={style}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div
      style={{ ...style, background: `linear-gradient(135deg,${token.color})`, fontSize: size * 0.38 }}
      className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
    >
      {token.symbol[0]}
    </div>
  );
}

export function PairAvatars({ t0, t1, size = 28 }: { t0: Token; t1: Token; size?: number }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size + size * 0.56, height: size }}>
      <div className="absolute left-0 z-10" style={{ borderRadius: "50%", border: "2px solid #1c1c1c" }}>
        <TokenAvatar token={t0} size={size} />
      </div>
      <div className="absolute z-0" style={{ left: size * 0.56, borderRadius: "50%", border: "2px solid #1c1c1c" }}>
        <TokenAvatar token={t1} size={size} />
      </div>
    </div>
  );
}

/* Generic avatar for pools using raw symbol + color */
export function ColorAvatar({ symbol, color, size = 28 }: { symbol: string; color: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size, background: `linear-gradient(135deg,${color})`, fontSize: size * 0.36 }}
      className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
    >
      {symbol[0]?.toUpperCase()}
    </div>
  );
}
