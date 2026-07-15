import { UnifiedPortfolioEngine } from "@/lib/portfolio-desk/UnifiedPortfolioEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type {
  LiveBlotterSnapshot,
  SettlementBreak,
  SettlementLedgerEntry,
  SettlementReconciliationSnapshot,
  SettlementReconStatus,
} from "@/types/institutional-capabilities";

function netFillSize(
  fills: LiveBlotterSnapshot["fills"],
  coin: string,
): number {
  return fills
    .filter((f) => f.coin === coin)
    .reduce((sum, f) => sum + (f.side === "buy" ? f.sz : -f.sz), 0);
}

function statusFromBreaks(breaks: SettlementBreak[]): SettlementReconStatus {
  if (breaks.some((b) => b.severity === "critical")) return "break";
  if (breaks.length > 0) return "watch";
  return "matched";
}

function healthFromBreaks(breaks: SettlementBreak[], wallet: string | null): number {
  let score = 100;
  if (!wallet) score -= 35;
  for (const b of breaks) {
    score -= b.severity === "critical" ? 22 : 12;
  }
  return Math.max(0, Math.min(100, score));
}

export class SettlementReconciliationEngine {
  static snapshot(blotter: LiveBlotterSnapshot | null): SettlementReconciliationSnapshot {
    const state = useTerminalStore.getState();
    const portfolio = UnifiedPortfolioEngine.snapshot();
    const wallet = blotter?.wallet ?? state.walletAddress;
    const fills = blotter?.fills ?? [];
    const openOrders = blotter?.openOrders ?? [];
    const positions = state.positions;

    const breaks: SettlementBreak[] = [];
    const ledger: SettlementLedgerEntry[] = [];

    if (blotter?.error) {
      breaks.push({
        id: "blotter-error",
        severity: "watch",
        coin: "—",
        headline: "Blotter sync failed",
        detail: blotter.error,
      });
    }

    if (!wallet) {
      breaks.push({
        id: "no-wallet",
        severity: "watch",
        coin: "—",
        headline: "Wallet not connected",
        detail: "Connect wallet to reconcile fills against live positions",
      });
    }

    let totalFeesUsd = 0;
    let totalRealizedPnlUsd = 0;
    let totalFillNotionalUsd = 0;

    for (const f of fills) {
      const notional = f.px * f.sz;
      totalFillNotionalUsd += notional;
      totalFeesUsd += Math.abs(f.fee);
      totalRealizedPnlUsd += f.closedPnl;

      ledger.push({
        id: `fill-${f.id}`,
        kind: "fill",
        at: f.time,
        coin: f.coin,
        amountUsd: Math.round(notional * 100) / 100,
        qty: f.sz,
        status: "settled",
        detail: `${f.side.toUpperCase()} ${f.sz} @ ${f.px} · ${f.dir}`,
      });

      if (Math.abs(f.fee) > 0) {
        ledger.push({
          id: `fee-${f.id}`,
          kind: "fee",
          at: f.time,
          coin: f.coin,
          amountUsd: Math.round(Math.abs(f.fee) * 100) / 100,
          qty: null,
          status: "settled",
          detail: "Exchange fee accrual",
        });
      }

      if (Math.abs(f.closedPnl) > 0) {
        ledger.push({
          id: `pnl-${f.id}`,
          kind: "pnl_realized",
          at: f.time,
          coin: f.coin,
          amountUsd: Math.round(f.closedPnl * 100) / 100,
          qty: null,
          status: "settled",
          detail: "Realized P&L on fill",
        });
      }
    }

    for (const p of positions) {
      const coinFills = fills.filter((f) => f.coin === p.coin);
      if (coinFills.length === 0) {
        ledger.push({
          id: `carry-${p.coin}`,
          kind: "position_carry",
          at: Date.now(),
          coin: p.coin,
          amountUsd: Math.round(Math.abs(p.size * p.markPrice)),
          qty: p.size,
          status: "pending",
          detail: "Position carried — no fills in blotter window",
        });
        if (Math.abs(p.size * p.markPrice) >= 500) {
          breaks.push({
            id: `uncorroborated-${p.coin}`,
            severity: "watch",
            coin: p.coin,
            headline: `${p.coin} position uncorroborated`,
            detail: `Live size ${p.size} with no matching fills in ledger sample`,
          });
        }
        continue;
      }

      const net = netFillSize(fills, p.coin);
      const tolerance = Math.max(0.0001, Math.abs(p.size) * 0.08);
      if (Math.abs(net - p.size) > tolerance && Math.sign(net) === Math.sign(p.size)) {
        breaks.push({
          id: `drift-${p.coin}`,
          severity: "critical",
          coin: p.coin,
          headline: `${p.coin} fill/position drift`,
          detail: `Position ${p.size} vs net fill delta ${net.toFixed(4)}`,
        });
        ledger.push({
          id: `break-${p.coin}`,
          kind: "break",
          at: Date.now(),
          coin: p.coin,
          amountUsd: Math.round(Math.abs(p.size - net) * p.markPrice * 100) / 100,
          qty: p.size - net,
          status: "break",
          detail: "Fill stream does not reconcile to reported position",
        });
      }
    }

    if (
      fills.length >= 3 &&
      Math.abs(totalRealizedPnlUsd - portfolio.netPnlUsd) >
        Math.max(250, Math.abs(portfolio.netPnlUsd) * 0.35)
    ) {
      breaks.push({
        id: "pnl-divergence",
        severity: "watch",
        coin: "BOOK",
        headline: "P&L divergence",
        detail: `Fill realized ${totalRealizedPnlUsd.toFixed(0)} vs book net ${portfolio.netPnlUsd.toFixed(0)}`,
      });
    }

    if (openOrders.length > 0 && wallet) {
      ledger.push({
        id: "pending-orders",
        kind: "position_carry",
        at: Date.now(),
        coin: "—",
        amountUsd: 0,
        qty: openOrders.length,
        status: "pending",
        detail: `${openOrders.length} open orders awaiting settlement`,
      });
    }

    ledger.sort((a, b) => b.at - a.at);

    const status = statusFromBreaks(breaks);

    return {
      wallet,
      healthScore: healthFromBreaks(breaks, wallet),
      status,
      fillCount: fills.length,
      openOrderCount: openOrders.length,
      positionCount: positions.length,
      totalFeesUsd: Math.round(totalFeesUsd * 100) / 100,
      totalRealizedPnlUsd: Math.round(totalRealizedPnlUsd * 100) / 100,
      totalFillNotionalUsd: Math.round(totalFillNotionalUsd),
      breaks: breaks.slice(0, 8),
      ledger: ledger.slice(0, 80),
      computedAt: Date.now(),
    };
  }
}
