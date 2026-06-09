import { memoryOrchestrator } from "@/lib/performance/MemoryOrchestrator";
import { multiWindowCoordinator } from "@/lib/performance/MultiWindowCoordinator";
import { renderMonitor } from "@/lib/performance/RenderMonitor";
import { streamProcessingEngine } from "@/lib/performance/StreamProcessingEngine";
import { stressModeController } from "@/lib/performance/StressModeController";
import { usePerformanceStore } from "@/store/usePerformanceStore";
import type { RuntimeVitals } from "@/types/terminal-performance";

const VITALS_MS = 1000;

/**
 * Central performance runtime — observability, stream coalescing hooks, memory hygiene.
 */
export class PerformanceEngine {
  private static instance: PerformanceEngine | null = null;

  private running = false;
  private vitalsTimer: ReturnType<typeof setInterval> | null = null;
  private streamMessagesWindow = 0;
  private streamWindowStart = Date.now();

  static getInstance(): PerformanceEngine {
    if (!PerformanceEngine.instance) {
      PerformanceEngine.instance = new PerformanceEngine();
    }
    return PerformanceEngine.instance;
  }

  start(): void {
    if (this.running || typeof window === "undefined") return;
    this.running = true;
    renderMonitor.start();
    memoryOrchestrator.start();
    multiWindowCoordinator.init();

    this.vitalsTimer = setInterval(() => this.publishVitals(), VITALS_MS);
    usePerformanceStore.getState().setEngineActive(true);
  }

  stop(): void {
    this.running = false;
    renderMonitor.stop();
    memoryOrchestrator.stop();
    multiWindowCoordinator.dispose();
    if (this.vitalsTimer) clearInterval(this.vitalsTimer);
    this.vitalsTimer = null;
    usePerformanceStore.getState().setEngineActive(false);
  }

  isRunning(): boolean {
    return this.running;
  }

  private publishVitals(): void {
    const render = renderMonitor.snapshot();
    const stream = streamProcessingEngine.resetWindowStats();
    const now = Date.now();
    const elapsed = Math.max(0.001, (now - this.streamWindowStart) / 1000);
    const streamEps = this.streamMessagesWindow / elapsed;
    this.streamMessagesWindow = stream.processed;
    this.streamWindowStart = now;

    let heapMb = 0;
    const perf = performance as Performance & {
      memory?: { usedJSHeapSize: number };
    };
    if (perf.memory?.usedJSHeapSize) {
      heapMb = Math.round(perf.memory.usedJSHeapSize / (1024 * 1024));
      stressModeController.noteHeap(heapMb);
    }

    const vitals: RuntimeVitals = {
      fps: render.fps,
      frameTimeMs: render.frameTimeMs,
      frameTimeP95Ms: render.frameTimeP95Ms,
      longFrames: render.longFrames,
      droppedFrames: render.droppedFrames,
      streamEps: Math.round(streamEps * 10) / 10,
      streamCoalesced: stream.coalesced,
      streamDropped: stream.dropped,
      lastFlushMs: Math.round(stream.lastFlushMs * 100) / 100,
      wsLatencyMs: streamProcessingEngine.getWsLatencyMs(),
      heapMb,
      stressActive: stressModeController.isActive(),
      stressReason: stressModeController.getReason(),
      updatedAt: now,
    };

    usePerformanceStore.getState().setVitals(vitals);
    multiWindowCoordinator.broadcast({
      type: "vitals:pulse",
      fps: vitals.fps,
      stress: vitals.stressActive,
    });
  }
}

export const performanceEngine = PerformanceEngine.getInstance();
