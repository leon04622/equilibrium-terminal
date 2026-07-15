import { EventPrioritizationEngine } from "@/lib/distribution/EventPrioritizationEngine";
import { DerivativesAlertEngine } from "@/lib/derivatives/DerivativesAlertEngine";
import { useAlertStore } from "@/store/useAlertStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useMarketCoverageStore } from "@/store/useMarketCoverageStore";
import { useExternalNewsStore } from "@/store/useExternalNewsStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { NewswireItem } from "@/types/information-distribution";
import type { NewsSourceTier } from "@/types/institutional-news";

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
  articleUrl: string | null = null,
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
    articleUrl,
  };
}

function severityFromHeadline(headline: string): NewswireItem["severity"] {
  const lower = headline.toLowerCase();
  if (
    lower.includes("hack") ||
    lower.includes("exploit") ||
    lower.includes("bankrupt") ||
    lower.includes("outage")
  ) {
    return "critical";
  }
  if (
    lower.includes("etf") ||
    lower.includes("fed") ||
    lower.includes("liquidat") ||
    lower.includes("regulat")
  ) {
    return "watch";
  }
  return "info";
}

function tierBoost(tier: NewsSourceTier): number {
  switch (tier) {
    case "squawk":
      return 18;
    case "exchange":
      return 17;
    case "hl":
      return 16;
    case "regulatory":
      return 15;
    case "macro":
      return 13;
    default:
      return 8;
  }
}

function tierCategory(tier: NewsSourceTier): string {
  if (tier === "regulatory") return "operational";
  if (tier === "macro") return "macro";
  if (tier === "exchange") return "exchange";
  return "narrative";
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
          w.articleUrl ?? null,
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

    for (const headline of useExternalNewsStore.getState().headlines.slice(0, 48)) {
      const isPanic = headline.source.toUpperCase().includes("PANIC");
      rows.push({
        ...item(
          headline.source,
          tierCategory(headline.tier),
          headline.headline,
          headline.detail,
          headline.coin,
          severityFromHeadline(headline.headline),
          headline.timestamp,
          headline.verified,
          (isPanic ? 17 : tierBoost(headline.tier)) + Math.round(headline.priority / 25),
          headline.url,
        ),
        id: headline.id,
      });
    }

    const asset =
      useTerminalStore.getState().selectedCoin ??
      useTerminalStore.getState().selectedAsset?.coin ??
      "BTC";
    for (const deriv of DerivativesAlertEngine.evaluate(asset)) {
      rows.push(
        item(
          "HL-DERIV",
          deriv.kind,
          `${asset} · ${deriv.headline}`,
          deriv.detail,
          asset,
          deriv.severity,
          deriv.timestamp,
          true,
          16,
        ),
      );
    }

    return rows
      .sort((a, b) => b.compositeScore - a.compositeScore || b.timestamp - a.timestamp)
      .slice(0, limit);
  }
}
