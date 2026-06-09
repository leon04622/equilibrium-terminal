import { MarketAnalogEngine } from "@/lib/market-memory/MarketAnalogEngine";
import { MarketReplayOrchestrator } from "@/lib/market-memory/MarketReplayOrchestrator";
import { RegimeAnalysisEngine } from "@/lib/market-memory/RegimeAnalysisEngine";
import type { MemoryAlert, MemoryAlertKind } from "@/types/market-memory";

function alert(
  kind: MemoryAlertKind,
  severity: MemoryAlert["severity"],
  headline: string,
  detail: string,
): MemoryAlert {
  return {
    id: `${kind}-${Date.now()}`,
    kind,
    severity,
    headline,
    detail,
    timestamp: Date.now(),
  };
}

export class MemoryAlertEngine {
  static evaluate(asset: string): MemoryAlert[] {
    const alerts: MemoryAlert[] = [];
    const regimes = RegimeAnalysisEngine.epochs(asset);
    const analogs = MarketAnalogEngine.matches(asset);
    const replay = MarketReplayOrchestrator.context();

    if (regimes.length >= 2 && regimes[0]!.label !== regimes[1]!.label) {
      alerts.push(
        alert(
          "regime_shift",
          "watch",
          "Regime transition detected",
          `${regimes[1]!.label} → ${regimes[0]!.label}`,
        ),
      );
    }

    const topAnalog = analogs[0];
    if (topAnalog && topAnalog.similarityPct >= 75) {
      alerts.push(
        alert(
          "analog_match",
          topAnalog.similarityPct >= 88 ? "critical" : "watch",
          "Strong historical analog",
          `${topAnalog.label} (${topAnalog.similarityPct}%)`,
        ),
      );
    }

    if (replay.replayReady && replay.mode !== "live") {
      alerts.push(
        alert(
          "replay_ready",
          "info",
          "Replay environment active",
          `${replay.candleCount} bars · ${replay.progressPct}%`,
        ),
      );
    }

    return alerts.slice(0, 8);
  }
}
