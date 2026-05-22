import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { cognitiveEngine } from "@/lib/telemetry/CognitiveEngine";
import {
  createSessionId,
  hashCoin,
  hashRoute,
  hashToken,
} from "@/lib/telemetry/anonymize";
import type {
  AdaptiveLayoutSuggestion,
  CognitiveLoadMetrics,
  HesitationSample,
  InteractionKind,
  LayoutFocusTrend,
  PlatformVitals,
  TraderInteractionEvent,
  TraderSegment,
} from "@/types/trader-telemetry";

export type {
  AdaptiveLayoutSuggestion,
  CognitiveLoadMetrics,
  HesitationSample,
  InteractionKind,
  LayoutFocusTrend,
  PlatformVitals,
  TraderInteractionEvent,
  TraderSegment,
} from "@/types/trader-telemetry";

const RING_MAX = 256;
const PROCESS_SAMPLES = 32;

export interface PendingHesitation {
  alertEventHash: string;
  severity: "info" | "watch" | "critical";
  signaledAt: number;
}

export interface ClickThroughStat {
  routeHash: string;
  views: number;
  lastAt: number;
}

export interface TraderTelemetryState {
  sessionId: string;
  pipelineActive: boolean;
  segment: TraderSegment;
  metrics: CognitiveLoadMetrics;
  vitals: PlatformVitals;
  eventRing: TraderInteractionEvent[];
  eventsVersion: number;
  layoutFocusTrends: LayoutFocusTrend[];
  clickThrough: ClickThroughStat[];
  pendingHesitations: PendingHesitation[];
  hesitationSamples: HesitationSample[];
  adaptiveSuggestion: AdaptiveLayoutSuggestion | null;
  workspacePriorityCap: number;
  processSamples: number[];

  trackInteraction: (input: {
    kind: InteractionKind;
    panelId?: string;
    coin?: string;
    routeParts: string[];
    severity?: "info" | "watch" | "critical";
    durationMs?: number;
    meta?: Record<string, string | number | boolean>;
  }) => TraderInteractionEvent;

  appendEvents: (events: TraderInteractionEvent[]) => void;
  setMetrics: (metrics: CognitiveLoadMetrics) => void;
  setSegment: (segment: TraderSegment) => void;
  setVitals: (vitals: PlatformVitals) => void;
  patchVitals: (patch: Partial<PlatformVitals>) => void;
  setPipelineActive: (active: boolean) => void;
  setWsReconnectLag: (ms: number) => void;
  recordProcessTiming: (ms: number) => void;
  getAvgProcessMs: () => number;

  registerAlertSignal: (alertId: string, severity: "info" | "watch" | "critical") => void;
  registerIntelligenceSignal: (signalId: string, severity: "info" | "watch" | "critical") => void;
  registerAssetFocus: (source: string) => void;
  recordAlertBypass: (alertId: string, severity: "info" | "watch" | "critical") => void;

  recordFocusTrend: (panelId: string, dwellMs: number) => void;
  recordClickThrough: (routeHash: string) => void;
  setAdaptiveSuggestion: (suggestion: AdaptiveLayoutSuggestion | null) => void;
  markSuggestionApplied: () => void;
  refreshPriorityCap: () => void;
  exportAnonymizedBatch: () => TraderInteractionEvent[];
  resetSession: () => void;
}

function defaultMetrics(): CognitiveLoadMetrics {
  return {
    alertFatigueIndex: 0,
    hesitationLagMs: 0,
    hesitationP95Ms: 0,
    navigationRepetitionScore: 0,
    bypassedCriticalAlerts: 0,
    bypassedWatchAlerts: 0,
    focusSwitchRatePerMin: 0,
    cognitiveFrictionScore: 0,
    samplesHesitation: 0,
    updatedAt: Date.now(),
  };
}

function defaultVitals(): PlatformVitals {
  return {
    eventBufferDepth: 0,
    eventsPerSecond: 0,
    avgProcessMs: 0,
    lastProcessMs: 0,
    droppedFrames: 0,
    wsReconnectLagMs: 0,
    lastStreamStatus: "idle",
    pipelineActive: false,
    memoryHintMb: 0,
    updatedAt: Date.now(),
  };
}

