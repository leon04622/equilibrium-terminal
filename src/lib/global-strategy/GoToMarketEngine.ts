import type { GtmTargetRow } from "@/types/global-infrastructure";

export class GoToMarketEngine {
  static targets(): GtmTargetRow[] {
    const targets: GtmTargetRow[] = [
      {
        segment: "professional_traders",
        label: "Professional Traders",
        fitScore: 92,
        channel: "Desk workflow demos · execution quality proof",
        avoidRetail: true,
      },
      {
        segment: "crypto_desks",
        label: "Crypto-Native Desks",
        fitScore: 96,
        channel: "Team collab · shared intel · operational continuity",
        avoidRetail: true,
      },
      {
        segment: "research_orgs",
        label: "Research Organizations",
        fitScore: 84,
        channel: "Research suite · narrative archives · publishing",
        avoidRetail: true,
      },
      {
        segment: "market_makers",
        label: "Market Makers",
        fitScore: 78,
        channel: "Execution analytics · venue comparison · latency",
        avoidRetail: true,
      },
      {
        segment: "treasury_ops",
        label: "Treasury Operations",
        fitScore: 81,
        channel: "Portfolio OS · stablecoin monitor · cross-venue",
        avoidRetail: true,
      },
      {
        segment: "institutional_firms",
        label: "Institutional Crypto Firms",
        fitScore: 94,
        channel: "Enterprise tier · integrations · compliance readiness",
        avoidRetail: true,
      },
    ];

    return targets.sort((a, b) => b.fitScore - a.fitScore);
  }
}
