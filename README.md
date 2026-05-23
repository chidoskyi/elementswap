# ElementSwap


Uniswap-style decentralized exchange on **ARC Testnet** (Chain ID: 5042002).
Frontend-only — all blockchain interactions via RPC, no backend server required.

---

## Getting Started

### Prerequisites
- Node.js v16 or higher
- npm or yarn
- A Web3 wallet (MetaMask recommended)

### Quick Start

**1. Clone / extract the project**
```bash
cd knoxswap

```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment**
```bash
cp .env.example .env
# Edit .env — add your WalletConnect Project ID
# Get one free at https://cloud.walletconnect.com
```

**4. Run development server**
```bash
npm run dev
# → http://localhost:5000
```

### Production build
```bash
npm run build
npm start
```

---

## Available commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot-reload on port 5000 |
| `npm run build` | Build optimised production bundle → `dist/public/` |
| `npm start` | Serve production build |
| `npm run preview` | Preview production build |

---

## Networks

### ARC Testnet (Chain ID: 5042002)

| Item | Value |
|---|---|
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | `https://testnet.arcscan.app` |
| Native token | USDC (18 decimals) |
| Wrapped native | wUSDC — `0xDe5DB9049a8dd344dC1B7Bbb098f9da60930A6dA` |
| Factory | `0x7cC023C7184810B84657D55c1943eBfF8603B72B` |
| Router | `0xB92428D440c335546b69138F7fAF689F5ba8D436` |
| Default pair | USDC / ACHS |

---

## Project structure

```
knoxswap/

├── client/
│   ├── index.html
│   ├── public/
│   │   └── img/logos/          ← token + network logos
│   └── src/
│       ├── main.tsx
│       ├── App.tsx              ← providers + routing
│       ├── styles/globals.css   ← Uniswap-exact CSS tokens
│       ├── components/
│       │   ├── Header.tsx       ← logo | nav pill | chain | wallet
│       │   ├── TokenAvatar.tsx  ← logo with gradient fallback
│       │   ├── TokenSelectModal.tsx
│       │   └── SwapSettings.tsx ← slippage + deadline panel
│       ├── pages/
│       │   ├── Swap.tsx         ← swap interface
│       │   ├── Pools.tsx        ← on-chain pool discovery
│       │   ├── AddLiquidity.tsx
│       │   ├── RemoveLiquidity.tsx
│       │   └── Explore.tsx      ← analytics / metrics
│       ├── lib/
│       │   ├── wagmi.ts         ← RainbowKit + wagmi config
│       │   ├── contracts.ts     ← addresses + ABIs
│       │   ├── decimal-utils.ts ← safe math (any decimal precision)
│       │   └── pool-utils.ts    ← on-chain pool fetching
│       └── data/
│           └── tokens.ts        ← token list with chainId filtering
├── vite.config.ts
├── tailwind.config.ts
├── package.json
└── .env.example
```

---

## Deploying V2 contracts (Remix)

See the full deployment guide in the original README. Short version:

1. Open https://remix.ethereum.org
2. Connect MetaMask to ARC Testnet (Chain ID 5042002, RPC `https://rpc.testnet.arc.network`)
3. Deploy `AchSwapV2Factory` → copy address
4. Call `INIT_CODE_PAIR_HASH()` on deployed factory → copy hash
5. Paste hash into `AchSwapV2Library.sol` → recompile
6. Deploy `AchSwapV2Router` with factory address + wUSDC address
7. Update `client/src/lib/contracts.ts` with new addresses

---

## Adding a new chain

Update these four files:

1. `client/src/lib/wagmi.ts` — add chain definition to `SUPPORTED_CHAINS`
2. `client/src/data/tokens.ts` — add token list to `tokenListsByChain`
3. `client/src/lib/contracts.ts` — add addresses to `contractsByChainId`
4. `client/src/lib/pool-utils.ts` — add chain to `chainConfigs`

---

## Key features (from README)

- **150% gas boost** — all transactions include automatic gas estimation with 150% buffer
- **Multi-hop swaps** — auto-routes through wUSDC for pairs without direct liquidity
- **Slippage protection** — configurable tolerance with automatic min-amount calculation
- **On-chain pool discovery** — reads all pairs directly from the factory contract
- **Decimal agnostic** — handles tokens with any precision (0–77 decimals)
- **Token metadata fallback** — shows address prefix if symbol/name unavailable on-chain

---

## Branding notes

This app UI is branded as **ElementSwap**.

- The on-chain contracts remain **AchswapV2*** (contract names/addresses are technical identifiers and should not be renamed in the docs).
- If you fork and redeploy, update the addresses/initialization values in `client/src/lib/contracts.ts` and any token list entries in `client/src/data/tokens.ts`.

