import type { SdkPackage } from "@/types/platform-extensibility";

export class SdkEcosystemEngine {
  static packages(): SdkPackage[] {
    return [
      {
        id: "sdk-ts",
        language: "typescript",
        packageName: "@equilibrium/terminal-sdk",
        version: "0.49.0-beta",
        status: "beta",
        capabilities: [
          "market_ingestion",
          "intelligence_feeds",
          "custom_alerts",
          "workspace_automation",
          "research_hooks",
        ],
        downloadsEstimate: 1240,
      },
      {
        id: "sdk-py",
        language: "python",
        packageName: "equilibrium-terminal",
        version: "0.49.0-beta",
        status: "beta",
        capabilities: [
          "historical_query",
          "volatility_analytics",
          "event_subscriptions",
          "replay_api",
        ],
        downloadsEstimate: 890,
      },
      {
        id: "sdk-go",
        language: "go",
        packageName: "github.com/equilibrium/terminal-go",
        version: "0.48.0-staged",
        status: "staged",
        capabilities: ["execution_workflows", "webhook_clients", "low_latency_rest"],
        downloadsEstimate: 320,
      },
      {
        id: "sdk-rust",
        language: "rust",
        packageName: "equilibrium-terminal",
        version: "0.48.0-staged",
        status: "staged",
        capabilities: ["streaming_ingest", "derivatives_analytics", "signed_requests"],
        downloadsEstimate: 180,
      },
    ];
  }
}
