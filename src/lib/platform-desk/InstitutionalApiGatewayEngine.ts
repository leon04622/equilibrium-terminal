import { ExternalApiEngine } from "@/lib/integrations/ExternalApiEngine";
import type { GatewayEndpoint, PlatformApiKind } from "@/types/platform-extensibility";

const VITALS_ROUTES: Array<{
  id: string;
  path: string;
  domain: string;
  description: string;
}> = [
  { id: "vitals-market", path: "/api/market/vitals", domain: "market_data", description: "Multi-venue quotes & tape vitals" },
  { id: "vitals-ingestion", path: "/api/ingestion/vitals", domain: "ingestion", description: "Normalized ingest pipeline health" },
  { id: "vitals-execution", path: "/api/execution/vitals", domain: "execution", description: "Order flow & execution analytics" },
  { id: "vitals-portfolio", path: "/api/portfolio/vitals", domain: "portfolio", description: "Portfolio & treasury systems" },
  { id: "vitals-derivatives", path: "/api/derivatives/vitals", domain: "derivatives", description: "Options & vol surface analytics" },
  { id: "vitals-systemic", path: "/api/systemic/vitals", domain: "intelligence", description: "Systemic & knowledge graph vitals" },
  { id: "vitals-memory", path: "/api/memory/vitals", domain: "replay", description: "Historical replay & regime memory" },
  { id: "vitals-research", path: "/api/research/vitals", domain: "research", description: "Research desk & journaling vitals" },
  { id: "vitals-alpha", path: "/api/alpha/vitals", domain: "intelligence", description: "Alpha lab operational vitals" },
  { id: "vitals-ops", path: "/api/ops/vitals", domain: "operations", description: "DevOps & regional operations" },
  { id: "vitals-security", path: "/api/security/vitals", domain: "security", description: "Security posture & audit" },
  { id: "vitals-platform", path: "/api/platform/vitals", domain: "platform", description: "Platform extensibility gateway" },
  { id: "vitals-mobile", path: "/api/mobile/vitals", domain: "mobile", description: "Mobile companion & awareness vitals" },
  { id: "vitals-ops-command", path: "/api/ops-command/vitals", domain: "operations", description: "Internal ops command & admin vitals" },
  { id: "vitals-billing", path: "/api/billing/vitals", domain: "commercial", description: "Billing & entitlement commercial vitals" },
  { id: "vitals-desk-ops", path: "/api/desk-ops/vitals", domain: "operations", description: "Desk operations & org collaboration vitals" },
  { id: "vitals-global-intel", path: "/api/global-intel/vitals", domain: "intelligence", description: "Global news, macro & cross-asset intelligence vitals" },
  { id: "vitals-operator-ai", path: "/api/operator-ai/vitals", domain: "intelligence", description: "AI-assisted operator & contextual intelligence vitals" },
  { id: "vitals-unified-ops", path: "/api/unified-ops/vitals", domain: "operations", description: "Unified institutional operating experience vitals" },
  { id: "vitals-live-exec", path: "/api/live-exec/vitals", domain: "execution", description: "Live execution desk & trader operations vitals" },
  { id: "vitals-market-command", path: "/api/market-command/vitals", domain: "markets", description: "Global market command & situational awareness vitals" },
  { id: "vitals-product-maturity", path: "/api/product-maturity/vitals", domain: "platform", description: "Institutional experience polish & product maturity vitals" },
  { id: "vitals-live-deployment", path: "/api/live-deployment/vitals", domain: "platform", description: "Live deployment, alpha rollout & operational scale vitals" },
];

function mapKind(kind: string): PlatformApiKind {
  if (kind === "websocket") return "websocket";
  if (kind === "webhook") return "webhook";
  if (kind === "streaming_feed") return "streaming";
  if (kind === "embed") return "embed";
  return "rest";
}

export class InstitutionalApiGatewayEngine {
  static endpoints(): GatewayEndpoint[] {
    const legacy = ExternalApiEngine.endpoints().map((e) => ({
      id: e.id,
      path: e.path,
      kind: mapKind(e.kind),
      domain: e.kind === "webhook" ? "webhooks" : "integrations",
      version: e.version,
      status: e.status === "live" ? ("live" as const) : ("connected" as const),
      latencyMs: e.kind === "streaming_feed" ? 12 : 28,
      requestsPerMin: e.requestsPerMin,
      authMethod: e.authMethod,
      description: e.description,
    }));

    const vitals = VITALS_ROUTES.map((r) => ({
      id: r.id,
      path: r.path,
      kind: "rest" as const,
      domain: r.domain,
      version: "v1",
      status: "live" as const,
      latencyMs: 18 + (r.id.length % 12),
      requestsPerMin: 4 + (r.id.length % 20),
      authMethod: "api_key",
      description: r.description,
    }));

    const ws: GatewayEndpoint = {
      id: "ws-market-stream",
      path: "/ws/market",
      kind: "websocket",
      domain: "market_data",
      version: "v1",
      status: "connected",
      latencyMs: 8,
      requestsPerMin: 240,
      authMethod: "api_key",
      description: "Low-latency market & intelligence stream (gateway staged)",
    };

    return [...legacy, ...vitals, ws].sort((a, b) => b.requestsPerMin - a.requestsPerMin);
  }
}
