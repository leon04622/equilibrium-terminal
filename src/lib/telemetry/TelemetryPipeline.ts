import { adaptiveOptimizer } from "@/lib/telemetry/AdaptiveOptimizer";
import { cognitiveEngine } from "@/lib/telemetry/CognitiveEngine";
import { eventBuffer } from "@/lib/telemetry/EventBuffer";
import type { Layout } from "react-grid-layout";
import type {
  PlatformVitals,
  TraderInteractionEvent,
} from "@/types/trader-telemetry";
import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";

const VITALS_INTERVAL_MS = 1000;

function defaultVitals(): PlatformVitals {
  return {
    eventBufferDepth: 0,
    eventsPerSecond: 0,
    avgProcessMs: 0,
    lastProcessMs: 0,
    droppedFrames: 0,
    wsReconnectLagMs: 0,
    lastStreamStatus: "idle",
    pipelineActive: false,
    memoryHintMb: 0,
    updatedAt: Date.now(),
  };
}

/**
 * Imperative telemetry pipeline — processes buffered events off the React thread.
 */
export class TelemetryPipeline {
  private static instance: TelemetryPipeline | null = null;

  private active = false;
  private vitalsTimer: ReturnType<typeof setInterval> | null = null;
  private eventsInWindow = 0;
  private windowStart = Date.now();
  private rafId: number | null = null;
  private lastFrameAt = 0;
  private droppedFrames = 0;
  private wsDisconnectAt: number | null = null;

  static getInstance(): TelemetryPipeline {
    if (!TelemetryPipeline.instance) {
      TelemetryPipeline.instance = new TelemetryPipeline();
    }
    return TelemetryPipeline.instance;
  }

  start(baseLayout: Layout[]): void {
    if (this.active) return;
    this.active = true;
    adaptiveOptimizer.setBaseLayout(baseLayout);
    eventBuffer.setFlushHandler((batch) => this.processBatch(batch));
    useTraderTelemetryStore.getState().setPipelineActive(true);

    this.lastFrameAt = performance.now();
    const tick = (now: number) => {
      if (!this.active) return;
      const delta = now - this.lastFrameAt;
      if (delta > 20) {
        const missed = Math.floor(delta / 16.67) - 1;
        if (missed > 0) this.droppedFrames += missed;
      }
      this.lastFrameAt = now;
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);

    this.vitalsTimer = setInterval(() => this.publishVitals(), VITALS_INTERVAL_MS);
  }

  stop(): void {
    this.active = false;
    eventBuffer.setFlushHandler(null);
    useTraderTelemetryStore.getState().setPipelineActive(false);
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.vitalsTimer != null) {
      clearInterval(this.vitalsTimer);
      this.vitalsTimer = null;
    }
  }

  enqueue(event: TraderInteractionEvent): void {
    eventBuffer.push(event);
  }

  updateBaseLayout(layout: Layout[]): void {
    adaptiveOptimizer.setBaseLayout(layout);
  }

  noteStreamStatus(status: string): void {
    const store = useTraderTelemetryStore.getState();
    if (status === "reconnecting" || status === "disconnected") {
      if (this.wsDisconnectAt == null) this.wsDisconnectAt = Date.now();
    } else if (status === "connected") {
      const lag =
        this.wsDisconnectAt != null ? Date.now() - this.wsDisconnectAt : 0;
      store.setWsReconnectLag(lag);
      this.wsDisconnectAt = null;
    }
    store.patchVitals({ lastStreamStatus: status });
  }

  private processBatch(batch: TraderInteractionEvent[]): void {
    const t0 = performance.now();
    const store = useTraderTelemetryStore.getState();

    store.appendEvents(batch);
    const metrics = cognitiveEngine.processBatch(batch);
    store.setMetrics(metrics);
    store.setSegment(cognitiveEngine.getState().segment);

    const suggestion = adaptiveOptimizer.ingestBatch(
      batch,
      cognitiveEngine.getState().segment,
    );
    if (suggestion) {
      const prev = useTraderTelemetryStore.getState().adaptiveSuggestion;
      const isDuplicate =
        prev &&
        prev.reason === suggestion.reason &&
        (prev.appliedAt != null || suggestion.appliedAt != null);
      if (!isDuplicate && process.env.NEXT_PUBLIC_ADAPTIVE_LAYOUT === "1") {
        store.setAdaptiveSuggestion(suggestion);
      }
    }

    for (const ev of batch) {
      if (ev.kind === "widget_focus" || ev.kind === "click") {
        store.recordFocusTrend(ev.panelId ?? "unknown", ev.durationMs ?? 0);
      }
      if (ev.kind === "alert_view" || ev.kind === "intel_wire") {
        store.recordClickThrough(ev.routeHash);
      }
    }

    const elapsed = performance.now() - t0;
    this.eventsInWindow += batch.length;
    store.recordProcessTiming(elapsed);
    store.patchVitals({
      eventBufferDepth: eventBuffer.getDepth(),
      lastProcessMs: elapsed,
    });
  }

  private publishVitals(): void {
    const now = Date.now();
    const elapsedSec = Math.max(0.001, (now - this.windowStart) / 1000);
    const eps = this.eventsInWindow / elapsedSec;
    this.eventsInWindow = 0;
    this.windowStart = now;

    const dropped = eventBuffer.resetDropped();
    const store = useTraderTelemetryStore.getState();
    const avgProcess = store.getAvgProcessMs();

    let memoryHintMb = 0;
    const perf = performance as Performance & {
      memory?: { usedJSHeapSize: number };
    };
    if (perf.memory?.usedJSHeapSize) {
      memoryHintMb = Math.round(perf.memory.usedJSHeapSize / (1024 * 1024));
    }

    const vitals: PlatformVitals = {
      ...defaultVitals(),
      eventBufferDepth: eventBuffer.getDepth(),
      eventsPerSecond: Math.round(eps * 10) / 10,
      avgProcessMs: avgProcess,
      lastProcessMs: store.vitals.lastProcessMs,
      droppedFrames: this.droppedFrames,
      wsReconnectLagMs: store.vitals.wsReconnectLagMs,
      lastStreamStatus: store.vitals.lastStreamStatus,
      pipelineActive: this.active,
      memoryHintMb,
      updatedAt: now,
    };

    this.droppedFrames = 0;
    store.setVitals(vitals);
  }
}

export const telemetryPipeline = TelemetryPipeline.getInstance();
