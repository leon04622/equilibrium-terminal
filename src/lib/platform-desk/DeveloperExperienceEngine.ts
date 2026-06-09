import type { DeveloperResource } from "@/types/platform-extensibility";

export class DeveloperExperienceEngine {
  static resources(): DeveloperResource[] {
    return [
      {
        id: "dev-api-ref",
        title: "Institutional API Reference",
        type: "docs",
        url: "/docs/PLATFORM_EXTENSIBILITY.md",
        status: "live",
      },
      {
        id: "dev-sdk-ts",
        title: "TypeScript SDK Guide",
        type: "docs",
        url: "/docs/PLATFORM_EXTENSIBILITY.md#sdk",
        status: "live",
      },
      {
        id: "dev-playground",
        title: "API Playground (sandbox)",
        type: "playground",
        url: "/api/platform/vitals",
        status: "live",
      },
      {
        id: "dev-example-ingest",
        title: "Event stream subscription example",
        type: "example",
        url: "/api/ingestion/events",
        status: "live",
      },
      {
        id: "dev-onboard",
        title: "Developer onboarding checklist",
        type: "onboarding",
        url: "/docs/PLATFORM_EXTENSIBILITY.md#onboarding",
        status: "live",
      },
      {
        id: "dev-webhook-test",
        title: "Webhook test harness",
        type: "playground",
        url: "/api/distribution/webhook",
        status: "staged",
      },
    ];
  }
}
