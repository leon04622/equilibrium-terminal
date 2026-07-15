import { create } from "zustand";
import type { InstrumentMasterSnapshot } from "@/types/institutional-capabilities";

interface InstrumentMasterState {
  snapshot: InstrumentMasterSnapshot | null;
  loading: boolean;
  query: string;
  setSnapshot: (snapshot: InstrumentMasterSnapshot | null) => void;
  setLoading: (loading: boolean) => void;
  setQuery: (query: string) => void;
}

export const useInstrumentMasterStore = create<InstrumentMasterState>((set) => ({
  snapshot: null,
  loading: false,
  query: "",
  setSnapshot: (snapshot) => set({ snapshot, loading: false }),
  setLoading: (loading) => set({ loading }),
  setQuery: (query) => set({ query }),
}));
