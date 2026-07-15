import { create } from "zustand";
import type { LiveBlotterSnapshot } from "@/types/institutional-capabilities";

interface LiveBlotterState {
  snapshot: LiveBlotterSnapshot | null;
  loading: boolean;
  setSnapshot: (snapshot: LiveBlotterSnapshot) => void;
  setLoading: (loading: boolean) => void;
}

export const useLiveBlotterStore = create<LiveBlotterState>((set) => ({
  snapshot: null,
  loading: false,
  setSnapshot: (snapshot) => set({ snapshot, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
