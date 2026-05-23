// src/lib/bridge.ts

import { AppKit, BridgeChain } from "@circle-fin/app-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import type { EIP1193Provider } from "viem";

const kit = new AppKit();

/**
 * Circle bridge chain identifiers (testnet only).
 * Identifiers are case-sensitive and must match Circle's BridgeChain enum.
 */
const CHAIN_BY_ID: Record<number, BridgeChain> = {
  5042002: BridgeChain.Arc_Testnet,
  11155111: BridgeChain.Ethereum_Sepolia,
  421614: BridgeChain.Arbitrum_Sepolia,
  84532: BridgeChain.Base_Sepolia,
  11155420: BridgeChain.Optimism_Sepolia,
  43113: BridgeChain.Avalanche_Fuji,
  80002: BridgeChain.Polygon_Amoy_Testnet,
};

function getBridgeChain(chainId: number): BridgeChain {
  const chain = CHAIN_BY_ID[chainId];
  if (!chain) {
    throw new Error(`Unsupported bridge chain: ${chainId}`);
  }
  return chain;
}

function getBrowserProvider(): EIP1193Provider {
  const ethereum = (window as any).ethereum;
  if (typeof window === "undefined" || !ethereum) {
    throw new Error("No wallet provider found. Please open the app in a MetaMask-enabled browser.");
  }
  return ethereum as EIP1193Provider;
}

export async function bridgeUSDC(params: {
  fromChainId: number;
  toChainId: number;
  amount: string;
}) {
  const provider = getBrowserProvider();

  const adapter = await createViemAdapterFromProvider({
    provider,
  });

  const result = await kit.bridge({
    from: {
      adapter,
      chain: getBridgeChain(params.fromChainId),
    },
    to: {
      adapter,
      chain: getBridgeChain(params.toChainId),
    },
    amount: params.amount,
    token: "USDC",
  });

  return result;
}