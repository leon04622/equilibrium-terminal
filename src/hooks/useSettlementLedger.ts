"use client";

import { useEffect } from "react";
import { SettlementReconciliationEngine } from "@/lib/institutional/SettlementReconciliationEngine";
import { useLiveBlotterStore } from "@/store/useLiveBlotterStore";
import { useSettlementLedgerStore } from "@/store/useSettlementLedgerStore";
import { useTerminalStore } from "@/store/terminalStore";

export function useSettlementLedger(enabled = true): void {
  const blotter = useLiveBlotterStore((s) => s.snapshot);
  const positionsVersion = useTerminalStore((s) => s.positionsVersion);

  useEffect(() => {
    if (!enabled) return;
    const snap = SettlementReconciliationEngine.snapshot(blotter);
    useSettlementLedgerStore.getState().setSnapshot(snap);
  }, [enabled, blotter, positionsVersion]);
}
