import { CrossAssetVisualizationEngine } from "@/lib/market-command/CrossAssetVisualizationEngine";
import { GlobalMarketOverviewEngine } from "@/lib/market-command/GlobalMarketOverviewEngine";
import { IncidentCommandModeEngine } from "@/lib/market-command/IncidentCommandModeEngine";
import { LiquidityMapsCommandEngine } from "@/lib/market-command/LiquidityMapsCommandEngine";
import { MARKET_COMMAND_DASHBOARD_MODES } from "@/lib/market-command/MarketCommandDashboardModes";
import { MarketCommandBriefEngine } from "@/lib/market-command/MarketCommandBriefEngine";
import { MarketCommandTelemetry } from "@/lib/market-command/MarketCommandTelemetry";
import { OrganizationalCommandEngine } from "@/lib/market-command/OrganizationalCommandEngine";
import { SituationalAiSummaryEngine } from "@/lib/market-command/SituationalAiSummaryEngine";
import { SystemicRiskCommandEngine } from "@/lib/market-command/SystemicRiskCommandEngine";
import { VolatilityCommandEngine } from "@/lib/market-command/VolatilityCommandEngine";
import { VisualOrchestrationEngine } from "@/lib/market-command/VisualOrchestrationEngine";
import { SystemicRiskEngine } from "@/lib/systemic-intelligence/SystemicRiskEngine";
import { MarketCoverageOrchestrator } from "@/lib/coverage/MarketCoverageOrchestrator";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { MarketCommandModeId, MarketCommandSnapshot } from "@/types/market-command";

const MODE_STORAGE = "eq-market-command-mode-v1";

function readMode(): MarketCommandModeId {
  if (typeof window === "undefined") return "situation_room";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && MARKET_COMMAND_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as MarketCommandModeId;
    }
  } catch {
    /* ignore */
  }
  return "situation_room";
}

export class MarketCommandOrchestrator {
  static snapshot(): MarketCommandSnapshot {
    MarketCommandTelemetry.begin();
    const asset = useTerminalStore.getState().selectedCoin ?? "BTC";
    const atmosphere = useMarketAtmosphereStore.getState();
    const coverage = MarketCoverageOrchestrator.snapshot();
    const risk = SystemicRiskEngine.metrics(asset);

    const overview = GlobalMarketOverviewEngine.overview();
    const systemicRisk = SystemicRiskCommandEngine.factors(asset);
    const liquidityMaps = LiquidityMapsCommandEngine.maps(asset);
    const volatility = VolatilityCommandEngine.dashboard(asset);
    const incidents = IncidentCommandModeEngine.incidents(asset);
    const crossAsset = CrossAssetVisualizationEngine.links(asset);
    const orgCommand = OrganizationalCommandEngine.command();
    const visualOrchestration = VisualOrchestrationEngine.controls();

    const criticalIncidents = incidents.filter((i) => i.severity === "critical").length;
    const telemetry = MarketCommandTelemetry.snapshot({
      criticalIncidents,
      systemicTier: risk.riskTier,
      stressScore: atmosphere.stress.score,
      coverageScore: coverage.coverageScore,
    });

    const partial = { overview, incidents, telemetry };

    return {
      asset,
      overview,
      systemicRisk,
      liquidityMaps,
      volatility,
      incidents,
      crossAsset,
      orgCommand,
      visualOrchestration,
      situationalBrief: MarketCommandBriefEngine.brief(partial),
      aiSummary: SituationalAiSummaryEngine.summarize(asset),
      dashboardModes: MARKET_COMMAND_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetry,
      situationalScore: telemetry.situationalScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: MarketCommandModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
    if (id === "incident_command") useAdaptiveWorkspaceStore.getState().setMode("execution");
    else if (id === "liquidity_map") useAdaptiveWorkspaceStore.getState().setMode("execution");
    else if (id === "systemic_watch") useAdaptiveWorkspaceStore.getState().setMode("macro");
    else if (id === "cross_asset") useAdaptiveWorkspaceStore.getState().setMode("macro");
    else useAdaptiveWorkspaceStore.getState().setMode("balanced");
  }
}
