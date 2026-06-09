import type { PlatformDeskDashboardMode } from "@/types/platform-extensibility";

export const PLATFORM_DESK_DASHBOARD_MODES: PlatformDeskDashboardMode[] = [
  {
    id: "api_gateway",
    label: "API gateway",
    description: "REST, WebSocket, and streaming institutional endpoints.",
    panels: ["platformdesk", "ingestion", "integrations"],
  },
  {
    id: "sdk_dev",
    label: "SDK & developer",
    description: "SDK packages, docs, and integration playground.",
    panels: ["platformdesk", "integrations", "ecosystem"],
  },
  {
    id: "quant_research",
    label: "Quant & research APIs",
    description: "Replay, vol, liquidity, and research query surfaces.",
    panels: ["platformdesk", "memorydesk", "researchdesk", "derivdesk"],
  },
  {
    id: "enterprise_connect",
    label: "Enterprise connect",
    description: "Treasury, OMS, risk, and reporting integrations.",
    panels: ["platformdesk", "enterpriseops", "portfoliodesk"],
  },
  {
    id: "embed_ops",
    label: "Embeddable ops",
    description: "Widgets, feeds, and institutional display surfaces.",
    panels: ["platformdesk", "integrations", "newswire"],
  },
];
