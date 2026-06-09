import { CrossDeviceContinuityEngine } from "@/lib/mobile-desk/CrossDeviceContinuityEngine";
import { MarketIncidentModeEngine } from "@/lib/mobile-desk/MarketIncidentModeEngine";
import { MOBILE_DESK_DASHBOARD_MODES } from "@/lib/mobile-desk/MobileDeskDashboardModes";
import { MobileAwarenessBriefEngine } from "@/lib/mobile-desk/MobileAwarenessBriefEngine";
import { MobileCompanionArchitectureEngine } from "@/lib/mobile-desk/MobileCompanionArchitectureEngine";
import { MobileDeskTelemetry } from "@/lib/mobile-desk/MobileDeskTelemetry";
import { MobileExecutionOversightEngine } from "@/lib/mobile-desk/MobileExecutionOversightEngine";
import { MobileIntelligenceFeedEngine } from "@/lib/mobile-desk/MobileIntelligenceFeedEngine";
import { MobilePerformanceEngine } from "@/lib/mobile-desk/MobilePerformanceEngine";
import { PortfolioRiskOversightEngine } from "@/lib/mobile-desk/PortfolioRiskOversightEngine";
import { RealTimeAlertDeliveryEngine } from "@/lib/mobile-desk/RealTimeAlertDeliveryEngine";
import { WatchlistMonitoringEngine } from "@/lib/mobile-desk/WatchlistMonitoringEngine";
import type { MobileDeskModeId, MobileDeskSnapshot } from "@/types/mobile-operational";

const MODE_STORAGE = "eq-mobile-desk-mode-v1";

function readMode(): MobileDeskModeId {
  if (typeof window === "undefined") return "awareness";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && MOBILE_DESK_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as MobileDeskModeId;
    }
  } catch {
    /* ignore */
  }
  return "awareness";
}

export class MobileDeskOrchestrator {
  static snapshot(asset: string): MobileDeskSnapshot {
    MobileDeskTelemetry.begin();
    const telemetry = MobileDeskTelemetry.snapshot(asset);

    return {
      asset,
      platforms: MobileCompanionArchitectureEngine.targets(),
      alerts: RealTimeAlertDeliveryEngine.alerts(asset),
      intelFeed: MobileIntelligenceFeedEngine.feed(asset),
      portfolio: PortfolioRiskOversightEngine.rows(asset),
      execution: MobileExecutionOversightEngine.rows(asset),
      watchlist: WatchlistMonitoringEngine.assets(asset),
      sessions: CrossDeviceContinuityEngine.sessions(),
      incidentMode: MarketIncidentModeEngine.active(),
      performance: MobilePerformanceEngine.vitals(),
      awarenessBrief: MobileAwarenessBriefEngine.brief(asset),
      dashboardModes: MOBILE_DESK_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetry,
      awarenessScore: telemetry.awarenessScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: MobileDeskModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }
}
