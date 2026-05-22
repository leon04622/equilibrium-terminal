import type { OmniIntent } from "@/types/omnibar";

export interface ParseResult {
  intent: OmniIntent;
  elapsedMs: number;
  path: "fast" | "semantic";
}

const RE_NAV = /^\/nav\s+([A-Za-z0-9/_-]+)\s*$/i;
const RE_TRADE = /^\/trade\s+(buy|sell)\s+([A-Za-z0-9/_-]+)\s+([\d.]+)\s*$/i;
const RE_WATCH = /^\/watch\s+([A-Za-z0-9/_-]+)\s*$/i;
const RE_UNWATCH = /^\/unwatch\s+([A-Za-z0-9/_-]+)\s*$/i;
const RE_INTEL = /^\/intel(?:\s+([\s\S]*))?$/i;
const RE_LIQ = /^\/liq(?:\s+([A-Za-z0-9/_-]+))?\s*$/i;
const RE_MACRO = /^\/macro\s*$/i;
const RE_VOL = /^\/vol\s*$/i;
const RE_SUMMARIZE = /^\/summarize(?:\s+([A-Za-z0-9/_-]+))?\s*$/i;
const RE_FOCUS =
  /^\/focus\s+(chart|book|intel|macro|ticket|surveillance|copilot|graph|knowledge|journal|research|briefing|dailyops|coverage|markets|reliability|trust|newswire|wire|incidents|ingest|ingestion|dataplane|pipeline|intelengine|mktintel|collab|team|teamdesk|desk|enterpriseops|enterprise|orgops|integrations|integrate|embed|propintel|proprietary|eqintel|moat|ecosystem|finos|cryptoos)\s*$/i;
const RE_TICKER = /^[A-Za-z0-9/_-]{2,16}$/;
const RE_AI = /^(?:\/ai\s+|\/ai$)([\s\S]*)$/i;
const RE_NET = /^(?:\/net\s+|\/net$)([\s\S]*)$/i;
const RE_GRAPH = /^(?:\/graph\s+|\/graph$)([\s\S]*)$/i;
const RE_JOURNAL = /^\/journal\s*$/i;
const RE_RESEARCH = /^\/research\s*$/i;
const RE_WORKSPACE =
  /^\/workspace\s+([A-Za-z0-9/_-]+)(?:\s+(standard|execution|research|surveillance))?\s*$/i;
const RE_BRIEFING = /^\/(?:briefing|brief)\s*$/i;
const RE_COVERAGE = /^\/(?:coverage|markets)\s*$/i;
const RE_RELIABILITY = /^\/(?:reliability|trust)\s*$/i;
const RE_NEWSWIRE = /^\/(?:newswire|wire|distribute)\s*$/i;
const RE_INCIDENTS = /^\/incidents\s*$/i;
const RE_INGEST = /^\/(?:ingest|ingestion|dataplane|pipeline)\s*$/i;
const RE_INTEL_ENGINE = /^\/(?:intelengine|mktintel|intelligence-engine)\s*$/i;
const RE_COLLAB = /^\/(?:collab|teamroom|deskops)\s*$/i;
const RE_TEAM = /^\/(?:team|teamdesk|desk)\s*$/i;
const RE_ENTERPRISE = /^\/(?:enterpriseops|enterprise|orgops|institutional)\s*$/i;
const RE_INTEGRATIONS = /^\/(?:integrations|integrate|industry|embed|connectivity)\s*$/i;
const RE_PROPRIETARY = /^\/(?:propintel|proprietary|eqintel|moat|eqmetrics)\s*$/i;
const RE_ECOSYSTEM = /^\/(?:ecosystem|finos|cryptoos|operatingsystem|portfolioos)\s*$/i;
const RE_ROUTINE = /^\/routine\s+([a-z_]+)\s*$/i;

