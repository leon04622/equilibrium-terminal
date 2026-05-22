"use client";

import { useEffect, useRef } from "react";
import { executionCopilotQueue } from "@/lib/execution/CopilotInferenceQueue";
import { orderFlowEngine } from "@/lib/execution/OrderFlowEngine";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";

export interface UseExecutionIntelligenceOptions {
  enabled?: boolean;
}

export function useExecutionIntelligence(options: UseExecutionIntelligenceOptions = {}) {
  const enabled = options.enabled ?? true;
  const lastTradeLenRef = useRef(0);
  const lastBookVersionRef = useRef(0);

  const selectedCoin = useTerminalStore((s) => s.selectedCoin);
  const applyMatrixPacket = useExecutionIntelligenceStore((s) => s.applyMatrixPacket);
  const mergeCopilotFlags = useExecutionIntelligenceStore((s) => s.mergeCopilotFlags);
  const setPipelineActive = useExecutionIntelligenceStore((s) => s.setPipelineActive);
  const setCoin = useExecutionIntelligenceStore((s) => s.setCoin);
  const resetExecutionState = useExecutionIntelligenceStore((s) => s.resetExecutionState);

  useEffect(() => {
    if (!enabled) return;

    try {
      orderFlowEngine.start((packet) => {
        applyMatrixPacket(packet);
        executionCopilotQueue.enqueue(packet);
      });
      executionCopilotQueue.start((flags) => {
        mergeCopilotFlags(flags);
      });
      setPipelineActive(true);
    } catch (err) {
      console.error("[useExecutionIntelligence] worker start failed", err);
      setPipelineActive(false);
    }

    return () => {
      orderFlowEngine.stop();
      executionCopilotQueue.stop();
      setPipelineActive(false);
      resetExecutionState();
    };
  }, [
    enabled,
    applyMatrixPacket,
    mergeCopilotFlags,
    setPipelineActive,
    resetExecutionState,
  ]);

  useEffect(() => {
    if (!enabled) return;
    setCoin(selectedCoin);
    orderFlowEngine.setCoin(selectedCoin);
    lastTradeLenRef.current = 0;
    lastBookVersionRef.current = 0;
  }, [enabled, selectedCoin, setCoin]);

  useEffect(() => {
    if (!enabled) return;

    const unsubBook = useTerminalStore.subscribe(
      (state) => state.bookVersion,
      (bookVersion, prevBookVersion) => {
        if (bookVersion === prevBookVersion) return;
        const book = useTerminalStore.getState().book;
        if (book) orderFlowEngine.ingestBook(book);
      },
    );

    const unsubTrades = useTerminalStore.subscribe(
      (state) => state.trades.length,
      (len, prevLen) => {
        if (len <= prevLen) return;
        const trades = useTerminalStore.getState().trades;
        const slice = trades.slice(prevLen);
        if (slice.length > 0) orderFlowEngine.ingestTrades(slice);
        lastTradeLenRef.current = len;
      },
    );

    const book = useTerminalStore.getState().book;
    if (book) orderFlowEngine.ingestBook(book);
    const trades = useTerminalStore.getState().trades;
    if (trades.length > 0) {
      orderFlowEngine.ingestTrades(trades.slice(-64));
      lastTradeLenRef.current = trades.length;
    }

    return () => {
      unsubBook();
      unsubTrades();
    };
  }, [enabled, selectedCoin]);
}
