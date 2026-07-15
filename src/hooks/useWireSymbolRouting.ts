"use client";

import { useEffect } from "react";
import { terminalBus } from "@/store/eventBus";
import { focusWireSymbol } from "@/lib/workflow/wireSymbolFocus";

/** Route critical wire headlines to chart/book when a coin tag is present. */
export function useWireSymbolRouting(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const off = terminalBus.on("distribution:event", ({ coin, severity }) => {
      if (!coin || severity === "info") return;
      focusWireSymbol(coin, "distribution-event");
    });
    return off;
  }, [enabled]);
}
