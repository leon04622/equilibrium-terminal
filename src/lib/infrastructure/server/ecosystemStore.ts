const cache = {
  ecosystemScore: 0,
  operatingReadiness: 0,
  layerCount: 0,
  updatedAt: 0,
};

export function syncEcosystemState(payload: {
  ecosystemScore: number;
  operatingReadiness: number;
  layerCount: number;
}): void {
  cache.ecosystemScore = payload.ecosystemScore;
  cache.operatingReadiness = payload.operatingReadiness;
  cache.layerCount = payload.layerCount;
  cache.updatedAt = Date.now();
}

export function getEcosystemVitals(): {
  ecosystemScore: number;
  operatingReadiness: number;
  layerCount: number;
  updatedAt: number;
  syncReady: boolean;
} {
  return {
    ecosystemScore: cache.ecosystemScore,
    operatingReadiness: cache.operatingReadiness,
    layerCount: cache.layerCount,
    updatedAt: cache.updatedAt || Date.now(),
    syncReady: true,
  };
}
