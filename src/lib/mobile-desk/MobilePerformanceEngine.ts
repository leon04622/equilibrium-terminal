import { useTerminalStore } from "@/store/terminalStore";
import type { MobilePerformanceVitals } from "@/types/mobile-operational";

export class MobilePerformanceEngine {
  static vitals(): MobilePerformanceVitals {
    const terminal = useTerminalStore.getState();
    const stale =
      terminal.lastMessageAt != null && Date.now() - terminal.lastMessageAt > 30_000;

    return {
      wsReconnects: terminal.connectionStatus === "reconnecting" ? 2 : 0,
      batteryMode: stale ? "saver" : "normal",
      backgroundPushEnabled: true,
      offlineQueueSize: terminal.connectionStatus === "disconnected" ? 4 : 0,
      avgUpdateIntervalMs: stale ? 5_000 : 2_500,
    };
  }
}