function makeEventId(): string {
  return `tev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useTraderTelemetryStore = create<TraderTelemetryState>()(
  subscribeWithSelector((set, get) => ({
    sessionId: createSessionId(),
    pipelineActive: false,
    segment: "unknown",
    metrics: defaultMetrics(),
    vitals: defaultVitals(),
    eventRing: [],
    eventsVersion: 0,
    layoutFocusTrends: [],
    clickThrough: [],
    pendingHesitations: [],
    hesitationSamples: [],
    adaptiveSuggestion: null,
    workspacePriorityCap: 8,
    processSamples: [],

    trackInteraction: (input) => {
      const ev: TraderInteractionEvent = {
        id: makeEventId(),
        kind: input.kind,
        at: Date.now(),
        durationMs: input.durationMs,
        panelId: input.panelId,
        coinHash: hashCoin(input.coin),
        routeHash: hashRoute(input.routeParts),
        severity: input.severity,
        meta: input.meta,
      };
      return ev;
    },

    appendEvents: (events) =>
      set((s) => ({
        eventRing: [...events, ...s.eventRing].slice(0, RING_MAX),
        eventsVersion: s.eventsVersion + 1,
      })),

    setMetrics: (metrics) => set({ metrics }),
    setSegment: (segment) => set({ segment }),
    setVitals: (vitals) => set({ vitals }),
    patchVitals: (patch) =>
      set((s) => ({ vitals: { ...s.vitals, ...patch, updatedAt: Date.now() } })),

    setPipelineActive: (pipelineActive) =>
      set((s) => ({
        pipelineActive,
        vitals: { ...s.vitals, pipelineActive, updatedAt: Date.now() },
      })),

    setWsReconnectLag: (wsReconnectLagMs) =>
      set((s) => ({
        vitals: { ...s.vitals, wsReconnectLagMs, updatedAt: Date.now() },
      })),

    recordProcessTiming: (ms) =>
      set((s) => {
        const processSamples = [ms, ...s.processSamples].slice(0, PROCESS_SAMPLES);
        return { processSamples };
      }),

    getAvgProcessMs: () => {
      const samples = get().processSamples;
      if (samples.length === 0) return 0;
      const sum = samples.reduce((a, b) => a + b, 0);
      return Math.round((sum / samples.length) * 100) / 100;
    },

    registerAlertSignal: (alertId, severity) => {
      const alertEventHash = hashToken(`alert:${alertId}`);
      set((s) => ({
        pendingHesitations: [
          { alertEventHash, severity, signaledAt: Date.now() },
          ...s.pendingHesitations,
        ].slice(0, 32),
      }));
    },

    registerIntelligenceSignal: (signalId, severity) => {
      const alertEventHash = hashToken(`intel:${signalId}`);
      set((s) => ({
        pendingHesitations: [
          { alertEventHash, severity, signaledAt: Date.now() },
          ...s.pendingHesitations,
        ].slice(0, 32),
      }));
    },

    registerAssetFocus: (source) => {
      const now = Date.now();
      const pending = get().pendingHesitations;
      if (pending.length === 0) return;

      const oldest = pending[pending.length - 1];
      const focusLagMs = now - oldest.signaledAt;
      const sample: HesitationSample = {
        alertEventHash: oldest.alertEventHash,
        focusLagMs,
        severity: oldest.severity,
        recordedAt: now,
      };

      cognitiveEngine.recordHesitation(sample);

      set((s) => ({
        pendingHesitations: s.pendingHesitations.slice(0, -1),
        hesitationSamples: [sample, ...s.hesitationSamples].slice(0, 64),
        metrics: cognitiveEngine.getState().metrics,
      }));

    },

    recordAlertBypass: (alertId, severity) => {
      void get().trackInteraction({
        kind: "alert_bypass",
        panelId: "alerts",
        routeParts: ["alert_bypass", alertId],
        severity,
      });
    },

    recordFocusTrend: (panelId, dwellMs) =>
      set((s) => {
        const existing = s.layoutFocusTrends.find((t) => t.panelId === panelId);
        const next: LayoutFocusTrend[] = existing
          ? s.layoutFocusTrends.map((t) =>
              t.panelId === panelId
                ? {
                    ...t,
                    focusCount: t.focusCount + 1,
                    totalDwellMs: t.totalDwellMs + dwellMs,
                    lastFocusAt: Date.now(),
                  }
                : t,
            )
          : [
              {
                panelId,
                focusCount: 1,
                totalDwellMs: dwellMs,
                lastFocusAt: Date.now(),
              },
              ...s.layoutFocusTrends,
            ];
        return { layoutFocusTrends: next.slice(0, 24) };
      }),

    recordClickThrough: (routeHash) =>
      set((s) => {
        const hit = s.clickThrough.find((c) => c.routeHash === routeHash);
        const clickThrough: ClickThroughStat[] = hit
          ? s.clickThrough.map((c) =>
              c.routeHash === routeHash
                ? { ...c, views: c.views + 1, lastAt: Date.now() }
                : c,
            )
          : [{ routeHash, views: 1, lastAt: Date.now() }, ...s.clickThrough];
        return { clickThrough: clickThrough.slice(0, 48) };
      }),

    setAdaptiveSuggestion: (adaptiveSuggestion) =>
      set((s) => {
        if (adaptiveSuggestion === null) {
          return s.adaptiveSuggestion === null ? s : { adaptiveSuggestion: null };
        }
        const prev = s.adaptiveSuggestion;
        if (
          prev &&
          prev.reason === adaptiveSuggestion.reason &&
          prev.appliedAt === adaptiveSuggestion.appliedAt
        ) {
          return s;
        }
        return { adaptiveSuggestion };
      }),

    markSuggestionApplied: () =>
      set((s) =>
        s.adaptiveSuggestion
          ? {
              adaptiveSuggestion: {
                ...s.adaptiveSuggestion,
                appliedAt: Date.now(),
              },
            }
          : s,
      ),

    refreshPriorityCap: () =>
      set({ workspacePriorityCap: cognitiveEngine.getWorkspacePriorityCap() }),

    exportAnonymizedBatch: () => get().eventRing,

    resetSession: () =>
      set({
        sessionId: createSessionId(),
        segment: "unknown",
        metrics: defaultMetrics(),
        vitals: defaultVitals(),
        eventRing: [],
        eventsVersion: 0,
        layoutFocusTrends: [],
        clickThrough: [],
        pendingHesitations: [],
        hesitationSamples: [],
        adaptiveSuggestion: null,
        workspacePriorityCap: 8,
        processSamples: [],
      }),
  })),
);
