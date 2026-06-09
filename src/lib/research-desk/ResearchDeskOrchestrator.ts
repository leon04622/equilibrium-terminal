import { AiResearchAssistanceEngine } from "@/lib/research-desk/AiResearchAssistanceEngine";
import { AnnotationInfrastructureEngine } from "@/lib/research-desk/AnnotationInfrastructureEngine";
import { CollaborativeAnalystEngine } from "@/lib/research-desk/CollaborativeAnalystEngine";
import { MarketJournalEngine } from "@/lib/research-desk/MarketJournalEngine";
import { MarketMemoryIntegrationEngine } from "@/lib/research-desk/MarketMemoryIntegrationEngine";
import { RESEARCH_DESK_DASHBOARD_MODES } from "@/lib/research-desk/ResearchDeskDashboardModes";
import { ResearchDeskTelemetry } from "@/lib/research-desk/ResearchDeskTelemetry";
import { ResearchLinkingEngine } from "@/lib/research-desk/ResearchLinkingEngine";
import { ResearchSearchEngine } from "@/lib/research-desk/ResearchSearchEngine";
import { ResearchWorkspaceEngine } from "@/lib/research-desk/ResearchWorkspaceEngine";
import { ThesisTrackingEngine } from "@/lib/research-desk/ThesisTrackingEngine";
import type {
  ResearchDeskModeId,
  ResearchDeskSnapshot,
} from "@/types/research-operating";

const MODE_STORAGE = "eq-research-desk-mode-v1";

function readMode(): ResearchDeskModeId {
  if (typeof window === "undefined") return "analyst_workspace";
  try {
    const raw = localStorage.getItem(MODE_STORAGE);
    if (raw && RESEARCH_DESK_DASHBOARD_MODES.some((m) => m.id === raw)) {
      return raw as ResearchDeskModeId;
    }
  } catch {
    /* ignore */
  }
  return "analyst_workspace";
}

export class ResearchDeskOrchestrator {
  static snapshot(asset: string, searchQuery = ""): ResearchDeskSnapshot {
    ResearchDeskTelemetry.begin();

    const telemetry = ResearchDeskTelemetry.snapshot(asset);
    const researchScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          telemetry.continuityScore * 0.5 +
            telemetry.journalCount * 1.5 +
            telemetry.thesisCount * 4 +
            telemetry.annotationCount * 2,
        ),
      ),
    );

    return {
      asset,
      notebooks: ResearchWorkspaceEngine.notebooks(asset),
      collections: ResearchWorkspaceEngine.collections(asset),
      journal: MarketJournalEngine.entries(asset),
      annotations: AnnotationInfrastructureEngine.list(asset),
      theses: ThesisTrackingEngine.theses(asset),
      links: ResearchLinkingEngine.links(asset),
      commentary: CollaborativeAnalystEngine.commentary(asset),
      memoryContext: MarketMemoryIntegrationEngine.context(asset),
      searchHits: ResearchSearchEngine.search(asset, searchQuery),
      aiBrief: AiResearchAssistanceEngine.brief(asset),
      dashboardModes: RESEARCH_DESK_DASHBOARD_MODES,
      activeMode: readMode(),
      telemetry,
      researchScore,
      updatedAt: Date.now(),
    };
  }

  static setActiveMode(id: ResearchDeskModeId): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE, id);
    }
  }
}
