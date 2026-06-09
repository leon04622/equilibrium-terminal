import type { EventPropagationRow } from "@/types/unified-operations";

const RULES: EventPropagationRow[] = [
  {
    id: "prop-intel-chart",
    trigger: "intelligence:signal",
    targets: "chart · alerts · operatordesk",
    status: "armed",
  },
  {
    id: "prop-exec-risk",
    trigger: "execution:fill",
    targets: "positions · portfoliodesk · slippageradar",
    status: "armed",
  },
  {
    id: "prop-macro-watch",
    trigger: "distribution:event",
    targets: "macro · globaldesk · watchlists",
    status: "armed",
  },
  {
    id: "prop-deriv-alert",
    trigger: "derivatives:regime",
    targets: "derivdesk · alerts · systemicintel",
    status: "armed",
  },
  {
    id: "prop-replay-notes",
    trigger: "memory:replay",
    targets: "memorydesk · researchdesk · annotations",
    status: "armed",
  },
  {
    id: "prop-portfolio-intel",
    trigger: "portfolio:exposure",
    targets: "intelligence scoring · risk panels",
    status: "armed",
  },
  {
    id: "prop-alert-mobile",
    trigger: "alert:triggered",
    targets: "mobiledesk · operatordesk",
    status: "armed",
  },
  {
    id: "prop-ai-context",
    trigger: "ai:prompt",
    targets: "copilot · unified context fusion",
    status: "live",
  },
];

export class CrossSystemPropagationDeskEngine {
  static rules(): EventPropagationRow[] {
    return RULES;
  }
}
