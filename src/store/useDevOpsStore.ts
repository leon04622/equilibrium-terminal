import { create } from "zustand";
import type { DevOpsOperationsSnapshot } from "@/types/devops-operations";

interface DevOpsStoreState {
  snapshot: DevOpsOperationsSnapshot | null;
  setSnapshot: (snapshot: DevOpsOperationsSnapshot) => void;
}

export const useDevOpsStore = create<DevOpsStoreState>((set) => ({
  snapshot: null,
  setSnapshot: (snapshot) => set({ snapshot }),
}));
