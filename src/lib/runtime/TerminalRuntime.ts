import { performanceEngine } from "@/lib/performance/PerformanceEngine";
import { terminalBus } from "@/store/eventBus";
import { terminalIngress, useTerminalStore } from "@/store/terminalStore";
import { useAlertStore } from "@/store/useAlertStore";
import type { TerminalEventMap } from "@/store/eventBus";

type Unsubscribe = () => void;

export interface TerminalRuntimeStatus {
  initialized: boolean;
  refCount: number;
  startedAt: number | null;
}

/**
 * Central terminal runtime singleton — wires cross-cutting event bus bridges
 * and exposes imperative ingress. Safe to call init() from multiple React roots
 * (ref-counted for Strict Mode).
 */
class TerminalRuntime {
  private static instance: TerminalRuntime | null = null;

  private refCount = 0;
  private initialized = false;
  private startedAt: number | null = null;
  private unsubscribers: Unsubscribe[] = [];

  static getInstance(): TerminalRuntime {
    if (!TerminalRuntime.instance) {
      TerminalRuntime.instance = new TerminalRuntime();
    }
    return TerminalRuntime.instance;
  }

  get bus() {
    return terminalBus;
  }

  get ingress() {
    return terminalIngress;
  }

  getStatus(): TerminalRuntimeStatus {
    return {
      initialized: this.initialized,
      refCount: this.refCount,
      startedAt: this.startedAt,
    };
  }

  init(): void {
    if (typeof window === "undefined") return;

    this.refCount += 1;
    if (this.initialized) return;

    this.startedAt = Date.now();
    this.registerBridges();
    performanceEngine.start();
    this.initialized = true;
  }

  dispose(): void {
    if (typeof window === "undefined") return;

    this.refCount = Math.max(0, this.refCount - 1);
    if (this.refCount > 0 || !this.initialized) return;

    for (const off of this.unsubscribers) off();
    this.unsubscribers = [];
    performanceEngine.stop();
    this.initialized = false;
    this.startedAt = null;
  }

  on<K extends keyof TerminalEventMap>(
    event: K,
    handler: (payload: TerminalEventMap[K]) => void,
  ): Unsubscribe {
    return terminalBus.on(event, handler);
  }

  private registerBridges(): void {
    this.unsubscribers.push(
      terminalBus.on("alert:triggered", ({ id }) => {
        const trigger = useAlertStore.getState().triggers.find((t) => t.id === id);
        if (!trigger) return;
        useTerminalStore.getState().pushIntelligence({
          id: `intel-${id}`,
          coin: trigger.coin,
          channel: "market",
          title: trigger.title,
          detail: trigger.summary,
          severity: trigger.severity,
          notionalUsd: trigger.event.metrics.notionalUsd,
          timestamp: trigger.timestamp,
        });
      }),
    );

    this.unsubscribers.push(
      terminalBus.on("asset:select", ({ coin, source }) => {
        if (
          source === "store" ||
          source === "picker" ||
          source === "omnibar" ||
          source === "team-desk"
        ) {
          return;
        }
        const state = useTerminalStore.getState();
        if (state.selectedCoin.toUpperCase() === coin.toUpperCase()) return;
        state.selectAssetByCoin(coin, source);
      }),
    );
  }
}

export const terminalRuntime = TerminalRuntime.getInstance();
