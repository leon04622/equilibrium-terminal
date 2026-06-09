import { SystemicRiskEngine } from "@/lib/systemic-intelligence/SystemicRiskEngine";
import { NarrativePropagationEngine } from "@/lib/systemic-intelligence/NarrativePropagationEngine";
import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import type { KnowledgeMemoryPoint } from "@/types/systemic-intelligence";

const STORAGE_KEY = "eq-systemic-memory-v1";
const MAX_POINTS = 120;

let memory: KnowledgeMemoryPoint[] = [];

function load(): KnowledgeMemoryPoint[] {
  if (memory.length) return memory;
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) memory = JSON.parse(raw) as KnowledgeMemoryPoint[];
  } catch {
    memory = [];
  }
  return memory;
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory.slice(-MAX_POINTS)));
  } catch {
    /* ignore */
  }
}

export class KnowledgeMemoryEngine {
  static record(asset: string): void {
    const risk = SystemicRiskEngine.metrics(asset);
    const narr = NarrativePropagationEngine.analyze(asset);
    const snap = marketKnowledgeGraph.snapshot();

    const point: KnowledgeMemoryPoint = {
      timestamp: Date.now(),
      regime: risk.riskTier,
      contagionRisk: risk.contagionRisk,
      narrativeAccel: narr.accelerationScore,
      entityCount: snap.entityCount,
    };

    const history = load();
    const last = history[history.length - 1];
    if (last && Date.now() - last.timestamp < 5_000) {
      history[history.length - 1] = point;
    } else {
      history.push(point);
    }
    memory = history.slice(-MAX_POINTS);
    persist();
  }

  static points(): KnowledgeMemoryPoint[] {
    return load().slice(-36);
  }
}
