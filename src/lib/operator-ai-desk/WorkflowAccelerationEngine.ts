import type { WorkflowSuggestionRow } from "@/types/operator-ai";

const BASE: WorkflowSuggestionRow[] = [
  { id: "wf-chart", command: "/chart", description: "Focus chart panel" },
  { id: "wf-intel", command: "/intel", description: "Open tactical intelligence" },
  { id: "wf-summarize", command: "/summarize", description: "Compress active asset context" },
  { id: "wf-alerts", command: "/alerts", description: "Review alert queue" },
  { id: "wf-macro", command: "/macro", description: "Macro tape & calendar" },
  { id: "wf-ai", command: "/ai", description: "Natural language operator query (Omni)" },
];

export class WorkflowAccelerationEngine {
  static suggestions(asset: string): WorkflowSuggestionRow[] {
    return [
      ...BASE,
      {
        id: "wf-global",
        command: "focus:globaldesk",
        description: `Global intel wire for ${asset}`,
      },
      {
        id: "wf-research",
        command: "focus:researchdesk",
        description: `Research desk · thesis & journal for ${asset}`,
      },
    ];
  }
}
