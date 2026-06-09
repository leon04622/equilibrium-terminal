import { OperationalExplainEngine } from "@/lib/operator-guide/OperationalExplainEngine";
import type { ComponentGuideEntry, ContextualExplanation, ExplainAudience } from "@/types/operator-guide";

/** Bridges legacy snapshot field to operational education. */
export class AiContextualExplainEngine {
  static explain(entry: ComponentGuideEntry, audience: ExplainAudience): ContextualExplanation {
    const op = OperationalExplainEngine.explain(entry, audience);
    return {
      whatThisIs: op.panelRole,
      whyThisMattersNow: op.whatChangesMatter,
      professionalUsageNow: op.proDoesNext.detail,
      liveReadingMeaning: op.liveReading,
      beginnerExplanation: op.workflowSteps.join(" → "),
      advancedExplanation: `${op.confirms} Invalidated if: ${op.invalidates}`,
      bullishInterpretation: op.bullish,
      bearishInterpretation: op.bearish,
      liveMarketContext: op.liveReading,
      commonMistakes: op.beginnerMistakes,
      panelConnections: op.connectedPanels,
      howToUseInTrade: op.workflowSteps.join(" · "),
    };
  }
}
