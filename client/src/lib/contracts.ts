/**
 * lib/contracts.ts
 * ─────────────────
 * Contract addresses + ABIs extracted directly from:
 *   contracts/AchswapV2Core.sol   (pragma solidity =0.5.16)
 *   contracts/AchswapV2Router.sol (pragma solidity =0.6.6)
 *
 * LP token:  name="ACHSWAP V2"  symbol="Achswap-V2"  decimals=18
 * Swap fee:  0.3%  (997/1000 formula in AchswapV2Library.getAmountOut)
 * Init hash: 683d24ea0bd739688620d551f4013c550d2259bc1aec69c8aeb91ada09bc89e2
 *
 * NOTE: On ARC Testnet "WETH" = wUSDC (0xDe5DB9...6dA).
 *       The Router constructor receives _WETH = wUSDC address.
 */

/* ── Chain config ─────────────────────────────────────────── */
export interface ChainContracts {
  factory:  `0x${string}`;
  router:   `0x${string}`;
  wNative:  `0x${string}`;   // wUSDC on ARC testnet
  explorer: string;
  rpc:      string;
  initCodeHash: string;      // from AchswapV2Library.pairFor
}

export const contractsByChainId: Record<number, ChainContracts> = {
  5042002: {
    factory:      '0xa1590cA4F350407582b6244B53E7C6c0AD9861ad',
    router:       '0x512F66593c6B69434F4657753bfB0f035b3797c3',
    wNative:      '0xDe5DB9049a8dd344dC1B7Bbb098f9da60930A6dA',
    explorer:     'https://testnet.arcscan.app',
    rpc:          'https://rpc.testnet.arc.network',
    initCodeHash: '683d24ea0bd739688620d551f4013c550d2259bc1aec69c8aeb91ada09bc89e2',
  },
};


export function getContracts(chainId: number): ChainContracts {
  const c = contractsByChainId[chainId];
  if (!c) throw new Error(`Unsupported chain: ${chainId}`);
  return c;
}

export function explorerTx(chainId: number, hash: string): string {
  return `${contractsByChainId[chainId]?.explorer ?? ""}/tx/${hash}`;
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

/* ── ACHSWAPV2Factory ABI ─────────────────────────────────────
   Source: contracts/AchswapV2Core.sol — contract ACHSWAPV2Factory
─────────────────────────────────────────────────────────────── */
export const FACTORY_ABI = [
  {
    name: "PairCreated",
    type: "event",
    inputs: [
      { name: "token0", type: "address", indexed: true },
      { name: "token1", type: "address", indexed: true },
      { name: "pair",   type: "address", indexed: false },
      { name: "",       type: "uint256", indexed: false },
    ],
  },
  {
    name: "feeTo",
    type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "address" }],
  },
  {
    name: "feeToSetter",
    type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "address" }],
  },
  {
    name: "getPair",
    type: "function", stateMutability: "view",
    inputs:  [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }],
    outputs: [{ name: "pair",   type: "address" }],
  },
  {
    name: "allPairs",
    type: "function", stateMutability: "view",
    inputs:  [{ name: "", type: "uint256" }],
    outputs: [{ name: "pair", type: "address" }],
  },
  {
    name: "allPairsLength",
    type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "createPair",
    type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "tokenA", type: "address" }, { name: "tokenB", type: "address" }],
    outputs: [{ name: "pair",   type: "address" }],
  },
  {
    name: "setFeeTo",
    type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "_feeTo", type: "address" }], outputs: [],
  },
  {
    name: "setFeeToSetter",
    type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "_feeToSetter", type: "address" }], outputs: [],
  },
] as const;

