import type { NormalizedCandle } from "@/types/terminal-schema";
import type { ReplayMode, ReplayState } from "@/types/chart-analytics";

export type ReplayTickHandler = (visibleCandles: NormalizedCandle[], playheadTime: number) => void;

/** Institutional market replay — candle playback over historical buffer. */
export class ReplayEngine {
  private buffer: NormalizedCandle[] = [];
  private mode: ReplayMode = "live";
  private playheadIndex = -1;
  private speed: ReplayState["speed"] = 1;
  private timer: ReturnType<typeof setInterval> | null = null;
  private onTick: ReplayTickHandler | null = null;

  setBuffer(candles: NormalizedCandle[]): void {
    this.buffer = [...candles].sort((a, b) => a.time - b.time);
    if (this.mode === "live") {
      this.playheadIndex = this.buffer.length - 1;
    }
  }

  setHandler(handler: ReplayTickHandler | null): void {
    this.onTick = handler;
  }

  getState(): ReplayState {
    const len = this.buffer.length;
    const idx = this.playheadIndex < 0 ? len - 1 : this.playheadIndex;
    const playhead = this.buffer[idx];
    const rangeStart = this.buffer[0]?.time ?? 0;
    const rangeEnd = this.buffer[len - 1]?.time ?? 0;
    const progressPct = len > 1 ? (idx / (len - 1)) * 100 : 0;

    return {
      mode: this.mode,
      playheadTime: playhead?.time ?? null,
      speed: this.speed,
      rangeStart,
      rangeEnd,
      progressPct,
    };
  }

  goLive(): void {
    this.stopTimer();
    this.mode = "live";
    this.playheadIndex = this.buffer.length - 1;
    this.emit();
  }

  pause(): void {
    this.stopTimer();
    if (this.mode === "playing") this.mode = "paused";
  }

  play(): void {
    if (this.buffer.length < 2) return;
    this.mode = "playing";
    this.stopTimer();
    const intervalMs = Math.max(80, 400 / this.speed);
    this.timer = setInterval(() => {
      if (this.playheadIndex >= this.buffer.length - 1) {
        this.pause();
        return;
      }
      this.playheadIndex += 1;
      this.emit();
    }, intervalMs);
  }

  scrubToTime(time: number): void {
    this.stopTimer();
    this.mode = "scrubbing";
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < this.buffer.length; i++) {
      const d = Math.abs(this.buffer[i].time - time);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    this.playheadIndex = best;
    this.emit();
  }

  setSpeed(speed: ReplayState["speed"]): void {
    this.speed = speed;
    if (this.mode === "playing") {
      this.play();
    }
  }

  visibleCandles(): NormalizedCandle[] {
    if (this.mode === "live" || this.playheadIndex < 0) return this.buffer;
    return this.buffer.slice(0, this.playheadIndex + 1);
  }

  private emit(): void {
    const visible = this.visibleCandles();
    const t = visible[visible.length - 1]?.time ?? 0;
    this.onTick?.(visible, t);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  destroy(): void {
    this.stopTimer();
    this.onTick = null;
  }
}

export const chartReplayEngine = new ReplayEngine();
