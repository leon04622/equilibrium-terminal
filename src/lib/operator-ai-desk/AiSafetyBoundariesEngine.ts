import type { SafetyBoundaryRow } from "@/types/operator-ai";

export class AiSafetyBoundariesEngine {
  static boundaries(): SafetyBoundaryRow[] {
    return [
      { id: "safe-01", rule: "No autonomous trade execution", enforced: true },
      { id: "safe-02", rule: "Human trader retains decision authority", enforced: true },
      { id: "safe-03", rule: "Uncertainty surfaced when confidence < 60%", enforced: true },
      { id: "safe-04", rule: "Sources cited from platform systems only", enforced: true },
      { id: "safe-05", rule: "No fabricated market data or fills", enforced: true },
      { id: "safe-06", rule: "User intent cannot be overridden by AI", enforced: true },
    ];
  }

  static disclaimer(): string {
    return "AI-assisted organization only — not investment advice. Verify all summaries against primary feeds.";
  }
}
