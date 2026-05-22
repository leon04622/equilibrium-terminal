import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { behavioralMemory } from "@/lib/agentic/BehavioralMemory";
import type { MarketEvent } from "@/types/alerts";
import type {
  AgentKind,
  AgentRuntimeState,
  AgentSignal,
  DynamicWatchlist,
  DynamicWatchlistEntry,
  FusedOpportunity,
  WatchlistTier,
} from "@/types/agentic";

const DEFAULT_AGENTS: AgentRuntimeState[] = (
  ["structure", "whale", "liquidation", "funding", "narrative"] as AgentKind[]
).map((agentId) => ({
  agentId,
  status: "idle" as const,
  lastRunAt: null,
  tokensUsed: 0,
  pollIntervalMs: 2_000,
  signalsEmitted: 0,
}));

const MAX_SIGNALS = 300;
const MAX_FUSED = 80;
const MAX_EVENTS = 200;

function tierForCoin(
  coin: string,
  activeCoin: string | null,
  entries: DynamicWatchlistEntry[],
): WatchlistTier {
  const upper = coin.toUpperCase();
  if (activeCoin && activeCoin.toUpperCase() === upper) return "active";
  const entry = entries.find((e) => e.coin === upper);
  if (!entry) return "cold";
  return entry.tier;
}

export interface AgentOperationsState {
  loopRunning: boolean;
  tokenPressure: number;
  agents: AgentRuntimeState[];
  signals: AgentSignal[];
  signalsVersion: number;
  fusedMatrix: FusedOpportunity[];
  fusedVersion: number;
  watchlist: DynamicWatchlist;
  recentMarketEvents: MarketEvent[];
  biasFilterEnabled: boolean;

  setLoopRunning: (running: boolean) => void;
  setTokenPressure: (pressure: number) => void;
  setAgentStatus: (agentId: AgentKind, status: AgentRuntimeState["status"]) => void;
  setAgentPollInterval: (agentId: AgentKind, ms: number) => void;
  incrementAgentTokens: (agentId: AgentKind, tokens: number) => void;
  pushSignal: (signal: AgentSignal) => void;
  upsertFusedOpportunity: (op: FusedOpportunity) => void;
  patchFusedThesis: (id: string, thesis: string) => void;
  ingestMarketEvent: (event: MarketEvent) => void;
  getRecentEventsForCoin: (coin: string) => MarketEvent[];
  syncWatchlistFromTerminal: (activeCoin: string | null) => void;
  recordInteraction: (coin: string) => void;
  setWatchlistTier: (coin: string, tier: WatchlistTier) => void;
  behavioralRelevance: (coin: string) => number;
  setBiasFilterEnabled: (enabled: boolean) => void;
  clearFused: () => void;
}

