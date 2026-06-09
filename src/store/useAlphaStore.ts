import { create } from "zustand";
import type { AlphaLaunchSnapshot } from "@/types/alpha-launch";

interface AlphaState {
  snapshot: AlphaLaunchSnapshot | null;
  inviteGateOpen: boolean;
  setSnapshot: (snapshot: AlphaLaunchSnapshot) => void;
  setInviteGateOpen: (open: boolean) => void;
}

export const useAlphaStore = create<AlphaState>((set) => ({
  snapshot: null,
  inviteGateOpen: false,
  setSnapshot: (snapshot) => set({ snapshot }),
  setInviteGateOpen: (inviteGateOpen) => set({ inviteGateOpen }),
}));
