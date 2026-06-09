import { CrossAssetRelationshipDeskEngine } from "@/lib/global-intel-desk/CrossAssetRelationshipDeskEngine";
import { EtfFlowDeskEngine } from "@/lib/global-intel-desk/EtfFlowDeskEngine";
import { EventNormalizationEngine } from "@/lib/global-intel-desk/EventNormalizationEngine";
import { EventPropagationDeskEngine } from "@/lib/global-intel-desk/EventPropagationDeskEngine";
import { GLOBAL_INTEL_DASHBOARD_MODES } from "@/lib/global-intel-desk/GlobalIntelDashboardModes";
import { GlobalAlertingDeskEngine } from "@/lib/global-intel-desk/GlobalAlertingDeskEngine";
import { GlobalIntelBriefEngine } from "@/lib/global-intel-desk/GlobalIntelBriefEngine";
import { GlobalIntelTelemetry } from "@/lib/global-intel-desk/GlobalIntelTelemetry";
import { MacroIntelligenceDeskEngine } from "@/lib/global-intel-desk/MacroIntelligenceDeskEngine";
import { NewsIngestionDeskEngine } from "@/lib/global-intel-desk/NewsIngestionDeskEngine";
import { RegulatoryPolicyDeskEngine } from "@/lib/global-intel-desk/RegulatoryPolicyDeskEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { GlobalIntelModeId, GlobalIntelSnapshot } from "@/types/global-intelligence";

const MODE_STORAGE = "eq-global-intel-mode-v1";

function readMode(): GlobalIntelModeId {
  if (typeof window === "undefined") return "macro_command";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && GLOBAL_INTEL_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as GlobalIntelModeId;
    }
  } catch {
    /* ignore */
  }
  return "macro_command";
}

export class GlobalIntelOrchestrator {
  static snapshot(): GlobalIntelSnapshot {
    GlobalIntelTelemetry.begin();
    const asset = useTerminalStore.getState().selectedCoin ?? "BTC";

    const newsFeed = NewsIngestionDeskEngine.feed(asset);
    const macroEvents = EventNormalizationEngine.normalize(asset);
    const macroIndicators = MacroIntelligenceDeskEngine.indicators();
    const macroCalendar = MacroIntelligenceDeskEngine.calendar();
    const etfFlows = EtfFlowDeskEngine.flows();
    const regulatory = RegulatoryPolicyDeskEngine.monitor();
    const crossAsset = CrossAssetRelationshipDeskEngine.relationships(asset);
    const propagation = EventPropagationDeskEngine.chains(asset);
    const alerts = GlobalAlertingDeskEngine.alerts(asset);

    const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
    const telemetry = GlobalIntelTelemetry.snapshot({
      wireItems: newsFeed.length,
      macroEvents: macroEvents.length,
      criticalAlerts,
    });

    const partial = {
      newsFeed,
      macroEvents,
      alerts,
      macroIndicators,
      telemetry,
    };

    return {
      asset,
      newsFeed,
      macroEvents,
      macroIndicators,
      macroCalendar,
      etfFlows,
      regulatory,
      crossAsset,
      propagation,
      alerts,
      globalBrief: GlobalIntelBriefEngine.brief(partial),
      dashboardModes: GLOBAL_INTEL_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetry,
      globalScore: telemetry.globalScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: GlobalIntelModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }
}
