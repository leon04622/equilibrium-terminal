/** Alert engine schemas — shared by store, lib/alerts, and widgets (no React). */

export type MarketEventType =
  | "HL_FUNDING_FLIP"
  | "HL_OPEN_INTEREST_SPIKE"
  | "ON_CHAIN_WHALE_TRANSFER"
  | "LIQUIDATION_CLUSTER_HIT";

export interface MarketEvent {
  id: string;
  type: MarketEventType;
  coin: string;
  timestamp: number;
  metrics: Record<string, number>;
  meta?: Record<string, string>;
}

export type ComparisonOp =
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "eq"
  | "pct_change_gt"
  | "flip_negative"
  | "flip_positive";

export interface AlertCondition {
  field: string;
  op: ComparisonOp;
  value: number;
}

export interface AlertRule {
  id: string;
  name: string;
  coins: string[];
  eventTypes: MarketEventType[];
  logic: "AND" | "OR";
  conditions: AlertCondition[];
  enabled: boolean;
  cooldownMs: number;
}

export type AlertSeverity = "info" | "watch" | "critical";

export interface TriggeredAlert {
  id: string;
  ruleId: string;
  event: MarketEvent;
  coin: string;
  title: string;
  summary: string;
  severity: AlertSeverity;
  timestamp: number;
  isNew: boolean;
  aiExplanation: string | null;
  aiPending: boolean;
}
