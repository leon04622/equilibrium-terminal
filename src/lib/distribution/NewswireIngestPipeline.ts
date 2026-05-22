import { EventPrioritizationEngine } from "@/lib/distribution/EventPrioritizationEngine";
import { useAlertStore } from "@/store/useAlertStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useMarketCoverageStore } from "@/store/useMarketCoverageStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { NewswireItem } from "@/types/information-distribution";

function item(
  source: string,
  categoryRaw: string,
  headline: string,
  detail: string,
  coin: string | null,
  severity: NewswireItem["severity"],
  timestamp: number,
  verified: boolean,
  sourceBoost = 0,
): NewswireItem {
  const category = EventPrioritizationEngine.mapCategory(categoryRaw);
  const scores = EventPrioritizationEngine.score(
    category,
    headline,
    coin,
    severity,
    timestamp,
    verified,
    sourceBoost,
  );
  return {
    id: `${source}-${timestamp}-${headline.slice(0, 16).replace(/\s/g, "_")}`,
    category,
    headline,
    detail,
    coin,
    severity,
    source,
    verified,
    timestamp,
    ...scores,
  };
}

export class NewswireIngestPipeline {
  static ingest(limit = 48): NewswireItem[] {
    const rows: NewswireItem[] = [];

    for (const t of useAlertStore.getState().triggers) {
      rows.push(
        item(
          "ALERT",
          t.event.type,
          t.title,
          t.aiExplanation ?? `Rule trigger · ${t.event.type}`,
          t.coin,
          t.severity,
          t.timestamp,
          true,
          14,
        ),
      );
    }

    for (const w of useMarketAtmosphereStore.getState().wire.slice(0, 20)) {
      rows.push(
        item(
          "WIRE",
          w.channel,
          w.headline,
          `${w.channel} · confidence ${w.confidenceIndex}`,
          w.coin,
          w.severity,
          w.timestamp,
          true,
          8,
        ),
      );
    }

    for (const h of useInformationDiscoveryStore.getState().surveillance?.headlines ?? []) {
      rows.push(
        item(
          "SURVEILLANCE",
          h.category,
          h.headline,
          h.detail,
          h.coin,
          h.priority >= 80 ? "critical" : h.priority >= 50 ? "watch" : "info",
          h.timestamp,
          true,
          h.priority / 12,
        ),
      );
    }

    for (const intel of useTerminalStore.getState().intelligence.slice(0, 12)) {
      rows.push(
        item(
          "INTEL",
          intel.channel,
          intel.title,
          intel.detail,
          intel.coin,
          intel.severity,
          intel.timestamp,
          true,
          5,
        ),
      );
    }

    const coverage = useMarketCoverageStore.getState().snapshot;
    for (const ev of coverage?.rankedEvents.slice(0, 10) ?? []) {
      rows.push(
        item(
          ev.source,
          ev.category,
          ev.headline,
          `${ev.source} · priority ${ev.priority}`,
          ev.coin,
          ev.severity,
          ev.timestamp,
          ev.verified,
          ev.priority / 15,
        ),
      );
    }

    for (const sig of coverage?.onChainSignals.slice(0, 8) ?? []) {
      rows.push(
        item(
          "ON-CHAIN",
          sig.category,
          sig.headline,
          sig.notionalUsd ? `$${(sig.notionalUsd / 1_000_000).toFixed(1)}M notional` : "On-chain signal",
          sig.coin,
          sig.severity,
          sig.timestamp,
          sig.sourceVerified,
          10,
        ),
      );
    }

    return rows
      .sort((a, b) => b.compositeScore - a.compositeScore || b.timestamp - a.timestamp)
      .slice(0, limit);
  }
}
