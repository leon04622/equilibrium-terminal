import type { ProprietaryMetric } from "@/types/proprietary-intelligence";

const cache: {
  moatScore: number;
  differentiationScore: number;
  metrics: ProprietaryMetric[];
  updatedAt: number;
} = {
  moatScore: 0,
  differentiationScore: 0,
  metrics: [],
  updatedAt: 0,
};

export function syncProprietaryIntel(payload: {
  moatScore: number;
  differentiationScore: number;
  metrics: ProprietaryMetric[];
}): void {
  cache.moatScore = payload.moatScore;
  cache.differentiationScore = payload.differentiationScore;
  cache.metrics = payload.metrics;
  cache.updatedAt = Date.now();
}

export function getProprietaryVitals(): {
  moatScore: number;
  differentiationScore: number;
  metricCount: number;
  updatedAt: number;
  syncReady: boolean;
} {
  return {
    moatScore: cache.moatScore,
    differentiationScore: cache.differentiationScore,
    metricCount: cache.metrics.length,
    updatedAt: cache.updatedAt || Date.now(),
    syncReady: true,
  };
}

export function getProprietaryMetrics(): ProprietaryMetric[] {
  return cache.metrics;
}
