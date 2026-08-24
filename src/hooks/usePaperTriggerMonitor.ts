"use client";

import { useEffect } from "react";
import { useDeskExecutionStore } from "@/store/useDeskExecutionStore";
import { useHyperliquidStore } from "@/store/hyperliquidStore";

/** Watches live marks and auto-closes paper positions on TP / SL / liquidation. */
export function usePaperTriggerMonitor(): void {
  const mode = useDeskExecutionStore((s) => s.mode);
  const mids = useHyperliquidStore((s) => s.mids.mids);
  const bookCoin = useHyperliquidStore((s) => s.book?.coin);
  const bookMid = useHyperliquidStore((s) => s.book?.mid);

  useEffect(() => {
    if (mode !== "paper") return;
    const marks: Record<string, number> = { ...mids };
    if (bookCoin && bookMid && bookMid > 0) marks[bookCoin] = bookMid;
    useDeskExecutionStore.getState().tickPaperTriggers(marks);
  }, [bookCoin, bookMid, mids, mode]);
}
