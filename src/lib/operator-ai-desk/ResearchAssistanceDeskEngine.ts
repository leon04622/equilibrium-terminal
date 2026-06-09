import { AiResearchAssistanceEngine } from "@/lib/research-desk/AiResearchAssistanceEngine";
import { ResearchSearchEngine } from "@/lib/research-desk/ResearchSearchEngine";
import type { ResearchAssistRow } from "@/types/operator-ai";

export class ResearchAssistanceDeskEngine {
  static assist(asset: string): ResearchAssistRow[] {
    const brief = AiResearchAssistanceEngine.brief(asset);
    const hits = ResearchSearchEngine.search(asset, asset).slice(0, 4);

    const rows: ResearchAssistRow[] = [
      { id: "res-brief", label: "Desk brief", detail: brief },
    ];

    for (const h of hits) {
      rows.push({
        id: h.id,
        label: h.category,
        detail: `${h.title} — ${h.snippet.slice(0, 60)}`,
      });
    }

    return rows;
  }
}
