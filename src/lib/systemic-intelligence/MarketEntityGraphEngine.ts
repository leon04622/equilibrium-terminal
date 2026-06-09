import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import type { GraphEntity, GraphLink } from "@/types/market-knowledge-graph";

function ent(partial: Omit<GraphEntity, "timestamp"> & { timestamp?: number }): GraphEntity {
  return {
    ...partial,
    timestamp: partial.timestamp ?? Date.now(),
    metadata: partial.metadata ?? {},
  };
}

function link(
  from: string,
  to: string,
  relation: GraphLink["relation"],
  evidence: string,
  weight = 1,
): GraphLink {
  return {
    id: `link-${from}-${relation}-${to}-${Date.now() % 100000}`,
    from,
    to,
    relation,
    weight,
    timestamp: Date.now(),
    evidence,
  };
}

/** Phase 1 — Seed institutional entity nodes and cross-ecosystem links. */
export class MarketEntityGraphEngine {
  static run(asset: string): number {
    const g = marketKnowledgeGraph;
    const upper = asset.toUpperCase();

    const venues: Array<{ id: string; label: string; kind: GraphEntity["kind"] }> = [
      { id: "exchange:hyperliquid", label: "HYPERLIQUID", kind: "exchange" },
      { id: "exchange:binance", label: "BINANCE", kind: "exchange" },
      { id: "exchange:deribit", label: "DERIBIT", kind: "derivatives_venue" },
      { id: "exchange:okx", label: "OKX", kind: "derivatives_venue" },
      { id: "venue:cme-btc", label: "CME BTC FUTURES", kind: "derivatives_venue" },
    ];

    for (const v of venues) {
      g.upsertEntity(
        ent({
          id: v.id,
          kind: v.kind,
          label: v.label,
          coin: null,
          sector: null,
          snippet: "Institutional venue node",
          metadata: {},
        }),
      );
    }

    for (const stable of ["USDT", "USDC", "DAI"]) {
      const sid = `stablecoin:${stable}`;
      g.upsertEntity(
        ent({
          id: sid,
          kind: "stablecoin",
          label: stable,
          coin: stable,
          sector: "stablecoin",
          snippet: "Settlement & treasury rail",
          metadata: { systemic: true },
        }),
      );
      g.upsertLink(link(sid, "exchange:binance", "flows_to", "CEX liquidity"));
      g.upsertLink(link(sid, `asset:${upper}`, "correlates_with", "Collateral linkage"));
    }

    for (const proto of ["ethereum", "hyperliquid-l1", "arbitrum"]) {
      const pid = `protocol:${proto}`;
      g.upsertEntity(
        ent({
          id: pid,
          kind: "protocol",
          label: proto.toUpperCase(),
          coin: null,
          sector: "infrastructure",
          snippet: "Protocol dependency",
          metadata: {},
        }),
      );
      g.upsertLink(link(`asset:ETH`, pid, "belongs_to", "L1 dependency", 0.8));
    }

    g.upsertEntity(
      ent({
        id: "treasury:institutional",
        kind: "treasury",
        label: "INSTITUTIONAL TREASURY",
        coin: null,
        sector: null,
        snippet: "Operational capital pool",
        metadata: {},
      }),
    );
    g.upsertLink(link("treasury:institutional", `stablecoin:USDC`, "concentrated_in", "Treasury allocation"));

    g.upsertEntity(
      ent({
        id: "mm:composite",
        kind: "market_maker",
        label: "COMPOSITE MM LAYER",
        coin: null,
        sector: null,
        snippet: "Aggregated liquidity provision",
        metadata: {},
      }),
    );
    g.upsertLink(link("mm:composite", `asset:${upper}`, "affects", "Primary MM touch"));

    g.upsertEntity(
      ent({
        id: `pool:${upper}-hl`,
        kind: "liquidity_pool",
        label: `${upper} HL POOL`,
        coin: upper,
        sector: null,
        snippet: "Perp liquidity pool",
        metadata: {},
      }),
    );
    g.upsertLink(link(`pool:${upper}-hl`, "exchange:hyperliquid", "concentrated_in", "Venue pool"));

    return g.getVersion();
  }
}
