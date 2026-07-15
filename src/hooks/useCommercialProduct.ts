"use client";

import { useEffect } from "react";
import { CommercialOrchestrator } from "@/lib/commercial/CommercialOrchestrator";
import { OnboardingEngine } from "@/lib/commercial/OnboardingEngine";
import { useCommercialStore } from "@/store/useCommercialStore";
import { useDeskStore } from "@/store/useDeskStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useWedgeStore } from "@/store/useWedgeStore";

const POLL_MS = 8_000;

export function useCommercialProduct(enabled = true): void {
  const setSnapshot = useCommercialStore((s) => s.setSnapshot);
  const setWalkthroughOpen = useCommercialStore((s) => s.setWalkthroughOpen);

  useEffect(() => {
    if (!enabled) return;
    let autoOpened = false;

    const refresh = () => {
      const snap = CommercialOrchestrator.snapshot();
      setSnapshot(snap);

      OnboardingEngine.autoProgressHints({
        walletConnected: useTerminalStore.getState().authStatus === "agent_ready",
        deskFocusMode: useWedgeStore.getState().deskFocusMode,
        omniUsed: snap.onboarding.some((s) => s.id === "omnibar" && s.completed),
        executionDeskActive: useDeskStore.getState().activeDeskId === "execution",
      });

      if (!autoOpened && OnboardingEngine.shouldShowWalkthrough()) {
        setWalkthroughOpen(true);
        autoOpened = true;
      }
    };

    refresh();
    const id = window.setInterval(refresh, POLL_MS);

    const unsubSession = useProductionConfigStore.subscribe(() => refresh());
    const unsubWedge = useWedgeStore.subscribe((s) => s.deskFocusMode, () => refresh());
    const unsubDesk = useDeskStore.subscribe((s) => s.activeDeskId, () => refresh());
    const unsubWallet = useTerminalStore.subscribe((s) => s.authStatus, () => refresh());

    return () => {
      window.clearInterval(id);
      unsubSession();
      unsubWedge();
      unsubDesk();
      unsubWallet();
    };
  }, [enabled, setSnapshot, setWalkthroughOpen]);
}
