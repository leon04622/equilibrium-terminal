import { useTerminalStore } from "@/store/terminalStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import type { PlatformLayerStatus } from "@/types/crypto-ecosystem";

export class PlatformLayerEngine {
  static layers(): PlatformLayerStatus[] {
    const conn = useTerminalStore.getState().connectionStatus;
    const ent = useProductionConfigStore.getState().entitlements;
    const streamHealth: PlatformLayerStatus["health"] =
      conn === "connected" ? "operational" : conn === "reconnecting" ? "degraded" : "offline";

    return [
      {
        layer: "terminal",
        label: "TERMINAL LAYER",
        health: streamHealth,
        activeModules: 12,
        headline: "Workspace, charts, execution ticket, positions",
      },
      {
        layer: "intelligence",
        label: "INTELLIGENCE LAYER",
        health: "operational",
        activeModules: 5,
        headline: "Intel engine, newswire, propintel, distribution",
      },
      {
        layer: "execution",
        label: "EXECUTION LAYER",
        health: streamHealth,
        activeModules: 4,
        headline: "Hyperliquid routing, DOM, slippage radar",
      },
      {
        layer: "organizational",
        label: "ORGANIZATIONAL LAYER",
        health: ent.teamNetEnabled ? "operational" : "staged",
        activeModules: ent.teamNetEnabled ? 4 : 1,
        headline: "Collab, enterprise ops, research desks",
      },
      {
        layer: "infrastructure",
        label: "INFRASTRUCTURE LAYER",
        health: ent.infraDiagnosticsEnabled ? "operational" : "degraded",
        activeModules: 3,
        headline: "Reliability, ingest, cloud sync",
      },
      {
        layer: "api",
        label: "API LAYER",
        health: ent.telemetryExportEnabled ? "operational" : "staged",
        activeModules: 8,
        headline: "REST, webhooks, embed feeds, proprietary metrics",
      },
    ];
  }
}
