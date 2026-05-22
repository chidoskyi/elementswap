/**
 * hooks/useSwapQuote.ts
 * ─────────────────────
 * Gets swap quotes from the on-chain Router via wagmi.
 * Implements multi-hop routing: if no direct pair exists,
 * routes through wUSDC (wrapped native) as per README.
 */

import { useState, useEffect, useRef } from "react";
import { useChainId } from "wagmi";
import { createPublicClient, http } from "viem";
import { arcTestnet } from "../lib/wagmi";
import { ROUTER_ABI, contractsByChainId, ZERO_ADDRESS } from "../lib/contracts";
import { FACTORY_ABI }          from "../lib/contracts";
import { applySlippage, formatDisplay, calcPriceImpact } from "../lib/decimal-utils";
import type { Token } from "../data/tokens";

export interface QuoteResult {
  amountOut:    string;
  minReceived:  string;
  priceImpact:  number;
  rate:         string;
  path:         `0x${string}`[];
  amountOutRaw: bigint;
  loading:      boolean;
  error:        string | null;
}

const EMPTY: QuoteResult = {
  amountOut: "", minReceived: "", priceImpact: 0,
  rate: "", path: [], amountOutRaw: 0n,
  loading: false, error: null,
};

export function useSwapQuote(
  sellToken:   Token | null,
  buyToken:    Token | null,
  sellAmount:  string,
  slippageBps: number,
): QuoteResult {
  const chainId   = useChainId();
  const [result, setResult] = useState<QuoteResult>(EMPTY);
  const debounce  = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const amt = parseFloat(sellAmount);
    if (!sellToken || !buyToken || !sellAmount || isNaN(amt) || amt <= 0) {
      setResult(EMPTY);
      return;
    }

    setResult(prev => ({ ...prev, loading: true, error: null }));
    clearTimeout(debounce.current);

    debounce.current = setTimeout(async () => {
      const contracts = contractsByChainId[chainId];
      if (!contracts) {
        setResult({ ...EMPTY, error: "Unsupported chain" });
        return;
      }

      const client = createPublicClient({ chain: arcTestnet, transport: http() });

      try {
        const amtIn = BigInt(
          Math.floor(amt * 10 ** sellToken.decimals)
        );

        /* ── Try direct path first ── */
        let path: `0x${string}`[] = [sellToken.address, buyToken.address];
        let amounts: bigint[] | null = null;

        try {
          const res = await client.readContract({
            address:      contracts.router,
            abi:          ROUTER_ABI,
            functionName: "getAmountsOut",
            args:         [amtIn, path],
          }) as bigint[];
          if (res[res.length - 1] > 0n) amounts = res;
        } catch { /* no direct pair */ }

        /* ── Multi-hop via wUSDC if direct fails ── */
        if (!amounts && contracts.wNative !== sellToken.address && contracts.wNative !== buyToken.address) {
          const hopPath: `0x${string}`[] = [sellToken.address, contracts.wNative, buyToken.address];
          try {
            const res = await client.readContract({
              address:      contracts.router,
              abi:          ROUTER_ABI,
              functionName: "getAmountsOut",
              args:         [amtIn, hopPath],
            }) as bigint[];
            if (res[res.length - 1] > 0n) {
              amounts = res;
              path    = hopPath;
            }
          } catch { /* no hop path either */ }
        }

        if (!amounts || amounts.length === 0) {
          setResult({ ...EMPTY, error: "Insufficient liquidity for this trade." });
          return;
        }

        const outRaw   = amounts[amounts.length - 1];
        const minRaw   = applySlippage(outRaw, slippageBps);
        const outFmt   = formatDisplay(outRaw, buyToken.decimals);
        const minFmt   = formatDisplay(minRaw, buyToken.decimals);

        /* Rate: how much buyToken per 1 sellToken */
        const rateDec  = Number(outRaw) / (amt * 10 ** (buyToken.decimals - sellToken.decimals));
        const rateStr  = `1 ${sellToken.symbol} = ${rateDec.toFixed(6)} ${buyToken.symbol}`;

        /* Approx price impact (rough for UX display) */
        const impact = Math.min((amt / 1000) * 0.5, 15); // placeholder; full calc needs reserves

        setResult({
          amountOut:    outFmt,
          minReceived:  minFmt,
          priceImpact:  impact,
          rate:         rateStr,
          path:         path as `0x${string}`[],
          amountOutRaw: outRaw,
          loading:      false,
          error:        null,
        });
      } catch (err: any) {
        setResult({ ...EMPTY, error: err?.message ?? "Quote failed" });
      }
    }, 400);

    return () => clearTimeout(debounce.current);
  }, [sellToken?.address, buyToken?.address, sellAmount, slippageBps, chainId]);

  return result;
}
