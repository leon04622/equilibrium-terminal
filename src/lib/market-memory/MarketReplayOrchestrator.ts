import { chartReplayEngine } from "@/lib/charting/ReplayEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { ReplayContextSnapshot } from "@/types/market-memory";

export class MarketReplayOrchestrator {
  static context(): ReplayContextSnapshot {
    const replay = chartReplayEngine.getState();
    const book = useTerminalStore.getState().book;
    const candles = chartReplayEngine.visibleCandles();
    const intel = useTerminalStore.getState().intelligence.length;

    return {
      mode: replay.mode,
      playheadTime: replay.playheadTime,
      progressPct: Math.round(replay.progressPct),
      candleCount: candles.length,
      spreadBps: book?.spreadBps ?? null,
      intelligenceCount: intel,
      replayReady: candles.length >= 2,
    };
  }

  static play(): void {
    chartReplayEngine.play();
  }

  static pause(): void {
    chartReplayEngine.pause();
  }

  static goLive(): void {
    chartReplayEngine.goLive();
  }

  static scrub(time: number): void {
    chartReplayEngine.scrubToTime(time);
  }
}
