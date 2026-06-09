import { RiskEngine } from "@/lib/portfolio-desk/RiskEngine";
import { UnifiedPortfolioEngine } from "@/lib/portfolio-desk/UnifiedPortfolioEngine";
import type { PortfolioHistoryPoint } from "@/types/portfolio-risk-treasury";

const STORAGE_KEY = "eq-portfolio-history-v1";
const MAX_POINTS = 120;

let memory: PortfolioHistoryPoint[] = [];

function load(): PortfolioHistoryPoint[] {
  if (memory.length) return memory;
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) memory = JSON.parse(raw) as PortfolioHistoryPoint[];
  } catch {
    memory = [];
  }
  return memory;
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory.slice(-MAX_POINTS)));
  } catch {
    /* ignore */
  }
}

export class PortfolioHistoryEngine {
  static record(): void {
    const portfolio = UnifiedPortfolioEngine.snapshot();
    const risk = RiskEngine.metrics();
    const point: PortfolioHistoryPoint = {
      timestamp: Date.now(),
      accountValueUsd: portfolio.accountValueUsd,
      leverageRatio: risk.leverageRatio,
      netPnlUsd: portfolio.netPnlUsd,
      riskScore: risk.liquidationRiskScore,
    };

    const history = load();
    const last = history[history.length - 1];
    if (last && Date.now() - last.timestamp < 4_000) {
      history[history.length - 1] = point;
    } else {
      history.push(point);
    }
    memory = history.slice(-MAX_POINTS);
    persist();
  }

  static points(): PortfolioHistoryPoint[] {
    return load().slice(-48);
  }
}
