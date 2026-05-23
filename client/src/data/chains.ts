// src/data/chains.ts
// Bridge-supported testnet chains — only chains where USDC bridge works
// Source: https://docs.arc.io/app-kit/references/supported-blockchains

export interface BridgeChain {
  id:       number;
  name:     string;
  flag:     string;
  symbol:   string;
  color:    string;
  rpc:      string;
  explorer: string;
  tokens:   BridgeToken[];
}

export interface BridgeToken {
  symbol:   string;
  name:     string;
  address:  string;
  decimals: number;
  color:    string;
  logoURI?: string;
}

export const BRIDGE_CHAINS: BridgeChain[] = [
  {
    id: 5042002,
    name: "ARC Testnet",
    flag: "/img/logos/usdc.webp",
    symbol: "USDC",
    color: "#4c82fb",
    rpc: "https://rpc.testnet.arc.network",
    explorer: "https://testnet.arcscan.app",
    tokens: [
      { symbol: "USDC",  name: "USD Coin",          address: "0x0000000000000000000000000000000000000000", decimals: 18, color: "#2775CA,#5bc4f5" },
      { symbol: "wUSDC", name: "Wrapped USDC",       address: "0xDe5DB9049a8dd344dC1B7Bbb098f9da60930A6dA", decimals: 18, color: "#7b61ff,#4c82fb" },
      { symbol: "ELMS",  name: "ElementSwap Token",  address: "0x3742EC64Dc7678de91bdD00c5E1290f3e7D16c44", decimals: 18, color: "#fc72ff,#ff5c87" },
    ],
  },
  {
    id: 11155111,
    name: "Ethereum Sepolia",
    flag: "/img/logos/eth.webp",
    symbol: "ETH",
    color: "#627EEA",
    rpc: "https://rpc.sepolia.org",
    explorer: "https://sepolia.etherscan.io",
    tokens: [
      { symbol: "ETH",  name: "Ether",    address: "0x0000000000000000000000000000000000000000", decimals: 18, color: "#627EEA,#a1b4f5" },
      { symbol: "USDC", name: "USD Coin", address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", decimals: 6,  color: "#2775CA,#5bc4f5" },
    ],
  },
  {
    id: 421614,
    name: "Arbitrum Sepolia",
    flag: "/img/logos/arbitrum.jpeg",
    symbol: "ETH",
    color: "#28A0F0",
    rpc: "https://sepolia-rollup.arbitrum.io/rpc",
    explorer: "https://sepolia.arbiscan.io",
    tokens: [
      { symbol: "ETH",  name: "Ether",    address: "0x0000000000000000000000000000000000000000", decimals: 18, color: "#627EEA,#a1b4f5" },
      { symbol: "USDC", name: "USD Coin", address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", decimals: 6,  color: "#2775CA,#5bc4f5" },
    ],
  },
  {
    id: 84532,
    name: "Base Sepolia",
    flag: "/img/logos/base.jpeg",
    symbol: "ETH",
    color: "#0052FF",
    rpc: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
    tokens: [
      { symbol: "ETH",  name: "Ether",    address: "0x0000000000000000000000000000000000000000", decimals: 18, color: "#627EEA,#a1b4f5" },
      { symbol: "USDC", name: "USD Coin", address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", decimals: 6,  color: "#2775CA,#5bc4f5" },
    ],
  },
  {
    id: 11155420,
    name: "OP Sepolia",
    flag: "/img/logos/optimism.jpeg",
    symbol: "ETH",
    color: "#FF0420",
    rpc: "https://sepolia.optimism.io",
    explorer: "https://sepolia-optimism.etherscan.io",
    tokens: [
      { symbol: "ETH",  name: "Ether",    address: "0x0000000000000000000000000000000000000000", decimals: 18, color: "#627EEA,#a1b4f5" },
      { symbol: "USDC", name: "USD Coin", address: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7", decimals: 6,  color: "#2775CA,#5bc4f5" },
    ],
  },
  {
    id: 43113,
    name: "Avalanche Fuji",
    flag: "/img/logos/avalanche.jpeg",
    symbol: "AVAX",
    color: "#E84142",
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    explorer: "https://testnet.snowtrace.io",
    tokens: [
      { symbol: "AVAX", name: "Avalanche", address: "0x0000000000000000000000000000000000000000", decimals: 18, color: "#E84142,#ff6b6c" },
      { symbol: "USDC", name: "USD Coin",  address: "0x5425890298aed601595a70AB815c96711a31Bc65", decimals: 6,  color: "#2775CA,#5bc4f5" },
    ],
  },
  {
    id: 80002,
    name: "Polygon Amoy",
    flag: "/img/logos/polygon.jpeg",
    symbol: "MATIC",
    color: "#8247E5",
    rpc: "https://rpc-amoy.polygon.technology",
    explorer: "https://amoy.polygonscan.com",
    tokens: [
      { symbol: "MATIC", name: "Polygon",  address: "0x0000000000000000000000000000000000000000", decimals: 18, color: "#8247E5,#a855f7" },
      { symbol: "USDC",  name: "USD Coin", address: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582", decimals: 6,  color: "#2775CA,#5bc4f5" },
    ],
  },
];

export function getChain(id: number): BridgeChain | undefined {
  return BRIDGE_CHAINS.find((c) => c.id === id);
}

export function getUsdcToken(chain: BridgeChain): BridgeToken {
  return chain.tokens.find((t) => t.symbol === "USDC") ?? chain.tokens[0];
}