/* ── ACHSWAPV2Pair ABI ────────────────────────────────────────
   Source: contracts/AchswapV2Core.sol — contract ACHSWAPV2Pair
   LP token: name="ACHSWAP V2"  symbol="Achswap-V2"
─────────────────────────────────────────────────────────────── */
export const PAIR_ABI = [
  /* ── ERC-20 events ── */
  {
    name: "Approval", type: "event",
    inputs: [
      { name: "owner",   type: "address", indexed: true },
      { name: "spender", type: "address", indexed: true },
      { name: "value",   type: "uint256", indexed: false },
    ],
  },
  {
    name: "Transfer", type: "event",
    inputs: [
      { name: "from",  type: "address", indexed: true },
      { name: "to",    type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
  /* ── Pair events ── */
  {
    name: "Mint", type: "event",
    inputs: [
      { name: "sender",  type: "address", indexed: true },
      { name: "amount0", type: "uint256", indexed: false },
      { name: "amount1", type: "uint256", indexed: false },
    ],
  },
  {
    name: "Burn", type: "event",
    inputs: [
      { name: "sender",  type: "address", indexed: true },
      { name: "amount0", type: "uint256", indexed: false },
      { name: "amount1", type: "uint256", indexed: false },
      { name: "to",      type: "address", indexed: true },
    ],
  },
  {
    name: "Swap", type: "event",
    inputs: [
      { name: "sender",    type: "address", indexed: true },
      { name: "amount0In", type: "uint256", indexed: false },
      { name: "amount1In", type: "uint256", indexed: false },
      { name: "amount0Out",type: "uint256", indexed: false },
      { name: "amount1Out",type: "uint256", indexed: false },
      { name: "to",        type: "address", indexed: true },
    ],
  },
  {
    name: "Sync", type: "event",
    inputs: [
      { name: "reserve0", type: "uint112", indexed: false },
      { name: "reserve1", type: "uint112", indexed: false },
    ],
  },
  /* ── ERC-20 view ── */
  { name: "name",        type: "function", stateMutability: "pure",
    inputs: [], outputs: [{ name: "", type: "string" }] },
  { name: "symbol",      type: "function", stateMutability: "pure",
    inputs: [], outputs: [{ name: "", type: "string" }] },
  { name: "decimals",    type: "function", stateMutability: "pure",
    inputs: [], outputs: [{ name: "", type: "uint8" }] },
  { name: "totalSupply", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
  {
    name: "balanceOf",   type: "function", stateMutability: "view",
    inputs:  [{ name: "owner", type: "address" }],
    outputs: [{ name: "",      type: "uint256" }],
  },
  {
    name: "allowance",   type: "function", stateMutability: "view",
    inputs:  [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "",      type: "uint256" }],
  },
  /* ── ERC-20 write ── */
  {
    name: "approve",     type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "spender", type: "address" }, { name: "value", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "transfer",    type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "to", type: "address" }, { name: "value", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "transferFrom", type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "value", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  /* ── EIP-2612 permit ── */
  { name: "DOMAIN_SEPARATOR", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "bytes32" }] },
  { name: "PERMIT_TYPEHASH",  type: "function", stateMutability: "pure",
    inputs: [], outputs: [{ name: "", type: "bytes32" }] },
  {
    name: "nonces", type: "function", stateMutability: "view",
    inputs:  [{ name: "owner", type: "address" }],
    outputs: [{ name: "",      type: "uint256" }],
  },
  {
    name: "permit", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "owner",    type: "address" },
      { name: "spender",  type: "address" },
      { name: "value",    type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "v",        type: "uint8"   },
      { name: "r",        type: "bytes32" },
      { name: "s",        type: "bytes32" },
    ],
    outputs: [],
  },
  /* ── Pair constants ── */
  { name: "MINIMUM_LIQUIDITY", type: "function", stateMutability: "pure",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
  /* ── Pair view ── */
  { name: "factory", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "address" }] },
  { name: "token0",  type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "address" }] },
  { name: "token1",  type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "address" }] },
  {
    name: "getReserves", type: "function", stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "reserve0",          type: "uint112" },
      { name: "reserve1",          type: "uint112" },
      { name: "blockTimestampLast",type: "uint32"  },
    ],
  },
  { name: "price0CumulativeLast", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "price1CumulativeLast", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "kLast", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
  /* ── Pair write ── */
  {
    name: "mint", type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "to", type: "address" }],
    outputs: [{ name: "liquidity", type: "uint256" }],
  },
  {
    name: "burn", type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "to", type: "address" }],
    outputs: [{ name: "amount0", type: "uint256" }, { name: "amount1", type: "uint256" }],
  },
  {
    name: "swap", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "amount0Out", type: "uint256" },
      { name: "amount1Out", type: "uint256" },
      { name: "to",         type: "address" },
      { name: "data",       type: "bytes"   },
    ],
    outputs: [],
  },
  {
    name: "skim", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "to", type: "address" }], outputs: [],
  },
  { name: "sync", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
  {
    name: "initialize", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "", type: "address" }, { name: "", type: "address" }], outputs: [],
  },
] as const;

