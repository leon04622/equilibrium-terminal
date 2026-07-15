"use client";

import { useEffect } from "react";
import { AssetWorkspaceOrchestrator } from "@/lib/workflow/AssetWorkspaceOrchestrator";
import { terminalBus } from "@/store/eventBus";
import { useTerminalStore } from "@/store/terminalStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";

function isInputTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

export function useGlobalShortcuts(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const onKey = (e: KeyboardEvent) => {
      if (isInputTarget(e.target) && !(e.ctrlKey || e.metaKey)) return;

      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        useTerminalStore.getState().setOmniOpen(true);
        return;
      }

      if (mod && e.shiftKey && e.key.toLowerCase() === "w") {
        e.preventDefault();
        const coin =
          useTerminalStore.getState().selectedCoin ??
          useTerminalStore.getState().selectedAsset?.coin ??
          "BTC";
        AssetWorkspaceOrchestrator.open(coin, { source: "shortcut" });
        return;
      }

      if (e.key === "?" && !mod) {
        e.preventDefault();
        useOperatorGuideStore.getState().toggleExplainMode();
        terminalBus.emit("guide:explain-toggle", {
          active: useOperatorGuideStore.getState().explainModeActive,
        });
        return;
      }

      if (!mod) return;

      const focus = (widgetId: string) => {
        e.preventDefault();
        terminalBus.emit("widget:focus", { widgetId });
      };

      switch (e.key.toLowerCase()) {
        case "b":
          if (!e.shiftKey) focus("dailyops");
          break;
        case "j":
          focus("operatorjournal");
          break;
        case "r":
          if (!e.shiftKey) focus("research");
          break;
        case "m":
          focus("surveillance");
          break;
        case "l":
          if (!e.shiftKey) focus("reliability");
          break;
        case "n":
          if (!e.shiftKey) focus("newswire");
          break;
        case "i":
          if (!e.shiftKey) focus("ingestion");
          else focus("intelengine");
          break;
        case "t":
          if (e.shiftKey) focus("collab");
          else focus("teamdesk");
          break;
        case "e":
          if (e.shiftKey) focus("ecosystem");
          else focus("ticket");
          break;
        case "o":
          if (e.shiftKey) focus("enterpriseops");
          break;
        case "g":
          if (e.shiftKey) focus("integrations");
          else focus("globalstrategy");
          break;
        case "p":
          if (e.shiftKey) focus("propintel");
          else focus("paperblotter");
          break;
        case "1":
          focus("chart");
          break;
        case "2":
          focus("hyperbook");
          break;
        case "]":
          focus(useTraderWorkflowStore.getState().cyclePanel());
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}
