import { useAlertStore } from "@/store/useAlertStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { RankedMarketEvent } from "@/types/market-coverage";

function rankEvent(
  source: string,
  category: string,
  headline: string,
  coin: string | null,
  severity: RankedMarketEvent["severity"],
  timestamp: number,
  verified: boolean,
  boost = 0,
): RankedMarketEvent {
  const sev =
    severity === "critical" ? 90 : severity === "watch" ? 55 : 25;
  const ageMin = (Date.now() - timestamp) / 60_000;
  const freshness = ageMin < 3 ? 15 : ageMin < 15 ? 8 : 0;
  return {
    id: `${source}-${timestamp}-${headline.slice(0, 8)}`,
    source,
    category,
    headline,
    coin,
    severity,
    timestamp,
    verified,
    priority: Math.min(100, sev + freshness + boost),
  };
}

export class EventIngestPipeline {
  static ingest(limit = 32): RankedMarketEvent[] {
    const events: RankedMarketEvent[] = [];

    for (const t of useAlertStore.getState().triggers) {
      events.push(
        rankEvent("ALERT", t.event.type, t.title, t.coin, t.severity, t.timestamp, true, 12),
      );
    }

    for (const h of useInformationDiscoveryStore.getState().surveillance?.headlines ?? []) {
      events.push(
        rankEvent(
          "SURVEILLANCE",
          h.category,
          h.headline,
          h.coin,
          h.priority >= 80 ? "critical" : h.priority >= 50 ? "watch" : "info",
          h.timestamp,
          true,
          h.priority / 10,
        ),
      );
    }

    for (const w of useMarketAtmosphereStore.getState().wire.slice(0, 12)) {
      events.push(
        rankEvent("WIRE", w.channel, w.headline, w.coin, w.severity, w.timestamp, true, 5),
      );
    }

    for (const item of useTerminalStore.getState().intelligence.slice(0, 10)) {
      events.push(
        rankEvent(
          "INTEL",
          item.channel,
          item.title,
          item.coin,
          item.severity,
          item.timestamp,
          true,
        ),
      );
    }

    return events
      .sort((a, b) => b.priority - a.priority || b.timestamp - a.timestamp)
      .slice(0, limit);
  }
}
