import type { QuantApiSurface } from "@/types/platform-extensibility";

export class QuantResearchApiEngine {
  static surfaces(asset: string): QuantApiSurface[] {
    const coin = asset.toUpperCase();
    return [
      {
        id: "qr-replay",
        path: `/api/memory/vitals?asset=${coin}`,
        category: "replay",
        streaming: false,
        status: "live",
      },
      {
        id: "qr-events",
        path: "/api/ingestion/events",
        category: "events",
        streaming: true,
        status: "live",
      },
      {
        id: "qr-deriv",
        path: `/api/derivatives/vitals?asset=${coin}`,
        category: "derivatives",
        streaming: false,
        status: "live",
      },
      {
        id: "qr-vol",
        path: `/api/integrations/feed?type=volatility&asset=${coin}`,
        category: "volatility",
        streaming: true,
        status: "live",
      },
      {
        id: "qr-liq",
        path: `/api/execution/vitals?asset=${coin}`,
        category: "liquidity",
        streaming: false,
        status: "live",
      },
      {
        id: "qr-research",
        path: `/api/research/vitals?asset=${coin}`,
        category: "research",
        streaming: false,
        status: "live",
      },
    ];
  }
}
