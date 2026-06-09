import { InformationDistributionOrchestrator } from "@/lib/distribution/InformationDistributionOrchestrator";
import type { RegulatoryRow } from "@/types/global-intelligence";

const SEEDED: RegulatoryRow[] = [
  {
    id: "reg-sec-01",
    jurisdiction: "US · SEC",
    topic: "Digital asset custody rulemaking",
    severity: "watch",
    summary: "Comment period active — desk monitor for ETF issuer filings",
  },
  {
    id: "reg-mica-01",
    jurisdiction: "EU · MiCA",
    topic: "Stablecoin reserve requirements",
    severity: "info",
    summary: "Issuer attestation cadence tightening for EURC/USDC pairs",
  },
  {
    id: "reg-cftc-01",
    jurisdiction: "US · CFTC",
    topic: "Derivatives venue oversight",
    severity: "watch",
    summary: "Perp venue reporting standards — execution desk compliance watch",
  },
];

export class RegulatoryPolicyDeskEngine {
  static monitor(): RegulatoryRow[] {
    const fromWire = InformationDistributionOrchestrator.snapshot()
      .newswire.filter(
        (n) =>
          n.headline.toLowerCase().includes("sec") ||
          n.headline.toLowerCase().includes("regulat") ||
          n.headline.toLowerCase().includes("mica") ||
          n.category === "operational",
      )
      .slice(0, 6)
      .map((n) => ({
        id: `reg-wire-${n.id}`,
        jurisdiction: n.source,
        topic: n.headline.slice(0, 40),
        severity: n.severity,
        summary: n.detail.slice(0, 80),
      }));

    return [...fromWire, ...SEEDED];
  }
}
