import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { CollaborationSnapshot } from "@/types/collaboration";

export type CollaborationTab =
  | "activity"
  | "comms"
  | "annotate"
  | "research"
  | "alerts"
  | "presence"
  | "memory";

export interface CollaborationState {
  snapshot: CollaborationSnapshot | null;
  activeTab: CollaborationTab;
  collabVersion: number;

  setSnapshot: (snapshot: CollaborationSnapshot) => void;
  setActiveTab: (tab: CollaborationTab) => void;
}

export const useCollaborationStore = create<CollaborationState>()(
  subscribeWithSelector((set) => ({
    snapshot: null,
    activeTab: "activity",
    collabVersion: 0,

    setSnapshot: (snapshot) =>
      set((s) => ({
        snapshot,
        collabVersion: s.collabVersion + 1,
      })),
    setActiveTab: (activeTab) => set({ activeTab }),
  })),
);