/* ── AchswapV2Router02 ABI ────────────────────────────────────
   Source: contracts/AchswapV2Router.sol — contract AchswapV2Router02
   WETH = wUSDC on ARC Testnet
─────────────────────────────────────────────────────────────── */
export const ROUTER_ABI = [
  /* ── Immutables ── */
  { name: "factory", type: "function", stateMutability: "pure",
    inputs: [], outputs: [{ name: "", type: "address" }] },
  { name: "WETH",    type: "function", stateMutability: "pure",
    inputs: [], outputs: [{ name: "", type: "address" }] },

  /* ── Liquidity ── */
  {
    name: "addLiquidity", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "tokenA",        type: "address" },
      { name: "tokenB",        type: "address" },
      { name: "amountADesired",type: "uint256" },
      { name: "amountBDesired",type: "uint256" },
      { name: "amountAMin",    type: "uint256" },
      { name: "amountBMin",    type: "uint256" },
      { name: "to",            type: "address" },
      { name: "deadline",      type: "uint256" },
    ],
    outputs: [
      { name: "amountA",   type: "uint256" },
      { name: "amountB",   type: "uint256" },
      { name: "liquidity", type: "uint256" },
    ],
  },
  {
    name: "addLiquidityETH", type: "function", stateMutability: "payable",
    inputs: [
      { name: "token",             type: "address" },
      { name: "amountTokenDesired",type: "uint256" },
      { name: "amountTokenMin",    type: "uint256" },
      { name: "amountETHMin",      type: "uint256" },
      { name: "to",                type: "address" },
      { name: "deadline",          type: "uint256" },
    ],
    outputs: [
      { name: "amountToken", type: "uint256" },
      { name: "amountETH",   type: "uint256" },
      { name: "liquidity",   type: "uint256" },
    ],
  },
  {
    name: "removeLiquidity", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "tokenA",    type: "address" },
      { name: "tokenB",    type: "address" },
      { name: "liquidity", type: "uint256" },
      { name: "amountAMin",type: "uint256" },
      { name: "amountBMin",type: "uint256" },
      { name: "to",        type: "address" },
      { name: "deadline",  type: "uint256" },
    ],
    outputs: [
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" },
    ],
  },
  {
    name: "removeLiquidityETH", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "token",         type: "address" },
      { name: "liquidity",     type: "uint256" },
      { name: "amountTokenMin",type: "uint256" },
      { name: "amountETHMin",  type: "uint256" },
      { name: "to",            type: "address" },
      { name: "deadline",      type: "uint256" },
    ],
    outputs: [
      { name: "amountToken", type: "uint256" },
      { name: "amountETH",   type: "uint256" },
    ],
  },
  {
    name: "removeLiquidityWithPermit", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "tokenA",    type: "address" },
      { name: "tokenB",    type: "address" },
      { name: "liquidity", type: "uint256" },
      { name: "amountAMin",type: "uint256" },
      { name: "amountBMin",type: "uint256" },
      { name: "to",        type: "address" },
      { name: "deadline",  type: "uint256" },
      { name: "approveMax",type: "bool"    },
      { name: "v",         type: "uint8"   },
      { name: "r",         type: "bytes32" },
      { name: "s",         type: "bytes32" },
    ],
    outputs: [{ name: "amountA", type: "uint256" }, { name: "amountB", type: "uint256" }],
  },
  {
    name: "removeLiquidityETHWithPermit", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "token",         type: "address" },
      { name: "liquidity",     type: "uint256" },
      { name: "amountTokenMin",type: "uint256" },
      { name: "amountETHMin",  type: "uint256" },
      { name: "to",            type: "address" },
      { name: "deadline",      type: "uint256" },
      { name: "approveMax",    type: "bool"    },
      { name: "v",             type: "uint8"   },
      { name: "r",             type: "bytes32" },
      { name: "s",             type: "bytes32" },
    ],
    outputs: [{ name: "amountToken", type: "uint256" }, { name: "amountETH", type: "uint256" }],
  },
  {
    name: "removeLiquidityETHSupportingFeeOnTransferTokens",
    type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "token",         type: "address" },
      { name: "liquidity",     type: "uint256" },
      { name: "amountTokenMin",type: "uint256" },
      { name: "amountETHMin",  type: "uint256" },
      { name: "to",            type: "address" },
      { name: "deadline",      type: "uint256" },
    ],
    outputs: [{ name: "amountETH", type: "uint256" }],
  },

  /* ── Swap exact input ── */
  {
    name: "swapExactTokensForTokens", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn",    type: "uint256"    },
      { name: "amountOutMin",type: "uint256"    },
      { name: "path",        type: "address[]"  },
      { name: "to",          type: "address"    },
      { name: "deadline",    type: "uint256"    },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    name: "swapExactETHForTokens", type: "function", stateMutability: "payable",
    inputs: [
      { name: "amountOutMin",type: "uint256"   },
      { name: "path",        type: "address[]" },
      { name: "to",          type: "address"   },
      { name: "deadline",    type: "uint256"   },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    name: "swapExactTokensForETH", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn",    type: "uint256"   },
      { name: "amountOutMin",type: "uint256"   },
      { name: "path",        type: "address[]" },
      { name: "to",          type: "address"   },
      { name: "deadline",    type: "uint256"   },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },

  /* ── Swap exact output ── */
  {
    name: "swapTokensForExactTokens", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "amountOut",   type: "uint256"   },
      { name: "amountInMax", type: "uint256"   },
      { name: "path",        type: "address[]" },
      { name: "to",          type: "address"   },
      { name: "deadline",    type: "uint256"   },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    name: "swapTokensForExactETH", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "amountOut",   type: "uint256"   },
      { name: "amountInMax", type: "uint256"   },
      { name: "path",        type: "address[]" },
      { name: "to",          type: "address"   },
      { name: "deadline",    type: "uint256"   },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    name: "swapETHForExactTokens", type: "function", stateMutability: "payable",
    inputs: [
      { name: "amountOut", type: "uint256"   },
      { name: "path",      type: "address[]" },
      { name: "to",        type: "address"   },
      { name: "deadline",  type: "uint256"   },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },

  /* ── Fee-on-transfer swaps ── */
  {
    name: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
    type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn",    type: "uint256"   },
      { name: "amountOutMin",type: "uint256"   },
      { name: "path",        type: "address[]" },
      { name: "to",          type: "address"   },
      { name: "deadline",    type: "uint256"   },
    ],
    outputs: [],
  },
  {
    name: "swapExactETHForTokensSupportingFeeOnTransferTokens",
    type: "function", stateMutability: "payable",
    inputs: [
      { name: "amountOutMin",type: "uint256"   },
      { name: "path",        type: "address[]" },
      { name: "to",          type: "address"   },
      { name: "deadline",    type: "uint256"   },
    ],
    outputs: [],
  },
  {
    name: "swapExactTokensForETHSupportingFeeOnTransferTokens",
    type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn",    type: "uint256"   },
      { name: "amountOutMin",type: "uint256"   },
      { name: "path",        type: "address[]" },
      { name: "to",          type: "address"   },
      { name: "deadline",    type: "uint256"   },
    ],
    outputs: [],
  },

  /* ── Pure/view math (from AchswapV2Library) ── */
  {
    name: "quote", type: "function", stateMutability: "pure",
    inputs:  [{ name: "amountA",  type: "uint256" }, { name: "reserveA", type: "uint256" }, { name: "reserveB", type: "uint256" }],
    outputs: [{ name: "amountB", type: "uint256" }],
  },
  {
    name: "getAmountOut", type: "function", stateMutability: "pure",
    inputs:  [{ name: "amountIn",  type: "uint256" }, { name: "reserveIn",  type: "uint256" }, { name: "reserveOut", type: "uint256" }],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
  {
    name: "getAmountIn",  type: "function", stateMutability: "pure",
    inputs:  [{ name: "amountOut", type: "uint256" }, { name: "reserveIn",  type: "uint256" }, { name: "reserveOut", type: "uint256" }],
    outputs: [{ name: "amountIn",  type: "uint256" }],
  },
  {
    name: "getAmountsOut", type: "function", stateMutability: "view",
    inputs:  [{ name: "amountIn",  type: "uint256" }, { name: "path", type: "address[]" }],
    outputs: [{ name: "amounts",   type: "uint256[]" }],
  },
  {
    name: "getAmountsIn",  type: "function", stateMutability: "view",
    inputs:  [{ name: "amountOut", type: "uint256" }, { name: "path", type: "address[]" }],
    outputs: [{ name: "amounts",   type: "uint256[]" }],
  },
] as const;

