import type {
  CognitiveLoadMetrics,
  HesitationSample,
  TraderInteractionEvent,
  TraderSegment,
} from "@/types/trader-telemetry";

const BYPASS_WINDOW_MS = 90_000;
const FATIGUE_CRITICAL_THRESHOLD = 3;

export interface CognitiveEngineState {
  metrics: CognitiveLoadMetrics;
  hesitationSamples: HesitationSample[];
  recentRoutes: string[];
  bypassTimestamps: number[];
  focusTimestamps: number[];
  segment: TraderSegment;
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

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
  );
  return sorted[idx];
}

function inferSegment(
  focusTimestamps: number[],
  events: TraderInteractionEvent[],
): TraderSegment {
  const now = Date.now();
  const recentFocus = focusTimestamps.filter((t) => now - t < 120_000);
  const assetFocus = events.filter(
    (e) => e.kind === "asset_focus" && now - e.at < 120_000,
  ).length;
  const layoutChanges = events.filter(
    (e) => e.kind === "layout_change" && now - e.at < 300_000,
  ).length;
  const omni = events.filter(
    (e) => e.kind === "omnibar_command" && now - e.at < 300_000,
  ).length;

  if (assetFocus >= 8 && recentFocus.length >= 10) return "scalper";
  if (omni >= 4 || layoutChanges >= 3) return "analyst";
  if (assetFocus >= 3 && recentFocus.length >= 4) return "swing";
  if (recentFocus.length <= 2 && assetFocus <= 1) return "passive";
  return "unknown";
}

/**
 * Quantitative cognitive evaluation — alert fatigue, hesitation, navigation repetition.
 */
export class CognitiveEngine {
  private static instance: CognitiveEngine | null = null;

  private state: CognitiveEngineState = {
    metrics: defaultMetrics(),
    hesitationSamples: [],
    recentRoutes: [],
    bypassTimestamps: [],
    focusTimestamps: [],
    segment: "unknown",
  };

  static getInstance(): CognitiveEngine {
    if (!CognitiveEngine.instance) {
      CognitiveEngine.instance = new CognitiveEngine();
    }
    return CognitiveEngine.instance;
  }

  getState(): Readonly<CognitiveEngineState> {
    return this.state;
  }

  recordHesitation(sample: HesitationSample): void {
    this.state.hesitationSamples = [sample, ...this.state.hesitationSamples].slice(
      0,
      64,
    );
    const lags = this.state.hesitationSamples.map((s) => s.focusLagMs);
    const p50 = percentile(lags, 50);
    const p95 = percentile(lags, 95);
    this.state.metrics.hesitationLagMs = p50;
    this.state.metrics.hesitationP95Ms = p95;
    this.state.metrics.samplesHesitation = lags.length;
    this.recomputeFriction();
  }

  processBatch(events: TraderInteractionEvent[]): CognitiveLoadMetrics {
    const now = Date.now();
    let bypassedCritical = 0;
    let bypassedWatch = 0;

    for (const ev of events) {
      this.state.recentRoutes.push(ev.routeHash);
      if (this.state.recentRoutes.length > 128) {
        this.state.recentRoutes = this.state.recentRoutes.slice(-128);
      }

      if (ev.kind === "asset_focus") {
        this.state.focusTimestamps.push(ev.at);
        if (this.state.focusTimestamps.length > 200) {
          this.state.focusTimestamps = this.state.focusTimestamps.slice(-200);
        }
      }

      if (ev.kind === "alert_bypass") {
        this.state.bypassTimestamps.push(ev.at);
        if (ev.severity === "critical") bypassedCritical += 1;
        if (ev.severity === "watch") bypassedWatch += 1;
      }
    }

    this.state.bypassTimestamps = this.state.bypassTimestamps.filter(
      (t) => now - t < BYPASS_WINDOW_MS,
    );

    const recentCriticalBypass = events.filter(
      (e) =>
        e.kind === "alert_bypass" &&
        e.severity === "critical" &&
        now - e.at < BYPASS_WINDOW_MS,
    ).length;

    const totalCriticalInWindow =
      recentCriticalBypass +
      this.state.bypassTimestamps.length;

    let alertFatigueIndex = Math.min(
      100,
      Math.round((totalCriticalInWindow / FATIGUE_CRITICAL_THRESHOLD) * 100),
    );
    if (recentCriticalBypass >= FATIGUE_CRITICAL_THRESHOLD) {
      alertFatigueIndex = 100;
    }

    const routeCounts = new Map<string, number>();
    for (const r of this.state.recentRoutes) {
      routeCounts.set(r, (routeCounts.get(r) ?? 0) + 1);
    }
    let maxRepeat = 0;
    routeCounts.forEach((count) => {
      if (count > maxRepeat) maxRepeat = count;
    });
    const navigationRepetitionScore = Math.min(
      100,
      Math.round((maxRepeat / Math.max(6, this.state.recentRoutes.length)) * 100),
    );

    const focusLastMinute = this.state.focusTimestamps.filter(
      (t) => now - t < 60_000,
    ).length;

    this.state.metrics = {
      ...this.state.metrics,
      alertFatigueIndex,
      navigationRepetitionScore,
      bypassedCriticalAlerts:
        this.state.metrics.bypassedCriticalAlerts + bypassedCritical,
      bypassedWatchAlerts: this.state.metrics.bypassedWatchAlerts + bypassedWatch,
      focusSwitchRatePerMin: focusLastMinute,
      updatedAt: now,
    };

    this.state.segment = inferSegment(this.state.focusTimestamps, events);
    this.recomputeFriction();
    return this.state.metrics;
  }

  shouldSuppressHighSeverityAlerts(): boolean {
    return this.state.metrics.alertFatigueIndex >= 85;
  }

  getWorkspacePriorityCap(): number {
    if (this.state.metrics.alertFatigueIndex >= 85) return 2;
    if (this.state.metrics.alertFatigueIndex >= 60) return 4;
    return 8;
  }

  private recomputeFriction(): void {
    const m = this.state.metrics;
    const hesitationFactor = Math.min(100, m.hesitationP95Ms / 80);
    const friction = Math.min(
      100,
      Math.round(
        m.alertFatigueIndex * 0.42 +
          hesitationFactor * 0.33 +
          m.navigationRepetitionScore * 0.25,
      ),
    );
    m.cognitiveFrictionScore = friction;
    m.updatedAt = Date.now();
  }
}

export const cognitiveEngine = CognitiveEngine.getInstance();
