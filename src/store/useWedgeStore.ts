import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { resolveWorkspaceLayout } from "@/lib/wedge/WedgeManifest";
import type { Layout } from "react-grid-layout";

const STORAGE_KEY = "eq-wedge-v2";

interface WedgePersist {
  deskFocusMode: boolean;
}

function loadPersist(): WedgePersist {
  /** V1 wedge default per mission: HL execution desk first. */
  if (typeof window === "undefined") return { deskFocusMode: true };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { deskFocusMode: true };
    const parsed = JSON.parse(raw) as Partial<WedgePersist>;
    if (typeof parsed.deskFocusMode === "boolean") {
      return { deskFocusMode: parsed.deskFocusMode };
    }
    return { deskFocusMode: true };
  } catch {
    return { deskFocusMode: true };
  }
}

function savePersist(partial: Partial<WedgePersist>) {
  if (typeof window === "undefined") return;
  try {
    const next = { ...loadPersist(), ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

export interface WedgeState {
  /** When true (default): V1 HL execution desk. When false: full dev workspace. */
  deskFocusMode: boolean;
  setDeskFocusMode: (on: boolean) => void;
  toggleDeskFocusMode: () => void;
  buildLayout: () => Layout[];
}

export const useWedgeStore = create<WedgeState>()(
  subscribeWithSelector((set, get) => {
    const persisted = loadPersist();
    return {
      deskFocusMode: persisted.deskFocusMode,

      setDeskFocusMode: (on) => {
        savePersist({ deskFocusMode: on });
        set({ deskFocusMode: on });
      },

      toggleDeskFocusMode: () => {
        const next = !get().deskFocusMode;
        savePersist({ deskFocusMode: next });
        set({ deskFocusMode: next });
      },

      buildLayout: () => resolveWorkspaceLayout(get().deskFocusMode),
    };
  }),
);

/** @deprecated Use deskFocusMode */
export function wedgeShowsAdvancedPanels(): boolean {
  return !useWedgeStore.getState().deskFocusMode;
}