/* ── Standard ERC-20 ABI ──────────────────────────────────────
   Source: interface IERC20 in both contract files
─────────────────────────────────────────────────────────────── */
export const ERC20_ABI = [
  { name: "name",        type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "string" }] },
  { name: "symbol",      type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "string" }] },
  { name: "decimals",    type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint8" }] },
  { name: "totalSupply", type: "function", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }] },
  {
    name: "balanceOf", type: "function", stateMutability: "view",
    inputs:  [{ name: "owner",   type: "address" }],
    outputs: [{ name: "",        type: "uint256" }],
  },
  {
    name: "allowance", type: "function", stateMutability: "view",
    inputs:  [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "",      type: "uint256" }],
  },
  {
    name: "approve", type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "",        type: "bool" }],
  },
  {
    name: "transfer", type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "to", type: "address" }, { name: "value", type: "uint256" }],
    outputs: [{ name: "",   type: "bool" }],
  },
  {
    name: "transferFrom", type: "function", stateMutability: "nonpayable",
    inputs:  [
      { name: "from",  type: "address" },
      { name: "to",    type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  /* ── Events ── */
  {
    name: "Approval", type: "event",
    inputs: [
      { name: "owner",   type: "address", indexed: true  },
      { name: "spender", type: "address", indexed: true  },
      { name: "value",   type: "uint256", indexed: false },
    ],
  },
  {
    name: "Transfer", type: "event",
    inputs: [
      { name: "from",  type: "address", indexed: true  },
      { name: "to",    type: "address", indexed: true  },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

/* ── IWETH ABI ────────────────────────────────────────────────
   Source: interface IWETH in AchswapV2Router.sol
   On ARC Testnet: deposit() wraps USDC → wUSDC
                   withdraw() unwraps wUSDC → USDC
─────────────────────────────────────────────────────────────── */
export const WETH_ABI = [
  {
    name: "deposit",  type: "function", stateMutability: "payable",
    inputs: [], outputs: [],
  },
  {
    name: "withdraw", type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "wad", type: "uint256" }],
    outputs: [],
  },
  {
    name: "transfer", type: "function", stateMutability: "nonpayable",
    inputs:  [{ name: "to", type: "address" }, { name: "value", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;
