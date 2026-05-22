import { MarketCoverageRegistry } from "@/lib/coverage/MarketCoverageRegistry";
import { useTerminalStore } from "@/store/terminalStore";
import type { ExchangeIntegration, IntegrationCategory, IntegrationStatus } from "@/types/industry-integrations";
import type { VenueKind } from "@/types/market-coverage";

function mapKind(kind: VenueKind): IntegrationCategory {
  if (kind === "dex") return "dex";
  if (kind === "options") return "options";
  if (kind === "derivatives") return "exchange";
  if (kind === "stablecoin") return "treasury";
  return "exchange";
}

function mapStatus(status: string): IntegrationStatus {
  if (status === "live") return "live";
  if (status === "degraded") return "degraded";
  if (status === "staged") return "staged";
  return "offline";
}

export class ExchangeConnectivityEngine {
  static integrations(): ExchangeIntegration[] {
    const venues = MarketCoverageRegistry.list();
    const lastMsg = useTerminalStore.getState().lastMessageAt;

    const fromCoverage: ExchangeIntegration[] = venues.map((v) => ({
      id: v.id,
      name: v.name,
      category: mapKind(v.kind),
      status: mapStatus(v.status),
      venues: 1,
      latencyMs: v.latencyMs,
      executionEnabled: v.id.startsWith("hl"),
      dataFeedEnabled: v.status === "live" || v.status === "degraded",
      lastSyncAt: v.lastEventAt ?? lastMsg,
    }));

    const staged: ExchangeIntegration[] = [
      {
        id: "prime-falconx",
        name: "FALCONX PRIME (STAGED)",
        category: "prime_broker",
        status: "staged",
        venues: 12,
        latencyMs: null,
        executionEnabled: false,
        dataFeedEnabled: true,
        lastSyncAt: null,
      },
      {
        id: "cust-fireblocks",
        name: "FIREBLOCKS CUSTODY (STAGED)",
        category: "custodian",
        status: "staged",
        venues: 1,
        latencyMs: null,
        executionEnabled: false,
        dataFeedEnabled: true,
        lastSyncAt: null,
      },
      {
        id: "otc-desk-01",
        name: "OTC DESK ROUTING (STAGED)",
        category: "otc",
        status: "staged",
        venues: 3,
        latencyMs: null,
        executionEnabled: true,
        dataFeedEnabled: false,
        lastSyncAt: null,
      },
    ];

    return [...fromCoverage, ...staged];
  }
}
