// src/lib/chain.ts
import { BridgeChain } from "@circle-fin/app-kit";

export const BRIDGE_CHAIN_BY_ID = {
  5042002: BridgeChain.Arc_Testnet,
  1: BridgeChain.Ethereum,
  137: BridgeChain.Polygon,
  42161: BridgeChain.Arbitrum,
  10: BridgeChain.Optimism,
  8453: BridgeChain.Base,
  43114: BridgeChain.Avalanche,
} as const;

export const BRIDGE_SUPPORTED_CHAIN_IDS = new Set<number>(
  Object.keys(BRIDGE_CHAIN_BY_ID).map(Number)
);

export function getCircleChain(chainId: number): BridgeChain {
  const chain = BRIDGE_CHAIN_BY_ID[chainId as keyof typeof BRIDGE_CHAIN_BY_ID];
  if (!chain) {
    throw new Error(`Chain ${chainId} is not supported by Circle Bridge`);
  }
  return chain;
}

export function isBridgeSupportedChain(chainId: number): boolean {
  return BRIDGE_SUPPORTED_CHAIN_IDS.has(chainId);
}