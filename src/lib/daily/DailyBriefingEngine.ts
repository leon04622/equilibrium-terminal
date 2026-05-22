import { SessionClockEngine } from "@/lib/daily/SessionClockEngine";
import { useAlertStore } from "@/store/useAlertStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import type { BriefingBullet, DailyBriefing } from "@/types/daily-operations";

function bullet(
  category: BriefingBullet["category"],
  headline: string,
  detail: string,
  severity: BriefingBullet["severity"] = "info",
): BriefingBullet {
  return {
    id: `${category}-${headline.slice(0, 12)}`,
    category,
    headline,
    detail,
    severity,
  };
}

export class DailyBriefingEngine {
  static build(): DailyBriefing {
    const clock = SessionClockEngine.snapshot();
    const atmosphere = useMarketAtmosphereStore.getState();
    const surveillance = useInformationDiscoveryStore.getState().surveillance;
    const triggers = useAlertStore.getState().triggers;
    const bullets: BriefingBullet[] = [];

    bullets.push(
      bullet(
        "session",
        `${clock.label} session · ${clock.liquidityPhase} liquidity`,
        `Next: ${clock.nextTransitionLabel}`,
        "info",
      ),
    );

    if (surveillance) {
      bullets.push(
        bullet(
          "overnight",
          `Regime ${surveillance.regime}`,
          `Stress ${surveillance.stressScore.toFixed(0)} · narrative accel ${surveillance.narrativeAcceleration.toFixed(0)}`,
          surveillance.stressScore > 65 ? "watch" : "info",
        ),
      );
      for (const h of surveillance.headlines.slice(0, 4)) {
        bullets.push(
          bullet(
            "narrative",
            h.headline,
            h.detail,
            h.priority >= 80 ? "critical" : h.priority >= 50 ? "watch" : "info",
          ),
        );
      }
    }

    const stress = atmosphere.stress;
    if (stress.velocityRatio > 1.35) {
      bullets.push(
        bullet(
          "volatility",
          "Velocity elevated",
          `Tape velocity ${stress.velocityRatio.toFixed(2)}× baseline`,
          "watch",
        ),
      );
    }

    if ((stress.spreadBps ?? 0) > 14) {
      bullets.push(
        bullet(
          "liquidity",
          "Spread widening",
          `${stress.spreadBps?.toFixed(1) ?? "—"} bps on active book`,
          "watch",
        ),
      );
    }

    const liqHeadlines = surveillance?.headlines.filter((h) =>
      h.headline.toLowerCase().includes("liq"),
    );
    if (liqHeadlines?.length) {
      bullets.push(
        bullet(
          "liquidation",
          "Liquidation activity noted",
          liqHeadlines[0].detail,
          "watch",
        ),
      );
    }

    const highMacro = atmosphere.calendar.filter((e) => e.impact === "high");
    for (const ev of highMacro.slice(0, 3)) {
      const hrs = Math.round((ev.scheduledAt - Date.now()) / 3_600_000);
      bullets.push(
        bullet(
          "macro",
          ev.title,
          `${ev.region} · ${hrs > 0 ? `in ${hrs}h` : "imminent"} · ${ev.forecast ?? "—"} vs ${ev.previous ?? "—"}`,
          ev.impact === "high" ? "watch" : "info",
        ),
      );
    }

    bullets.push(
      bullet(
        "etf",
        "ETF flow context",
        `Macro tape lead ${atmosphere.regime.dominantMacro ?? "—"} · futures ${atmosphere.macro[2]?.changePct?.toFixed(2) ?? "—"}%`,
        "info",
      ),
    );

    bullets.push(
      bullet(
        "stablecoin",
        "Stablecoin & fiat rails",
        "Monitor USDT/USDC mint flows and CEX inflows during session handoff — structural context only.",
        "info",
      ),
    );

    if (triggers.length > 0) {
      bullets.push(
        bullet(
          "overnight",
          `${triggers.length} active alert(s)`,
          triggers
            .slice(0, 3)
            .map((t) => `${t.coin} ${t.title}`)
            .join(" · "),
          triggers.some((t) => t.severity === "critical") ? "critical" : "watch",
        ),
      );
    }

    const headline =
      surveillance?.regime === "liquidation"
        ? "Defensive posture — liquidation regime active"
        : atmosphere.regime.regime === "risk-off"
          ? "Risk-off tone into session"
          : `Operational prep — ${clock.label}`;

    return {
      generatedAt: Date.now(),
      session: clock.activeSession,
      headline,
      bullets: bullets.slice(0, 16),
      macroEventsToday: atmosphere.calendar.filter((e) => {
        const d = new Date(e.scheduledAt);
        const n = new Date();
        return d.getUTCDate() === n.getUTCDate();
      }).length,
      alertPressure: Math.min(100, triggers.length * 12 + stress.score * 0.4),
    };
  }
}
