const cache: {
  integrationScore: number;
  liveVenues: number;
  apiEndpoints: number;
  updatedAt: number;
} = {
  integrationScore: 0,
  liveVenues: 0,
  apiEndpoints: 0,
  updatedAt: 0,
};

export function syncIntegrationsState(payload: {
  integrationScore: number;
  liveVenues: number;
  apiEndpoints: number;
}): void {
  cache.integrationScore = payload.integrationScore;
  cache.liveVenues = payload.liveVenues;
  cache.apiEndpoints = payload.apiEndpoints;
  cache.updatedAt = Date.now();
}

export function getIntegrationsVitals(): {
  integrationScore: number;
  liveVenues: number;
  apiEndpoints: number;
  updatedAt: number;
  syncReady: boolean;
} {
  return {
    integrationScore: cache.integrationScore,
    liveVenues: cache.liveVenues,
    apiEndpoints: cache.apiEndpoints,
    updatedAt: cache.updatedAt || Date.now(),
    syncReady: true,
  };
}

export function getEmbeddableFeed(type = "intelligence"): {
  feedId: string;
  type: string;
  generatedAt: number;
  events: Array<{ id: string; headline: string; timestamp: number }>;
} {
  return {
    feedId: "eq-embed-v1",
    type,
    generatedAt: Date.now(),
    events: [
      {
        id: `embed-${type}-01`,
        headline: `Equilibrium ${type} feed — institutional embed`,
        timestamp: Date.now(),
      },
    ],
  };
}
