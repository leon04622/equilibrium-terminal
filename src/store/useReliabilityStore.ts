import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { ReliabilityAuditLog } from "@/lib/reliability";
import type { ReliabilityAuditEntry, ReliabilitySnapshot } from "@/types/reliability";

export interface ReliabilityState {
  snapshot: ReliabilitySnapshot | null;
  auditLog: ReliabilityAuditEntry[];
  highVolMode: boolean;
  calmUiMode: boolean;

  hydrateLog: () => void;
  setSnapshot: (snapshot: ReliabilitySnapshot) => void;
  appendAudit: (entry: Omit<ReliabilityAuditEntry, "id" | "at">) => void;
  clearAudit: () => void;
}

export const useReliabilityStore = create<ReliabilityState>()(
  subscribeWithSelector((set, get) => ({
    snapshot: null,
    auditLog: [],
    highVolMode: false,
    calmUiMode: false,

    hydrateLog: () => set({ auditLog: ReliabilityAuditLog.load() }),
    setSnapshot: (snapshot) =>
      set({
        snapshot,
        highVolMode: snapshot.volatility.highVolMode,
        calmUiMode: snapshot.volatility.animationSuppression,
      }),
    appendAudit: (entry) =>
      set((s) => ({
        auditLog: ReliabilityAuditLog.append(s.auditLog, entry),
      })),
    clearAudit: () => {
      ReliabilityAuditLog.save([]);
      set({ auditLog: [] });
      get().appendAudit({
        category: "recovery",
        severity: "info",
        summary: "Reliability audit cleared",
        detail: "Local audit history reset by operator.",
      });
    },
  })),
);
