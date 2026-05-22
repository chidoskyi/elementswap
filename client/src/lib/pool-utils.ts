import { createPublicClient, http } from "viem";
import { arcTestnet } from "./wagmi";
import { FACTORY_ABI, PAIR_ABI, ERC20_ABI, ZERO_ADDRESS, contractsByChainId } from "./contracts";
import { findToken } from "../data/tokens";

export interface PoolInfo {
  pairAddress: `0x${string}`;
  token0:      `0x${string}`;
  token1:      `0x${string}`;
  symbol0:     string;
  symbol1:     string;
  reserve0:    bigint;
  reserve1:    bigint;
  totalSupply: bigint;
  color0:      string;
  color1:      string;
}

const chainConfigs: Record<number, typeof arcTestnet> = {
  5042002: arcTestnet,
};

export function getPublicClient(chainId: number) {
  const chain = chainConfigs[chainId] ?? arcTestnet;
  return createPublicClient({ chain, transport: http() });
}

export async function fetchAllPools(chainId: number): Promise<PoolInfo[]> {
  const contracts = contractsByChainId[chainId];
  if (!contracts) return [];

  const client = getPublicClient(chainId);

  let totalPairs: bigint;
  try {
    totalPairs = await client.readContract({
      address:  contracts.factory,
      abi:      FACTORY_ABI,
      functionName: "allPairsLength",
    }) as bigint;
  } catch { return []; }

  const count   = Math.min(Number(totalPairs), 20); // cap at 20 for perf
  const pools: PoolInfo[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const pairAddress = await client.readContract({
        address:  contracts.factory,
        abi:      FACTORY_ABI,
        functionName: "allPairs",
        args:     [BigInt(i)],
      }) as `0x${string}`;

      if (!pairAddress || pairAddress === ZERO_ADDRESS) continue;

      const [token0, token1, reserves, totalSupply] = await Promise.all([
        client.readContract({ address: pairAddress, abi: PAIR_ABI, functionName: "token0" }) as Promise<`0x${string}`>,
        client.readContract({ address: pairAddress, abi: PAIR_ABI, functionName: "token1" }) as Promise<`0x${string}`>,
        client.readContract({ address: pairAddress, abi: PAIR_ABI, functionName: "getReserves" }) as Promise<[bigint, bigint, number]>,
        client.readContract({ address: pairAddress, abi: PAIR_ABI, functionName: "totalSupply" }) as Promise<bigint>,
      ]);

      /* ── Fetch symbols (with fallback) ── */
      let symbol0 = "UNKNOWN", symbol1 = "UNKNOWN";
      try { symbol0 = await client.readContract({ address: token0, abi: ERC20_ABI, functionName: "symbol" }) as string; } catch {}
      try { symbol1 = await client.readContract({ address: token1, abi: ERC20_ABI, functionName: "symbol" }) as string; } catch {}

      // Fallback to address prefix if metadata unavailable
      if (symbol0 === "UNKNOWN") symbol0 = token0.slice(0, 6) + "…";
      if (symbol1 === "UNKNOWN") symbol1 = token1.slice(0, 6) + "…";

      const t0 = findToken(token0, chainId);
      const t1 = findToken(token1, chainId);

      pools.push({
        pairAddress,
        token0, token1,
        symbol0: t0?.symbol ?? symbol0,
        symbol1: t1?.symbol ?? symbol1,
        reserve0: reserves[0],
        reserve1: reserves[1],
        totalSupply,
        color0: t0?.color ?? "#9b9b9b, #5d5d5d",
        color1: t1?.color ?? "#9b9b9b, #5d5d5d",
      });
    } catch { /* skip individual pair failures */ }
  }

  return pools;
}

export async function getPairAddress(
  chainId: number,
  tokenA: `0x${string}`,
  tokenB: `0x${string}`,
): Promise<`0x${string}` | null> {
  const contracts = contractsByChainId[chainId];
  if (!contracts) return null;
  try {
    const client = getPublicClient(chainId);
    const pair = await client.readContract({
      address:  contracts.factory,
      abi:      FACTORY_ABI,
      functionName: "getPair",
      args:     [tokenA, tokenB],
    }) as `0x${string}`;
    return pair === ZERO_ADDRESS ? null : pair;
  } catch { return null; }
}
