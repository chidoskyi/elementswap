# AchSwap V2 — Contract Deployment Guide

Deploy order: **Core first → get init hash → update Library → deploy Router**

---

## Prerequisites

- MetaMask connected to **ARC Testnet**
  - Chain ID: `5042002`
  - RPC: `https://rpc.testnet.arc.network`
  - Symbol: `USDC`
  - Explorer: `https://testnet.arcscan.app`
- Enough USDC for gas
- [Remix IDE](https://remix.ethereum.org)

---

## Step 1 — Remix setup

1. Open https://remix.ethereum.org
2. In **File Explorer → Upload Files**: upload both `.sol` files from this `contracts/` folder
3. In **Deploy & Run Transactions**:
   - Set **Environment** → `Injected Provider - MetaMask`
   - Confirm MetaMask is on ARC Testnet

---

## Step 2 — Compile Core contracts

File: `AchswapV2Core.sol`

- **Compiler**: `0.5.16` (exact — must match `pragma solidity =0.5.16`)
- **Optimizer**: ✅ Enabled — **Runs: 2000**
- ARC has a 24 KB contract size limit. The optimizer keeps the pair contract under it.

---

## Step 3 — Deploy `ACHSWAPV2Factory`

1. In Remix select contract: `ACHSWAPV2Factory`
2. Constructor argument:
   - `_feeToSetter`: your wallet address (receives fee admin rights)
3. Click **Deploy** → confirm MetaMask
4. ✅ Copy the deployed **Factory address**

---

## Step 4 — Get the Init Code Hash

The init code hash is a `bytes32` deterministic fingerprint of the `ACHSWAPV2Pair` bytecode.
The Router uses it to compute pair addresses off-chain without calling the factory.

After deploying the Factory:
1. In Remix, expand the deployed `ACHSWAPV2Factory` instance
2. Call: `INIT_CODE_PAIR_HASH` *(no arguments)*

   > If the getter is not exposed, compute it manually in Remix console:
   > ```js
   > const bytecode = await artifacts.require('ACHSWAPV2Pair').new.getData()
   > web3.utils.keccak256(bytecode)
   > ```

3. Copy the returned `bytes32` value (64 hex characters, no `0x` prefix needed for the next step)

**The currently deployed hash on ARC Testnet:**
```
9501ae7182c857be72cae9ef2da358bfbf59c1f791ec50d0c722e77aaecc4912
```
If you redeploy the Factory with a different compiler/optimizer setting, you MUST re-derive this hash.

---

## Step 5 — Update `AchswapV2Router.sol` with your hash

Open `AchswapV2Router.sol` and find `AchswapV2Library.pairFor()`:

```solidity
pair = address(uint(keccak256(abi.encodePacked(
    hex'ff',
    factory,
    keccak256(abi.encodePacked(token0, token1)),
    hex'9501ae7182c857be72cae9ef2da358bfbf59c1f791ec50d0c722e77aaecc4912' // ← replace if hash changed
))));
```

Replace the 64-char hex string with your new hash (keep the `hex'...'` wrapper).
**Save and recompile** before proceeding.

---

## Step 6 — Compile Router contracts

File: `AchswapV2Router.sol`

- **Compiler**: `0.6.6` (exact — must match `pragma solidity =0.6.6`)
- **Optimizer**: ✅ Enabled — **Runs: 2000**

---

## Step 7 — Deploy `AchswapV2Router02`

1. In Remix select contract: `AchswapV2Router02`
2. Constructor arguments:
   - `_factory`: ← paste Factory address from Step 3
   - `_WETH`: `0xDe5DB9049a8dd344dC1B7Bbb098f9da60930A6dA`
     *(This is wUSDC — the "wrapped native" on ARC Testnet)*
3. Click **Deploy** → confirm MetaMask
4. ✅ Copy the deployed **Router address**

---

## Step 8 — Update the frontend

Edit `client/src/lib/contracts.ts`:

```ts
export const contractsByChainId: Record<number, ChainContracts> = {
  5042002: {
    factory:  "0xYOUR_NEW_FACTORY_ADDRESS",   // ← Step 3
    router:   "0xYOUR_NEW_ROUTER_ADDRESS",    // ← Step 7
    wNative:  "0xDe5DB9049a8dd344dC1B7Bbb098f9da60930A6dA",
    explorer: "https://testnet.arcscan.app",
    rpc:      "https://rpc.testnet.arc.network",
    initCodeHash: "0xYOUR_INIT_CODE_HASH",    // ← Step 4
  },
};
```

---

## Step 9 — Add initial liquidity

Before swaps can work, at least one pool needs liquidity.

**Option A — Use the UI**:
1. `npm run dev` → open `http://localhost:5000`
2. Connect wallet → go to **Pool → New position**
3. Select USDC + ACHS → enter amounts → click **Add Liquidity**

**Option B — Remix directly**:
1. Approve both tokens to the Router address
2. Call `addLiquidity(tokenA, tokenB, amountA, amountB, 0, 0, yourAddress, deadline)`

---

## Common errors

| Error | Fix |
|---|---|
| `INSUFFICIENT_OUTPUT_AMOUNT` immediately after deploy | No liquidity yet — add liquidity first |
| Pair address mismatch / swap fails with wrong amounts | Init code hash in Router doesn't match Factory — redo Step 4-5 |
| Contract exceeds 24 KB | Increase optimizer runs to 5000+ |
| `EXPIRED` | Increase `deadline` — use `block.timestamp + 1200` |
| MetaMask won't connect | Add ARC Testnet manually: Chain ID 5042002, RPC `https://rpc.testnet.arc.network` |

---

## Deployed addresses (ARC Testnet — original deployment)

| Contract | Address |
|---|---|
| Factory | `0x7cC023C7184810B84657D55c1943eBfF8603B72B` |
| Router  | `0xB92428D440c335546b69138F7fAF689F5ba8D436` |
| wUSDC   | `0xDe5DB9049a8dd344dC1B7Bbb098f9da60930A6dA` |
| Init hash | `9501ae7182c857be72cae9ef2da358bfbf59c1f791ec50d0c722e77aaecc4912` |
