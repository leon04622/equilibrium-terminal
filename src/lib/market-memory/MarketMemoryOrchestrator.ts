import { HistoricalEventArchiveEngine } from "@/lib/market-memory/HistoricalEventArchiveEngine";
import { HistoricalLiquidityEngine } from "@/lib/market-memory/HistoricalLiquidityEngine";
import { HistoricalSearchEngine } from "@/lib/market-memory/HistoricalSearchEngine";
import { MARKET_MEMORY_DASHBOARD_MODES } from "@/lib/market-memory/MarketMemoryDashboardModes";
import { MarketAnalogEngine } from "@/lib/market-memory/MarketAnalogEngine";
import { MarketMemoryTelemetry } from "@/lib/market-memory/MarketMemoryTelemetry";
import { MarketReplayOrchestrator } from "@/lib/market-memory/MarketReplayOrchestrator";
import { MemoryAlertEngine } from "@/lib/market-memory/MemoryAlertEngine";
import { NarrativeEvolutionEngine } from "@/lib/market-memory/NarrativeEvolutionEngine";
import { PortfolioRiskMemoryEngine } from "@/lib/market-memory/PortfolioRiskMemoryEngine";
import { RegimeAnalysisEngine } from "@/lib/market-memory/RegimeAnalysisEngine";
import { ResearchAnnotationMemoryEngine } from "@/lib/market-memory/ResearchAnnotationMemoryEngine";
import type {
  MarketMemoryDashboardModeId,
  MarketMemorySnapshot,
} from "@/types/market-memory";

const MODE_STORAGE = "eq-memory-mode-v1";

function readMode(): MarketMemoryDashboardModeId {
  if (typeof window === "undefined") return "replay_desk";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && MARKET_MEMORY_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as MarketMemoryDashboardModeId;
    }
  } catch {
    /* ignore */
  }
  return "replay_desk";
}

export class MarketMemoryOrchestrator {
  static snapshot(asset: string, searchQuery = ""): MarketMemorySnapshot {
    MarketMemoryTelemetry.begin();
    HistoricalLiquidityEngine.record(asset);

    const archive = HistoricalEventArchiveEngine.archive(asset);
    const replay = MarketReplayOrchestrator.context();
    const regimes = RegimeAnalysisEngine.epochs(asset);
    const currentRegime = regimes[0] ?? RegimeAnalysisEngine.classify(asset);
    const searchResults = HistoricalSearchEngine.search(asset, searchQuery);
    const analogs = MarketAnalogEngine.matches(asset);
    const liquidityHistory = HistoricalLiquidityEngine.history();
    const narrativeEvolution = NarrativeEvolutionEngine.timeline(asset);
    const portfolioMemory = PortfolioRiskMemoryEngine.points(asset);
    const researchMemory = ResearchAnnotationMemoryEngine.entries(asset);
    const alerts = MemoryAlertEngine.evaluate(asset);
    const telemetry = MarketMemoryTelemetry.snapshot(asset);

    const memoryScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          telemetry.storageQualityScore * 0.35 +
            (replay.replayReady ? 25 : 10) +
            analogs.length * 4 +
            (currentRegime.volatility === "stress" ? 70 : 90) * 0.15,
        ),
      ),
    );

    return {
      asset,
      archive: archive.slice(0, 32),
      replay,
      regimes,
      currentRegime,
      searchResults,
      analogs,
      liquidityHistory,
      narrativeEvolution,
      portfolioMemory,
      researchMemory,
      alerts,
      dashboardModes: MARKET_MEMORY_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetry,
      memoryScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: MarketMemoryDashboardModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }
}
