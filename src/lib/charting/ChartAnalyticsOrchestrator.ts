import { ChartDataEngine } from "@/lib/charting/ChartDataEngine";
import { ChartSyncCoordinator } from "@/lib/charting/ChartSyncCoordinator";
import { EventOverlayEngine } from "@/lib/charting/EventOverlayEngine";
import { ExecutionChartOverlayBridge } from "@/lib/execution-analytics/ExecutionChartOverlayBridge";
import { chartReplayEngine } from "@/lib/charting/ReplayEngine";
import { VolumeProfileEngine } from "@/lib/charting/VolumeProfileEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type {
  ChartAnalyticsSnapshot,
  ChartOverlayLayer,
  ChartTimeframe,
} from "@/types/chart-analytics";

const DEFAULT_OVERLAYS: ChartOverlayLayer[] = [
  "event_markers",
  "volume_profile",
  "liquidity_heatmap",
  "liquidation_zones",
];

export class ChartAnalyticsOrchestrator {
  static snapshot(
    coin: string,
    timeframe: ChartTimeframe,
    overlays: ChartOverlayLayer[] = DEFAULT_OVERLAYS,
  ): ChartAnalyticsSnapshot {
    const terminal = useTerminalStore.getState();
    const buffered = chartReplayEngine.getBuffer();
    const candles =
      buffered.length > 0
        ? ChartDataEngine.viewport(buffered)
        : ChartDataEngine.resolveCandles(terminal.candles, terminal.trades, timeframe);

    const book = terminal.book;
    const mid = book?.mid ?? null;
    const executionMarkers =
      overlays.includes("aggressor_flow") || overlays.includes("imbalance")
        ? ExecutionChartOverlayBridge.markers()
        : [];

    const eventMarkers = EventOverlayEngine.merge(
      EventOverlayEngine.fromIntelligence(terminal.intelligence),
      EventOverlayEngine.fromTrades(terminal.trades, mid),
      executionMarkers,
    );

    const volumeProfile = overlays.includes("volume_profile")
      ? VolumeProfileEngine.profileFromCandles(candles)
      : [];

    const flow = overlays.includes("cvd")
      ? VolumeProfileEngine.flowFromTrades(terminal.trades)
      : {
          cumulativeDelta: 0,
          buyVolume: 0,
          sellVolume: 0,
          aggressorImbalancePct: 0,
          absorptionScore: 0,
          updatedAt: Date.now(),
        };

    const spreadBps = book?.spreadBps ?? null;
    const bidSum = book?.bids.reduce((s, l) => s + l.size, 0) ?? 0;
    const askSum = book?.asks.reduce((s, l) => s + l.size, 0) ?? 0;
    const denom = bidSum + askSum;
    const bookImbalancePct = denom > 0 ? ((bidSum - askSum) / denom) * 100 : null;

    return {
      coin,
      timeframe,
      sync: ChartSyncCoordinator.getState(),
      replay: chartReplayEngine.getState(),
      overlays,
      eventMarkers,
      volumeProfile,
      flow,
      microstructure: {
        spreadBps,
        bookImbalancePct,
        liquidityWithdrawal: spreadBps != null && spreadBps > 20,
        heatmapIntensity: Math.min(1, (spreadBps ?? 0) / 40),
      },
      barCount: candles.length,
      updatedAt: Date.now(),
    };
  }
}
