import { DailyBriefingEngine } from "@/lib/daily/DailyBriefingEngine";
import { SessionClockEngine } from "@/lib/daily/SessionClockEngine";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useMarketCoverageStore } from "@/store/useMarketCoverageStore";
import type { DistributionBriefing } from "@/types/information-distribution";

function briefing(
  kind: DistributionBriefing["kind"],
  headline: string,
  summary: string,
  bullets: string[],
  severity: DistributionBriefing["severity"],
): DistributionBriefing {
  return {
    id: `brief-${kind}-${Date.now()}`,
    kind,
    headline,
    summary,
    bullets,
    severity,
    generatedAt: Date.now(),
  };
}

export class BriefingDispatchEngine {
  static build(): DistributionBriefing[] {
    const out: DistributionBriefing[] = [];
    const daily = DailyBriefingEngine.build();
    const clock = SessionClockEngine.snapshot();
    const atmosphere = useMarketAtmosphereStore.getState();
    const surveillance = useInformationDiscoveryStore.getState().surveillance;
    const coverage = useMarketCoverageStore.getState().snapshot;

    out.push(
      briefing(
        "pre_market",
        daily.headline,
        `${clock.label} · ${clock.liquidityPhase} liquidity · ${daily.macroEventsToday} macro events today`,
        daily.bullets.slice(0, 6).map((b) => `${b.category}: ${b.headline}`),
        daily.bullets.some((b) => b.severity === "critical")
          ? "critical"
          : daily.alertPressure > 50
            ? "watch"
            : "info",
      ),
    );

    const volState =
      atmosphere.stress.score > 75
        ? "extreme"
        : atmosphere.stress.score > 55
          ? "elevated"
          : atmosphere.stress.velocityRatio > 1.3
            ? "elevated"
            : "normal";
    out.push(
      briefing(
        "volatility",
        `Volatility report · ${volState}`,
        `Stress ${atmosphere.stress.score.toFixed(0)} · velocity ${atmosphere.stress.velocityRatio.toFixed(2)}× · spread ${atmosphere.stress.spreadBps?.toFixed(1) ?? "—"} bps`,
        [
          `Regime ${atmosphere.regime.regime}`,
          `Narrative accel ${atmosphere.regime.narrativeAcceleration.toFixed(0)}`,
          surveillance ? `Surveillance stress ${surveillance.stressScore.toFixed(0)}` : "Surveillance pending",
        ],
        volState === "extreme" ? "critical" : volState === "elevated" ? "watch" : "info",
      ),
    );

    out.push(
      briefing(
        "macro",
        "Macro summary",
        `Lead ${atmosphere.regime.dominantMacro ?? "—"} · ${atmosphere.macro.length} macro tickers tracked`,
        atmosphere.calendar.slice(0, 4).map((e) => `${e.title} (${e.impact})`),
        atmosphere.calendar.some((e) => e.impact === "high") ? "watch" : "info",
      ),
    );

    out.push(
      briefing(
        "liquidity",
        "Liquidity conditions",
        `Book imbalance ${atmosphere.stress.bookImbalance.toFixed(2)} · EQ liquidity index ${coverage?.proprietaryMetrics.find((m) => m.id === "eq_liquidity")?.value ?? "—"}`,
        [
          `Liquidity phase ${clock.liquidityPhase}`,
          `Coverage trust ${coverage?.dataQuality.overallTrust ?? "—"}%`,
          `Feeds ${coverage?.dataQuality.feedsOnline ?? 0}/${coverage?.dataQuality.feedsTotal ?? 0} online`,
        ],
        atmosphere.stress.spreadBps != null && atmosphere.stress.spreadBps > 16 ? "watch" : "info",
      ),
    );

    if (surveillance) {
      out.push(
        briefing(
          "narrative",
          "Narrative pulse",
          `Regime ${surveillance.regime} · accel ${surveillance.narrativeAcceleration.toFixed(0)}`,
          surveillance.headlines.slice(0, 4).map((h) => h.headline),
          surveillance.narrativeAcceleration > 70 ? "watch" : "info",
        ),
      );
    }

    const stressedVenues = coverage?.venues.filter((v) => v.status !== "live").length ?? 0;
    if (stressedVenues > 0) {
      out.push(
        briefing(
          "exchange_stress",
          "Exchange stress update",
          `${stressedVenues} venue(s) degraded or offline`,
          coverage?.venues
            .filter((v) => v.status !== "live")
            .slice(0, 4)
            .map((v) => `${v.name}: ${v.status}`) ?? [],
          stressedVenues >= 2 ? "watch" : "info",
        ),
      );
    }

    out.push(
      briefing(
        "daily_state",
        "Daily market state",
        daily.headline,
        [
          `Alert pressure ${daily.alertPressure}`,
          `Session ${daily.session}`,
          `Coverage score ${coverage?.coverageScore ?? "—"}`,
        ],
        daily.alertPressure > 70 ? "watch" : "info",
      ),
    );

    return out;
  }
}
