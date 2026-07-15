import { create } from "zustand";
import type { SettlementReconciliationSnapshot } from "@/types/institutional-capabilities";

interface SettlementLedgerState {
  snapshot: SettlementReconciliationSnapshot | null;
  setSnapshot: (snapshot: SettlementReconciliationSnapshot) => void;
}

export const useSettlementLedgerStore = create<SettlementLedgerState>((set) => ({
  snapshot: null,
  setSnapshot: (snapshot) => set({ snapshot }),
}));
