"use client";

import { createContext, useContext } from "react";
import { useHyperliquidAuth } from "@/hooks/useHyperliquidAuth";

export type HyperliquidAuthValue = ReturnType<typeof useHyperliquidAuth>;

const HyperliquidAuthContext = createContext<HyperliquidAuthValue | null>(null);

export function HyperliquidAuthProvider({ children }: { children: React.ReactNode }) {
  const value = useHyperliquidAuth();
  return (
    <HyperliquidAuthContext.Provider value={value}>
      {children}
    </HyperliquidAuthContext.Provider>
  );
}

export function useHyperliquidAuthContext(): HyperliquidAuthValue {
  const ctx = useContext(HyperliquidAuthContext);
  if (!ctx) {
    throw new Error("useHyperliquidAuthContext requires HyperliquidAuthProvider");
  }
  return ctx;
}
