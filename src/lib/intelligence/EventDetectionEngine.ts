import { IngestStreamBuffer } from "@/lib/ingest/IngestStreamBuffer";
import { StreamProcessingEngine } from "@/lib/ingest/StreamProcessingEngine";
import { useAlertStore } from "@/store/useAlertStore";
import { useDataIngestionStore } from "@/store/useDataIngestionStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useMarketCoverageStore } from "@/store/useMarketCoverageStore";
import { useTerminalStore } from "@/store/terminalStore";
import type {
  IntelligenceCategory,
  IntelligenceEvent,
  IntelligenceSeverityBand,
} from "@/types/market-intelligence";

function band(severity: number): IntelligenceSeverityBand {
  if (severity >= 75) return "critical";
  if (severity >= 45) return "watch";
  return "info";
}

function evt(
  id: string,
  category: IntelligenceCategory,
  severity: number,
  confidence: number,
  assets: string[],
  summary: string,
  detail: string,
  timestamp: number,
  related: string[],
): IntelligenceEvent {
  return {
    id,
    category,
    severity,
    severityBand: band(severity),
    confidence,
    urgencyScore: 0,
    impactScore: 0,
    relevanceScore: 0,
    compositeScore: 0,
    affectedAssets: assets,
    summary,
    detail,
    timestamp,
    relatedEntities: related,
    enriched: false,
  };
}

export class EventDetectionEngine {
  static detect(limit = 40): IntelligenceEvent[] {
    const out: IntelligenceEvent[] = [];
    const now = Date.now();
    const terminal = useTerminalStore.getState();
    const atmosphere = useMarketAtmosphereStore.getState();
    const surveillance = useInformationDiscoveryStore.getState().surveillance;
    const processing = useDataIngestionStore.getState().snapshot?.processing;
    const coverage = useMarketCoverageStore.getState().snapshot;
    const activeCoin = terminal.selectedCoin ?? terminal.selectedAsset?.coin ?? "BTC";

    if (surveillance?.regime === "liquidation") {
      out.push(
        evt(
          "liq-cascade-regime",
          "liquidation",
          82,
          0.88,
          ["BTC", "ETH"],
          "Liquidation cascade regime active",
          `Surveillance stress ${surveillance.stressScore.toFixed(0)} · monitor cascade risk`,
          now,
          ["liquidation", "volatility"],
        ),
      );
    }

    if ((processing?.volatilityScore ?? atmosphere.stress.score) > 78) {
      out.push(
        evt(
          "vol-spike",
          "volatility",
          Math.min(95, (processing?.volatilityScore ?? atmosphere.stress.score) + 10),
          0.85,
          [activeCoin],
          "Volatility spike detected",
          `Stress ${(processing?.volatilityScore ?? atmosphere.stress.score).toFixed(0)} · velocity ${atmosphere.stress.velocityRatio.toFixed(2)}×`,
          now,
          ["volatility", "liquidity"],
        ),
      );
    }

    const spread = terminal.book?.spreadBps ?? processing?.spreadBps;
    if (spread != null && spread > 16) {
      out.push(
        evt(
          `spread-${activeCoin}`,
          "liquidity",
          Math.min(90, 50 + spread),
          0.9,
          [activeCoin],
          "Spread widening on active book",
          `${spread.toFixed(1)} bps · liquidity withdrawal signal`,
          now,
          ["liquidity", activeCoin],
        ),
      );
    }

    if (processing?.fundingBias === "long_pays" || processing?.fundingBias === "short_pays") {
      out.push(
        evt(
          "funding-skew",
          "funding",
          58,
          0.72,
          [activeCoin],
          `Abnormal funding skew · ${processing.fundingBias.replace("_", " ")}`,
          "Order flow imbalance elevated on recent tape",
          now,
          ["funding", "positioning"],
        ),
      );
    }

    if (terminal.connectionStatus !== "connected") {
      out.push(
        evt(
          "exchange-instability",
          "exchange",
          terminal.connectionStatus === "disconnected" ? 88 : 62,
          0.95,
          [activeCoin],
          "Exchange stream instability",
          `Connection ${terminal.connectionStatus}`,
          now,
          ["exchange", "hl-perp"],
        ),
      );
    }

    for (const t of useAlertStore.getState().triggers.slice(0, 6)) {
      const cat: IntelligenceCategory = t.event.type.includes("LIQ")
        ? "liquidation"
        : t.event.type.includes("FUNDING")
          ? "funding"
          : t.event.type.includes("WHALE")
            ? "positioning"
            : "volatility";
      out.push(
        evt(
          `alert-${t.id}`,
          cat,
          t.severity === "critical" ? 85 : t.severity === "watch" ? 58 : 32,
          0.8,
          [t.coin],
          t.title,
          t.aiExplanation ?? t.event.type,
          t.timestamp,
          [t.event.type, t.coin],
        ),
      );
    }

    for (const sig of coverage?.onChainSignals.slice(0, 5) ?? []) {
      const cat: IntelligenceCategory =
        sig.category === "whale" || sig.category === "treasury"
          ? "positioning"
          : sig.category === "exchange_flow"
            ? "stablecoin"
            : "narrative";
      out.push(
        evt(
          sig.id,
          cat,
          sig.severity === "critical" ? 80 : sig.severity === "watch" ? 55 : 30,
          sig.sourceVerified ? 0.86 : 0.6,
          [sig.coin],
          sig.headline,
          sig.notionalUsd ? `$${(sig.notionalUsd / 1_000_000).toFixed(1)}M notional` : "On-chain signal",
          sig.timestamp,
          [sig.category, sig.coin],
        ),
      );
    }

    for (const h of surveillance?.headlines.slice(0, 4) ?? []) {
      out.push(
        evt(
          h.id,
          h.category.includes("macro") ? "macro" : "narrative",
          h.priority >= 80 ? 78 : h.priority >= 50 ? 52 : 28,
          0.75,
          h.coin ? [h.coin] : [],
          h.headline,
          h.detail,
          h.timestamp,
          [h.category],
        ),
      );
    }

    for (const flag of processing?.anomalyFlags ?? []) {
      out.push(
        evt(
          `anomaly-${flag}`,
          "volatility",
          65,
          0.7,
          [activeCoin],
          `Anomaly · ${flag.replace(/_/g, " ")}`,
          "Stream processing layer flagged unusual conditions",
          now,
          [flag],
        ),
      );
    }

    for (const e of IngestStreamBuffer.recent(8)) {
      if (e.eventType !== "trade") continue;
      const payload = e.payload as { notionalUsd?: number; side?: string; asset?: string };
      if ((payload.notionalUsd ?? 0) > 500_000) {
        out.push(
          evt(
            e.id,
            "positioning",
            70,
            0.82,
            [e.asset ?? activeCoin],
            `Large ${payload.side ?? "side"} print · ${e.asset ?? activeCoin}`,
            `$${((payload.notionalUsd ?? 0) / 1000).toFixed(0)}K notional`,
            e.timestamp,
            ["whale", e.asset ?? activeCoin],
          ),
        );
      }
    }

    const deduped = new Map<string, IntelligenceEvent>();
    for (const e of out) {
      const key = `${e.category}-${e.summary.slice(0, 40)}`;
      const existing = deduped.get(key);
      if (!existing || e.severity > existing.severity) deduped.set(key, e);
    }

    return Array.from(deduped.values())
      .sort((a, b) => b.severity - a.severity || b.timestamp - a.timestamp)
      .slice(0, limit);
  }
}
