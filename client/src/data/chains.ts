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
    id: 5042002, name: "ARC Testnet", flag: "/img/logos/usdc.webp", symbol: "USDC",
    color: "#4c82fb", rpc: "https://rpc.testnet.arc.network",
    explorer: "https://testnet.arcscan.app",
    tokens: [
      { symbol: "USDC",  name: "USD Coin",      address: "0x0000000000000000000000000000000000000000", decimals: 18, color: "#2775CA,#5bc4f5" },
      { symbol: "wUSDC", name: "Wrapped USDC",  address: "0xDe5DB9049a8dd344dC1B7Bbb098f9da60930A6dA", decimals: 18, color: "#7b61ff,#4c82fb" },
      { symbol: "ELMS",  name: "ElementSwap Token", address: "0x3742EC64Dc7678de91bdD00c5E1290f3e7D16c44", decimals: 18, color: "#fc72ff,#ff5c87" },
    ],
  },
  {
    id: 1, name: "Ethereum", flag: "/img/logos/eth.webp", symbol: "ETH",
    color: "#627EEA", rpc: "https://mainnet.infura.io/v3/public",
    explorer: "https://etherscan.io",
    tokens: [
      { symbol: "ETH",  name: "Ether",         address: "0x0000000000000000000000000000000000000000", decimals: 18, color: "#627EEA,#a1b4f5" },
      { symbol: "USDC", name: "USD Coin",       address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6,  color: "#2775CA,#5bc4f5" },
      { symbol: "USDT", name: "Tether USD",     address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6,  color: "#26A17B,#57d9a3" },
      { symbol: "WBTC", name: "Wrapped Bitcoin",address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8,  color: "#F7931A,#f5b965" },
    ],
  },
  {
    id: 137, name: "Polygon", flag: "/img/logos/polygon.jpeg", symbol: "MATIC",
    color: "#8247E5", rpc: "https://polygon-rpc.com",
    explorer: "https://polygonscan.com",
    tokens: [
      { symbol: "MATIC", name: "Polygon",   address: "0x0000000000000000000000000000000000000000", decimals: 18, color: "#8247E5,#a855f7" },
      { symbol: "USDC",  name: "USD Coin",  address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6,  color: "#2775CA,#5bc4f5" },
      { symbol: "USDT",  name: "Tether",    address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6,  color: "#26A17B,#57d9a3" },
    ],
  },
  {
    id: 56, name: "BNB Chain", flag: "/img/logos/bsc.jpeg", symbol: "BNB",
    color: "#F0B90B", rpc: "https://bsc-dataseed.binance.org",
    explorer: "https://bscscan.com",
    tokens: [
      { symbol: "BNB",  name: "BNB",      address: "0x0000000000000000000000000000000000000000", decimals: 18, color: "#F0B90B,#f8d580" },
      { symbol: "USDT", name: "Tether",   address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18, color: "#26A17B,#57d9a3" },
      { symbol: "USDC", name: "USD Coin", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18, color: "#2775CA,#5bc4f5" },
    ],
  },
  {
    id: 42161, name: "Arbitrum", flag: "/img/logos/arbitrum.jpeg", symbol: "ETH",
    color: "#28A0F0", rpc: "https://arb1.arbitrum.io/rpc",
    explorer: "https://arbiscan.io",
    tokens: [
      { symbol: "ETH",  name: "Ether",    address: "0x0000000000000000000000000000000000000000", decimals: 18, color: "#627EEA,#a1b4f5" },
      { symbol: "USDC", name: "USD Coin", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6,  color: "#2775CA,#5bc4f5" },
      { symbol: "ARB",  name: "Arbitrum", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18, color: "#28A0F0,#6ec6ff" },
    ],
  },
  {
    id: 10, name: "Optimism", flag: "/img/logos/optimism.jpeg", symbol: "ETH",
    color: "#FF0420", rpc: "https://mainnet.optimism.io",
    explorer: "https://optimistic.etherscan.io",
    tokens: [
      { symbol: "ETH",  name: "Ether",    address: "0x0000000000000000000000000000000000000000", decimals: 18, color: "#627EEA,#a1b4f5" },
      { symbol: "USDC", name: "USD Coin", address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6,  color: "#2775CA,#5bc4f5" },
      { symbol: "OP",   name: "Optimism", address: "0x4200000000000000000000000000000000000042", decimals: 18, color: "#FF0420,#ff6b81" },
    ],
  },
  {
    id: 8453, name: "Base", flag: "/img/logos/base.jpeg", symbol: "ETH",
    color: "#0052FF", rpc: "https://mainnet.base.org",
    explorer: "https://basescan.org",
    tokens: [
      { symbol: "ETH",  name: "Ether",    address: "0x0000000000000000000000000000000000000000", decimals: 18, color: "#627EEA,#a1b4f5" },
      { symbol: "USDC", name: "USD Coin", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6,  color: "#2775CA,#5bc4f5" },
    ],
  },
  {
    id: 43114, name: "Avalanche", flag: "/img/logos/avalanche.jpeg", symbol: "AVAX",
    color: "#E84142", rpc: "https://api.avax.network/ext/bc/C/rpc",
    explorer: "https://snowtrace.io",
    tokens: [
      { symbol: "AVAX", name: "Avalanche", address: "0x0000000000000000000000000000000000000000", decimals: 18, color: "#E84142,#ff6b6c" },
      { symbol: "USDC", name: "USD Coin",  address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6,  color: "#2775CA,#5bc4f5" },
    ],
  },
];

export function getChain(id: number): BridgeChain | undefined {
  return BRIDGE_CHAINS.find((c) => c.id === id);
}
