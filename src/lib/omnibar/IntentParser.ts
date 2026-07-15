import { wedgeAllowsCommand, wedgeBlockedCommand, wedgeBlockedMessage, wedgeResolveWidget } from "@/lib/wedge/wedgeAccess";
import type { OmniIntent } from "@/types/omnibar";

export interface ParseResult {
  intent: OmniIntent;
  elapsedMs: number;
  path: "fast" | "semantic";
}

const RE_NAV = /^\/nav\s+([A-Za-z0-9/_-]+)\s*$/i;
const RE_CHART = /^\/chart(?:\s+([A-Za-z0-9/_-]+))?\s*$/i;
const RE_DEPTH = /^\/depth(?:\s+([A-Za-z0-9/_-]+))?\s*$/i;
const RE_EXEC = /^\/exec\s+(buy|sell)\s+([A-Za-z0-9/_-]+)(?:\s+([\d.]+))?\s*$/i;
const RE_MONITOR = /^\/monitor(?:\s+(\w+))?\s*$/i;
const RE_ALERTS = /^\/alerts(?:\s+([A-Za-z0-9/_-]+))?\s*$/i;
const RE_OPERATOR = /^\/operator(?:\s+mode)?\s*$/i;
const RE_DESK = /^\/desk\s*$/i;
const RE_EXPAND = /^\/expand\s*$/i;
const RE_HELP = /^\/help\s*$/i;
const RE_GUIDE = /^\/(?:guide|explain)(?:\s+(on|off|toggle))?\s*$/i;
const RE_WORKSPACE_MODE =
  /^\/workspace\s+(macro|execution|research|surveillance|standard|balanced|scalping)\s*$/i;
const RE_PERP_TICKER = /^([A-Za-z0-9]+)-(PERP|SPOT)$/i;
const RE_TRADE = /^\/trade\s+(buy|sell)\s+([A-Za-z0-9/_-]+)\s+([\d.]+)\s*$/i;
const RE_WATCH = /^\/watch\s+([A-Za-z0-9/_-]+)\s*$/i;
const RE_UNWATCH = /^\/unwatch\s+([A-Za-z0-9/_-]+)\s*$/i;
const RE_INTEL = /^\/intel(?:\s+([\s\S]*))?$/i;
const RE_LIQ = /^\/liq(?:\s+([A-Za-z0-9/_-]+))?\s*$/i;
const RE_PAPER = /^\/(?:paper|blotter)\s*$/i;
const RE_MACRO = /^\/macro\s*$/i;
const RE_VOL = /^\/vol\s*$/i;
const RE_SUMMARIZE = /^\/summarize(?:\s+([A-Za-z0-9/_-]+))?\s*$/i;
const RE_FOCUS =
  /^\/focus\s+(chart|book|intel|macro|ticket|paper|blotter|surveillance|copilot|graph|knowledge|journal|research|briefing|dailybriefing|dailyops|marketstate|coverage|markets|reliability|trust|newswire|wire|incidents|ingest|ingestion|dataplane|pipeline|intelengine|mktintel|collab|team|teamdesk|desk|enterpriseops|enterprise|orgops|integrations|integrate|embed|propintel|proprietary|eqintel|moat|ecosystem|finos|cryptoos|globalstrategy|globalinfra|infrastrategy|gtm)\s*$/i;
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
const RE_TEAM = /^\/(?:team|teamdesk)\s*$/i;
const RE_ENTERPRISE = /^\/(?:enterpriseops|enterprise|orgops|institutional)\s*$/i;
const RE_INTEGRATIONS = /^\/(?:integrations|integrate|industry|embed|connectivity)\s*$/i;
const RE_PROPRIETARY = /^\/(?:propintel|proprietary|eqintel|moat|eqmetrics)\s*$/i;
const RE_ECOSYSTEM = /^\/(?:ecosystem|finos|cryptoos|operatingsystem|portfolioos)\s*$/i;
const RE_GLOBAL_STRATEGY =
  /^\/(?:globalstrategy|globalinfra|infrastrategy|gtm|scaling|moat)\s*$/i;
const RE_ROUTINE = /^\/routine\s+([a-z_]+)\s*$/i;

