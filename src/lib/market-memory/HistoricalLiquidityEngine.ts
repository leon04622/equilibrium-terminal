import { SystemicIntelligenceOrchestrator } from "@/lib/systemic-intelligence/SystemicIntelligenceOrchestrator";
import { useTerminalStore } from "@/store/terminalStore";
import type { HistoricalLiquidityPoint } from "@/types/market-memory";

const STORAGE_KEY = "eq-liq-history-v1";

function load(): HistoricalLiquidityPoint[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoricalLiquidityPoint[]) : [];
  } catch {
    return [];
  }
}

function persist(points: HistoricalLiquidityPoint[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(points.slice(-120)));
  } catch {
    /* ignore */
  }
}

export class HistoricalLiquidityEngine {
  static record(asset: string): void {
    const book = useTerminalStore.getState().book;
    let exchangeConcentration = 70;
    let fragmentation = 40;
    let stablecoinFlowUsd = 2_400_000;
    try {
      const s = SystemicIntelligenceOrchestrator.snapshot(asset);
      exchangeConcentration = s.systemicRisk.exchangeConcentration;
      fragmentation = s.systemicRisk.liquidityFragmentation;
      stablecoinFlowUsd = s.liquidityFlows[0]?.magnitudeUsd ?? stablecoinFlowUsd;
    } catch {
      /* partial */
    }

    const point: HistoricalLiquidityPoint = {
      timestamp: Date.now(),
      exchangeConcentration,
      fragmentation,
      stablecoinFlowUsd,
      depthScore: Math.max(0, 100 - (book?.spreadBps ?? 5) * 3),
    };

    const history = load();
    const last = history[history.length - 1];
    if (last && Date.now() - last.timestamp < 4_000) {
      history[history.length - 1] = point;
    } else {
      history.push(point);
    }
    persist(history);
  }

  static history(): HistoricalLiquidityPoint[] {
    return load().slice(-36);
  }
}
