import { stressModeController } from "@/lib/performance/StressModeController";

const FRAME_HISTORY = 120;

/**
 * RAF-based render timing — FPS, p95 frame time, dropped frames.
 */
export class RenderMonitor {
  private static instance: RenderMonitor | null = null;

  private running = false;
  private rafId: number | null = null;
  private lastAt = 0;
  private frameTimes: number[] = [];
  private droppedFrames = 0;
  private longFrames = 0;

  static getInstance(): RenderMonitor {
    if (!RenderMonitor.instance) {
      RenderMonitor.instance = new RenderMonitor();
    }
    return RenderMonitor.instance;
  }

  start(): void {
    if (this.running || typeof window === "undefined") return;
    this.running = true;
    this.lastAt = performance.now();
    const tick = (now: number) => {
      if (!this.running) return;
      const delta = now - this.lastAt;
      this.lastAt = now;
      this.frameTimes.push(delta);
      if (this.frameTimes.length > FRAME_HISTORY) this.frameTimes.shift();

      if (delta > 20) {
        const missed = Math.floor(delta / 16.67) - 1;
        if (missed > 0) {
          this.droppedFrames += missed;
          stressModeController.noteFrameDrops(missed);
        }
      }
      if (delta > 50) this.longFrames += 1;

      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop(): void {
    this.running = false;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  snapshot(): {
    fps: number;
    frameTimeMs: number;
    frameTimeP95Ms: number;
    droppedFrames: number;
    longFrames: number;
  } {
    const samples = this.frameTimes;
    const last = samples[samples.length - 1] ?? 16.67;
    const avg = samples.length
      ? samples.reduce((a, b) => a + b, 0) / samples.length
      : 16.67;
    const sorted = [...samples].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? avg;
    const fps = Math.min(144, Math.round(1000 / Math.max(1, avg)));

    const dropped = this.droppedFrames;
    const long = this.longFrames;
    this.droppedFrames = 0;
    this.longFrames = 0;

    return {
      fps,
      frameTimeMs: Math.round(last * 10) / 10,
      frameTimeP95Ms: Math.round(p95 * 10) / 10,
      droppedFrames: dropped,
      longFrames: long,
    };
  }
}

export const renderMonitor = RenderMonitor.getInstance();
