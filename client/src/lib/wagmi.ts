import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

/* ── ARC Testnet — exact values from README ──────────────── */
export const arcTestnet = defineChain({
  id: 5042002,
  name: "ARC Testnet",
  nativeCurrency: { decimals: 18, name: "USD Coin", symbol: "USDC" },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
    public:  { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ARC Scan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName:   "AchSwap",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains:    [arcTestnet],
  ssr:       false,
});
console.log("Project ID:", import.meta.env.VITE_WALLETCONNECT_PROJECT_ID);

export const SUPPORTED_CHAINS = [arcTestnet] as const;
