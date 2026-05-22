export interface Token {
  address:    `0x${string}`;
  symbol:     string;
  name:       string;
  decimals:   number;
  chainId:    number;
  logoURI:    string;
  color:      string;   /* gradient colours for avatar fallback */
  isNative?:  boolean;  /* native coin — use wrap/unwrap flow   */
  isWrapped?: boolean;  /* wrapped native                       */
}

/* ── ARC Testnet tokens (Chain ID: 5042002) ─────────────── */
const arcTestnetTokens: Token[] = [
  {
    address:   "0x0000000000000000000000000000000000000000",
    symbol:    "USDC",
    name:      "USD Coin",
    decimals:  18,
    chainId:   5042002,
    logoURI:   "/img/logos/usdc.webp",
    color:     "#2775CA, #5bc4f5",
    isNative:  true,
  },
  {
    address:   "0xDe5DB9049a8dd344dC1B7Bbb098f9da60930A6dA",
    symbol:    "wUSDC",
    name:      "Wrapped USDC",
    decimals:  18,
    chainId:   5042002,
    logoURI:   "/img/logos/wusdc.jpeg",
    color:     "#7b61ff, #4c82fb",
    isWrapped: true,
  },
  {
    address:   "0x3742EC64Dc7678de91bdD00c5E1290f3e7D16c44",
    symbol:    "ELMS",
    name:      "ElementSwap Token",
    decimals:  18,
    chainId:   5042002,
    logoURI:   "/img/logos/elements.webp",
    color:     "#fc72ff, #ff5c87",
  },
  {
    address:   "0x4B3cB791833A14ae62273CdFe620a815EB96b4fc",
    symbol:    "ETH",
    name:      "Wrapped Ether",
    decimals:  18,
    chainId:   5042002,
    logoURI:   "/img/logos/eth.webp",
    color:     "#627EEA, #a1b4f5",
  },
  {
    address:   "0x618677f87924D77744f7d956181651e3C4909DDa",
    symbol:    "USDT",
    name:      "Tether USD",
    decimals:  6,
    chainId:   5042002,
    logoURI:   "/img/logos/usdt.png",
    color:     "#26A17B, #57d9a3",
  },
  {
    address:   "0x46642fDBd29E5FbbD3a2A754c0A3e397C301d1a0",
    symbol:    "DAI",
    name:      "Dai Stablecoin",
    decimals:  18,
    chainId:   5042002,
    logoURI:   "/img/logos/dai.png",
    color:     "#F4B731, #f8d580",
  },
];

/* ── Per-chain defaults (from README) ──────────────────── */
export const tokenListsByChain: Record<number, Token[]> = { 5042002: arcTestnetTokens };
export const defaultPairByChain: Record<number, [string, string]> = { 5042002: ["USDC", "ELMS"] };
export const commonTokensByChain: Record<number, string[]> = { 5042002: ["USDC", "wUSDC", "ELMS"] };

export function getTokens(chainId: number): Token[] {
  return tokenListsByChain[chainId] ?? [];
}
export function findToken(address: string, chainId: number): Token | undefined {
  return tokenListsByChain[chainId]?.find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
}
export function findTokenBySymbol(symbol: string, chainId: number): Token | undefined {
  return tokenListsByChain[chainId]?.find((t) => t.symbol === symbol);
}
