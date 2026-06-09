import { useAlertStore } from "@/store/useAlertStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import { stressModeController } from "@/lib/performance/StressModeController";

const CLEANUP_INTERVAL_MS = 120_000;

/**
 * Long-session memory hygiene — prunes stale buffers without touching live WS state.
 */
export class MemoryOrchestrator {
  private static instance: MemoryOrchestrator | null = null;

  private timer: ReturnType<typeof setInterval> | null = null;

  static getInstance(): MemoryOrchestrator {
    if (!MemoryOrchestrator.instance) {
      MemoryOrchestrator.instance = new MemoryOrchestrator();
    }
    return MemoryOrchestrator.instance;
  }

  start(): void {
    if (this.timer || typeof window === "undefined") return;
    this.timer = setInterval(() => this.runCleanup(), CLEANUP_INTERVAL_MS);
    this.runCleanup();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  runCleanup(): void {
    const stress = stressModeController.isActive();

    const terminal = useTerminalStore.getState();
    if (terminal.intelligence.length > (stress ? 48 : 80)) {
      useTerminalStore.setState({
        intelligence: terminal.intelligence.slice(0, stress ? 48 : 80),
      });
    }

    const wire = useMarketAtmosphereStore.getState().wire;
    if (wire.length > 80) {
      useMarketAtmosphereStore.setState({
        wire: wire.slice(0, 80),
      });
    }

    const triggers = useAlertStore.getState().triggers;
    const maxTriggers = stress ? 80 : 120;
    if (triggers.length > maxTriggers) {
      useAlertStore.setState({ triggers: triggers.slice(0, maxTriggers) });
    }

    const timeline = useInformationDiscoveryStore.getState().assetTimeline;
    if (timeline.length > 40) {
      useInformationDiscoveryStore.getState().setAssetTimeline(timeline.slice(0, 40));
    }
  }
}

export const memoryOrchestrator = MemoryOrchestrator.getInstance();
