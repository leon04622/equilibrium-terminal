const cache = {
  infrastructureTrustScore: 0,
  globalReadinessScore: 0,
  moatCompositeScore: 0,
  updatedAt: 0,
};

export function syncGlobalStrategyState(payload: {
  infrastructureTrustScore: number;
  globalReadinessScore: number;
  moatCompositeScore: number;
}): void {
  cache.infrastructureTrustScore = payload.infrastructureTrustScore;
  cache.globalReadinessScore = payload.globalReadinessScore;
  cache.moatCompositeScore = payload.moatCompositeScore;
  cache.updatedAt = Date.now();
}

export function getGlobalStrategyVitals(): {
  infrastructureTrustScore: number;
  globalReadinessScore: number;
  moatCompositeScore: number;
  updatedAt: number;
  syncReady: boolean;
} {
  return {
    infrastructureTrustScore: cache.infrastructureTrustScore,
    globalReadinessScore: cache.globalReadinessScore,
    moatCompositeScore: cache.moatCompositeScore,
    updatedAt: cache.updatedAt || Date.now(),
    syncReady: true,
  };
}
