import { InformationDistributionOrchestrator } from "@/lib/distribution/InformationDistributionOrchestrator";
import { SystemicAlertEngine } from "@/lib/systemic-intelligence/SystemicAlertEngine";
import type { GlobalAlertRow } from "@/types/global-intelligence";

export class GlobalAlertingDeskEngine {
  static alerts(asset: string): GlobalAlertRow[] {
    const upper = asset.toUpperCase();
    const dist = InformationDistributionOrchestrator.snapshot();
    const fromWire = dist.newswire
      .filter((n) => n.severity !== "info")
      .filter((n) => !upper || !n.coin || n.coin.toUpperCase() === upper)
      .slice(0, 6)
      .map((n) => ({
        id: n.id,
        kind: n.category,
        headline: n.headline,
        severity: n.severity,
      }));

    const fromIncidents = dist.incidents
      .filter((i) => i.severity !== "info")
      .slice(0, 4)
      .map((i) => ({
        id: i.id,
        kind: i.kind,
        headline: i.headline,
        severity: i.severity,
      }));

    const systemic = SystemicAlertEngine.evaluate(asset).slice(0, 4).map((a) => ({
      id: a.id,
      kind: a.kind,
      headline: a.headline,
      severity: a.severity,
    }));

    return [...fromWire, ...fromIncidents, ...systemic];
  }
}
