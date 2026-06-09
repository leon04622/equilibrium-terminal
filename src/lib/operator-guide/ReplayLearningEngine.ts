import { chartReplayEngine } from "@/lib/charting/ReplayEngine";
import { ScenarioLibraryEngine } from "@/lib/operator-guide/ScenarioLibraryEngine";
import {
  EducationalOverlayEngine,
} from "@/lib/operator-guide/WorkflowWalkthroughEngine";
import { terminalBus } from "@/store/eventBus";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { NormalizedCandle, IntelligenceItem } from "@/types/terminal-schema";
import type { ActiveReplayState, ScenarioLibraryEntry } from "@/types/operator-guide";

function synthCandles(
  asset: string,
  basePrice: number,
  count: number,
  volPattern: "cascade" | "spike" | "trend" | "squeeze" | "stress",
): NormalizedCandle[] {
  const now = Date.now();
  const step = 60_000;
  const candles: NormalizedCandle[] = [];
  let px = basePrice;

  for (let i = 0; i < count; i++) {
    let drift = 0;
    let range = basePrice * 0.001;

    switch (volPattern) {
      case "cascade":
        drift = i > count * 0.2 ? -basePrice * 0.0008 * (i / count) : basePrice * 0.0001;
        range = basePrice * (0.001 + (i / count) * 0.004);
        break;
      case "spike":
        drift = i > count * 0.3 && i < count * 0.7 ? basePrice * 0.0015 : basePrice * 0.0002;
        range = basePrice * (0.002 + Math.sin(i / 3) * 0.001);
        break;
      case "trend":
        drift = basePrice * 0.0005;
        range = basePrice * 0.0012;
        break;
      case "squeeze":
        drift = i > count * 0.4 ? basePrice * 0.0012 : -basePrice * 0.0003;
        range = basePrice * 0.0018;
        break;
      default:
        drift = (Math.random() - 0.5) * basePrice * 0.0004;
        range = basePrice * 0.0015;
    }

    const open = px;
    const close = px + drift;
    const high = Math.max(open, close) + range * 0.5;
    const low = Math.min(open, close) - range * 0.5;
    px = close;

    candles.push({
      time: now - (count - i) * step,
      open,
      high,
      low,
      close,
      volume: 1000 + i * 50,
    });
  }
  return candles;
}

function basePriceFor(asset: string): number {
  const map: Record<string, number> = {
    BTC: 94_000,
    ETH: 3_400,
    SOL: 180,
    HYPE: 28,
  };
  return map[asset.toUpperCase()] ?? 100;
}

function volPatternFor(category: ScenarioLibraryEntry["category"]): "cascade" | "spike" | "trend" | "squeeze" | "stress" {
  switch (category) {
    case "liquidation_cascade":
      return "cascade";
    case "volatility_spike":
    case "macro_event":
      return "spike";
    case "trend_continuation":
      return "trend";
    case "gamma_squeeze":
    case "funding_squeeze":
      return "squeeze";
    default:
      return "stress";
  }
}

function seedIntel(scenario: ScenarioLibraryEntry): void {
  const items: IntelligenceItem[] = [
    {
      id: `replay-intel-${scenario.id}-1`,
      coin: scenario.asset,
      channel: "market",
      title: scenario.headline,
      detail: scenario.professionalContext,
      severity: scenario.severity,
      notionalUsd: scenario.severity === "critical" ? 420_000 : 95_000,
      timestamp: Date.now() - 30_000,
    },
  ];
  for (const item of items) {
    useTerminalStore.getState().pushIntelligence(item);
  }
}

export class ReplayLearningEngine {
  static startScenario(scenarioId: string): boolean {
    const scenario = ScenarioLibraryEngine.get(scenarioId);
    if (!scenario) return false;

    useTerminalStore.getState().selectAssetByCoin(scenario.asset, "operator-guide-replay");

    const base = basePriceFor(scenario.asset);
    const candles = synthCandles(
      scenario.asset,
      base,
      Math.max(40, Math.round(scenario.durationSec / 2)),
      volPatternFor(scenario.category),
    );

    chartReplayEngine.setBuffer(candles);
    chartReplayEngine.scrubToTime(candles[0]?.time ?? Date.now());

    seedIntel(scenario);

    for (const panel of scenario.focusPanels) {
      terminalBus.emit("widget:focus", { widgetId: panel });
    }

    const annotations = EducationalOverlayEngine.annotationsForScenario(scenarioId);
    useOperatorGuideStore.getState().setActiveReplay({
      scenarioId,
      title: scenario.title,
      progressPct: 0,
      mode: "scrubbing",
      playheadTime: candles[0]?.time ?? null,
      annotations,
      activeAnnotation: annotations[0] ?? null,
    });

    useOperatorGuideStore.getState().incrementReplays();
    useOperatorGuideStore.getState().setExplainMode(true);
    useOperatorGuideStore.getState().setSidePanelOpen(true);

    chartReplayEngine.play();

    terminalBus.emit("guide:replay-start", {
      scenarioId,
      title: scenario.title,
      asset: scenario.asset,
    });

    return true;
  }

  static syncReplayState(): ActiveReplayState | null {
    const store = useOperatorGuideStore.getState();
    const replay = store.activeReplay;
    if (!replay) return null;

    const state = chartReplayEngine.getState();
    const progressPct = Math.round(state.progressPct);
    const activeAnnotation = EducationalOverlayEngine.activeAnnotation(
      replay.annotations,
      progressPct,
    );

    const next: ActiveReplayState = {
      ...replay,
      progressPct,
      mode: state.mode,
      playheadTime: state.playheadTime,
      activeAnnotation,
    };

    if (
      activeAnnotation?.focusPanel &&
      activeAnnotation.id !== replay.activeAnnotation?.id
    ) {
      terminalBus.emit("widget:focus", { widgetId: activeAnnotation.focusPanel });
    }

    terminalBus.emit("chart:replay", {
      mode: state.mode,
      playheadTime: state.playheadTime,
      progressPct,
    });

    return next;
  }

  static stopReplay(): void {
    chartReplayEngine.goLive();
    useOperatorGuideStore.getState().setActiveReplay(null);
    terminalBus.emit("guide:replay-stop", {});
  }
}
