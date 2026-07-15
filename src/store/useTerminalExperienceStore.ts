import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { TerminalDensity } from "@/lib/theme/institutional";

const PREFS_KEY = "eq-terminal-experience-v2";

interface ExperiencePrefs {
  density: TerminalDensity;
  calmMode: boolean;
  reducedMotion: boolean;
  beginnerMode: boolean;
}

function loadPrefs(): ExperiencePrefs {
  const defaults: ExperiencePrefs = {
    density: "compact",
    calmMode: true,
    reducedMotion: false,
    beginnerMode: false,
  };
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function savePrefs(prefs: ExperiencePrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export interface TerminalExperienceState extends ExperiencePrefs {
  setDensity: (density: TerminalDensity) => void;
  setCalmMode: (calm: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  setBeginnerMode: (on: boolean) => void;
  toggleBeginnerMode: () => void;
  hydrate: () => void;
}

export const useTerminalExperienceStore = create<TerminalExperienceState>()(
  subscribeWithSelector((set, get) => ({
    ...loadPrefs(),

    setDensity: (density) => {
      savePrefs({ ...get(), density });
      set({ density });
    },
    setCalmMode: (calmMode) => {
      savePrefs({ ...get(), calmMode });
      set({ calmMode });
    },
    setReducedMotion: (reducedMotion) => {
      savePrefs({ ...get(), reducedMotion });
      set({ reducedMotion });
    },
    setBeginnerMode: (beginnerMode) => {
      savePrefs({ ...get(), beginnerMode });
      set({ beginnerMode });
    },
    toggleBeginnerMode: () => {
      const beginnerMode = !get().beginnerMode;
      savePrefs({ ...get(), beginnerMode });
      set({ beginnerMode });
    },
    hydrate: () => set(loadPrefs()),
  })),
);
