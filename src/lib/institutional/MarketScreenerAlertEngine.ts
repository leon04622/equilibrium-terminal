import { MarketScreenerEngine } from "@/lib/institutional/MarketScreenerEngine";
import {
  BUILTIN_SCREENER_ALERT_RULES,
  BUILTIN_SCREENER_PRESETS,
  DEFAULT_SCREENER_FILTER,
  type MarketScreenerFilter,
  type MarketScreenerRow,
  type ScreenerAlertHit,
  type ScreenerAlertRule,
} from "@/types/institutional-capabilities";
import type { AlertSeverity } from "@/types/alerts";

function filterForRule(rule: ScreenerAlertRule): MarketScreenerFilter {
  if (!rule.presetId) return DEFAULT_SCREENER_FILTER;
  const preset = BUILTIN_SCREENER_PRESETS.find((p) => p.id === rule.presetId);
  return preset?.filter ?? DEFAULT_SCREENER_FILTER;
}

function rowMatches(rule: ScreenerAlertRule, row: MarketScreenerRow): boolean {
  if (Math.abs(row.changePct) < rule.minChangePct) return false;
  if (row.compositeScore < rule.minComposite) return false;
  if (rule.requireTag && !row.tags.includes(rule.requireTag)) return false;
  return true;
}

export class MarketScreenerAlertEngine {
  static evaluate(
    rules: ScreenerAlertRule[],
    cooldowns: Map<string, number>,
    savedPresets: { id: string; filter: MarketScreenerFilter }[] = [],
  ): ScreenerAlertHit[] {
    const hits: ScreenerAlertHit[] = [];
    const now = Date.now();

    for (const rule of rules) {
      if (!rule.enabled) continue;

      let filter = filterForRule(rule);
      if (rule.presetId?.startsWith("user_")) {
        const userPreset = savedPresets.find((p) => p.id === rule.presetId);
        if (userPreset) filter = userPreset.filter;
      }

      const snapshot = MarketScreenerEngine.snapshot(filter);

      for (const row of snapshot.rows) {
        if (!rowMatches(rule, row)) continue;

        const cooldownKey = `${rule.id}:${row.coin}`;
        const last = cooldowns.get(cooldownKey) ?? 0;
        if (now - last < rule.cooldownMs) continue;

        hits.push({
          ruleId: rule.id,
          ruleLabel: rule.label,
          coin: row.coin,
          symbol: row.symbol,
          changePct: row.changePct,
          compositeScore: row.compositeScore,
          tags: row.tags,
          at: now,
        });
        cooldowns.set(cooldownKey, now);
      }
    }

    return hits;
  }

  static severity(row: ScreenerAlertHit): AlertSeverity {
    if (Math.abs(row.changePct) >= 5 || row.compositeScore >= 75) return "watch";
    return "info";
  }

  static defaultRules(): ScreenerAlertRule[] {
    return BUILTIN_SCREENER_ALERT_RULES.map((r) => ({ ...r }));
  }
}
