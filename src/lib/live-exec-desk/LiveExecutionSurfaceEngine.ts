import { useTerminalStore } from "@/store/terminalStore";
import type { ExecutionSurfaceRow } from "@/types/live-execution";

export class LiveExecutionSurfaceEngine {
  static surfaces(): ExecutionSurfaceRow[] {
    const t = useTerminalStore.getState();
    const pos = t.positions?.length ?? 0;
    const conn = t.connectionStatus;

    return [
      {
        id: "surf-ticket",
        surface: "Order ticket",
        status: conn === "connected" ? "ready" : "degraded",
        detail: `${t.selectedAsset?.symbol ?? "—"} · market/limit`,
      },
      {
        id: "surf-pos",
        surface: "Positions",
        status: pos > 0 ? "active" : "flat",
        detail: `${pos} open position(s)`,
      },
      {
        id: "surf-book",
        surface: "HyperBook",
        status: t.book ? "live" : "stale",
        detail: "L2 + tape ingress",
      },
      {
        id: "surf-dom",
        surface: "DOM ladder",
        status: "live",
        detail: "Depth + imbalance canvas",
      },
      {
        id: "surf-slip",
        surface: "Slippage radar",
        status: "monitoring",
        detail: "Adverse selection watch",
      },
      {
        id: "surf-cancel",
        surface: "Rapid cancel",
        status: "armed",
        detail: "Hotkey · ticket focus",
      },
    ];
  }
}
