import type { AiEmbedRow } from "@/types/unified-operations";

export class AiWorkflowEmbeddingDeskEngine {
  static workflows(): AiEmbedRow[] {
    return [
      { id: "ai-ctx", workflow: "Contextual retrieval", assist: "Operator AI · cross-system RAG" },
      { id: "ai-sum", workflow: "Operational summarization", assist: "Intel compress · daily brief" },
      { id: "ai-flow", workflow: "Workflow acceleration", assist: "Omni commands · panel focus" },
      { id: "ai-expl", workflow: "Intelligence explanation", assist: "Alert · wire · systemic context" },
      { id: "ai-res", workflow: "Research continuity", assist: "Thesis · journal · memory links" },
      { id: "ai-safe", workflow: "Trust boundary", assist: "No auto-execution · human authority" },
    ];
  }
}
