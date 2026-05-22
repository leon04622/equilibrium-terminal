import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { backtestEngine } from "@/lib/quant/BacktestEngine";
import { signalDecayEngine } from "@/lib/quant/SignalDecayEngine";
import type {
  BacktestRunLog,
  FeatureMatrixRow,
  GovernanceMetrics,
  MarketFeature,
  MarketRegime,
  ModelExperiment,
  SignalCandidate,
  SignalStatus,
} from "@/types/quant-research";

export type {
  BacktestRunLog,
  BacktestTradeLog,
  FeatureKind,
  FeatureMatrixRow,
  FlatFeatureSnapshot,
  GovernanceMetrics,
  HistoricalMarketEvent,
  MarketFeature,
  MarketRegime,
  ModelExperiment,
  RegimePerformance,
  SignalCandidate,
  SignalStatus,
} from "@/types/quant-research";

const MATRIX_MAX = 32;
const CANDIDATE_MAX = 24;
const LOG_MAX = 48;

function defaultGovernance(): GovernanceMetrics {
  return {
    activeSignals: 0,
    decayingSignals: 0,
    retiredSignals: 0,
    avgConfidence: 0,
    pipelineCycleMs: 0,
    featuresPerSecond: 0,
    lastDecayEventAt: null,
    updatedAt: Date.now(),
  };
}

function seedCandidates(): SignalCandidate[] {
  const now = Date.now();
  return [
    {
      id: "sig-book-squeeze",
      name: "L2 IMBALANCE SQUEEZE",
      hypothesis: "Bid-heavy imbalance in HV squeeze precedes 15m continuation",
      coin: "BTC",
      featureKinds: ["book_imbalance", "spread_pressure", "volatility_surface"],
      status: "active",
      confidenceIndex: 78,
      validationSharpe: 1.42,
      validationWinRate: 0.56,
      validationMaxDrawdown: 0.11,
      liveSharpe: 1.28,
      liveWinRate: 0.54,
      liveExpectancy: 0.0018,
      decayBoundary: 0.0009,
      decayRate: 0.04,
      regimeDependencies: [
        {
          regime: "HIGH_VOLATILITY_SQUEEZE",
          tradeCount: 42,
          winRate: 0.58,
          sharpeRatio: 1.55,
          maxDrawdown: 0.09,
          expectancy: 0.0021,
          sampleSize: 42,
        },
        {
          regime: "LOW_VOLATILITY_MEAN_REVERTING",
          tradeCount: 18,
          winRate: 0.44,
          sharpeRatio: 0.62,
          maxDrawdown: 0.14,
          expectancy: 0.0004,
          sampleSize: 18,
        },
      ],
      createdAt: now - 86_400_000,
      updatedAt: now,
      retiredAt: null,
    },
    {
      id: "sig-liq-cascade",
      name: "LIQ VELOCITY FADE",
      hypothesis: "Post-cascade flow imbalance mean-reverts within 3 regimes",
      coin: "ETH",
      featureKinds: ["liquidation_velocity", "trade_flow_imbalance"],
      status: "validating",
      confidenceIndex: 64,
      validationSharpe: 1.05,
      validationWinRate: 0.51,
      validationMaxDrawdown: 0.16,
      liveSharpe: 0.98,
      liveWinRate: 0.49,
      liveExpectancy: 0.0012,
      decayBoundary: 0.0007,
      decayRate: 0.05,
      regimeDependencies: [
        {
          regime: "LIQUIDATION_CASCADE",
          tradeCount: 31,
          winRate: 0.55,
          sharpeRatio: 1.18,
          maxDrawdown: 0.12,
          expectancy: 0.0016,
          sampleSize: 31,
        },
      ],
      createdAt: now - 172_800_000,
      updatedAt: now,
      retiredAt: null,
    },
  ];
}

