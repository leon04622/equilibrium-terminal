import { terminalBus } from "@/store/eventBus";
import type { ChartTimeframe } from "@/types/chart-analytics";

/** Multi-chart sync — linked cursors, timeframe, asset (Phase 34). */
export class ChartSyncCoordinator {
  private static linked = true;
  private static timeframe: ChartTimeframe = "1m";
  private static cursorTime: number | null = null;

  static getState() {
    return {
      linked: ChartSyncCoordinator.linked,
      timeframe: ChartSyncCoordinator.timeframe,
      cursorTime: ChartSyncCoordinator.cursorTime,
      sourceChartId: null as string | null,
    };
  }

  static setLinked(linked: boolean): void {
    ChartSyncCoordinator.linked = linked;
    terminalBus.emit("chart:sync", ChartSyncCoordinator.getState());
  }

  static setTimeframe(tf: ChartTimeframe): void {
    ChartSyncCoordinator.timeframe = tf;
    terminalBus.emit("chart:sync", ChartSyncCoordinator.getState());
  }

  static publishCursor(time: number, sourceChartId: string): void {
    if (!ChartSyncCoordinator.linked) return;
    ChartSyncCoordinator.cursorTime = time;
    terminalBus.emit("chart:cursor", { time, sourceChartId });
  }
}
