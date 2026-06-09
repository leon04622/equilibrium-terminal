import { PERFORMANCE_BUDGETS } from "@/lib/performance/PerformanceBudgets";
import type { StressModeReason } from "@/types/terminal-performance";

const STRESS_HOLD_MS = 45_000;

/**
 * High-volatility stress mode — coalesces streams and throttles non-critical UI work.
 */
export class StressModeController {
  private static instance: StressModeController | null = null;

  private active = false;
  private reason: StressModeReason = "none";
  private activatedAt = 0;
  private messagesInWindow = 0;
  private windowStart = Date.now();

  static getInstance(): StressModeController {
    if (!StressModeController.instance) {
      StressModeController.instance = new StressModeController();
    }
    return StressModeController.instance;
  }

  isActive(): boolean {
    if (!this.active) return false;
    if (Date.now() - this.activatedAt > STRESS_HOLD_MS) {
      this.deactivate();
      return false;
    }
    return true;
  }

  getReason(): StressModeReason {
    return this.reason;
  }

  recordMessages(count: number): void {
    this.messagesInWindow += count;
    const now = Date.now();
    if (now - this.windowStart >= 1000) {
      const eps = this.messagesInWindow;
      this.messagesInWindow = 0;
      this.windowStart = now;
      if (eps >= PERFORMANCE_BUDGETS.stressThroughputEps) {
        this.activate("throughput");
      }
    }
  }

  noteFrameDrops(dropped: number): void {
    if (dropped >= 4) this.activate("frame_drop");
  }

  noteHeap(mb: number): void {
    if (mb >= PERFORMANCE_BUDGETS.heapWarnMb) this.activate("memory");
  }

  setManual(on: boolean): void {
    if (on) this.activate("manual");
    else this.deactivate();
  }

  private activate(reason: StressModeReason): void {
    if (this.active && this.reason === reason) {
      this.activatedAt = Date.now();
      return;
    }
    this.active = true;
    this.reason = reason;
    this.activatedAt = Date.now();
    if (typeof document !== "undefined") {
      document.documentElement.dataset.eqStress = "1";
    }
  }

  private deactivate(): void {
    this.active = false;
    this.reason = "none";
    if (typeof document !== "undefined") {
      delete document.documentElement.dataset.eqStress;
    }
  }
}

export const stressModeController = StressModeController.getInstance();
