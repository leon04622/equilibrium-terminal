import { EventCascadeEngine } from "@/lib/systemic-intelligence/EventCascadeEngine";
import { NarrativePropagationEngine } from "@/lib/systemic-intelligence/NarrativePropagationEngine";
import type { PropagationRow } from "@/types/global-intelligence";

export class EventPropagationDeskEngine {
  static chains(asset: string): PropagationRow[] {
    const cascade = EventCascadeEngine.analyze(asset).map((s) => ({
      id: s.id,
      trigger: s.trigger,
      propagation: s.propagation,
      severity: s.severity,
    }));

    const narrative = NarrativePropagationEngine.analyze(asset);
    const fromNarrative = narrative.activeNarratives.slice(0, 4).map((n) => ({
      id: `narr-${n.id}`,
      trigger: n.label.slice(0, 40),
      propagation: `Sector spread: ${narrative.sectorSpread.join(", ") || "desk watch"}`,
      severity: narrative.emergenceScore >= 70 ? "critical" : "watch",
    }));

    return [...cascade, ...fromNarrative];
  }
}
