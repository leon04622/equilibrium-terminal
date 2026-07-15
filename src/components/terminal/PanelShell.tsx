"use client";

import { Maximize2, Minimize2, GripVertical, HelpCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { INSTITUTIONAL_INTERACTION, STATUS_INDICATOR, type PanelStatus } from "@/lib/theme/institutional";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { resolvePanelEmphasis } from "@/lib/theme/equilibrium-visual";
import { PanelLoadingState } from "@/components/terminal/PanelLoadingState";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useTerminalStore } from "@/store/terminalStore";
import { isBloombergChrome } from "@/lib/theme/bloomberg";
import type { PanelEmphasis } from "@/store/useAdaptiveWorkspaceStore";
import type { ExplainLabel, ExplainLabelAnchor, ExplainLabelTone } from "@/types/operator-guide";

interface PanelShellProps {
  title: string;
  subtitle?: string;
  telemetry?: string;
  panelId?: string;
  children: React.ReactNode;
  className?: string;
  dragHandleClassName?: string;
  maximized?: boolean;
  emphasis?: PanelEmphasis;
  loading?: boolean;
  status?: PanelStatus;
  onToggleMaximize?: () => void;
  onClone?: () => void;
}

const EMPHASIS_SHELL: Record<PanelEmphasis, string> = {
  high: "ring-1 ring-cyan-900/45 shadow-[inset_0_1px_0_rgba(0,229,255,0.06)] z-[1]",
  medium: "",
  low: "opacity-[0.92]",
  muted: "opacity-[0.52] saturate-[0.85]",
};

const EMPHASIS_HEADER: Record<PanelEmphasis, string> = {
  high: "bg-slate-900/80",
  medium: "bg-slate-950",
  low: "bg-slate-950/90",
  muted: "bg-slate-950/70",
};

const EMPHASIS_TITLE: Record<PanelEmphasis, string> = {
  high: "text-slate-200",
  medium: "text-slate-300",
  low: "text-slate-400",
  muted: "text-slate-500",
};

const LABEL_ANCHOR: Record<ExplainLabelAnchor, string> = {
  tl: "top-1.5 left-1.5",
  tr: "top-1.5 right-1.5",
  bl: "bottom-1.5 left-1.5",
  br: "bottom-1.5 right-1.5",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  left: "top-1/2 left-1.5 -translate-y-1/2",
  right: "top-1/2 right-1.5 -translate-y-1/2",
};

const LABEL_TONE: Record<ExplainLabelTone, string> = {
  neutral: "border-slate-500/60 bg-slate-900/85 text-slate-200",
  good: "border-emerald-500/60 bg-emerald-950/85 text-emerald-200",
  bad: "border-rose-500/60 bg-rose-950/85 text-rose-200",
  warn: "border-amber-500/60 bg-amber-950/85 text-amber-200",
};

const STREAM_PANELS = new Set([
  "hyperbook",
  "chart",
  "intelligence",
  "ticket",
  "positions",
  "domladder",
  "slippageradar",
  "alerts",
  "surveillance",
  "newswire",
  "paperblotter",
  "macro",
]);

function streamPanelStatus(panelId: string, connectionStatus: string): PanelStatus {
  if (!STREAM_PANELS.has(panelId)) return "idle";
  if (connectionStatus === "connected") return "live";
  if (connectionStatus === "reconnecting") return "watch";
  return "offline";
}

function ExplainLabelOverlay({ labels }: { labels: ExplainLabel[] }) {
  if (!labels.length) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      {labels.map((l, i) => (
        <span
          key={`${l.text}-${i}`}
          className={cn(
            "absolute border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide shadow-lg backdrop-blur-sm",
            "animate-[fadeIn_0.25s_ease-out]",
            LABEL_ANCHOR[l.anchor],
            LABEL_TONE[l.tone ?? "neutral"],
          )}
        >
          {l.text}
        </span>
      ))}
    </div>
  );
}

