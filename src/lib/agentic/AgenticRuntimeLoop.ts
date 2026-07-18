import { behavioralMemory } from "@/lib/agentic/BehavioralMemory";
import { inferenceQueue } from "@/lib/agentic/InferenceQueue";
import {
  ALL_AGENT_KINDS,
  runMicroAgent,
  type AgentContext,
} from "@/lib/agentic/MicroAgents";
import { signalFusionEngine } from "@/lib/agentic/SignalFusionEngine";
import { terminalBus } from "@/store/eventBus";
import { useAgentOperationsStore } from "@/store/useAgentOperationsStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { AgentKind, WatchlistTier } from "@/types/agentic";

const POLL_MS: Record<WatchlistTier, number> = {
  active: 2_000,
  warm: 8_000,
  cold: 30_000,
};

export interface AgenticLoopStatus {
  running: boolean;
  tickCount: number;
  lastTickAt: number | null;
  tokenPressure: number;
}

class AgenticRuntimeLoop {
  private static instance: AgenticRuntimeLoop | null = null;

  private running = false;
  private tickCount = 0;
  private lastTickAt: number | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private unsubscribers: Array<() => void> = [];
  private lastFusionByCoin = new Map<string, number>();

  static getInstance(): AgenticRuntimeLoop {
    if (!AgenticRuntimeLoop.instance) {
      AgenticRuntimeLoop.instance = new AgenticRuntimeLoop();
    }
    return AgenticRuntimeLoop.instance;
  }

  getStatus(): AgenticLoopStatus {
    return {
      running: this.running,
      tickCount: this.tickCount,
      lastTickAt: this.lastTickAt,
      tokenPressure: inferenceQueue.getTokenPressure(),
    };
  }

  start(): void {
    if (typeof window === "undefined" || this.running) return;
    this.running = true;
    behavioralMemory.load();

    this.unsubscribers.push(
      terminalBus.on("asset:select", ({ coin }) => {
        useAgentOperationsStore.getState().recordInteraction(coin);
      }),
    );

    this.unsubscribers.push(
      useTerminalStore.subscribe(
        (s) => s.trades[0]?.id,
        () => {
          const trade = useTerminalStore.getState().trades[0];
          if (trade) this.scheduleCoinCycle(trade.coin, "active");
        },
      ),
    );

    this.timer = setInterval(() => this.tick(), 3_000);
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    for (const off of this.unsubscribers) off();
    this.unsubscribers = [];
    inferenceQueue.clear();
    useAgentOperationsStore.getState().setLoopRunning(false);
  }

  private tick(): void {
    if (typeof document !== "undefined" && document.hidden) return;
    if (!this.running) return;
    this.tickCount += 1;
    this.lastTickAt = Date.now();
    useAgentOperationsStore.getState().setLoopRunning(true);
    useAgentOperationsStore.getState().setTokenPressure(inferenceQueue.getTokenPressure());

    const store = useAgentOperationsStore.getState();
    const terminal = useTerminalStore.getState();
    const activeCoin = terminal.selectedCoin;

    store.syncWatchlistFromTerminal(activeCoin);

    for (const entry of store.watchlist.entries) {
      const due = this.isDue(entry.coin, entry.tier);
      if (due) this.scheduleCoinCycle(entry.coin, entry.tier);
    }

    if (activeCoin && !store.watchlist.entries.find((e) => e.coin === activeCoin)) {
      this.scheduleCoinCycle(activeCoin, "active");
    }
  }

  private isDue(coin: string, tier: WatchlistTier): boolean {
    const last = this.lastFusionByCoin.get(coin.toUpperCase()) ?? 0;
    return Date.now() - last >= POLL_MS[tier];
  }

  private scheduleCoinCycle(coin: string, tier: WatchlistTier): void {
    const upper = coin.toUpperCase();
    this.lastFusionByCoin.set(upper, Date.now());

    for (const agentId of ALL_AGENT_KINDS) {
      useAgentOperationsStore.getState().setAgentStatus(agentId, "queued");
    }

    queueMicrotask(() => this.runHotPath(upper, tier));

    inferenceQueue.enqueue(() => {
      this.runEnrichment(upper, tier);
    }, 600);
  }

  private runHotPath(coin: string, tier: WatchlistTier): void {
    const ctx = this.buildContext(coin, tier);
    const signals = ALL_AGENT_KINDS.map((agentId) => {
      useAgentOperationsStore.getState().setAgentStatus(agentId, "running");
      const sig = runMicroAgent(agentId, ctx);
      useAgentOperationsStore.getState().incrementAgentTokens(agentId, 120);
      useAgentOperationsStore.getState().setAgentStatus(agentId, "idle");
      if (sig) useAgentOperationsStore.getState().pushSignal(sig);
      return sig;
    }).filter((s): s is NonNullable<typeof s> => s !== null);

    if (!signals.length) return;

    const relevance = useAgentOperationsStore.getState().behavioralRelevance(coin);
    const fusion = signalFusionEngine.fuse({ coin, signals, relevanceScore: relevance });

    if (fusion.opportunity && fusion.fusedConfidenceScore >= 0.42) {
      useAgentOperationsStore.getState().upsertFusedOpportunity(fusion.opportunity);
      terminalBus.emit("agentic:fused", {
        id: fusion.opportunity.id,
        coin: fusion.opportunity.coin,
        score: fusion.opportunity.fusedConfidenceScore,
      });
    }
  }

  private runEnrichment(coin: string, tier: WatchlistTier): void {
    const op = useAgentOperationsStore.getState().fusedMatrix.find(
      (f) => f.coin === coin,
    );
    if (!op) return;

    const enrichedThesis =
      `${op.thesis} Tape context for ${coin} @ ${tier} tier — ` +
      `monitor funding/OI divergence and whale absorption.`;

    useAgentOperationsStore.getState().patchFusedThesis(op.id, enrichedThesis);
    useAgentOperationsStore.getState().incrementAgentTokens("narrative", 400);
  }

  private buildContext(coin: string, tier: WatchlistTier): AgentContext {
    const terminal = useTerminalStore.getState();
    const book =
      terminal.selectedCoin.toUpperCase() === coin.toUpperCase()
        ? terminal.book
        : null;
    const trade =
      terminal.trades.find((t) => t.coin.toUpperCase() === coin.toUpperCase()) ??
      null;
    const recentEvents = useAgentOperationsStore
      .getState()
      .getRecentEventsForCoin(coin);

    return {
      coin: coin.toUpperCase(),
      tier,
      book,
      latestTrade: trade,
      recentEvents,
      mid: book?.mid ?? terminal.mids.mids[coin] ?? null,
    };
  }

  setAgentPollOverride(agentId: AgentKind, intervalMs: number): void {
    useAgentOperationsStore.getState().setAgentPollInterval(agentId, intervalMs);
  }
}

export const agenticRuntimeLoop = AgenticRuntimeLoop.getInstance();
