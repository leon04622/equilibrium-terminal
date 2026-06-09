import { create } from "zustand";
import type { LaunchHardeningSnapshot } from "@/types/launch-hardening";

interface HardeningState {
  snapshot: LaunchHardeningSnapshot | null;
  setSnapshot: (snapshot: LaunchHardeningSnapshot) => void;
}

export const useHardeningStore = create<HardeningState>((set) => ({
  snapshot: null,
  setSnapshot: (snapshot) => set({ snapshot }),
}));
