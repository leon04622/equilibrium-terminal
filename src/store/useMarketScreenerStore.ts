import { create } from "zustand";
import {
  BUILTIN_SCREENER_PRESETS,
  DEFAULT_SCREENER_FILTER,
  type MarketScreenerFilter,
  type MarketScreenerPreset,
  type MarketScreenerSnapshot,
} from "@/types/institutional-capabilities";

const PRESETS_KEY = "eq-screener-presets";

function loadSavedPresets(): MarketScreenerPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MarketScreenerPreset[];
    return Array.isArray(parsed) ? parsed.filter((p) => !p.builtIn) : [];
  } catch {
    return [];
  }
}

function persistSavedPresets(presets: MarketScreenerPreset[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets.filter((p) => !p.builtIn)));
  } catch {
    /* storage blocked */
  }
}

interface MarketScreenerState {
  snapshot: MarketScreenerSnapshot | null;
  filter: MarketScreenerFilter;
  activePresetId: string;
  savedPresets: MarketScreenerPreset[];
  setSnapshot: (snapshot: MarketScreenerSnapshot) => void;
  setFilter: (patch: Partial<MarketScreenerFilter>) => void;
  applyPreset: (id: string) => void;
  saveCurrentAsPreset: (label: string) => void;
  deletePreset: (id: string) => void;
  hydratePresets: () => void;
}

export const useMarketScreenerStore = create<MarketScreenerState>((set, get) => ({
  snapshot: null,
  filter: DEFAULT_SCREENER_FILTER,
  activePresetId: BUILTIN_SCREENER_PRESETS[0].id,
  savedPresets: [],
  setSnapshot: (snapshot) => set({ snapshot }),
  setFilter: (patch) =>
    set({
      filter: { ...get().filter, ...patch },
      activePresetId: "custom",
    }),
  applyPreset: (id) => {
    const all = [...BUILTIN_SCREENER_PRESETS, ...get().savedPresets];
    const preset = all.find((p) => p.id === id);
    if (!preset) return;
    set({ filter: { ...preset.filter }, activePresetId: id });
  },
  saveCurrentAsPreset: (label) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const id = `user_${Date.now()}`;
    const preset: MarketScreenerPreset = {
      id,
      label: trimmed.slice(0, 40),
      filter: { ...get().filter },
    };
    const savedPresets = [...get().savedPresets, preset];
    persistSavedPresets(savedPresets);
    set({ savedPresets, activePresetId: id });
  },
  deletePreset: (id) => {
    const savedPresets = get().savedPresets.filter((p) => p.id !== id);
    persistSavedPresets(savedPresets);
    const activePresetId =
      get().activePresetId === id ? BUILTIN_SCREENER_PRESETS[0].id : get().activePresetId;
    const next: Partial<MarketScreenerState> = { savedPresets, activePresetId };
    if (activePresetId !== get().activePresetId) {
      const preset = BUILTIN_SCREENER_PRESETS.find((p) => p.id === activePresetId);
      if (preset) next.filter = { ...preset.filter };
    }
    set(next);
  },
  hydratePresets: () => set({ savedPresets: loadSavedPresets() }),
}));
