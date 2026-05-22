import type { ExternalApiEndpoint } from "@/types/industry-integrations";

export class ExternalApiEngine {
  static endpoints(): ExternalApiEndpoint[] {
    return [
      {
        id: "api-distribution-feed",
        path: "/api/distribution/feed",
        kind: "rest",
        version: "v1",
        status: "live",
        requestsPerMin: 42,
        authMethod: "jwt",
        description: "Institutional newswire & intelligence feed",
      },
      {
        id: "api-distribution-webhook",
        path: "/api/distribution/webhook",
        kind: "webhook",
        version: "v1",
        status: "live",
        requestsPerMin: 8,
        authMethod: "webhook_secret",
        description: "Outbound critical event webhooks",
      },
      {
        id: "api-ingestion-events",
        path: "/api/ingestion/events",
        kind: "streaming_feed",
        version: "v1",
        status: "live",
        requestsPerMin: 120,
        authMethod: "api_key",
        description: "Normalized cross-venue ingest events",
      },
      {
        id: "api-collaboration-sync",
        path: "/api/collaboration/sync",
        kind: "rest",
        version: "v1",
        status: "connected",
        requestsPerMin: 18,
        authMethod: "jwt",
        description: "Desk collaboration sync",
      },
      {
        id: "api-enterprise-sync",
        path: "/api/enterprise/sync",
        kind: "rest",
        version: "v1",
        status: "connected",
        requestsPerMin: 12,
        authMethod: "jwt",
        description: "Enterprise operations sync",
      },
      {
        id: "api-integrations-feed",
        path: "/api/integrations/feed",
        kind: "embed",
        version: "v1",
        status: "live",
        requestsPerMin: 24,
        authMethod: "api_key",
        description: "Embeddable intelligence & market monitors",
      },
      {
        id: "api-workspace-snapshot",
        path: "/api/workspace/snapshot",
        kind: "rest",
        version: "v1",
        status: "live",
        requestsPerMin: 6,
        authMethod: "siwe",
        description: "Workspace cloud persistence",
      },
    ];
  }
}
