import type { CompetitivePositionRow } from "@/types/global-infrastructure";

export class CompetitivePositioningEngine {
  static positions(): CompetitivePositionRow[] {
    const rows: CompetitivePositionRow[] = [
      {
        id: "bloomberg_crypto",
        positioning: "Bloomberg for crypto — institutional command surface",
        strength: 94,
      },
      {
        id: "operating_infra",
        positioning: "Institutional crypto operating infrastructure",
        strength: 91,
      },
      {
        id: "intel_layer",
        positioning: "Operational intelligence layer across venues",
        strength: 88,
      },
      {
        id: "execution_aware",
        positioning: "Execution-aware market infrastructure",
        strength: 86,
      },
    ];
    return rows;
  }
}
