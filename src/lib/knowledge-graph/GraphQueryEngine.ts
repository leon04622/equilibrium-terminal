import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import type {
  GraphEntity,
  GraphLink,
  GraphQueryMatch,
  MarketGraphQueryResult,
} from "@/types/market-knowledge-graph";

const queryCache = new Map<string, MarketGraphQueryResult>();
const CACHE_MAX = 64;

interface QueryPattern {
  test: (q: string) => boolean;
  run: (q: string) => GraphEntity[];
  interpretation: string;
}

const PATTERNS: QueryPattern[] = [
  {
    test: (q) => q.includes("ai sector") || q.includes("ai accumulation"),
    run: () => {
      const sector = marketKnowledgeGraph.findByKind("sector").filter((e) =>
        e.id.includes("ai-sector"),
      );
      const assets = marketKnowledgeGraph
        .getAllEntities()
        .filter((e) => e.sector === "ai-sector" || e.metadata.agent === "whale");
      return [...sector, ...assets].slice(0, 20);
    },
    interpretation: "AI sector entities and linked accumulation signals",
  },
  {
    test: (q) => q.includes("negative funding") || q.includes("funding"),
    run: () => [
      ...marketKnowledgeGraph.findByKind("funding_regime"),
      ...marketKnowledgeGraph.searchText("funding", 12),
    ],
    interpretation: "Funding regime nodes and related market links",
  },
  {
    test: (q) => q.includes("stablecoin") || q.includes("inflow"),
    run: () => marketKnowledgeGraph.searchText("flow stable", 16),
    interpretation: "Flow-related entities (extend with on-chain feed in 18b)",
  },
  {
    test: (q) => q.includes("whale"),
    run: () => marketKnowledgeGraph.findByKind("wallet"),
    interpretation: "Whale / large participant wallet nodes",
  },
  {
    test: (q) => q.includes("narrative"),
    run: () => marketKnowledgeGraph.findByKind("narrative").slice(0, 24),
    interpretation: "Active narrative clusters",
  },
  {
    test: (q) => q.includes("liquid") || q.includes("liq"),
    run: () => marketKnowledgeGraph.findByKind("liquidity_zone").slice(0, 20),
    interpretation: "Liquidity zones and book-derived nodes",
  },
  {
    test: (q) => q.includes("macro"),
    run: () => marketKnowledgeGraph.findByKind("macro_event"),
    interpretation: "Macro event entities",
  },
  {
    test: (q) => q.includes("volatility") || q.includes("vol "),
    run: () => marketKnowledgeGraph.findByKind("volatility_regime"),
    interpretation: "Volatility / stress regime nodes",
  },
];

function buildSubgraph(entities: GraphEntity[]): {
  entities: GraphEntity[];
  links: GraphLink[];
} {
  const ids = new Set(entities.map((e) => e.id));
  const links: GraphLink[] = [];
  for (const e of entities) {
    const n = marketKnowledgeGraph.getNeighbors(e.id, 1);
    for (const l of n.links) {
      if (ids.has(l.from) && ids.has(l.to)) links.push(l);
      else if (ids.has(l.from) || ids.has(l.to)) {
        ids.add(l.from);
        ids.add(l.to);
        links.push(l);
        const addEnt = n.entities.find((x) => x.id === l.from || x.id === l.to);
        if (addEnt && !entities.find((x) => x.id === addEnt.id)) entities.push(addEnt);
      }
    }
  }
  return {
    entities: entities.slice(0, 32),
    links: links.slice(0, 64),
  };
}

export class GraphQueryEngine {
  static query(prompt: string): MarketGraphQueryResult {
    const key = prompt.trim().toLowerCase();
    const cached = queryCache.get(key);
    if (cached) return { ...cached, cached: true };

    const t0 = performance.now();
    let matches: GraphQueryMatch[] = [];
    let interpretation = "Text search across unified market graph";

    const coinMatch = key.match(/\b([a-z]{2,10})\b/i);
    if (coinMatch && key.length < 12) {
      const coin = coinMatch[1].toUpperCase();
      const byCoin = marketKnowledgeGraph.findByCoin(coin);
      if (byCoin.length > 0) {
        matches = byCoin.map((entity) => ({
          entity,
          score: 100,
          path: [entity.id],
        }));
        interpretation = `${coin} entity neighborhood`;
      }
    }

    if (!matches.length) {
      for (const pattern of PATTERNS) {
        if (!pattern.test(key)) continue;
        const entities = pattern.run(key);
        matches = entities.map((entity, i) => ({
          entity,
          score: 90 - i,
          path: [entity.id],
        }));
        interpretation = pattern.interpretation;
        break;
      }
    }

    if (!matches.length) {
      const found = marketKnowledgeGraph.searchText(key, 20);
      matches = found.map((entity, i) => ({
        entity,
        score: 70 - i,
        path: [entity.id],
      }));
    }

    const subgraph = buildSubgraph(matches.map((m) => m.entity));

    const result: MarketGraphQueryResult = {
      queryId: `mgq-${Date.now()}`,
      query: prompt,
      matches,
      subgraph,
      interpretation,
      elapsedMs: performance.now() - t0,
      cached: false,
    };

    if (queryCache.size >= CACHE_MAX) {
      const first = queryCache.keys().next().value;
      if (first) queryCache.delete(first);
    }
    queryCache.set(key, result);
    return result;
  }

  static clearCache(): void {
    queryCache.clear();
  }
}
