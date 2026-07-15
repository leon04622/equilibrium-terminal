"use client";

import { useCallback, useRef, useState } from "react";
import { useHyperliquidAuthContext } from "@/contexts/HyperliquidAuthContext";

/** HL DEX pattern: poll silently, prompt builder approval only when user attempts live perp execution. */
export function useBuilderFeeGate() {
  const {
    builderFeeApproved,
    approveBuilderFee,
    builderFeeApproving,
    authError,
  } = useHyperliquidAuthContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<"trade" | "close">("trade");
  const pendingActionRef = useRef<(() => void) | null>(null);

  const runWithBuilderFee = useCallback(
    (opts: { isPerp: boolean; context?: "trade" | "close"; action: () => void }) => {
      if (!opts.isPerp || builderFeeApproved) {
        opts.action();
        return;
      }
      pendingActionRef.current = opts.action;
      setModalContext(opts.context ?? "trade");
      setModalOpen(true);
    },
    [builderFeeApproved],
  );

  const cancelModal = useCallback(() => {
    if (builderFeeApproving) return;
    setModalOpen(false);
    pendingActionRef.current = null;
  }, [builderFeeApproving]);

  const confirmApproval = useCallback(async () => {
    const ok = await approveBuilderFee();
    if (!ok) return;
    setModalOpen(false);
    const next = pendingActionRef.current;
    pendingActionRef.current = null;
    next?.();
  }, [approveBuilderFee]);

  return {
    modalOpen,
    modalContext,
    builderFeeApproving,
    authError,
    runWithBuilderFee,
    cancelModal,
    confirmApproval,
  };
}
