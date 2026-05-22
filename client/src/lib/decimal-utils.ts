/**
 * decimal-utils.ts
 * Handles tokens with any decimal precision (0-77 decimals)
 * 150% gas boost applied via gasEstimate helpers
 */
import Decimal from "decimal.js";
Decimal.set({ precision: 40, rounding: Decimal.ROUND_DOWN });

/* ── Unit conversions ───────────────────────────────────── */
export function parseUnits(value: string, decimals: number): bigint {
  if (!value || value === "." || isNaN(Number(value)) || Number(value) < 0) return 0n;
  try {
    const d = new Decimal(value).times(new Decimal(10).pow(decimals));
    return BigInt(d.toFixed(0));
  } catch { return 0n; }
}

export function formatUnits(value: bigint | string, decimals: number, displayDecimals = 6): string {
  try {
    const d = new Decimal(value.toString()).div(new Decimal(10).pow(decimals));
    const fixed = d.toFixed(displayDecimals);
    // Remove trailing zeros after decimal
    return fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed;
  } catch { return "0"; }
}

export function formatDisplay(value: bigint | string, decimals: number): string {
  const s = formatUnits(value, decimals, 8);
  const n = parseFloat(s);
  if (n === 0) return "0";
  if (n < 0.0001) return "<0.0001";
  if (n < 1) return n.toFixed(6).replace(/\.?0+$/, "");
  if (n < 1000) return n.toFixed(4).replace(/\.?0+$/, "");
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/* ── Slippage math ──────────────────────────────────────── */
export function applySlippage(amount: bigint, slippageBps: number): bigint {
  if (amount === 0n) return 0n;
  const factor = new Decimal(10000 - slippageBps).div(10000);
  return BigInt(new Decimal(amount.toString()).times(factor).toFixed(0));
}

/* ── Uniswap V2 math (mid-point comparison for accuracy) ── */
export function getAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
  if (amountIn <= 0n || reserveIn <= 0n || reserveOut <= 0n) return 0n;
  const aInFee = amountIn * 997n;
  return (aInFee * reserveOut) / (reserveIn * 1000n + aInFee);
}

export function getAmountIn(amountOut: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
  if (amountOut <= 0n || reserveIn <= 0n || reserveOut <= 0n || amountOut >= reserveOut) return 0n;
  return (reserveIn * amountOut * 1000n) / ((reserveOut - amountOut) * 997n) + 1n;
}

/* ── Price impact — mid-point method ───────────────────── */
export function calcPriceImpact(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): number {
  if (reserveIn === 0n || reserveOut === 0n || amountIn === 0n) return 0;
  const aIn  = new Decimal(amountIn.toString());
  const rIn  = new Decimal(reserveIn.toString());
  const rOut = new Decimal(reserveOut.toString());
  const midPrice  = rOut.div(rIn);
  const execPrice = rOut.minus(
    rOut.times(rIn).div(rIn.plus(aIn.times(997).div(1000)))
  ).div(aIn);
  const impact = midPrice.minus(execPrice).div(midPrice).times(100);
  return Math.max(0, Number(impact.toFixed(4)));
}

/* ── Pool share ────────────────────────────────────────── */
export function calcPoolShare(lpTokens: bigint, totalSupply: bigint): number {
  if (totalSupply === 0n) return 0;
  return Number(new Decimal(lpTokens.toString()).div(totalSupply.toString()).times(100).toFixed(4));
}

/* ── 150% gas boost (from README) ─────────────────────── */
export function boostGas(estimate: bigint): bigint {
  return (estimate * 150n) / 100n;
}

/* ── Display helpers ───────────────────────────────────── */
export function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function fmtUsd(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
  if (usd >= 1_000)     return `$${(usd / 1_000).toFixed(2)}K`;
  return `$${usd.toFixed(2)}`;
}

export function deadlineTimestamp(minutes: number): number {
  return Math.floor(Date.now() / 1000) + minutes * 60;
}
