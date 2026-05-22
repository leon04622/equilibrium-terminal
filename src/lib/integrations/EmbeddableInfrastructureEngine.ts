import type { EmbeddableWidget } from "@/types/industry-integrations";

export class EmbeddableInfrastructureEngine {
  static widgets(): EmbeddableWidget[] {
    return [
      {
        id: "embed-newswire",
        name: "MARKET NEWSWIRE",
        type: "newswire",
        endpoint: "/api/distribution/feed",
        format: "json",
        subscribers: 14,
        status: "live",
      },
      {
        id: "embed-intel",
        name: "INTELLIGENCE MONITOR",
        type: "intelligence_feed",
        endpoint: "/api/integrations/feed?type=intelligence",
        format: "sse",
        subscribers: 8,
        status: "live",
      },
      {
        id: "embed-vol",
        name: "VOLATILITY GAUGE",
        type: "volatility_gauge",
        endpoint: "/api/integrations/feed?type=volatility",
        format: "json",
        subscribers: 5,
        status: "connected",
      },
      {
        id: "embed-portfolio",
        name: "PORTFOLIO STRIP",
        type: "portfolio_strip",
        endpoint: "/api/integrations/feed?type=portfolio",
        format: "iframe",
        subscribers: 3,
        status: "staged",
      },
      {
        id: "embed-monitor",
        name: "MARKET SURVEILLANCE",
        type: "market_monitor",
        endpoint: "/api/integrations/feed?type=surveillance",
        format: "json",
        subscribers: 6,
        status: "connected",
      },
    ];
  }
}
