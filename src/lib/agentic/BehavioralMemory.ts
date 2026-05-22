import type { LocalBehaviorMemory, TraderBehaviorProfile } from "@/types/agentic";

const STORAGE_KEY = "eq-terminal-behavior-v1";

const DEFAULT_MEMORY: LocalBehaviorMemory = {
  version: 1,
  profiles: {},
  globalRiskBias: "balanced",
  updatedAt: Date.now(),
};

function clampRelevance(w: number): number {
  return Math.max(0.35, Math.min(1.25, w));
}

export class BehavioralMemory {
  private cache: LocalBehaviorMemory = DEFAULT_MEMORY;

  load(): LocalBehaviorMemory {
    if (typeof window === "undefined") return this.cache;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.cache;
      const parsed = JSON.parse(raw) as LocalBehaviorMemory;
      if (parsed.version === 1) {
        this.cache = parsed;
      }
    } catch {
      this.cache = DEFAULT_MEMORY;
    }
    return this.cache;
  }

  persist(): void {
    if (typeof window === "undefined") return;
    this.cache.updatedAt = Date.now();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
  }

  getProfile(coin: string): TraderBehaviorProfile {
    const upper = coin.toUpperCase();
    const existing = this.cache.profiles[upper];
    if (existing) return existing;
    return {
      coin: upper,
      selectCount: 0,
      lastSelectedAt: 0,
      typicalHoldMinutes: 45,
      riskBias: this.cache.globalRiskBias,
      relevanceWeight: 0.65,
    };
  }

  recordAssetSelect(coin: string): void {
    const upper = coin.toUpperCase();
    const p = this.getProfile(upper);
    p.selectCount += 1;
    p.lastSelectedAt = Date.now();
    p.relevanceWeight = clampRelevance(0.55 + Math.log10(p.selectCount + 1) * 0.18);
    this.cache.profiles[upper] = p;
    this.persist();
  }

  recordHoldSession(coin: string, minutesHeld: number): void {
    const upper = coin.toUpperCase();
    const p = this.getProfile(upper);
    p.typicalHoldMinutes = Math.round(p.typicalHoldMinutes * 0.7 + minutesHeld * 0.3);
    this.cache.profiles[upper] = p;
    this.persist();
  }

  relevanceForCoin(coin: string, isActive: boolean, inWatchlist: boolean): number {
    const p = this.getProfile(coin);
    let score = p.relevanceWeight;
    if (isActive) score *= 1.35;
    else if (inWatchlist) score *= 1.1;
    else score *= 0.72;
    const daysSince =
      p.lastSelectedAt > 0 ? (Date.now() - p.lastSelectedAt) / 86_400_000 : 30;
    if (daysSince < 1) score *= 1.15;
    else if (daysSince > 14) score *= 0.85;
    return clampRelevance(score);
  }

  setGlobalRiskBias(bias: LocalBehaviorMemory["globalRiskBias"]): void {
    this.cache.globalRiskBias = bias;
    this.persist();
  }
}

export const behavioralMemory = new BehavioralMemory();
