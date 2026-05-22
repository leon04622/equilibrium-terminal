import type {
  AlertCondition,
  AlertRule,
  AlertSeverity,
  MarketEvent,
  MarketEventType,
  TriggeredAlert,
} from "@/types/alerts";

const lastFired = new Map<string, number>();

function ruleKey(ruleId: string, coin: string): string {
  return `${ruleId}:${coin}`;
}

function canFire(rule: AlertRule, coin: string): boolean {
  const key = ruleKey(rule.id, coin);
  const prev = lastFired.get(key) ?? 0;
  if (Date.now() - prev < rule.cooldownMs) return false;
  lastFired.set(key, Date.now());
  return true;
}

function coinMatches(rule: AlertRule, coin: string): boolean {
  if (!rule.coins.length) return true;
  const u = coin.toUpperCase();
  return rule.coins.some(
    (c) => c.toUpperCase() === u || u.startsWith(c.toUpperCase()),
  );
}

function evalCondition(cond: AlertCondition, metrics: Record<string, number>): boolean {
  const v = metrics[cond.field];
  if (v === undefined) return false;
  switch (cond.op) {
    case "gt":
      return v > cond.value;
    case "gte":
      return v >= cond.value;
    case "lt":
      return v < cond.value;
    case "lte":
      return v <= cond.value;
    case "eq":
      return v === cond.value;
    case "pct_change_gt":
      return v > cond.value;
    case "flip_negative":
      return (metrics.fundingRatePrev ?? 0) >= 0 && v < 0;
    case "flip_positive":
      return (metrics.fundingRatePrev ?? 0) <= 0 && v > 0;
    default:
      return false;
  }
}

function evalRule(rule: AlertRule, event: MarketEvent): boolean {
  if (!rule.enabled) return false;
  if (!rule.eventTypes.includes(event.type)) return false;
  if (!coinMatches(rule, event.coin)) return false;

  if (!rule.conditions.length) return true;

  if (rule.logic === "AND") {
    return rule.conditions.every((c) => evalCondition(c, event.metrics));
  }
  return rule.conditions.some((c) => evalCondition(c, event.metrics));
}

function severityFor(type: MarketEventType): AlertSeverity {
  switch (type) {
    case "LIQUIDATION_CLUSTER_HIT":
      return "critical";
    case "ON_CHAIN_WHALE_TRANSFER":
    case "HL_OPEN_INTEREST_SPIKE":
      return "watch";
    case "HL_FUNDING_FLIP":
    default:
      return "info";
  }
}

function titleFor(event: MarketEvent): string {
  switch (event.type) {
    case "HL_FUNDING_FLIP":
      return `Funding flip · ${event.coin}`;
    case "HL_OPEN_INTEREST_SPIKE":
      return `OI spike +${event.metrics.oiChangePct?.toFixed(1) ?? "?"}% · ${event.coin}`;
    case "ON_CHAIN_WHALE_TRANSFER":
      return `Whale ${event.meta?.side ?? "flow"} · ${event.coin}`;
    case "LIQUIDATION_CLUSTER_HIT":
      return `Liq cluster · ${event.coin}`;
    default:
      return `Alert · ${event.coin}`;
  }
}

function summaryFor(event: MarketEvent): string {
  const m = event.metrics;
  switch (event.type) {
    case "HL_FUNDING_FLIP":
      return `Funding ${m.fundingRatePrev?.toFixed(4)} → ${m.fundingRate?.toFixed(4)}`;
    case "HL_OPEN_INTEREST_SPIKE":
      return `OI proxy +${m.oiChangePct?.toFixed(1)}% (${m.oiProxy?.toFixed(0) ?? "?"} units)`;
    case "ON_CHAIN_WHALE_TRANSFER":
      return `$${Math.round(m.notionalUsd ?? 0).toLocaleString()} @ ${m.px?.toFixed(2) ?? "—"}`;
    case "LIQUIDATION_CLUSTER_HIT":
      return `${m.clusterCount ?? 0} prints / $${Math.round(m.clusterNotionalUsd ?? 0).toLocaleString()}`;
    default:
      return event.type;
  }
}

export type TriggerDispatch = Omit<
  TriggeredAlert,
  "isNew" | "aiExplanation" | "aiPending"
>;

export function evaluateMarketEvent(
  event: MarketEvent,
  rules: AlertRule[],
): TriggerDispatch[] {
  const out: TriggerDispatch[] = [];
  for (const rule of rules) {
    if (!evalRule(rule, event)) continue;
    if (!canFire(rule, event.coin)) continue;
    out.push({
      id: `trg-${event.id}-${rule.id}`,
      ruleId: rule.id,
      event,
      coin: event.coin,
      title: titleFor(event),
      summary: summaryFor(event),
      severity: severityFor(event.type),
      timestamp: event.timestamp,
    });
  }
  return out;
}
