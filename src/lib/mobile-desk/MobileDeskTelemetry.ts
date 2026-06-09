import { CrossDeviceContinuityEngine } from "@/lib/mobile-desk/CrossDeviceContinuityEngine";
import { RealTimeAlertDeliveryEngine } from "@/lib/mobile-desk/RealTimeAlertDeliveryEngine";
import type { MobileDeskTelemetrySnapshot } from "@/types/mobile-operational";

let startedAt = 0;

export class MobileDeskTelemetry {
  static begin(): void {
    startedAt = performance.now();
  }

  static snapshot(asset: string): MobileDeskTelemetrySnapshot {
    const alerts = RealTimeAlertDeliveryEngine.alerts(asset);
    const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
    const pushDelivered24h = alerts.filter((a) => a.pushed).length * 12;
    const syncedDevices = CrossDeviceContinuityEngine.sessions().filter((s) => s.handoffReady)
      .length;
    const awarenessScore = Math.min(
      100,
      40 + criticalAlerts * 8 + alerts.length * 2 + syncedDevices * 10,
    );

    return {
      alertCount: alerts.length,
      criticalAlerts,
      pushDelivered24h,
      syncedDevices,
      computeLatencyMs: Math.round(performance.now() - startedAt),
      awarenessScore,
    };
  }
}
