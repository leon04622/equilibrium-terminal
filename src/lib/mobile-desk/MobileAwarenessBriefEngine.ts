import { RealTimeAlertDeliveryEngine } from "@/lib/mobile-desk/RealTimeAlertDeliveryEngine";
import { MarketIncidentModeEngine } from "@/lib/mobile-desk/MarketIncidentModeEngine";

export class MobileAwarenessBriefEngine {
  static brief(asset: string): string {
    const alerts = RealTimeAlertDeliveryEngine.alerts(asset);
    const critical = alerts.filter((a) => a.severity === "critical").length;
    const incident = MarketIncidentModeEngine.active();

    return [
      `Mobile awareness · ${asset}`,
      `${alerts.length} active alerts · ${critical} critical`,
      incident ? `Incident mode: ${incident.headline}` : "No active incident mode",
      "Desktop remains primary — mobile is monitoring & response only.",
    ].join("\n");
  }
}
