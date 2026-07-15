import { create } from "zustand";
import type { InstitutionalNewsHeadline, InstitutionalNewsStatus } from "@/types/institutional-news";

interface ExternalNewsState {
  headlines: InstitutionalNewsHeadline[];
  status: InstitutionalNewsStatus | null;
  lastFetchedAt: number;
  setHeadlines: (headlines: InstitutionalNewsHeadline[], status?: InstitutionalNewsStatus | null) => void;
}

export const useExternalNewsStore = create<ExternalNewsState>()((set) => ({
  headlines: [],
  status: null,
  lastFetchedAt: 0,
  setHeadlines: (headlines, status = null) =>
    set({
      headlines,
      status,
      lastFetchedAt: Date.now(),
    }),
}));

export type ExternalNewsHeadline = InstitutionalNewsHeadline;
