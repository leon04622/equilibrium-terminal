import { useTerminalStore } from "@/store/terminalStore";
import type { ExecutionRoute } from "@/types/industry-integrations";

export class ExecutionRoutingEngine {
  static routes(): ExecutionRoute[] {
    const coin =
      useTerminalStore.getState().selectedCoin ??
      useTerminalStore.getState().selectedAsset?.coin ??
      "BTC";
    const book = useTerminalStore.getState().book;
    const spreadBps = book?.spreadBps ?? 4;

    return [
      {
        id: "route-hl-direct",
        venue: "HYPERLIQUID",
        asset: coin,
        routeType: "direct",
        fillRatePct: 98.2,
        avgSlippageBps: Math.max(1, spreadBps * 0.8),
        liquidityScore: 92,
        active: true,
      },
      {
        id: "route-hl-smart",
        venue: "HYPERLIQUID SMART",
        asset: coin,
        routeType: "smart",
        fillRatePct: 96.8,
        avgSlippageBps: Math.max(0.8, spreadBps * 0.6),
        liquidityScore: 88,
        active: true,
      },
      {
        id: "route-agg-staged",
        venue: "MULTI-VENUE AGG (STAGED)",
        asset: coin,
        routeType: "aggregated",
        fillRatePct: 0,
        avgSlippageBps: 0,
        liquidityScore: 0,
        active: false,
      },
      {
        id: "route-otc-staged",
        venue: "OTC DESK (STAGED)",
        asset: coin,
        routeType: "otc",
        fillRatePct: 0,
        avgSlippageBps: 0,
        liquidityScore: 0,
        active: false,
      },
    ];
  }
}
