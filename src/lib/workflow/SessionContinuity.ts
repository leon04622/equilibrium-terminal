import type { TraderSessionState, WorkflowSnapshotExtension } from "@/types/trader-workflow";

const STORAGE_KEY = "eq-trader-workflow-v1";

export class SessionContinuity {
  static save(extension: WorkflowSnapshotExtension): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(extension));
    } catch {
      /* quota */
    }
  }

  static load(): WorkflowSnapshotExtension | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as WorkflowSnapshotExtension;
    } catch {
      return null;
    }
  }

  static buildSessionState(selectedCoin: string | null): TraderSessionState {
    return {
      version: 1,
      selectedCoin,
      assetWorkspaceMode: "standard",
      activeThesisId: null,
      lastJournalEntryId: null,
      savedAt: Date.now(),
    };
  }
}