export const useAgentOperationsStore = create<AgentOperationsState>()(
  subscribeWithSelector((set, get) => ({
    loopRunning: false,
    tokenPressure: 0,
    agents: DEFAULT_AGENTS,
    signals: [],
    signalsVersion: 0,
    fusedMatrix: [],
    fusedVersion: 0,
    watchlist: {
      entries: [],
      activeCoin: null,
      updatedAt: Date.now(),
    },
    recentMarketEvents: [],
    biasFilterEnabled: true,

    setLoopRunning: (running) => set({ loopRunning: running }),

    setTokenPressure: (pressure) => set({ tokenPressure: pressure }),

    setAgentStatus: (agentId, status) =>
      set((s) => ({
        agents: s.agents.map((a) =>
          a.agentId === agentId
            ? {
                ...a,
                status,
                lastRunAt: status === "running" ? Date.now() : a.lastRunAt,
              }
            : a,
        ),
      })),

    setAgentPollInterval: (agentId, ms) =>
      set((s) => ({
        agents: s.agents.map((a) =>
          a.agentId === agentId ? { ...a, pollIntervalMs: ms } : a,
        ),
      })),

    incrementAgentTokens: (agentId, tokens) =>
      set((s) => ({
        agents: s.agents.map((a) =>
          a.agentId === agentId
            ? {
                ...a,
                tokensUsed: a.tokensUsed + tokens,
                signalsEmitted: a.signalsEmitted + (tokens < 200 ? 1 : 0),
              }
            : a,
        ),
      })),

    pushSignal: (signal) =>
      set((s) => ({
        signals: [signal, ...s.signals].slice(0, MAX_SIGNALS),
        signalsVersion: s.signalsVersion + 1,
      })),

    upsertFusedOpportunity: (op) =>
      set((s) => {
        const filtered = s.fusedMatrix.filter((f) => f.id !== op.id);
        const ranked = [op, ...filtered]
          .sort((a, b) => b.fusedConfidenceScore - a.fusedConfidenceScore)
          .slice(0, MAX_FUSED);
        return {
          fusedMatrix: ranked,
          fusedVersion: s.fusedVersion + 1,
        };
      }),

    patchFusedThesis: (id, thesis) =>
      set((s) => ({
        fusedMatrix: s.fusedMatrix.map((f) =>
          f.id === id ? { ...f, thesis } : f,
        ),
        fusedVersion: s.fusedVersion + 1,
      })),

    ingestMarketEvent: (event) =>
      set((s) => ({
        recentMarketEvents: [event, ...s.recentMarketEvents].slice(0, MAX_EVENTS),
      })),

    getRecentEventsForCoin: (coin) => {
      const upper = coin.toUpperCase();
      const cutoff = Date.now() - 300_000;
      return get().recentMarketEvents.filter(
        (e) => e.coin.toUpperCase() === upper && e.timestamp >= cutoff,
      );
    },

    syncWatchlistFromTerminal: (activeCoin) => {
      const upper = activeCoin?.toUpperCase() ?? null;
      set((s) => {
        const entries = [...s.watchlist.entries];
        const upsert = (coin: string, tier: WatchlistTier) => {
          const u = coin.toUpperCase();
          const idx = entries.findIndex((e) => e.coin === u);
          const row: DynamicWatchlistEntry = {
            coin: u,
            tier,
            addedAt: idx >= 0 ? entries[idx].addedAt : Date.now(),
            lastInteractionAt: Date.now(),
            interactionScore:
              (idx >= 0 ? entries[idx].interactionScore : 0) + (tier === "active" ? 2 : 1),
          };
          if (idx >= 0) entries[idx] = row;
          else entries.push(row);
        };

        if (upper) upsert(upper, "active");

        for (const e of entries) {
          if (upper && e.coin === upper) continue;
          if (e.tier === "active") {
            e.tier = "warm";
          }
        }

        entries.sort((a, b) => b.interactionScore - a.interactionScore);

        return {
          watchlist: {
            entries: entries.slice(0, 32),
            activeCoin: upper,
            updatedAt: Date.now(),
          },
        };
      });
    },

    recordInteraction: (coin) => {
      behavioralMemory.recordAssetSelect(coin);
      get().syncWatchlistFromTerminal(coin);
    },

    setWatchlistTier: (coin, tier) => {
      const upper = coin.toUpperCase();
      set((s) => {
        const entries = s.watchlist.entries.map((e) =>
          e.coin === upper ? { ...e, tier } : e,
        );
        if (!entries.find((e) => e.coin === upper)) {
          entries.push({
            coin: upper,
            tier,
            addedAt: Date.now(),
            lastInteractionAt: Date.now(),
            interactionScore: 1,
          });
        }
        return {
          watchlist: { ...s.watchlist, entries, updatedAt: Date.now() },
        };
      });
    },

    behavioralRelevance: (coin) => {
      const s = get();
      if (!s.biasFilterEnabled) return 1;
      const upper = coin.toUpperCase();
      const tier = tierForCoin(upper, s.watchlist.activeCoin, s.watchlist.entries);
      const inList = s.watchlist.entries.some((e) => e.coin === upper);
      return behavioralMemory.relevanceForCoin(
        upper,
        tier === "active",
        inList,
      );
    },

    setBiasFilterEnabled: (enabled) => set({ biasFilterEnabled: enabled }),

    clearFused: () =>
      set((s) => ({
        fusedMatrix: [],
        fusedVersion: s.fusedVersion + 1,
      })),
  })),
);