export function PanelShell({
  title,
  subtitle,
  telemetry,
  panelId,
  children,
  className,
  dragHandleClassName,
  maximized,
  emphasis: emphasisProp = "medium",
  loading: loadingProp,
  status: statusProp = "idle",
  onToggleMaximize,
  onClone,
}: PanelShellProps) {
  const explainMode = useOperatorGuideStore((s) => s.explainModeActive);
  const guideTargetId = useOperatorGuideStore((s) => s.selectedTargetId);
  const highlightPanelId = useOperatorGuideStore((s) => s.highlightPanelId);
  const focusModeActive = useOperatorGuideStore((s) => s.focusModeActive);
  const focusLabels = useOperatorGuideStore((s) => s.focusLabels);
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);
  const bloomberg = isBloombergChrome(beginnerMode);
  const connectionStatus = useTerminalStore((s) => s.connectionStatus);
  const selectedAsset = useTerminalStore((s) => s.selectedAsset);
  const adaptiveEmphasis = useAdaptiveWorkspaceStore((s) =>
    panelId ? s.panelEmphasis[panelId] : undefined,
  );
  const emphasis = panelId ? resolvePanelEmphasis(panelId, adaptiveEmphasis) : emphasisProp;
  const status = panelId ? streamPanelStatus(panelId, connectionStatus) : statusProp;
  // Only block panel chrome when the feed is fully offline — connecting/idle panels
  // render their own skeletons so operators are not stuck on a blanket SYNC overlay.
  const loading =
    loadingProp ??
    (panelId ? connectionStatus === "disconnected" && STREAM_PANELS.has(panelId) : false);
  const displaySubtitle = subtitle ?? selectedAsset?.symbol;
  const isGuideFocus = Boolean(panelId && guideTargetId === panelId);
  const isLessonHighlight = Boolean(panelId && highlightPanelId === panelId);

  // PHASE 1/2 — Guided Focus: the learning target is the highlighted panel
  // (driven by lesson steps) or, absent a lesson, the selected panel.
  const focusTargetId = highlightPanelId ?? guideTargetId;
  const isFocusTarget = Boolean(panelId && focusTargetId === panelId);
  const focusSpotlight = focusModeActive && isFocusTarget;
  // Academy live bridges set highlightPanelId — keep all panels readable; region ring handles focus.
  const focusDimmed =
    focusModeActive && Boolean(focusTargetId) && !isFocusTarget && !highlightPanelId;

  const openExplain = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (!panelId) return;
    // Optimistic, synchronous open — single set call, no async work before the panel shows.
    useOperatorGuideStore.setState({
      explainModeActive: true,
      selectedTargetId: panelId,
      sidePanelOpen: true,
    });
  };

  // Stop react-grid-layout's drag handler (bound to the header) from swallowing
  // the first mousedown, which previously caused a "click twice" feel.
  const stopDrag = (e: React.MouseEvent | React.PointerEvent) => e.stopPropagation();

  return (
    <div
      data-focus-dimmed={focusDimmed ? "true" : undefined}
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-none eq-panel-shell",
        "transition-[box-shadow,opacity,filter,transform] duration-300 ease-out",
        terminalSkin.border,
        terminalSkin.panel,
        EMPHASIS_SHELL[emphasis],
        explainMode &&
          panelId &&
          "cursor-help hover:ring-1 hover:ring-cyan-700/45 hover:shadow-[inset_0_0_0_1px_rgba(0,229,255,0.08)]",
        isGuideFocus &&
          "ring-2 ring-cyan-500/70 shadow-[inset_0_0_12px_rgba(0,229,255,0.12)] z-[2]",
        // Academy live bridges use a floating region ring — avoid a second amber shell ring.
        isLessonHighlight && "relative z-[4]",
        // PHASE 5 — quiet unrelated systems: dim, desaturate and soften.
        focusDimmed && "opacity-[0.22] saturate-[0.4] blur-[1.5px] z-0",
        // PHASE 2 — spotlight the active learning area.
        focusSpotlight &&
          "scale-[1.012] ring-2 ring-amber-400/80 shadow-[0_0_28px_rgba(251,191,36,0.35)] brightness-110 z-[40]",
        className,
      )}
    >
      <header
        className={cn(
          terminalSkin.panelHeader,
          terminalSkin.borderB,
          EMPHASIS_HEADER[emphasis],
          "justify-between px-1",
          dragHandleClassName,
        )}
      >
        <div className="flex min-w-0 items-center gap-1">
          <GripVertical className="h-3 w-3 shrink-0 cursor-grab text-slate-600 active:cursor-grabbing" />
          <span
            className={cn("h-1.5 w-1.5 shrink-0 rounded-none", STATUS_INDICATOR[status])}
            title={status}
          />
          <div className="min-w-0 leading-none">
            <p className={cn(TERMINAL_TYPO.label, "truncate", EMPHASIS_TITLE[emphasis])}>{title}</p>
            {displaySubtitle ? (
              <p className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>{displaySubtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {panelId && !bloomberg ? (
            <>
              <button
                type="button"
                onMouseDown={stopDrag}
                onPointerDown={stopDrag}
                onClick={(e) => openExplain(e)}
                className={cn(TERMINAL_TYPO.micro, INSTITUTIONAL_INTERACTION.panelButton, "text-cyan-500")}
                aria-label={`Explain ${title}`}
                title="AI explanation"
              >
                <HelpCircle className="h-3 w-3" />
              </button>
              <button
                type="button"
                onMouseDown={stopDrag}
                onPointerDown={stopDrag}
                onClick={(e) => openExplain(e)}
                className={cn(TERMINAL_TYPO.micro, INSTITUTIONAL_INTERACTION.panelButton, "text-slate-400")}
                aria-label={`Explain this ${title}`}
                title="Explain this"
              >
                <Sparkles className="h-3 w-3" />
              </button>
            </>
          ) : null}
          {telemetry ? (
            <span
              className={cn(TERMINAL_TYPO.micro, "text-slate-600 underline decoration-dotted decoration-slate-700")}
              title="Panel telemetry acronym"
            >
              {telemetry}
            </span>
          ) : null}
          {onClone ? (
            <button
              type="button"
              onClick={onClone}
              className={cn(TERMINAL_TYPO.micro, INSTITUTIONAL_INTERACTION.panelButton)}
              aria-label="Clone panel"
            >
              CPY
            </button>
          ) : null}
          {onToggleMaximize ? (
            <button
              type="button"
              onMouseDown={stopDrag}
              onPointerDown={stopDrag}
              onClick={(e) => {
                e.stopPropagation();
                onToggleMaximize();
              }}
              className={cn(TERMINAL_TYPO.micro, INSTITUTIONAL_INTERACTION.panelButton)}
              aria-label={maximized ? "Restore panel" : "Maximize panel"}
            >
              {maximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </button>
          ) : null}
        </div>
      </header>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {loading ? <PanelLoadingState /> : children}
        {focusSpotlight ? <ExplainLabelOverlay labels={focusLabels} /> : null}
      </div>
    </div>
  );
}
