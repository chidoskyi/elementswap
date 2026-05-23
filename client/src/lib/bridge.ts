// src/lib/bridge.ts
// Real USDC bridge using Circle App Kit (CCTP under the hood)
// Docs: https://docs.arc.io/app-kit/bridge

import { AppKit, BridgeChain } from "@circle-fin/app-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import type { EIP1193Provider } from "viem";

declare global {
  interface Window { ethereum?: EIP1193Provider; }
}

// Singleton kit instance
const kit = new AppKit();

// ── Supported testnet chain IDs → Circle BridgeChain identifiers ──────────
// Source: https://docs.arc.io/app-kit/references/supported-blockchains
export const BRIDGE_CHAIN_BY_ID: Record<number, BridgeChain> = {
  5042002:  BridgeChain.Arc_Testnet,
  11155111: BridgeChain.Ethereum_Sepolia,
  421614:   BridgeChain.Arbitrum_Sepolia,
  84532:    BridgeChain.Base_Sepolia,
  11155420: BridgeChain.Optimism_Sepolia,   // OP Sepolia
  43113:    BridgeChain.Avalanche_Fuji,
  80002:    BridgeChain.Polygon_Amoy_Testnet,
  84531:    BridgeChain.Unichain_Sepolia,
};

export function isBridgeSupported(chainId: number): boolean {
  return chainId in BRIDGE_CHAIN_BY_ID;
}

function getBridgeChain(chainId: number): BridgeChain {
  const chain = BRIDGE_CHAIN_BY_ID[chainId];
  if (!chain) throw new Error(`Chain ${chainId} is not supported for bridging.`);
  return chain;
}

function getProvider(): EIP1193Provider {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet provider found. Please open the app in a MetaMask-enabled browser.");
  }
  return window.ethereum;
}

export interface BridgeParams {
  fromChainId: number;
  toChainId:   number;
  amount:      string;   // decimal string e.g. "5.00"
}

export interface BridgeStepResult {
  name:     string;
  state:    string;
  txHash?:  string;
  explorerUrl?: string;
}

export interface BridgeResult {
  steps: BridgeStepResult[];
}

export async function bridgeUSDC(params: BridgeParams): Promise<BridgeResult> {
  const provider = getProvider();

  // createViemAdapterFromProvider uses the connected MetaMask wallet
  const adapter = await createViemAdapterFromProvider({ provider });

  const result = await kit.bridge({
    from: { adapter, chain: getBridgeChain(params.fromChainId) },
    to:   { adapter, chain: getBridgeChain(params.toChainId)   },
    amount: params.amount,
    token: "USDC",
  });

  // Normalise steps for the UI
  const steps: BridgeStepResult[] = (result.steps ?? []).map((s: any) => ({
    name:        s.name,
    state:       s.state,
    txHash:      s.txHash ?? s.data?.txHash,
    explorerUrl: s.data?.explorerUrl,
  }));

  return { steps };
}