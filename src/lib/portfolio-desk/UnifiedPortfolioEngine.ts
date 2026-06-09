import { PortfolioTreasuryEngine } from "@/lib/enterprise/PortfolioTreasuryEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { PortfolioHoldingRow, UnifiedPortfolioSummary } from "@/types/portfolio-risk-treasury";

export class UnifiedPortfolioEngine {
  static snapshot(): UnifiedPortfolioSummary {
    const state = useTerminalStore.getState();
    const accountValue = state.accountValue ?? 0;
    const withdrawable = state.withdrawable ?? 0;
    const positions = state.positions;

    const hlRows: PortfolioHoldingRow[] = positions.map((p) => {
      const notional = Math.abs(p.size * p.markPrice);
      return {
        asset: p.coin,
        category: "perp",
        venue: "Hyperliquid",
        balanceUsd: notional / Math.max(p.leverage, 1),
        notionalUsd: notional,
        pctPortfolio: 0,
        leverage: p.leverage,
        pnlUsd: p.unrealizedPnl,
      };
    });

    const treasuryRows: PortfolioHoldingRow[] = PortfolioTreasuryEngine.exposures().map((e) => ({
      asset: e.asset,
      category: e.category === "stablecoin" ? "stablecoin" : e.category === "perp" ? "perp" : "treasury",
      venue: e.exchange,
      balanceUsd: e.notionalUsd,
      notionalUsd: e.notionalUsd,
      pctPortfolio: e.pctPortfolio,
      leverage: e.leverage,
      pnlUsd: e.deltaUsd,
    }));

    const merged = new Map<string, PortfolioHoldingRow>();
    for (const row of [...hlRows, ...treasuryRows]) {
      const key = `${row.venue}:${row.asset}`;
      const existing = merged.get(key);
      if (existing) {
        existing.notionalUsd += row.notionalUsd;
        existing.pnlUsd += row.pnlUsd;
      } else {
        merged.set(key, { ...row });
      }
    }

    const holdings = Array.from(merged.values()).sort((a, b) => b.notionalUsd - a.notionalUsd);
    const totalFromHoldings = holdings.reduce((s, h) => s + h.notionalUsd, 0);
    const totalAumUsd = Math.max(accountValue, totalFromHoldings, 1);

    for (const h of holdings) {
      h.pctPortfolio = Math.round((h.notionalUsd / totalAumUsd) * 1000) / 10;
    }

    const netExposureUsd = state.positions.reduce(
      (s, p) => s + p.size * p.markPrice,
      0,
    );
    const netPnlUsd = holdings.reduce((s, h) => s + h.pnlUsd, 0);
    const venues = new Set(holdings.map((h) => h.venue));

    return {
      totalAumUsd,
      accountValueUsd: accountValue,
      withdrawableUsd: withdrawable,
      netExposureUsd,
      netPnlUsd,
      positionCount: positions.length,
      venueCount: venues.size,
      holdings: holdings.slice(0, 24),
    };
  }
}
