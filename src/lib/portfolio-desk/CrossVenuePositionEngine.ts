import { multiExchangeMarketState } from "@/lib/multi-exchange/marketState";
import { UnifiedPortfolioEngine } from "@/lib/portfolio-desk/UnifiedPortfolioEngine";
import type { CrossVenuePositionRow } from "@/types/portfolio-risk-treasury";
import type { ExchangeId } from "@/types/multi-exchange";

const CEX_VENUES: ExchangeId[] = ["binance", "bybit", "okx", "coinbase", "kraken"];

export class CrossVenuePositionEngine {
  static positions(asset: string): CrossVenuePositionRow[] {
    const portfolio = UnifiedPortfolioEngine.snapshot();
    const total = Math.max(portfolio.totalAumUsd, 1);
    const rows: CrossVenuePositionRow[] = [];

    for (const h of portfolio.holdings) {
      if (h.venue === "Hyperliquid") {
        rows.push({
          venue: "Hyperliquid",
          asset: h.asset,
          notionalUsd: h.notionalUsd,
          pctTotal: Math.round((h.notionalUsd / total) * 1000) / 10,
          leverage: h.leverage,
          riskBand:
            h.pnlUsd < -8000 ? "critical" : h.pnlUsd < -3000 ? "elevated" : h.pnlUsd < 0 ? "moderate" : "low",
        });
      }
    }

    const quotes = multiExchangeMarketState.forAsset(asset);
    for (const ex of CEX_VENUES) {
      const q = quotes.find((x) => x.exchange === ex);
      const seedNotional = portfolio.holdings
        .filter((h) => h.asset === asset && h.venue !== "Hyperliquid")
        .reduce((s, h) => s + h.notionalUsd, 0);
      const notional = seedNotional > 0 ? seedNotional / CEX_VENUES.length : (q ? 120_000 : 0);
      if (notional <= 0) continue;
      rows.push({
        venue: ex,
        asset,
        notionalUsd: notional,
        pctTotal: Math.round((notional / total) * 1000) / 10,
        leverage: 1,
        riskBand: "low",
      });
    }

    const stableRows = portfolio.holdings
      .filter((h) => h.category === "stablecoin")
      .map((h) => ({
        venue: "Treasury" as const,
        asset: h.asset,
        notionalUsd: h.notionalUsd,
        pctTotal: h.pctPortfolio,
        leverage: 1,
        riskBand: "low" as const,
      }));

    return [...rows, ...stableRows].sort((a, b) => b.notionalUsd - a.notionalUsd).slice(0, 16);
  }
}
