import { SessionClockEngine } from "@/lib/daily/SessionClockEngine";
import { useAlertStore } from "@/store/useAlertStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import type { PrioritizedAlertRow } from "@/types/daily-operations";
import type { TriggeredAlert } from "@/types/alerts";

const SEV_BASE: Record<string, number> = {
  critical: 90,
  watch: 55,
  info: 25,
};

export class AlertPrioritizer {
  static rank(limit = 24): PrioritizedAlertRow[] {
    const triggers = useAlertStore.getState().triggers;
    const clock = SessionClockEngine.snapshot();
    const stress = useMarketAtmosphereStore.getState().stress.score;
    const watchlist = new Set(
      useInformationDiscoveryStore.getState().watchlist.map((w) => w.coin),
    );

    return triggers
      .map((t) => AlertPrioritizer.scoreRow(t, clock.activeSession, stress, watchlist))
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, limit);
  }

  private static scoreRow(
    t: TriggeredAlert,
    session: string,
    stress: number,
    watchlist: Set<string>,
  ): PrioritizedAlertRow {
    let score = SEV_BASE[t.severity] ?? 20;
    const reasons: string[] = [];

    if (watchlist.has(t.coin)) {
      score += 15;
      reasons.push("watchlist");
    }
    if (t.severity === "critical") {
      score += stress > 50 ? 8 : 0;
      reasons.push("severity");
    }
    if (session === "us" || session === "overlap") {
      score += 5;
      reasons.push("US session");
    }
    if (session === "weekend_crypto" && t.event.type.includes("LIQ")) {
      score += 10;
      reasons.push("weekend liq");
    }
    const ageMin = (Date.now() - t.timestamp) / 60_000;
    if (ageMin < 5) {
      score += 12;
      reasons.push("fresh");
    } else if (ageMin > 60) {
      score -= 20;
    }

    return {
      id: t.id,
      coin: t.coin,
      title: t.title,
      severity: t.severity,
      priorityScore: Math.max(0, Math.min(100, Math.round(score))),
      reason: reasons.join(" · ") || "context",
      timestamp: t.timestamp,
    };
  }
}
