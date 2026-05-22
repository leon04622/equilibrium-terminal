import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { TerminalDensity } from "@/lib/theme/institutional";

const PREFS_KEY = "eq-terminal-experience-v1";

interface ExperiencePrefs {
  density: TerminalDensity;
  calmMode: boolean;
  reducedMotion: boolean;
}

function loadPrefs(): ExperiencePrefs {
  if (typeof window === "undefined") {
    return { density: "standard", calmMode: true, reducedMotion: false };
  }
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { density: "standard", calmMode: true, reducedMotion: false };
    return { density: "standard", calmMode: true, reducedMotion: false, ...JSON.parse(raw) };
  } catch {
    return { density: "standard", calmMode: true, reducedMotion: false };
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
    hydrate: () => set(loadPrefs()),
  })),
);
