import { PortfolioHistoryEngine } from "@/lib/portfolio-desk/PortfolioHistoryEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { PortfolioDeskTelemetrySnapshot } from "@/types/portfolio-risk-treasury";

let lastComputeAt = 0;

export class PortfolioDeskTelemetry {
  static begin(): void {
    lastComputeAt = performance.now();
  }

  static snapshot(): PortfolioDeskTelemetrySnapshot {
    const state = useTerminalStore.getState();
    const latency = lastComputeAt > 0 ? Math.max(0, Math.round(performance.now() - lastComputeAt)) : 0;
    const history = PortfolioHistoryEngine.points();
    const hasAccount = (state.accountValue ?? 0) > 0 || state.positions.length > 0;
    const dataQualityScore = hasAccount
      ? Math.min(100, 55 + state.positions.length * 8 + (state.connectionStatus === "connected" ? 25 : 0))
      : 35;

    return {
      computeLatencyMs: latency,
      historyPoints: history.length,
      lastAccountSyncAt: state.webData?.updatedAt ?? 0,
      dataQualityScore,
    };
  }
}
