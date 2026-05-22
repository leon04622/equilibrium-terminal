/**
 * Non-blocking inference / LLM execution queue.
 * Hot-path telemetry and L1 routing never await this queue.
 */

type Task = () => void | Promise<void>;

export class InferenceQueue {
  private queue: Task[] = [];
  private draining = false;
  private maxConcurrent = 1;
  private active = 0;
  private tokenBudgetPerMinute = 120_000;
  private tokensUsedInWindow = 0;
  private windowStart = Date.now();

  enqueue(task: Task, estimatedTokens = 800): boolean {
    if (!this.consumeTokenBudget(estimatedTokens)) return false;
    this.queue.push(task);
    this.scheduleDrain();
    return true;
  }

  private consumeTokenBudget(tokens: number): boolean {
    const now = Date.now();
    if (now - this.windowStart > 60_000) {
      this.windowStart = now;
      this.tokensUsedInWindow = 0;
    }
    if (this.tokensUsedInWindow + tokens > this.tokenBudgetPerMinute) return false;
    this.tokensUsedInWindow += tokens;
    return true;
  }

  getTokenPressure(): number {
    return Math.min(1, this.tokensUsedInWindow / this.tokenBudgetPerMinute);
  }

  setTokenBudgetPerMinute(budget: number): void {
    this.tokenBudgetPerMinute = Math.max(10_000, budget);
  }

  private scheduleDrain(): void {
    if (this.draining) return;
    this.draining = true;
    queueMicrotask(() => this.drain());
  }

  private async drain(): Promise<void> {
    while (this.queue.length > 0 && this.active < this.maxConcurrent) {
      const task = this.queue.shift();
      if (!task) break;
      this.active += 1;
      try {
        await Promise.resolve(task());
      } catch (err) {
        console.error("[InferenceQueue]", err);
      } finally {
        this.active -= 1;
      }
    }
    this.draining = false;
    if (this.queue.length > 0) this.scheduleDrain();
  }

  clear(): void {
    this.queue = [];
  }
}

export const inferenceQueue = new InferenceQueue();
