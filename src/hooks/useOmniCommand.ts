"use client";

import { useCallback } from "react";
import { AssetWorkspaceOrchestrator } from "@/lib/workflow/AssetWorkspaceOrchestrator";
import { GraphQueryEngine } from "@/lib/knowledge-graph/GraphQueryEngine";
import { RoutineCatalog } from "@/lib/daily/RoutineCatalog";
import type { AssetWorkspaceMode } from "@/types/trader-workflow";
import type { RoutineId } from "@/types/daily-operations";
import { knowledgeGraphIndexer } from "@/lib/network/KnowledgeGraphIndexer";
import { useMarketKnowledgeGraphStore } from "@/store/useMarketKnowledgeGraphStore";
import { OmniCommandRouter } from "@/lib/omnibar/OmniCommandRouter";
import { wedgeResolveWidget } from "@/lib/wedge/wedgeAccess";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useWedgeStore } from "@/store/useWedgeStore";
import type { TerminalMode } from "@/types/adaptive-workspace";
import { terminalBus } from "@/store/eventBus";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { OmniIntent } from "@/types/omnibar";

export interface OmniCommandResult {
  intent: OmniIntent;
  elapsedMs: number;
  handled: boolean;
}

export function useOmniCommand() {
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);
  const submitAiPrompt = useTerminalStore((s) => s.submitAiPrompt);
  const applyTradeTicketDraft = useTerminalStore((s) => s.applyTradeTicketDraft);
  const setOmniOpen = useTerminalStore((s) => s.setOmniOpen);

  const executeIntent = useCallback(
    (intent: OmniIntent): boolean => {
      switch (intent.type) {
        case "NAV_ASSET":
        case "TICKER_SELECT":
          selectAssetByCoin(
            intent.type === "NAV_ASSET" ? intent.coin : intent.query,
            "omnibar",
          );
          terminalBus.emit("widget:focus", { widgetId: "chart" });
          return true;
        case "TRADE_PREFILL":
          selectAssetByCoin(intent.coin, "omnibar");
          applyTradeTicketDraft({
            side: intent.side,
            size: String(intent.size),
            coin: intent.coin,
          });
          terminalBus.emit("widget:focus", { widgetId: "ticket" });
          return true;
        case "EXEC_SHORTCUT":
          selectAssetByCoin(intent.coin, "omnibar");
          applyTradeTicketDraft({
            side: intent.side,
            size: intent.size !== undefined ? String(intent.size) : "",
            coin: intent.coin,
          });
          terminalBus.emit("widget:focus", { widgetId: "ticket" });
          return true;
        case "WEDGE_LAYOUT":
          useWedgeStore.getState().setDeskFocusMode(intent.deskFocus);
          terminalBus.emit("widget:focus", { widgetId: "chart" });
          return true;
        case "SET_TERMINAL_MODE":
          useAdaptiveWorkspaceStore
            .getState()
            .setMode(intent.mode as TerminalMode);
          terminalBus.emit("widget:focus", { widgetId: "chart" });
          return true;
        case "COMMAND_HELP":
          useTerminalStore.getState().setOmniFeedback(
            "Command catalog below — type /expand for the full platform.",
          );
          return true;
        case "EXPLAIN_MODE": {
          const store = useOperatorGuideStore.getState();
          if (intent.toggle) {
            store.toggleExplainMode();
          } else if (intent.active === true) {
            store.setExplainMode(true);
          } else if (intent.active === false) {
            store.setExplainMode(false);
          }
          const guide = useOperatorGuideStore.getState();
          if (guide.explainModeActive && guide.selectedTargetId) {
            store.setSidePanelOpen(true);
          } else {
            store.setSidePanelOpen(false);
          }
          terminalBus.emit("guide:explain-toggle", {
            active: guide.explainModeActive,
          });
          terminalBus.emit("widget:focus", { widgetId: "explaindesk" });
          return true;
        }
        case "WATCHLIST_ADD":
          useInformationDiscoveryStore.getState().addToWatchlist(intent.coin);
          selectAssetByCoin(intent.coin, "omnibar");
          terminalBus.emit("widget:focus", { widgetId: "surveillance" });
          return true;
        case "WATCHLIST_REMOVE":
          useInformationDiscoveryStore.getState().removeFromWatchlist(intent.coin);
          return true;
        case "WEDGE_BLOCKED":
          useTerminalStore.getState().setOmniFeedback(intent.message);
          return true;
        case "OMNI_GUIDANCE":
          useTerminalStore.getState().setOmniFeedback(intent.message);
          if (intent.widgetId) {
            terminalBus.emit("widget:focus", { widgetId: intent.widgetId });
          }
          return true;
        case "FOCUS_WIDGET":
          if (intent.coin) selectAssetByCoin(intent.coin, "omnibar");
          terminalBus.emit("widget:focus", { widgetId: intent.widgetId });
          return true;
        case "INDEX_SELECT": {
          const entry = useInformationDiscoveryStore
            .getState()
            .index.find((e) => e.id === intent.entryId);
          if (!entry) return false;
          if (entry.routeCoin) selectAssetByCoin(entry.routeCoin, "omnibar");
          if (entry.routeWidget) {
            terminalBus.emit("widget:focus", {
              widgetId: wedgeResolveWidget(entry.routeWidget),
            });
          }
          return true;
        }
        case "SUMMARIZE_CONTEXT": {
          selectAssetByCoin(intent.coin, "omnibar");
          const surv = useInformationDiscoveryStore.getState().surveillance;
          const timeline = useInformationDiscoveryStore.getState().assetTimeline;
          const prompt =
            `Summarize current market context for ${intent.coin} for a professional trader. ` +
            `Cover: what changed, liquidity, volatility, narratives, macro links. ` +
            `Do NOT recommend trades or positions. Facts and structure only.\n` +
            `Regime: ${surv?.regime ?? "—"}. Headlines: ${surv?.headlines.slice(0, 3).map((h) => h.headline).join("; ") ?? "—"}. ` +
            `Recent events: ${timeline.slice(0, 5).map((e) => e.headline).join("; ") || "—"}.`;
          submitAiPrompt(prompt, "omnibar");
          terminalBus.emit("widget:focus", { widgetId: "copilot" });
          return true;
        }
        case "AI_SEMANTIC_QUERY":
          if (!intent.prompt.trim()) return false;
          submitAiPrompt(
            `${intent.prompt}\n\n[Respond with market facts and structure only. No trade recommendations.]`,
            "omnibar",
          );
          terminalBus.emit("widget:focus", { widgetId: "copilot" });
          return true;
        case "LAUNCH_ROUTINE": {
          RoutineCatalog.launch(intent.routineId as RoutineId);
          terminalBus.emit("widget:focus", { widgetId: "dailyops" });
          return true;
        }
        case "WORKFLOW_OPEN_ASSET": {
          const mode = intent.mode as AssetWorkspaceMode | undefined;
          AssetWorkspaceOrchestrator.open(intent.coin, { mode, source: "omnibar" });
          return true;
        }
        case "GRAPH_QUERY": {
          if (!intent.prompt.trim()) return false;
          const result = GraphQueryEngine.query(intent.prompt);
          useMarketKnowledgeGraphStore.getState().setLastQuery(result);
          if (result.matches[0]?.entity.coin) {
            selectAssetByCoin(result.matches[0].entity.coin, "omnibar");
          }
          terminalBus.emit("widget:focus", { widgetId: "knowledgegraph" });
          return true;
        }
        case "NETWORK_GRAPH_QUERY":
          if (!intent.prompt.trim()) return false;
          queueMicrotask(async () => {
            const result = await knowledgeGraphIndexer.query(intent.prompt);
            useNetworkGraphStore.getState().setGraphQueryResult(result);
            terminalBus.emit("network:graph-query", {
              queryId: result.queryId,
              query: result.query,
            });
          });
          terminalBus.emit("widget:focus", { widgetId: "teamdesk" });
          return true;
        default:
          return false;
      }
    },
    [applyTradeTicketDraft, selectAssetByCoin, submitAiPrompt],
  );

  const execute = useCallback(
    (raw: string): OmniCommandResult => {
      const { intent, elapsedMs, path } = OmniCommandRouter.parse(raw);

      if (path === "fast") {
        const handled = executeIntent(intent);
        return { intent, elapsedMs, handled };
      }

      queueMicrotask(() => {
        executeIntent(intent);
      });

      return { intent, elapsedMs, handled: true };
    },
    [executeIntent],
  );

  const selectIndexEntry = useCallback(
    (entryId: string): OmniCommandResult => {
      const intent: OmniIntent = {
        type: "INDEX_SELECT",
        entryId,
        raw: entryId,
        path: "fast",
      };
      const handled = executeIntent(intent);
      if (handled) setOmniOpen(false);
      return { intent, elapsedMs: 0, handled };
    },
    [executeIntent, setOmniOpen],
  );

  const submit = useCallback(
    (raw: string): OmniCommandResult => {
      const result = execute(raw);
      if (result.handled && result.intent.type !== "COMMAND_HELP" && result.intent.type !== "OMNI_GUIDANCE" && result.intent.type !== "WEDGE_BLOCKED") {
        setOmniOpen(false);
      }
      return result;
    },
    [execute, setOmniOpen],
  );

  return { execute, submit, executeIntent, selectIndexEntry };
}
