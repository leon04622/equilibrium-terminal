"use client";

import { HyperliquidAuthProvider } from "@/contexts/HyperliquidAuthContext";
import { useAgenticLoop } from "@/hooks/useAgenticLoop";
import { useMarketPresence } from "@/hooks/useMarketPresence";
import { useNetworkLayer } from "@/hooks/useNetworkLayer";
import { useAlertEngine } from "@/hooks/useAlertEngine";
import { usePerformanceEngine } from "@/hooks/usePerformanceEngine";
import { useTerminalRuntime } from "@/hooks/useTerminalRuntime";
import { useTerminalStreams } from "@/hooks/useTerminalStreams";

function HyperliquidStreams({ children }: { children: React.ReactNode }) {
  useTerminalRuntime();
  usePerformanceEngine();
  useTerminalStreams();
  useAlertEngine();
  useAgenticLoop();
  useNetworkLayer();
  useMarketPresence();
  return <HyperliquidAuthProvider>{children}</HyperliquidAuthProvider>;
}

export function HyperliquidProvider({ children }: { children: React.ReactNode }) {
  return <HyperliquidStreams>{children}</HyperliquidStreams>;
}
