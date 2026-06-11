/**
 * ACADEMY FRAMEWORK V1 — internal performance diagnostics (development only).
 */

export interface AcademyPerfSnapshot {
  lessonLoadMs: number;
  lastSpeechLatencyMs: number;
  lastSpeechDurationMs: number;
  lastTransitionMs: number;
  speechCancelCount: number;
  speechStartCount: number;
  speechStaleCallbackDrops: number;
  activeLessonId: string | null;
  updatedAt: number;
}

const MAX_SAMPLES = 32;

type Listener = (snap: AcademyPerfSnapshot) => void;

function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

class AcademyPerformanceMonitor {
  private listeners = new Set<Listener>();
  private speechSamples: number[] = [];
  private transitionSamples: number[] = [];

  snapshot: AcademyPerfSnapshot = {
    lessonLoadMs: 0,
    lastSpeechLatencyMs: 0,
    lastSpeechDurationMs: 0,
    lastTransitionMs: 0,
    speechCancelCount: 0,
    speechStartCount: 0,
    speechStaleCallbackDrops: 0,
    activeLessonId: null,
    updatedAt: 0,
  };

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.snapshot);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    this.snapshot.updatedAt = Date.now();
    this.listeners.forEach((fn) => fn(this.snapshot));
  }

  markLessonOpen(lessonId: string, loadMs: number): void {
    this.snapshot.activeLessonId = lessonId;
    this.snapshot.lessonLoadMs = Math.round(loadMs);
    this.emit();
  }

  markLessonClose(): void {
    this.snapshot.activeLessonId = null;
    this.emit();
  }

  recordSpeechStart(latencyMs: number): void {
    this.snapshot.speechStartCount += 1;
    this.snapshot.lastSpeechLatencyMs = Math.round(latencyMs);
    this.pushSample(this.speechSamples, latencyMs);
    this.emit();
  }

  recordSpeechEnd(durationMs: number): void {
    this.snapshot.lastSpeechDurationMs = Math.round(durationMs);
    this.emit();
  }

  recordSpeechCancel(): void {
    this.snapshot.speechCancelCount += 1;
    this.emit();
  }

  recordStaleCallback(): void {
    this.snapshot.speechStaleCallbackDrops += 1;
    this.emit();
  }

  recordTransition(ms: number): void {
    this.snapshot.lastTransitionMs = Math.round(ms);
    this.pushSample(this.transitionSamples, ms);
    this.emit();
  }

  avgSpeechLatency(): number {
    return avg(this.speechSamples);
  }

  avgTransitionMs(): number {
    return avg(this.transitionSamples);
  }

  private pushSample(buf: number[], n: number): void {
    buf.push(n);
    if (buf.length > MAX_SAMPLES) buf.shift();
  }
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export const academyPerf = new AcademyPerformanceMonitor();

export function isAcademyPerfEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

let transitionStart = 0;

export function beginAcademyTransition(): void {
  if (!isAcademyPerfEnabled()) return;
  transitionStart = now();
}

export function endAcademyTransition(): void {
  if (!isAcademyPerfEnabled() || transitionStart <= 0) return;
  academyPerf.recordTransition(now() - transitionStart);
  transitionStart = 0;
}
