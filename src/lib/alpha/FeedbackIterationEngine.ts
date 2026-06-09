import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";
import { HardeningOrchestrator } from "@/lib/hardening/HardeningOrchestrator";
import type { FeedbackPainPoint } from "@/types/alpha-launch";

const STORAGE_KEY = "eq-alpha-feedback-v1";

interface StoredFeedback {
  points: FeedbackPainPoint[];
}

function readStored(): StoredFeedback {
  if (typeof window === "undefined") return { points: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { points: [] };
    return JSON.parse(raw) as StoredFeedback;
  } catch {
    return { points: [] };
  }
}

function writeStored(data: StoredFeedback): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export class FeedbackIterationEngine {
  static painPoints(): FeedbackPainPoint[] {
    const stored = readStored().points;
    const metrics = useTraderTelemetryStore.getState().metrics;
    const hardening = HardeningOrchestrator.snapshot();
    const derived: FeedbackPainPoint[] = [];

    if (metrics.cognitiveFrictionScore > 60) {
      derived.push({
        id: "friction-cognitive",
        category: "friction",
        summary: "Elevated cognitive friction during session",
        priority: "p1",
        occurrences: Math.round(metrics.cognitiveFrictionScore / 10),
      });
    }
    if (metrics.hesitationP95Ms > 800) {
      derived.push({
        id: "friction-hesitation",
        category: "friction",
        summary: "Execution hesitation lag above target",
        priority: "p0",
        occurrences: metrics.samplesHesitation,
      });
    }
    for (const b of hardening.blockers.slice(0, 2)) {
      derived.push({
        id: `infra-${b.slice(0, 12)}`,
        category: "infra",
        summary: b,
        priority: "p1",
        occurrences: 1,
      });
    }

    const merged = [...stored];
    for (const d of derived) {
      const existing = merged.find((p) => p.id === d.id);
      if (existing) existing.occurrences += 1;
      else merged.push(d);
    }
    return merged.slice(0, 12);
  }

  static logPainPoint(
    category: FeedbackPainPoint["category"],
    summary: string,
    priority: FeedbackPainPoint["priority"] = "p2",
  ): void {
    const stored = readStored();
    const id = `fb_${Date.now()}`;
    stored.points.unshift({ id, category, summary, priority, occurrences: 1 });
    stored.points = stored.points.slice(0, 24);
    writeStored(stored);
  }

  static iterationFocus(): string[] {
    const points = FeedbackIterationEngine.painPoints();
    const focus: string[] = [
      "Refine execution desk workflow — no new panels",
      "Improve stream reconnect UX",
      "Reduce OmniBar discovery friction",
    ];
    if (points.some((p) => p.priority === "p0")) {
      focus.unshift("Resolve P0 operational pain before cohort expansion");
    }
    return focus.slice(0, 5);
  }
}