export interface QuantResearchState {
  featureMatrix: FeatureMatrixRow[];
  matrixVersion: number;
  candidates: SignalCandidate[];
  candidatesVersion: number;
  experiments: ModelExperiment[];
  backtestLogs: BacktestRunLog[];
  governance: GovernanceMetrics;
  selectedSignalId: string | null;
  pipelineActive: boolean;
  featureEventsWindow: number;

  setPipelineActive: (active: boolean) => void;
  upsertFeatureRow: (coin: string, features: MarketFeature[]) => void;
  selectSignal: (id: string | null) => void;
  addCandidate: (candidate: SignalCandidate) => void;
  updateCandidate: (id: string, patch: Partial<SignalCandidate>) => void;
  applyDecayEvaluations: () => void;
  queueExperiment: (signalId: string, label: string) => string;
  runExperiment: (experimentId: string) => void;
  appendBacktestLog: (log: BacktestRunLog) => void;
  patchGovernance: (patch: Partial<GovernanceMetrics>) => void;
  recordFeatureBatch: (count: number, cycleMs: number) => void;
}

export const useQuantResearchStore = create<QuantResearchState>()(
  subscribeWithSelector((set, get) => ({
    featureMatrix: [],
    matrixVersion: 0,
    candidates: seedCandidates(),
    candidatesVersion: 1,
    experiments: [],
    backtestLogs: [],
    governance: defaultGovernance(),
    selectedSignalId: "sig-book-squeeze",
    pipelineActive: false,
    featureEventsWindow: 0,

    setPipelineActive: (pipelineActive) => set({ pipelineActive }),

    upsertFeatureRow: (coin, features) =>
      set((s) => {
        const lastUpdatedNs = features[0]?.computedAtNs ?? Date.now() * 1_000_000;
        const existing = s.featureMatrix.find((r) => r.coin === coin);
        const row: FeatureMatrixRow = {
          coin,
          features,
          lastUpdatedNs,
        };
        const featureMatrix = existing
          ? s.featureMatrix.map((r) => (r.coin === coin ? row : r))
          : [row, ...s.featureMatrix].slice(0, MATRIX_MAX);
        return { featureMatrix, matrixVersion: s.matrixVersion + 1 };
      }),

    selectSignal: (selectedSignalId) => set({ selectedSignalId }),

    addCandidate: (candidate) =>
      set((s) => ({
        candidates: [candidate, ...s.candidates].slice(0, CANDIDATE_MAX),
        candidatesVersion: s.candidatesVersion + 1,
      })),

    updateCandidate: (id, patch) =>
      set((s) => ({
        candidates: s.candidates.map((c) =>
          c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c,
        ),
        candidatesVersion: s.candidatesVersion + 1,
      })),

    applyDecayEvaluations: () => {
      const evaluations = signalDecayEngine.batchEvaluate(get().candidates);
      if (evaluations.length === 0) return;

      set((s) => {
        let candidates = [...s.candidates];
        for (const ev of evaluations) {
          candidates = candidates.map((c) => {
            if (c.id !== ev.signalId) return c;
            return {
              ...c,
              confidenceIndex: ev.nextConfidence,
              status: ev.nextStatus,
              retiredAt: ev.shouldRetire ? Date.now() : c.retiredAt,
              updatedAt: Date.now(),
            };
          });
        }

        const activeSignals = candidates.filter((c) => c.status === "active").length;
        const decayingSignals = candidates.filter((c) => c.status === "decaying").length;
        const retiredSignals = candidates.filter((c) => c.status === "retired").length;
        const avgConfidence =
          candidates.length > 0
            ? candidates.reduce((a, c) => a + c.confidenceIndex, 0) / candidates.length
            : 0;

        return {
          candidates,
          candidatesVersion: s.candidatesVersion + 1,
          governance: {
            ...s.governance,
            activeSignals,
            decayingSignals,
            retiredSignals,
            avgConfidence,
            lastDecayEventAt: Date.now(),
            updatedAt: Date.now(),
          },
        };
      });
    },

    queueExperiment: (signalId, label) => {
      const id = `exp-${Date.now().toString(36)}`;
      const experiment: ModelExperiment = {
        id,
        label,
        signalId,
        status: "queued",
        slippageBps: 4.5,
        latencyMs: 28,
        positionSizePct: 2.5,
        regimesTested: [
          "HIGH_VOLATILITY_SQUEEZE",
          "LOW_VOLATILITY_MEAN_REVERTING",
          "LIQUIDATION_CASCADE",
          "TREND_EXPANSION",
        ],
        progressPct: 0,
        backtestLogId: null,
        error: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      set((s) => ({ experiments: [experiment, ...s.experiments].slice(0, 32) }));
      return id;
    },

    runExperiment: (experimentId) => {
      const state = get();
      const exp = state.experiments.find((e) => e.id === experimentId);
      const signal = state.candidates.find((c) => c.id === exp?.signalId);
      if (!exp || !signal) return;

      set((s) => ({
        experiments: s.experiments.map((e) =>
          e.id === experimentId
            ? { ...e, status: "running" as const, progressPct: 10, updatedAt: Date.now() }
            : e,
        ),
      }));

      const history = backtestEngine.generateSyntheticHistory(signal.coin, 240, 100);
      const result = backtestEngine.run(
        history,
        {
          id: signal.id,
          entryImbalanceThreshold: 0.22,
          exitImbalanceThreshold: 0.05,
          favoredRegimes: [
            "HIGH_VOLATILITY_SQUEEZE",
            "LIQUIDATION_CASCADE",
            "TREND_EXPANSION",
            "UNKNOWN",
          ],
        },
        signal.id,
        {
          slippageBps: exp.slippageBps,
          latencyMs: exp.latencyMs,
          positionSizePct: exp.positionSizePct,
        },
      );

      const log: BacktestRunLog = {
        id: result.runId,
        experimentId,
        signalId: signal.id,
        startedAt: Date.now(),
        completedAt: Date.now(),
        totalTrades: result.aggregate.tradeCount,
        aggregateSharpe: result.aggregate.sharpeRatio,
        aggregateWinRate: result.aggregate.winRate,
        maxDrawdown: result.aggregate.maxDrawdown,
        regimePartitions: result.regimePartitions,
        trades: result.trades,
      };

      get().appendBacktestLog(log);

      set((s) => ({
        experiments: s.experiments.map((e) =>
          e.id === experimentId
            ? {
                ...e,
                status: "completed" as const,
                progressPct: 100,
                backtestLogId: log.id,
                updatedAt: Date.now(),
              }
            : e,
        ),
        candidates: s.candidates.map((c) =>
          c.id === signal.id
            ? {
                ...c,
                validationSharpe: result.aggregate.sharpeRatio,
                validationWinRate: result.aggregate.winRate,
                validationMaxDrawdown: result.aggregate.maxDrawdown,
                regimeDependencies: result.regimePartitions,
                status: "active" as SignalStatus,
                updatedAt: Date.now(),
              }
            : c,
        ),
        candidatesVersion: s.candidatesVersion + 1,
      }));
    },

    appendBacktestLog: (log) =>
      set((s) => ({
        backtestLogs: [log, ...s.backtestLogs].slice(0, LOG_MAX),
      })),

    patchGovernance: (patch) =>
      set((s) => ({
        governance: { ...s.governance, ...patch, updatedAt: Date.now() },
      })),

    recordFeatureBatch: (count, cycleMs) =>
      set((s) => {
        const featureEventsWindow = s.featureEventsWindow + count;
        const featuresPerSecond =
          cycleMs > 0 ? Math.round((count / cycleMs) * 1000 * 10) / 10 : 0;
        return {
          featureEventsWindow,
          governance: {
            ...s.governance,
            pipelineCycleMs: cycleMs,
            featuresPerSecond,
            updatedAt: Date.now(),
          },
        };
      }),
  })),
);

/** Imperative decay tick — call from runtime loop. */
export function tickSignalDecay(): void {
  useQuantResearchStore.getState().applyDecayEvaluations();
}
