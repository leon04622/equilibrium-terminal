import type { ExecutionCopilotFlag, OrderFlowMatrixPacket } from "@/types/execution-intelligence";

export type CopilotInferenceHandler = (flags: ExecutionCopilotFlag[]) => void;

/**
 * Out-of-band execution copilot — rule-based enrichment runs off the hot path.
 * LLM prompts are queued and never block order routing or L2 ingestion.
 */
export class CopilotInferenceQueue {
  private readonly intervalMs: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private handler: CopilotInferenceHandler | null = null;
  private latestPacket: OrderFlowMatrixPacket | null = null;
  private processing = false;

  constructor(intervalMs = 250) {
    this.intervalMs = intervalMs;
  }

  start(handler: CopilotInferenceHandler): void {
    this.handler = handler;
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.drain();
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.handler = null;
    this.latestPacket = null;
  }

  enqueue(packet: OrderFlowMatrixPacket): void {
    this.latestPacket = packet;
  }

  private async drain(): Promise<void> {
    if (this.processing || !this.handler || !this.latestPacket) return;
    this.processing = true;
    const packet = this.latestPacket;
    try {
      const enriched = await this.enrichFlags(packet);
      this.handler(enriched);
    } finally {
      this.processing = false;
    }
  }

  private async enrichFlags(packet: OrderFlowMatrixPacket): Promise<ExecutionCopilotFlag[]> {
    await new Promise((resolve) => setTimeout(resolve, 0));
    const flags = [...packet.copilotFlags];
    if (packet.spoofingProbability > 55) {
      flags.push({
        id: `copilot-spoof-${packet.packetSeq}`,
        severity: "watch",
        code: "TOXIC_FLOW",
        message: "SPOOFING PROBABILITY ELEVATED",
        priceTick: packet.dom.midTick,
        atNs: packet.computedAtNs,
      });
    }
    if (packet.icebergProbability > 50) {
      flags.push({
        id: `copilot-iceberg-${packet.packetSeq}`,
        severity: "info",
        code: "PASSIVE_ABSORPTION",
        message: "ICEBERG RESTING SIGNATURE",
        priceTick: packet.dom.midTick,
        atNs: packet.computedAtNs,
      });
    }
    if (packet.imbalance.skew === "ask" && packet.cvd.delta < 0) {
      flags.push({
        id: `copilot-toxic-${packet.packetSeq}`,
        severity: "critical",
        code: "TOXIC_FLOW",
        message: "TOXIC SELL FLOW PRESSURE",
        priceTick: packet.dom.midTick,
        atNs: packet.computedAtNs,
      });
    }
    return flags.slice(0, 12);
  }
}

export const executionCopilotQueue = new CopilotInferenceQueue();
