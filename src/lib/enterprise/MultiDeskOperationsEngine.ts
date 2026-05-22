import type { MultiDeskProfile } from "@/types/enterprise-operations";

export class MultiDeskOperationsEngine {
  static desks(): MultiDeskProfile[] {
    return [
      {
        id: "desk-macro-01",
        name: "MACRO COMMAND",
        type: "macro",
        memberCount: 3,
        activeAlerts: 4,
        primaryAssets: ["BTC", "ETH", "DXY-proxy"],
        workflowMode: "macro",
        status: "operational",
      },
      {
        id: "desk-exec-01",
        name: "EXECUTION DESK A",
        type: "execution",
        memberCount: 5,
        activeAlerts: 6,
        primaryAssets: ["HYPE", "BTC", "ETH"],
        workflowMode: "execution",
        status: "operational",
      },
      {
        id: "desk-quant-01",
        name: "QUANT LAB",
        type: "quant",
        memberCount: 2,
        activeAlerts: 2,
        primaryAssets: ["BTC", "ETH", "SOL"],
        workflowMode: "quant",
        status: "operational",
      },
      {
        id: "desk-treasury-01",
        name: "TREASURY OPS",
        type: "treasury",
        memberCount: 2,
        activeAlerts: 3,
        primaryAssets: ["USDT", "USDC", "BTC"],
        workflowMode: "portfolio",
        status: "operational",
      },
      {
        id: "desk-research-01",
        name: "RESEARCH DESK",
        type: "research",
        memberCount: 4,
        activeAlerts: 1,
        primaryAssets: ["ETH", "SOL", "HYPE"],
        workflowMode: "research",
        status: "operational",
      },
      {
        id: "desk-monitor-01",
        name: "SURVEILLANCE MONITOR",
        type: "monitoring",
        memberCount: 2,
        activeAlerts: 8,
        primaryAssets: ["BTC", "ETH"],
        workflowMode: "narrative",
        status: "degraded",
      },
    ];
  }
}
