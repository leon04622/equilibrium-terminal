import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { evaluateMarketEvent } from "@/lib/alerts/Evaluator";
import { terminalBus } from "@/store/eventBus";
import type {
  AlertRule,
  AlertSeverity,
  MarketEvent,
  TriggeredAlert,
} from "@/types/alerts";

export type {
  AlertCondition,
  AlertRule,
  AlertSeverity,
  ComparisonOp,
  MarketEvent,
  MarketEventType,
  TriggeredAlert,
} from "@/types/alerts";
export type { OmniIntent } from "@/types/omnibar";

export interface AlertStoreState {
  rules: AlertRule[];
  triggers: TriggeredAlert[];
  triggersVersion: number;
  lastEventAt: number | null;

  addRule: (rule: AlertRule) => void;
  removeRule: (id: string) => void;
  toggleRule: (id: string, enabled: boolean) => void;
  dispatchTrigger: (alert: Omit<TriggeredAlert, "isNew" | "aiExplanation" | "aiPending">) => void;
  attachAiExplanation: (triggerId: string, text: string) => void;
  clearTriggerFlash: (id: string) => void;
  ingestMarketEvent: (event: MarketEvent) => void;
}

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: "rule-oi-spike",
    name: "OI surge +8%",
    coins: [],
    eventTypes: ["HL_OPEN_INTEREST_SPIKE"],
    logic: "AND",
    conditions: [{ field: "oiChangePct", op: "pct_change_gt", value: 8 }],
    enabled: true,
    cooldownMs: 120_000,
  },
  {
    id: "rule-funding-flip",
    name: "Funding flip negative",
    coins: [],
    eventTypes: ["HL_FUNDING_FLIP"],
    logic: "AND",
    conditions: [{ field: "fundingRate", op: "flip_negative", value: 0 }],
    enabled: true,
    cooldownMs: 300_000,
  },
  {
    id: "rule-whale",
    name: "Whale transfer",
    coins: [],
    eventTypes: ["ON_CHAIN_WHALE_TRANSFER"],
    logic: "OR",
    conditions: [{ field: "notionalUsd", op: "gte", value: 75_000 }],
    enabled: true,
    cooldownMs: 60_000,
  },
  {
    id: "rule-liq-cluster",
    name: "Liquidation cluster",
    coins: [],
    eventTypes: ["LIQUIDATION_CLUSTER_HIT"],
    logic: "AND",
    conditions: [
      { field: "clusterCount", op: "gte", value: 3 },
      { field: "clusterNotionalUsd", op: "gte", value: 250_000 },
    ],
    enabled: true,
    cooldownMs: 180_000,
  },
];

function explainAsync(triggerId: string, event: MarketEvent, title: string): void {
  window.setTimeout(() => {
    const text = buildAiExplanation(event, title);
    useAlertStore.getState().attachAiExplanation(triggerId, text);
  }, 0);
}

function buildAiExplanation(event: MarketEvent, title: string): string {
  const m = event.metrics;
  switch (event.type) {
    case "HL_FUNDING_FLIP":
      return `Funding crossed ${m.fundingRatePrev?.toFixed(4) ?? "?"} → ${m.fundingRate?.toFixed(4) ?? "?"} on ${event.coin}. Carry flipped; basis trades may widen.`;
    case "HL_OPEN_INTEREST_SPIKE":
      return `Open interest proxy +${m.oiChangePct?.toFixed(1) ?? "?"}% on ${event.coin} over the rolling window. New leverage likely entering the book.`;
    case "ON_CHAIN_WHALE_TRANSFER":
      return `Tape print ~$${Math.round(m.notionalUsd ?? 0).toLocaleString()} on ${event.coin}. Monitor book absorption at mid ${m.midPx?.toFixed(2) ?? "—"}.`;
    case "LIQUIDATION_CLUSTER_HIT":
      return `${m.clusterCount ?? 0} large aggressive prints (~$${Math.round(m.clusterNotionalUsd ?? 0).toLocaleString()}) on ${event.coin} in under 60s — liquidation cascade risk elevated.`;
    default:
      return `${title} on ${event.coin}.`;
  }
}

export const useAlertStore = create<AlertStoreState>()(
  subscribeWithSelector((set, get) => ({
    rules: DEFAULT_ALERT_RULES,
    triggers: [],
    triggersVersion: 0,
    lastEventAt: null,

    addRule: (rule) => set((s) => ({ rules: [...s.rules, rule] })),

    removeRule: (id) =>
      set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),

    toggleRule: (id, enabled) =>
      set((s) => ({
        rules: s.rules.map((r) => (r.id === id ? { ...r, enabled } : r)),
      })),

    dispatchTrigger: (alert) => {
      const full: TriggeredAlert = {
        ...alert,
        isNew: true,
        aiExplanation: null,
        aiPending: true,
      };
      set((s) => ({
        triggers: [full, ...s.triggers].slice(0, 200),
        triggersVersion: s.triggersVersion + 1,
        lastEventAt: Date.now(),
      }));
      terminalBus.emit("alert:triggered", {
        id: full.id,
        coin: full.coin,
        severity: full.severity,
      });
      explainAsync(full.id, full.event, full.title);
    },

    attachAiExplanation: (triggerId, text) =>
      set((s) => ({
        triggers: s.triggers.map((t) =>
          t.id === triggerId
            ? { ...t, aiExplanation: text, aiPending: false }
            : t,
        ),
        triggersVersion: s.triggersVersion + 1,
      })),

    clearTriggerFlash: (id) =>
      set((s) => ({
        triggers: s.triggers.map((t) =>
          t.id === id ? { ...t, isNew: false } : t,
        ),
      })),

    ingestMarketEvent: (event) => {
      const hits = evaluateMarketEvent(event, get().rules);
      for (const hit of hits) {
        get().dispatchTrigger(hit);
      }
    },
  })),
);
