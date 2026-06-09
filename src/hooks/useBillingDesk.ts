"use client";

import { useEffect } from "react";
import { BillingDeskOrchestrator } from "@/lib/billing-desk/BillingDeskOrchestrator";
import { useBillingDeskStore } from "@/store/useBillingDeskStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";

const TICK_MS = 3_000;

export function useBillingDesk(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      useBillingDeskStore.getState().setSnapshot(BillingDeskOrchestrator.snapshot());
    };

    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    const unsub = useProductionConfigStore.subscribe(refresh);

    return () => {
      window.clearInterval(id);
      unsub();
    };
  }, [enabled]);
}
