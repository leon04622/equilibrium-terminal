import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Layout } from "react-grid-layout";
import {
  cloneDeskLayout,
  isDeskId,
  type DeskId,
} from "@/lib/desks/DeskRegistry";
import { mergeMissingCorePanels } from "@/lib/wedge/layoutMerge";

const STORAGE_KEY = "eq-desks-v1";
const BOOT_KEY = "eq-boot-operator-os-v1";

interface DeskPersist {
  activeDeskId: DeskId | null;
  /** PHASE 8 — workspace memory: user-tuned layout per desk. */
  layouts: Partial<Record<DeskId, Layout[]>>;
}

const EMPTY: DeskPersist = { activeDeskId: "execution", layouts: {} };

function loadPersist(): DeskPersist {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BOOT_KEY, "1");
      return EMPTY;
    }
    const parsed = JSON.parse(raw) as Partial<DeskPersist>;
    const activeDeskId = isDeskId(parsed.activeDeskId ?? undefined)
      ? (parsed.activeDeskId as DeskId)
      : null;
    let layouts =
      parsed.layouts && typeof parsed.layouts === "object"
        ? (parsed.layouts as Partial<Record<DeskId, Layout[]>>)
        : {};

    // Inject wedge-core panels (newswire, etc.) into saved layouts from before they shipped.
    let migrated = false;
    const nextLayouts: Partial<Record<DeskId, Layout[]>> = { ...layouts };
    for (const id of Object.keys(nextLayouts) as DeskId[]) {
      if (!isDeskId(id)) continue;
      const saved = nextLayouts[id];
      if (!saved?.length) continue;
      const merged = mergeMissingCorePanels(saved, cloneDeskLayout(id));
      if (merged.length !== saved.length) {
        nextLayouts[id] = merged;
        migrated = true;
      }
    }
    if (migrated) {
      layouts = nextLayouts;
      savePersist({ activeDeskId, layouts });
    }

    if (!localStorage.getItem(BOOT_KEY) && activeDeskId === null) {
      localStorage.setItem(BOOT_KEY, "1");
      return { activeDeskId: "execution", layouts };
    }
    return {
      activeDeskId,
      layouts,
    };
  } catch {
    return EMPTY;
  }
}

function savePersist(state: DeskPersist) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

export interface DeskState {
  /** Active specialized desk, or null when on the legacy wedge/full layout. */
  activeDeskId: DeskId | null;
  layouts: Partial<Record<DeskId, Layout[]>>;
  /** True briefly during a desk switch so the grid can cross-fade. */
  transitioning: boolean;

  setActiveDesk: (id: DeskId | null) => void;
  /** Returns the saved layout for a desk, or its canonical layout. */
  layoutFor: (id: DeskId) => Layout[];
  /** PHASE 8 — persist a user-tuned layout for the active desk. */
  saveDeskLayout: (id: DeskId, layout: Layout[]) => void;
  /** Reset a desk back to its canonical layout. */
  resetDeskLayout: (id: DeskId) => void;
  endTransition: () => void;
}

export const useDeskStore = create<DeskState>()(
  subscribeWithSelector((set, get) => {
    const persisted = loadPersist();
    return {
      activeDeskId: persisted.activeDeskId,
      layouts: persisted.layouts,
      transitioning: false,

      setActiveDesk: (id) => {
        if (id === get().activeDeskId) return;
        savePersist({ activeDeskId: id, layouts: get().layouts });
        set({ activeDeskId: id, transitioning: true });
      },

      layoutFor: (id) => {
        const canonical = cloneDeskLayout(id);
        const saved = get().layouts[id];
        if (saved && saved.length) {
          return mergeMissingCorePanels(saved, canonical);
        }
        return canonical;
      },

      saveDeskLayout: (id, layout) => {
        const layouts = { ...get().layouts, [id]: layout.map((l) => ({ ...l })) };
        savePersist({ activeDeskId: get().activeDeskId, layouts });
        set({ layouts });
      },

      resetDeskLayout: (id) => {
        const layouts = { ...get().layouts };
        delete layouts[id];
        savePersist({ activeDeskId: get().activeDeskId, layouts });
        set({ layouts });
      },

      endTransition: () => set({ transitioning: false }),
    };
  }),
);
