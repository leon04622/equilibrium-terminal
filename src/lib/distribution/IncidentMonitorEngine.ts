import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useMarketCoverageStore } from "@/store/useMarketCoverageStore";
import { useReliabilityStore } from "@/store/useReliabilityStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { IncidentKind, MarketIncident } from "@/types/information-distribution";

function incident(
  kind: IncidentKind,
  headline: string,
  detail: string,
  coin: string | null,
  severity: MarketIncident["severity"],
  status: MarketIncident["status"],
  startedAt: number,
): MarketIncident {
  return {
    id: `inc-${kind}-${startedAt}`,
    kind,
    headline,
    detail,
    coin,
    severity,
    status,
    startedAt,
    updatedAt: Date.now(),
    sourceVerified: true,
  };
}

/**
 * Tracks operational market stress events for distribution.
 */
export class IncidentMonitorEngine {
  static scan(): MarketIncident[] {
    const out: MarketIncident[] = [];
    const now = Date.now();
    const terminal = useTerminalStore.getState();
    const atmosphere = useMarketAtmosphereStore.getState();
    const surveillance = useInformationDiscoveryStore.getState().surveillance;
    const coverage = useMarketCoverageStore.getState().snapshot;
    const reliability = useReliabilityStore.getState().snapshot;

    if (terminal.connectionStatus === "disconnected" || terminal.connectionStatus === "reconnecting") {
      out.push(
        incident(
          "api_instability",
          "Primary stream degraded",
          `Connection ${terminal.connectionStatus} · last message ${terminal.lastMessageAt ? `${Math.round((now - terminal.lastMessageAt) / 1000)}s ago` : "unknown"}`,
          terminal.selectedCoin,
          terminal.connectionStatus === "disconnected" ? "critical" : "watch",
          "active",
          now - 120_000,
        ),
      );
    }

    for (const v of coverage?.venues.filter((x) => x.status === "offline" || x.status === "degraded") ?? []) {
      out.push(
        incident(
          v.status === "offline" ? "exchange_outage" : "api_instability",
          `${v.name} ${v.status}`,
          `Venue ${v.kind} · latency ${v.latencyMs ?? "—"}ms`,
          null,
          v.status === "offline" ? "critical" : "watch",
          "monitoring",
          v.lastEventAt ?? now - 300_000,
        ),
      );
    }

    if (atmosphere.stress.score > 78) {
      out.push(
        incident(
          "abnormal_volatility",
          "Volatility stress elevated",
          `Stress ${atmosphere.stress.score.toFixed(0)} · velocity ${atmosphere.stress.velocityRatio.toFixed(2)}×`,
          terminal.selectedCoin,
          atmosphere.stress.score > 88 ? "critical" : "watch",
          "active",
          now - 60_000,
        ),
      );
    }

    if (surveillance?.regime === "liquidation") {
      out.push(
        incident(
          "liquidation_cascade",
          "Liquidation regime active",
          `Stress ${surveillance.stressScore.toFixed(0)} · monitor cascade risk on majors`,
          null,
          "watch",
          "active",
          now - 180_000,
        ),
      );
    }

    const staleStable = coverage?.dataQuality.staleSources.filter((s) =>
      s.toLowerCase().includes("stable"),
    );
    if (staleStable?.length) {
      out.push(
        incident(
          "stablecoin_depeg",
          "Stablecoin feed stress",
          staleStable.join(" · "),
          null,
          "watch",
          "monitoring",
          now - 240_000,
        ),
      );
    }

    for (const sig of coverage?.onChainSignals.filter((s) => s.category === "treasury" && s.notionalUsd && s.notionalUsd > 50_000_000) ?? []) {
      out.push(
        incident(
          "treasury_movement",
          sig.headline,
          sig.notionalUsd
            ? `$${(sig.notionalUsd / 1_000_000).toFixed(0)}M movement`
            : "Treasury movement detected",
          sig.coin,
          sig.severity,
          "monitoring",
          sig.timestamp,
        ),
      );
    }

    for (const sig of coverage?.onChainSignals.filter((s) => s.category === "bridge") ?? []) {
      out.push(
        incident(
          "bridge_failure",
          sig.headline,
          "Bridge infrastructure signal — verify secondary routes",
          sig.coin,
          sig.severity,
          "monitoring",
          sig.timestamp,
        ),
      );
    }

    if (reliability && reliability.data.staleFeedCount > 2) {
      out.push(
        incident(
          "chain_congestion",
          "Data pipeline staleness",
          `${reliability.data.staleFeedCount} stale feeds · quality ${reliability.data.qualityScore}`,
          null,
          reliability.data.qualityScore < 50 ? "critical" : "watch",
          "monitoring",
          now - 90_000,
        ),
      );
    }

    return out
      .sort((a, b) => {
        const sev = { critical: 3, watch: 2, info: 1 };
        return sev[b.severity] - sev[a.severity] || b.updatedAt - a.updatedAt;
      })
      .slice(0, 12);
  }
}