export class IntentParser {
  static parse(raw: string): ParseResult {
    const t0 = performance.now();
    const input = raw.trim();
    if (!input) {
      return {
        intent: { type: "FOCUS_WIDGET", widgetId: "surveillance", raw, path: "fast" },
        elapsedMs: performance.now() - t0,
        path: "fast",
      };
    }

    const nav = RE_NAV.exec(input);
    if (nav) {
      return fast(
        { type: "NAV_ASSET", coin: nav[1].toUpperCase(), raw: input, path: "fast" },
        t0,
      );
    }

    const trade = RE_TRADE.exec(input);
    if (trade) {
      const side = trade[1].toLowerCase() as "buy" | "sell";
      const size = parseFloat(trade[3]);
      if (Number.isFinite(size) && size > 0) {
        return fast(
          { type: "TRADE_PREFILL", side, coin: trade[2].toUpperCase(), size, raw: input },
          t0,
        );
      }
    }

    const watch = RE_WATCH.exec(input);
    if (watch) {
      return fast({ type: "WATCHLIST_ADD", coin: watch[1].toUpperCase(), raw: input }, t0);
    }

    const unwatch = RE_UNWATCH.exec(input);
    if (unwatch) {
      return fast({ type: "WATCHLIST_REMOVE", coin: unwatch[1].toUpperCase(), raw: input }, t0);
    }

    const liq = RE_LIQ.exec(input);
    if (liq) {
      const coin = liq[1]?.toUpperCase();
      return fast(
        {
          type: "FOCUS_WIDGET",
          widgetId: "hyperbook",
          coin,
          raw: input,
        },
        t0,
      );
    }

    if (RE_MACRO.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "macro", raw: input }, t0);
    }

    if (RE_VOL.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "surveillance", raw: input }, t0);
    }

    const intel = RE_INTEL.exec(input);
    if (intel) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "intelligence", raw: input }, t0);
    }

    const summarize = RE_SUMMARIZE.exec(input);
    if (summarize) {
      return {
        intent: {
          type: "SUMMARIZE_CONTEXT",
          coin: (summarize[1] ?? "BTC").toUpperCase(),
          raw: input,
          path: "semantic",
        },
        elapsedMs: performance.now() - t0,
        path: "semantic",
      };
    }

    if (RE_BRIEFING.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "dailyops", raw: input }, t0);
    }
    if (RE_COVERAGE.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "marketcoverage", raw: input }, t0);
    }
    if (RE_RELIABILITY.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "reliability", raw: input }, t0);
    }
    if (RE_NEWSWIRE.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "newswire", raw: input }, t0);
    }
    if (RE_INCIDENTS.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "newswire", raw: input }, t0);
    }
    if (RE_INGEST.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "ingestion", raw: input }, t0);
    }
    if (RE_INTEL_ENGINE.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "intelengine", raw: input }, t0);
    }
    if (RE_COLLAB.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "collab", raw: input }, t0);
    }
    if (RE_TEAM.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "teamdesk", raw: input }, t0);
    }
    if (RE_ENTERPRISE.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "enterpriseops", raw: input }, t0);
    }
    if (RE_INTEGRATIONS.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "integrations", raw: input }, t0);
    }
    if (RE_PROPRIETARY.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "propintel", raw: input }, t0);
    }
    if (RE_ECOSYSTEM.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "ecosystem", raw: input }, t0);
    }

    const routine = RE_ROUTINE.exec(input);
    if (routine) {
      return fast(
        { type: "LAUNCH_ROUTINE", routineId: routine[1], raw: input, path: "fast" },
        t0,
      );
    }

    if (RE_JOURNAL.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "traderjournal", raw: input }, t0);
    }

    if (RE_RESEARCH.test(input)) {
      return fast({ type: "FOCUS_WIDGET", widgetId: "research", raw: input }, t0);
    }

    const workspace = RE_WORKSPACE.exec(input);
    if (workspace) {
      return fast(
        {
          type: "WORKFLOW_OPEN_ASSET",
          coin: workspace[1].toUpperCase(),
          mode: workspace[2]?.toLowerCase(),
          raw: input,
        },
        t0,
      );
    }

    const focus = RE_FOCUS.exec(input);
    if (focus) {
      const map: Record<string, string> = {
        chart: "chart",
        book: "hyperbook",
        intel: "intelligence",
        macro: "macro",
        ticket: "ticket",
        surveillance: "surveillance",
        copilot: "copilot",
        graph: "knowledgegraph",
        knowledge: "knowledgegraph",
        journal: "traderjournal",
        research: "research",
        briefing: "dailyops",
        dailyops: "dailyops",
        coverage: "marketcoverage",
        markets: "marketcoverage",
        reliability: "reliability",
        trust: "reliability",
        newswire: "newswire",
        wire: "newswire",
        incidents: "newswire",
        ingest: "ingestion",
        ingestion: "ingestion",
        dataplane: "ingestion",
        pipeline: "ingestion",
        intelengine: "intelengine",
        mktintel: "intelengine",
        collab: "collab",
        team: "teamdesk",
        teamdesk: "teamdesk",
        desk: "teamdesk",
        enterpriseops: "enterpriseops",
        enterprise: "enterpriseops",
        orgops: "enterpriseops",
        integrations: "integrations",
        integrate: "integrations",
        embed: "integrations",
        propintel: "propintel",
        proprietary: "propintel",
        eqintel: "propintel",
        moat: "propintel",
        ecosystem: "ecosystem",
        finos: "ecosystem",
        cryptoos: "ecosystem",
      };
      const widgetId = map[focus[1].toLowerCase()] ?? "chart";
      return fast({ type: "FOCUS_WIDGET", widgetId, raw: input }, t0);
    }

    const graph = RE_GRAPH.exec(input);
    if (graph) {
      const prompt = graph[1]?.trim() ?? "";
      if (prompt) {
        return {
          intent: { type: "GRAPH_QUERY", prompt, raw: input, path: "semantic" },
          elapsedMs: performance.now() - t0,
          path: "semantic",
        };
      }
    }

    const net = RE_NET.exec(input);
    if (net?.[1]?.trim()) {
      return {
        intent: {
          type: "NETWORK_GRAPH_QUERY",
          prompt: net[1].trim(),
          raw: input,
          path: "semantic",
        },
        elapsedMs: performance.now() - t0,
        path: "semantic",
      };
    }

    const ai = RE_AI.exec(input);
    if (ai?.[1]?.trim()) {
      return {
        intent: { type: "AI_SEMANTIC_QUERY", prompt: ai[1].trim(), raw: input, path: "semantic" },
        elapsedMs: performance.now() - t0,
        path: "semantic",
      };
    }

    if (RE_TICKER.test(input) && !input.includes(" ")) {
      return fast({ type: "TICKER_SELECT", query: input, raw: input }, t0);
    }

    return {
      intent: { type: "AI_SEMANTIC_QUERY", prompt: input, raw: input, path: "semantic" },
      elapsedMs: performance.now() - t0,
      path: "semantic",
    };
  }
}

function fast(
  intent: Record<string, unknown> & { type: string; raw: string },
  t0: number,
): ParseResult {
  return {
    intent: { ...intent, path: "fast" } as OmniIntent,
    elapsedMs: performance.now() - t0,
    path: "fast",
  };
}