export class IntentParser {
  static parse(raw: string): ParseResult {
    const t0 = performance.now();
    const input = raw.trim();
    if (!input) {
      return focusWidget("chart", raw, t0);
    }

    if (RE_HELP.test(input)) {
      return fast({ type: "COMMAND_HELP", raw: input }, t0);
    }

    const guide = RE_GUIDE.exec(input);
    if (guide) {
      const mode = guide[1]?.toLowerCase();
      if (mode === "on") {
        return fast({ type: "EXPLAIN_MODE", active: true, raw: input }, t0);
      }
      if (mode === "off") {
        return fast({ type: "EXPLAIN_MODE", active: false, raw: input }, t0);
      }
      return fast({ type: "EXPLAIN_MODE", toggle: true, raw: input }, t0);
    }

    if (RE_OPERATOR.test(input) && wedgeAllowsCommand("/operator")) {
      return focusWidget("operatormode", input, t0);
    }

    if (RE_PAPER.test(input) && wedgeAllowsCommand("/paper")) {
      return focusWidget("paperblotter", input, t0);
    }

    if (RE_DESK.test(input)) {
      return fast({ type: "WEDGE_LAYOUT", deskFocus: true, raw: input }, t0);
    }

    if (RE_EXPAND.test(input)) {
      return fast({ type: "WEDGE_LAYOUT", deskFocus: false, raw: input }, t0);
    }

    const workspaceMode = RE_WORKSPACE_MODE.exec(input);
    if (workspaceMode) {
      const mode = workspaceMode[1].toLowerCase();
      const normalized = mode === "standard" ? "balanced" : mode;
      return fast({ type: "SET_TERMINAL_MODE", mode: normalized, raw: input }, t0);
    }

    const nav = RE_NAV.exec(input);
    if (nav) {
      return fast(
        { type: "NAV_ASSET", coin: nav[1].toUpperCase(), raw: input, path: "fast" },
        t0,
      );
    }

    const chart = RE_CHART.exec(input);
    if (chart) {
      const coin = chart[1]?.toUpperCase();
      if (coin) {
        return fast({ type: "NAV_ASSET", coin, raw: input }, t0);
      }
      return focusWidget("chart", input, t0);
    }

    const depth = RE_DEPTH.exec(input);
    if (depth) {
      const coin = depth[1]?.toUpperCase();
      return focusWidget("domladder", input, t0, coin);
    }

    const exec = RE_EXEC.exec(input);
    if (exec) {
      const side = exec[1].toLowerCase() as "buy" | "sell";
      const coin = exec[2].toUpperCase();
      const size = exec[3] ? parseFloat(exec[3]) : undefined;
      if (size !== undefined && Number.isFinite(size) && size > 0) {
        return fast({ type: "TRADE_PREFILL", side, coin, size, raw: input }, t0);
      }
      return fast({ type: "EXEC_SHORTCUT", side, coin, raw: input }, t0);
    }

    const monitor = RE_MONITOR.exec(input);
    if (monitor) {
      const topic = monitor[1]?.toLowerCase();
      const widgetId =
        topic === "funding" || topic === "liq" ? "slippageradar" : "surveillance";
      return focusWidget(widgetId, input, t0);
    }

    const alerts = RE_ALERTS.exec(input);
    if (alerts) {
      return focusWidget("alerts", input, t0, alerts[1]?.toUpperCase());
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
      if (!wedgeAllowsCommand("/macro")) {
        return fast(
          { type: "FOCUS_WIDGET", widgetId: wedgeResolveWidget("chart"), raw: input },
          t0,
        );
      }
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

    if (RE_BRIEFING.test(input) && wedgeAllowsCommand("/briefing")) {
      return focusWidget("dailybriefing", input, t0);
    }
    if (RE_COVERAGE.test(input) && wedgeAllowsCommand("/coverage")) {
      return focusWidget("marketcoverage", input, t0);
    }
    if (RE_RELIABILITY.test(input) && wedgeAllowsCommand("/reliability")) {
      return focusWidget("reliability", input, t0);
    }
    if (RE_NEWSWIRE.test(input) && wedgeAllowsCommand("/newswire")) {
      return focusWidget("newswire", input, t0);
    }
    if (RE_INCIDENTS.test(input) && wedgeAllowsCommand("/incidents")) {
      return focusWidget("newswire", input, t0);
    }
    if (RE_INGEST.test(input) && wedgeAllowsCommand("/ingest")) {
      return focusWidget("ingestion", input, t0);
    }
    if (RE_INTEL_ENGINE.test(input) && wedgeAllowsCommand("/intelengine")) {
      return focusWidget("intelengine", input, t0);
    }
    if (RE_COLLAB.test(input) && wedgeAllowsCommand("/collab")) {
      return focusWidget("collab", input, t0);
    }
    if (RE_TEAM.test(input) && wedgeAllowsCommand("/team")) {
      return focusWidget("teamdesk", input, t0);
    }
    if (RE_ENTERPRISE.test(input) && wedgeAllowsCommand("/enterprise")) {
      return focusWidget("enterpriseops", input, t0);
    }
    if (RE_INTEGRATIONS.test(input) && wedgeAllowsCommand("/integrations")) {
      return focusWidget("integrations", input, t0);
    }
    if (RE_PROPRIETARY.test(input) && wedgeAllowsCommand("/propintel")) {
      return focusWidget("propintel", input, t0);
    }
    if (RE_ECOSYSTEM.test(input) && wedgeAllowsCommand("/ecosystem")) {
      return focusWidget("ecosystem", input, t0);
    }
    if (RE_GLOBAL_STRATEGY.test(input) && wedgeAllowsCommand("/globalstrategy")) {
      return focusWidget("globalstrategy", input, t0);
    }

    const routine = RE_ROUTINE.exec(input);
    if (routine && wedgeAllowsCommand("/routine")) {
      return fast(
        { type: "LAUNCH_ROUTINE", routineId: routine[1], raw: input, path: "fast" },
        t0,
      );
    }

    if (RE_JOURNAL.test(input) && wedgeAllowsCommand("/journal")) {
      return focusWidget("operatorjournal", input, t0);
    }

    if (RE_RESEARCH.test(input) && wedgeAllowsCommand("/research")) {
      return focusWidget("research", input, t0);
    }

    const workspace = RE_WORKSPACE.exec(input);
    if (workspace && wedgeAllowsCommand("/workspace")) {
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
        paper: "paperblotter",
        blotter: "paperblotter",
        surveillance: "surveillance",
        copilot: "copilot",
        graph: "knowledgegraph",
        knowledge: "knowledgegraph",
        journal: "operatorjournal",
        traderjournal: "traderjournal",
        operatorjournal: "operatorjournal",
        research: "research",
        briefing: "dailybriefing",
        dailybriefing: "dailybriefing",
        dailyops: "dailyops",
        marketstate: "marketstate",
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
        globalstrategy: "globalstrategy",
        globalinfra: "globalstrategy",
        infrastrategy: "globalstrategy",
        gtm: "globalstrategy",
      };
      const widgetId = map[focus[1].toLowerCase()] ?? "chart";
      return focusWidget(widgetId, input, t0);
    }

    const graph = RE_GRAPH.exec(input);
    if (graph) {
      const prompt = graph[1]?.trim() ?? "";
      if (prompt && !wedgeAllowsCommand("/graph")) {
        const blocked = "/graph";
        return {
          intent: {
            type: "WEDGE_BLOCKED",
            command: blocked,
            message: wedgeBlockedMessage(blocked),
            raw: input,
            path: "fast",
          },
          elapsedMs: performance.now() - t0,
          path: "fast",
        };
      }
      if (!prompt) {
        return fast(
          {
            type: "OMNI_GUIDANCE",
            message: "Add a graph query — e.g. /graph BTC funding flows",
            widgetId: "knowledgegraph",
            raw: input,
          },
          t0,
        );
      }
      return {
        intent: { type: "GRAPH_QUERY", prompt, raw: input, path: "semantic" },
        elapsedMs: performance.now() - t0,
        path: "semantic",
      };
    }

    const net = RE_NET.exec(input);
    if (net) {
      const prompt = net[1]?.trim() ?? "";
      if (!prompt) {
        return fast(
          {
            type: "OMNI_GUIDANCE",
            message: "Add a network query — e.g. /net whale clusters",
            widgetId: "teamdesk",
            raw: input,
          },
          t0,
        );
      }
      return {
        intent: {
          type: "NETWORK_GRAPH_QUERY",
          prompt,
          raw: input,
          path: "semantic",
        },
        elapsedMs: performance.now() - t0,
        path: "semantic",
      };
    }

    const ai = RE_AI.exec(input);
    if (ai) {
      const prompt = ai[1]?.trim() ?? "";
      if (!prompt) {
        return fast(
          {
            type: "OMNI_GUIDANCE",
            message: "Add a prompt — e.g. /ai summarize funding for BTC",
            widgetId: "copilot",
            raw: input,
          },
          t0,
        );
      }
      return {
        intent: { type: "AI_SEMANTIC_QUERY", prompt, raw: input, path: "semantic" },
        elapsedMs: performance.now() - t0,
        path: "semantic",
      };
    }

    const perpTicker = RE_PERP_TICKER.exec(input);
    if (perpTicker) {
      return fast(
        { type: "TICKER_SELECT", query: perpTicker[1].toUpperCase(), raw: input },
        t0,
      );
    }

    if (RE_TICKER.test(input) && !input.includes(" ")) {
      return fast({ type: "TICKER_SELECT", query: input, raw: input }, t0);
    }

    const blocked = wedgeBlockedCommand(input);
    if (blocked) {
      return {
        intent: {
          type: "WEDGE_BLOCKED",
          command: blocked,
          message: wedgeBlockedMessage(blocked),
          raw: input,
          path: "fast",
        },
        elapsedMs: performance.now() - t0,
        path: "fast",
      };
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

function focusWidget(widgetId: string, raw: string, t0: number, coin?: string): ParseResult {
  return fast(
    {
      type: "FOCUS_WIDGET",
      widgetId: wedgeResolveWidget(widgetId),
      coin,
      raw,
    },
    t0,
  );
}
