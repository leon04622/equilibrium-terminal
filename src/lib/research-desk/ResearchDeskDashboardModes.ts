import type { ResearchDeskDashboardMode } from "@/types/research-operating";

export const RESEARCH_DESK_DASHBOARD_MODES: ResearchDeskDashboardMode[] = [
  {
    id: "analyst_workspace",
    label: "Analyst workspace",
    description: "Notebooks, collections, and saved panel layouts.",
    panels: ["researchdesk", "research", "chart", "intelligence"],
  },
  {
    id: "journal_focus",
    label: "Journal focus",
    description: "Trade, session, and market observation journaling.",
    panels: ["researchdesk", "traderjournal", "memorydesk"],
  },
  {
    id: "thesis_lab",
    label: "Thesis lab",
    description: "Thesis lifecycle, invalidation, and evidence links.",
    panels: ["researchdesk", "research", "systemicintel"],
  },
  {
    id: "collab_review",
    label: "Collab review",
    description: "Desk commentary and shared annotations.",
    panels: ["researchdesk", "collab", "knowledgegraph"],
  },
  {
    id: "memory_linked",
    label: "Memory linked",
    description: "Replay, analogs, and archived events tied to notes.",
    panels: ["researchdesk", "memorydesk", "chart"],
  },
];
