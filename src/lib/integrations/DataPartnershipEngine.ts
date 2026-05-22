import type { DataPartnership } from "@/types/industry-integrations";

export class DataPartnershipEngine {
  static partnerships(): DataPartnership[] {
    return [
      {
        id: "dp-hl",
        partner: "HYPERLIQUID",
        category: "exchange",
        tier: "premium",
        feedsActive: 6,
        status: "live",
        contractStatus: "active",
      },
      {
        id: "dp-chainlink",
        partner: "CHAINLINK DATA (STAGED)",
        category: "data_provider",
        tier: "premium",
        feedsActive: 0,
        status: "staged",
        contractStatus: "pending",
      },
      {
        id: "dp-kaiko",
        partner: "KAIKO (STAGED)",
        category: "data_provider",
        tier: "premium",
        feedsActive: 0,
        status: "staged",
        contractStatus: "trial",
      },
      {
        id: "dp-macro",
        partner: "MACRO DESK FEEDS",
        category: "macro",
        tier: "proprietary",
        feedsActive: 4,
        status: "connected",
        contractStatus: "active",
      },
      {
        id: "dp-liq",
        partner: "LIQUIDITY AGGREGATOR (STAGED)",
        category: "liquidity",
        tier: "standard",
        feedsActive: 0,
        status: "staged",
        contractStatus: "pending",
      },
    ];
  }
}
