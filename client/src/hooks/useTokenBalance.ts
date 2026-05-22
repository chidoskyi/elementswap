/**
 * hooks/useTokenBalance.ts
 * Reads native + ERC-20 balances and formats for display.
 */

import { useBalance } from "wagmi";
import { formatDisplay } from "../lib/decimal-utils";
import type { Token } from "../data/tokens";

export function useTokenBalance(address: `0x${string}` | undefined, token: Token | null) {
  const { data, isLoading, refetch } = useBalance({
    address,
    token: token?.isNative ? undefined : (token?.address as `0x${string}` | undefined),
    query: { enabled: !!address && !!token, refetchInterval: 12_000 },
  });

  const raw     = data?.value ?? 0n;
  const symbol  = data?.symbol ?? token?.symbol ?? "";
  const display = token ? formatDisplay(raw, token.decimals) : "0";

  return { raw, display, symbol, isLoading, refetch };
}
