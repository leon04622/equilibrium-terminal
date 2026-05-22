import type { MarketEvent } from "@/types/alerts";
import type { AgentKind, AgentSignal, WatchlistTier } from "@/types/agentic";
import type { NormalizedOrderBook, NormalizedTrade } from "@/types/terminal-schema";

export interface AgentContext {
  coin: string;
  tier: WatchlistTier;
  book: NormalizedOrderBook | null;
  latestTrade: NormalizedTrade | null;
  recentEvents: MarketEvent[];
  mid: number | null;
}

function id(agent: AgentKind, coin: string): string {
  return `${agent}-${coin}-${Date.now()}`;
}

function signal(
  agentId: AgentKind,
  ctx: AgentContext,
  stance: AgentSignal["stance"],
  confidence: number,
  thesis: string,
  evidence: AgentSignal["supportingEvidence"],
  provenanceKeys: string[],
): AgentSignal {
  return {
    id: id(agentId, ctx.coin),
    agentId,
    coin: ctx.coin.toUpperCase(),
    timestamp: Date.now(),
    stance,
    confidence: Math.min(0.98, Math.max(0.05, confidence)),
    thesis,
    supportingEvidence: evidence,
    provenanceKeys,
    computeTier: ctx.tier,
  };
}

export function runStructureAgent(ctx: AgentContext): AgentSignal | null {
  if (!ctx.book?.mid || !ctx.book.spreadBps) return null;
  const tight = ctx.book.spreadBps < 8;
  const bidHeavy = ctx.book.maxBidSize > ctx.book.maxAskSize * 1.15;
  const stance = bidHeavy ? "bullish" : ctx.book.maxAskSize > ctx.book.maxBidSize * 1.15 ? "bearish" : "neutral";
  const confidence = tight ? 0.72 : 0.55;
  return signal(
    "structure",
    ctx,
    stance,
    confidence,
    `Book structure ${stance} — spread ${ctx.book.spreadBps.toFixed(1)}bps, depth skew ${bidHeavy ? "bid" : "ask"}.`,
    [
      { key: "spread_bps", value: ctx.book.spreadBps.toFixed(2), provenance: "hl.l2Book" },
      { key: "max_bid_sz", value: String(ctx.book.maxBidSize), provenance: "hl.l2Book" },
      { key: "max_ask_sz", value: String(ctx.book.maxAskSize), provenance: "hl.l2Book" },
    ],
    ["hl.l2Book", "eq.structure.v1"],
  );
}

export function runWhaleAgent(ctx: AgentContext): AgentSignal | null {
  const t = ctx.latestTrade;
  if (!t || t.notionalUsd < 50_000) return null;
  const stance = t.side === "buy" ? "bullish" : "bearish";
  const confidence = Math.min(0.92, 0.55 + Math.log10(t.notionalUsd) / 12);
  return signal(
    "whale",
    ctx,
    stance,
    confidence,
    `Whale ${t.side} $${Math.round(t.notionalUsd).toLocaleString()} on tape.`,
    [
      { key: "notional_usd", value: String(Math.round(t.notionalUsd)), provenance: "hl.trades" },
      { key: "px", value: String(t.price), provenance: "hl.trades" },
      { key: "side", value: t.side, provenance: "hl.trades" },
    ],
    ["hl.trades", "eq.whale.v1"],
  );
}

export function runLiquidationAgent(ctx: AgentContext): AgentSignal | null {
  const liq = ctx.recentEvents.find((e) => e.type === "LIQUIDATION_CLUSTER_HIT");
  if (!liq) return null;
  const count = liq.metrics.clusterCount ?? 0;
  const notional = liq.metrics.clusterNotionalUsd ?? 0;
  return signal(
    "liquidation",
    ctx,
    "bearish",
    Math.min(0.9, 0.5 + count * 0.08),
    `Liquidation cluster ${count} prints ~$${Math.round(notional).toLocaleString()}.`,
    [
      { key: "cluster_count", value: String(count), provenance: "eq.alert.engine" },
      { key: "cluster_notional", value: String(Math.round(notional)), provenance: "eq.alert.engine" },
    ],
    ["eq.alert.engine", "hl.trades"],
  );
}

export function runFundingAgent(ctx: AgentContext): AgentSignal | null {
  const flip = ctx.recentEvents.find((e) => e.type === "HL_FUNDING_FLIP");
  const oi = ctx.recentEvents.find((e) => e.type === "HL_OPEN_INTEREST_SPIKE");
  if (!flip && !oi) return null;
  const rate = flip?.metrics.fundingRate ?? 0;
  const stance: AgentSignal["stance"] =
    rate < 0 ? "bearish" : oi ? "bullish" : "neutral";
  const confidence = flip ? 0.78 : 0.68;
  return signal(
    "funding",
    ctx,
    stance,
    confidence,
    flip
      ? `Funding flip → ${(rate * 100).toFixed(3)}% 8h equiv.`
      : `OI proxy spike +${oi?.metrics.oiChangePct?.toFixed(1) ?? "?"}%.`,
    [
      ...(flip
        ? [
            {
              key: "funding_rate",
              value: String(rate),
              provenance: "eq.metrics.funding",
            },
          ]
        : []),
      ...(oi
        ? [
            {
              key: "oi_change_pct",
              value: String(oi.metrics.oiChangePct ?? 0),
              provenance: "eq.metrics.oi",
            },
          ]
        : []),
    ],
    ["eq.metrics.funding", "eq.metrics.oi"],
  );
}

export function runNarrativeAgent(ctx: AgentContext): AgentSignal | null {
  const whale = ctx.latestTrade && ctx.latestTrade.notionalUsd >= 75_000;
  const liq = ctx.recentEvents.some((e) => e.type === "LIQUIDATION_CLUSTER_HIT");
  if (!whale && !liq) return null;
  const retailBreakout = whale && ctx.latestTrade?.side === "buy" && !liq;
  const distribution = whale && ctx.latestTrade?.side === "sell";
  const stance: AgentSignal["stance"] = distribution
    ? "bearish"
    : retailBreakout
      ? "bullish"
      : "neutral";
  const confidence = distribution || retailBreakout ? 0.62 : 0.48;
  return signal(
    "narrative",
    ctx,
    stance,
    confidence,
    distribution
      ? "Narrative: distribution tone — large sell vs retail breakout risk."
      : retailBreakout
        ? "Narrative: retail breakout tone — aggressive buy flow."
        : "Narrative: mixed flow — no dominant social vector.",
    [
      {
        key: "flow_tone",
        value: distribution ? "distribution" : retailBreakout ? "breakout" : "mixed",
        provenance: "eq.narrative.heuristic",
      },
    ],
    ["eq.narrative.v1", "hl.trades"],
  );
}

const RUNNERS: Record<
  AgentKind,
  (ctx: AgentContext) => AgentSignal | null
> = {
  structure: runStructureAgent,
  whale: runWhaleAgent,
  liquidation: runLiquidationAgent,
  funding: runFundingAgent,
  narrative: runNarrativeAgent,
};

export function runMicroAgent(
  agentId: AgentKind,
  ctx: AgentContext,
): AgentSignal | null {
  return RUNNERS[agentId](ctx);
}

export const ALL_AGENT_KINDS: AgentKind[] = [
  "structure",
  "whale",
  "liquidation",
  "funding",
  "narrative",
];
