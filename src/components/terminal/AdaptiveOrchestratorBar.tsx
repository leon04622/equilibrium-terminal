"use client";

import type { Layout } from "react-grid-layout";
import { Brain, Focus, LayoutGrid, Zap } from "lucide-react";
import { MODE_LABELS } from "@/lib/adaptive/PanelDefinitions";
import { LayoutOrchestrator } from "@/lib/adaptive/LayoutOrchestrator";
import { WorkspaceContextEngine } from "@/lib/adaptive/WorkspaceContextEngine";
import { AttentionGovernor } from "@/lib/adaptive/AttentionGovernor";
import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";
import { MODE_CHROME, TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useWedgeStore } from "@/store/useWedgeStore";
import type { FocusMode, TerminalMode } from "@/types/adaptive-workspace";

/** V1 wedge: execution-first modes; full palette when Advanced is on. */
const WEDGE_MODES: TerminalMode[] = ["execution", "scalping", "balanced"];
const FULL_MODES: TerminalMode[] = [
  "balanced",
  "execution",
  "research",
  "macro",
  "scalping",
  "ai_analyst",
  "portfolio",
  "narrative",
  "quant",
];

const FOCUS_OPTIONS: { id: FocusMode; label: string }[] = [
  { id: "none", label: "—" },
  { id: "execution_deep", label: "EXEC DEEP" },
  { id: "chart_isolated", label: "CHART" },
  { id: "ai_briefing", label: "AI BRIEF" },
  { id: "macro_command", label: "MACRO CMD" },
  { id: "asset_war_room", label: "WAR ROOM" },
];

interface AdaptiveOrchestratorBarProps {
  onApplyLayout: (layout: Layout[]) => void;
  baseLayout: Layout[];
}

export function AdaptiveOrchestratorBar({
  onApplyLayout,
  baseLayout,
}: AdaptiveOrchestratorBarProps) {
  const mode = useAdaptiveWorkspaceStore((s) => s.mode);
  const focusMode = useAdaptiveWorkspaceStore((s) => s.focusMode);
  const autoAdapt = useAdaptiveWorkspaceStore((s) => s.autoAdapt);
  const context = useAdaptiveWorkspaceStore((s) => s.context);
  const cognitive = useAdaptiveWorkspaceStore((s) => s.cognitiveLoad);
  const lastReason = useAdaptiveWorkspaceStore((s) => s.lastOrchestration?.reason);
  const setMode = useAdaptiveWorkspaceStore((s) => s.setMode);
  const setFocusMode = useAdaptiveWorkspaceStore((s) => s.setFocusMode);
  const setAutoAdapt = useAdaptiveWorkspaceStore((s) => s.setAutoAdapt);
  const clearFocus = useAdaptiveWorkspaceStore((s) => s.clearFocus);
  const ingest = useAdaptiveWorkspaceStore((s) => s.ingestOrchestration);
  const deskFocusMode = useWedgeStore((s) => s.deskFocusMode);
  const modes = deskFocusMode ? WEDGE_MODES : FULL_MODES;

  const commitOrchestration = (nextMode: TerminalMode, nextFocus: FocusMode) => {
    const result = LayoutOrchestrator.orchestrate(baseLayout, nextMode, nextFocus);
    const ctx = WorkspaceContextEngine.build();
    const cog = AttentionGovernor.evaluate(
      ctx,
      useTraderTelemetryStore.getState().metrics,
      baseLayout.length,
    );
    ingest(result, ctx, cog, LayoutOrchestrator.emphasisMap(result.scores));
    onApplyLayout(result.layout);
  };

  const overloadPct = cognitive ? Math.round(cognitive.overloadRisk * 100) : 0;
  const chrome = MODE_CHROME[mode];

  return (
    <div className="flex shrink-0 items-center gap-1 border-l border-slate-800 pl-2">
      <LayoutGrid className={cn("h-3 w-3 shrink-0", chrome.accent)} aria-hidden />
      <select
        value={mode}
        onChange={(e) => {
          const next = e.target.value as TerminalMode;
          setMode(next);
          commitOrchestration(next, "none");
        }}
        className={cn(
          TERMINAL_TYPO.micro,
          "max-w-[7rem] border-0 bg-transparent py-0 outline-none",
          chrome.accent,
        )}
        title="Terminal mode"
      >
        {modes.map((m) => (
          <option key={m} value={m}>
            {MODE_LABELS[m]}
          </option>
        ))}
      </select>

      <Focus className="h-3 w-3 shrink-0 text-slate-600" aria-hidden />
      <select
        value={focusMode}
        onChange={(e) => {
          const f = e.target.value as FocusMode;
          if (f === "none") clearFocus();
          else setFocusMode(f);
          commitOrchestration(mode, f);
        }}
        className={cn(
          TERMINAL_TYPO.micro,
          "max-w-[6rem] border-0 bg-transparent py-0 text-slate-500 outline-none",
        )}
        title="Focus mode"
      >
        {FOCUS_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setAutoAdapt(!autoAdapt)}
        className={cn(
          TERMINAL_TYPO.micro,
          "px-1 py-0.5",
          autoAdapt ? "bg-slate-900 text-cyan-400" : "text-slate-600 hover:text-slate-400",
        )}
        title="Auto-adapt layout from context"
      >
        <Zap className="mr-0.5 inline h-2.5 w-2.5" />
        AUTO
      </button>

      <button
        type="button"
        onClick={() => commitOrchestration(mode, focusMode)}
        className={cn(TERMINAL_TYPO.micro, "text-slate-500 hover:text-slate-200")}
        title="Apply orchestration now"
      >
        SYNC
      </button>

      {context && (
        <span className={cn(TERMINAL_TYPO.micro, "hidden text-slate-600 xl:inline")}>
          {context.marketRegime} · vol {context.volatilityScore}
        </span>
      )}

      {overloadPct > 50 && (
        <span className={cn(TERMINAL_TYPO.micro, terminalSkin.textWarn)} title={lastReason}>
          <Brain className="mr-0.5 inline h-2.5 w-2.5" />
          LOAD {overloadPct}%
        </span>
      )}
    </div>
  );
}

