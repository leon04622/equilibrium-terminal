import { marketKnowledgeGraph } from "@/lib/knowledge-graph/MarketKnowledgeGraph";
import { useAgentOperationsStore } from "@/store/useAgentOperationsStore";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { GraphEntity, GraphLink } from "@/types/market-knowledge-graph";

function ent(
  partial: Omit<GraphEntity, "timestamp"> & { timestamp?: number },
): GraphEntity {
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

const SECTOR_MAP: Record<string, string> = {
  BTC: "store-of-value",
  ETH: "smart-contract",
  SOL: "l1-alt",
  HYPE: "defi-perp",
  ARB: "l2",
  OP: "l2",
  AI: "ai-sector",
  FET: "ai-sector",
  RNDR: "ai-sector",
};

/** Incremental ingest from live terminal stores into the market knowledge graph. */
export class GraphIngestPipeline {
  static run(): number {
    const g = marketKnowledgeGraph;
    const terminal = useTerminalStore.getState();
    const atmosphere = useMarketAtmosphereStore.getState();
    const execution = useExecutionIntelligenceStore.getState();
    const agentic = useAgentOperationsStore.getState();
    const now = Date.now();

    const regimeId = `regime:${atmosphere.regime.regime}`;
    g.upsertEntity(
      ent({
        id: regimeId,
        kind: "volatility_regime",
        label: atmosphere.regime.regime.toUpperCase(),
        coin: null,
        sector: null,
        snippet: `Stress ${atmosphere.stress.score} · velocity ${atmosphere.stress.velocityRatio.toFixed(2)}x`,
        metadata: {
          stress: atmosphere.stress.score,
          velocity: atmosphere.stress.velocityRatio,
          narrativeAccel: atmosphere.regime.narrativeAcceleration,
        },
      }),
    );

    const fundingRegimeId = "funding:market-wide";
    g.upsertEntity(
      ent({
        id: fundingRegimeId,
        kind: "funding_regime",
        label: "PERP FUNDING COMPOSITE",
        coin: null,
        sector: null,
        snippet: "Synthetic funding pressure from execution + regime context",
        metadata: { riskTier: execution.slippage.riskTier },
      }),
    );

    const exchangeId = "exchange:hyperliquid";
    g.upsertEntity(
      ent({
        id: exchangeId,
        kind: "exchange",
        label: "HYPERLIQUID",
        coin: null,
        sector: null,
        snippet: "Primary execution venue",
        metadata: {},
      }),
    );

    for (const asset of terminal.assets) {
      const aid = `asset:${asset.coin}`;
      const sector = SECTOR_MAP[asset.coin] ?? "alt";
      g.upsertEntity(
        ent({
          id: aid,
          kind: "asset",
          label: asset.symbol,
          coin: asset.coin,
          sector,
          snippet: `${asset.market} · ${asset.label}`,
          metadata: { market: asset.market },
        }),
      );
      g.upsertLink(link(aid, exchangeId, "concentrated_in", "Listed on Hyperliquid"));
      g.upsertLink(link(aid, regimeId, "exhibits", `Regime ${atmosphere.regime.regime}`));

      const mid = terminal.mids.mids[asset.coin];
      if (mid) {
        g.upsertEntity(
          ent({
            id: `liq:${asset.coin}`,
            kind: "liquidity_zone",
            label: `${asset.symbol} TOUCH`,
            coin: asset.coin,
            sector,
            snippet: `Mid ${mid}`,
            metadata: { mid },
          }),
        );
        g.upsertLink(link(`liq:${asset.coin}`, aid, "affects", "Price discovery zone"));
      }
    }

    const activeCoin = terminal.selectedCoin ?? "BTC";
    if (terminal.book && terminal.book.coin === activeCoin) {
      g.upsertEntity(
        ent({
          id: `liq:active:${activeCoin}`,
          kind: "liquidity_zone",
          label: `${activeCoin} BOOK`,
          coin: activeCoin,
          sector: SECTOR_MAP[activeCoin] ?? "alt",
          snippet: `Spread ${terminal.book.spreadBps?.toFixed(1) ?? "—"}bps`,
          metadata: {
            spreadBps: terminal.book.spreadBps ?? 0,
            imbalance: execution.imbalance.skew,
          },
        }),
      );
      g.upsertLink(
        link(`liq:active:${activeCoin}`, `asset:${activeCoin}`, "affects", "Live L2 book"),
      );
    }

    for (const item of terminal.intelligence) {
      const eid = `intel:${item.id}`;
      g.upsertEntity(
        ent({
          id: eid,
          kind: "intelligence",
          label: item.title.slice(0, 64),
          coin: item.coin,
          sector: SECTOR_MAP[item.coin] ?? null,
          snippet: item.detail,
          timestamp: item.timestamp,
          metadata: { severity: item.severity, channel: item.channel },
        }),
      );
      g.upsertLink(link(eid, `asset:${item.coin}`, "affects", item.title));
    }

    for (const wire of atmosphere.wire) {
      const wid = `event:wire:${wire.id}`;
      const narrId = `narrative:${wire.channel}:${wire.coin}`;
      g.upsertEntity(
        ent({
          id: wid,
          kind: "event",
          label: wire.headline.slice(0, 72),
          coin: wire.coin,
          sector: SECTOR_MAP[wire.coin] ?? null,
          snippet: `${wire.channel} · ${wire.direction}`,
          timestamp: wire.timestamp,
          metadata: {
            severity: wire.severity,
            confidence: wire.confidenceIndex,
          },
        }),
      );
      g.upsertEntity(
        ent({
          id: narrId,
          kind: "narrative",
          label: `${wire.channel.toUpperCase()} · ${wire.coin}`,
          coin: wire.coin,
          sector: SECTOR_MAP[wire.coin] ?? null,
          snippet: wire.headline,
          timestamp: wire.timestamp,
          metadata: { acceleration: wire.acceleration },
        }),
      );
      g.upsertLink(link(wid, `asset:${wire.coin}`, "impacts", wire.headline));
      g.upsertLink(link(wid, narrId, "belongs_to", wire.channel));
      g.upsertLink(link(narrId, regimeId, "linked_macro", "Regime context"));
    }

    for (const macro of atmosphere.macro) {
      const mid = `macro:${macro.symbol}`;
      g.upsertEntity(
        ent({
          id: mid,
          kind: "macro_event",
          label: macro.label,
          coin: null,
          sector: null,
          snippet: `${macro.changePct >= 0 ? "+" : ""}${macro.changePct.toFixed(2)}%`,
          timestamp: macro.updatedAt,
          metadata: { symbol: macro.symbol, last: macro.last },
        }),
      );
      g.upsertLink(link(mid, regimeId, "impacts", "Macro cross-asset pressure"));
    }

    for (const sig of agentic.signals.slice(0, 60)) {
      const sid = `signal:${sig.id}`;
      g.upsertEntity(
        ent({
          id: sid,
          kind: "signal",
          label: `${sig.agentId} · ${sig.stance}`,
          coin: sig.coin,
          sector: SECTOR_MAP[sig.coin] ?? null,
          snippet: sig.thesis,
          timestamp: sig.timestamp,
          metadata: { confidence: sig.confidence, agent: sig.agentId },
        }),
      );
      g.upsertLink(link(sid, `asset:${sig.coin}`, "targets", sig.thesis));
      if (sig.agentId === "whale") {
        const wid = `wallet:whale:${sig.coin}`;
        g.upsertEntity(
          ent({
            id: wid,
            kind: "wallet",
            label: `WHALE FLOW · ${sig.coin}`,
            coin: sig.coin,
            sector: null,
            snippet: sig.thesis,
            timestamp: sig.timestamp,
            metadata: {},
          }),
        );
        g.upsertLink(link(wid, `asset:${sig.coin}`, "flows_to", "Whale tape activity"));
      }
    }

    const sectorNodes = new Set<string>();
    for (const [coin, sector] of Object.entries(SECTOR_MAP)) {
      const secId = `sector:${sector}`;
      if (!sectorNodes.has(secId)) {
        sectorNodes.add(secId);
        g.upsertEntity(
          ent({
            id: secId,
            kind: "sector",
            label: sector.toUpperCase().replace(/-/g, " "),
            coin: null,
            sector,
            snippet: "Sector cluster",
            metadata: {},
          }),
        );
      }
      if (terminal.assets.find((a) => a.coin === coin)) {
        g.upsertLink(link(`asset:${coin}`, secId, "belongs_to", sector));
      }
    }

  if (execution.liquidityVoids.length > 0) {
      for (const v of execution.liquidityVoids.slice(0, 8)) {
        const vid = `liq:void:${execution.coin}:${v.priceTick}`;
        g.upsertEntity(
          ent({
            id: vid,
            kind: "liquidity_zone",
            label: `VOID ${v.side}`,
            coin: execution.coin,
            sector: SECTOR_MAP[execution.coin] ?? null,
            snippet: `Score ${v.voidScore.toFixed(2)}`,
            metadata: { voidScore: v.voidScore },
          }),
        );
        g.upsertLink(link(vid, `asset:${execution.coin}`, "affects", "Liquidity void"));
      }
    }

    g.upsertEntity(
      ent({
        id: `summary:${activeCoin}`,
        kind: "summary",
        label: `${activeCoin} CONTEXT`,
        coin: activeCoin,
        sector: SECTOR_MAP[activeCoin] ?? null,
        snippet: "AI-organized market context (human review required)",
        metadata: { execConfidence: execution.executionConfidence },
      }),
    );
    g.upsertLink(
      link(`summary:${activeCoin}`, `asset:${activeCoin}`, "related_to", "Contextual summary node"),
    );

    return g.getVersion();
  }
}
