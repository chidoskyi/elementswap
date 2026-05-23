/**
 * store/useHistoryStore.ts
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type TxType =
  | "swap" | "bridge" | "send"
  | "add_liquidity" | "remove_liquidity"
  | "wrap" | "unwrap"
  | "yield_deposit" | "yield_withdraw";

export type TxStatus = "pending" | "confirmed" | "failed";

export interface HistoryEntry {
  id:        string;
  type:      TxType;
  status:    TxStatus;
  txHash?:   string;
  chainId:   number;
  network:   string;
  timestamp: number;

  amountIn?:   string;
  amountOut?:  string;
  symbolIn?:   string;
  symbolOut?:  string;

  // Bridge extras
  toChain?:    string;

  // Send extras
  toCountry?:  string;
  recipient?:  string;
  reference?:  string;   // ← Kudi Arc backend ref e.g. "KUDI-NGN-ABC123"

  feeDisplay?:  string;
  explorerUrl?: string;
}

interface HistoryState {
  entries:   HistoryEntry[];
  panelOpen: boolean;          // NOT persisted — always starts closed

  add:          (e: HistoryEntry) => void;
  updateStatus: (id: string, status: TxStatus, txHash?: string) => void;
  clear:        () => void;
  setPanelOpen: (v: boolean) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries:   [],
      panelOpen: false,

      add: (e) =>
        set((s) => ({ entries: [e, ...s.entries].slice(0, 100) })),

      updateStatus: (id, status, txHash) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id
              ? { ...e, status, ...(txHash ? { txHash } : {}) }
              : e
          ),
        })),

      clear: () => set({ entries: [] }),

      setPanelOpen: (v) => set({ panelOpen: v }),
    }),
    {
      name:    "achswap-history",
      storage: createJSONStorage(() => localStorage),
      // ← KEY FIX: only persist entries, never panelOpen.
      // Without this, zustand rehydrates the full snapshot (including
      // panelOpen: true/false) and can race with in-flight state writes,
      // causing entries added right after mount to appear lost.
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);

/**
 * trackTx — fire-and-forget helper for on-chain transactions.
 *
 * Usage in your swap / bridge page:
 *
 *   const txHash = await walletClient.sendTransaction({ ... });
 *   trackTx({
 *     type: "swap", chainId: 5042002, network: "ARC Testnet",
 *     amountIn: "10", symbolIn: "USDC", amountOut: "9.14", symbolOut: "EURC",
 *   }, provider.waitForTransaction(txHash));
 */
export function trackTx(
  partial: Omit<HistoryEntry, "id" | "timestamp" | "status">,
  txConfirmation: Promise<string>   // resolves with the tx hash
): string {
  const id = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const { add, updateStatus } = useHistoryStore.getState();

  add({ ...partial, id, timestamp: Date.now(), status: "pending" });

  txConfirmation
    .then((hash) => updateStatus(id, "confirmed", hash))
    .catch(()    => updateStatus(id, "failed"));

  return id;
}