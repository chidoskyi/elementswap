/**
 * store/useHistoryStore.ts
 * Persisted transaction history for all user actions:
 * swap, bridge, send, add/remove liquidity, wrap/unwrap.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TxType =
  | "swap" | "bridge" | "send" | "add_liquidity"
  | "remove_liquidity" | "wrap" | "unwrap" | "yield_deposit" | "yield_withdraw";

export type TxStatus = "pending" | "confirmed" | "failed";

export interface HistoryEntry {
  id:        string;
  type:      TxType;
  status:    TxStatus;
  txHash?:   string;
  chainId:   number;
  network:   string;
  timestamp: number;       // Unix ms

  // Amounts
  amountIn?:   string;
  amountOut?:  string;
  symbolIn?:   string;
  symbolOut?:  string;

  // Bridge / Send extras
  toChain?:    string;
  toCountry?:  string;
  recipient?:  string;
  feeDisplay?: string;

  explorerUrl?: string;
}

interface HistoryState {
  entries:    HistoryEntry[];
  panelOpen:  boolean;

  add:           (e: HistoryEntry) => void;
  updateStatus:  (id: string, status: TxStatus, txHash?: string) => void;
  clear:         () => void;
  setPanelOpen:  (v: boolean) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries:   [],
      panelOpen: false,

      add: (e) =>
        set((s) => ({ entries: [e, ...s.entries].slice(0, 100) })),  // keep last 100

      updateStatus: (id, status, txHash) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, status, ...(txHash ? { txHash } : {}) } : e
          ),
        })),

      clear: () => set({ entries: [] }),

      setPanelOpen: (v) => set({ panelOpen: v }),
    }),
    { name: "achswap-history" }
  )
);

/** Helper to add a pending entry then resolve it once tx confirms */
export function trackTx(
  partial: Omit<HistoryEntry, "id" | "timestamp" | "status">,
  txHashPromise: Promise<string>
): string {
  const id = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const { add, updateStatus } = useHistoryStore.getState();

  add({ ...partial, id, timestamp: Date.now(), status: "pending" });

  txHashPromise
    .then((hash) => updateStatus(id, "confirmed", hash))
    .catch(() => updateStatus(id, "failed"));

  return id;
}
