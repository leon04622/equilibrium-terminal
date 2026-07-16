"use client";

import dynamic from "next/dynamic";
import { loadMaximizedPanelId, saveMaximizedPanelId } from "@/lib/workspace/workspaceUiPrefs";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Layout } from "react-grid-layout";
import { OmniBar } from "@/components/terminal/OmniBar";
import { PanelShell } from "@/components/terminal/PanelShell";
import { WalletStatus } from "@/components/terminal/WalletStatus";
import { DeferredPanelContent } from "@/components/terminal/DeferredPanelContent";
import { GuidedFocusIndicator } from "@/components/terminal/explain/GuidedFocusIndicator";
import { LiveDeskBridgeStrip } from "@/components/terminal/explain/LiveDeskBridgeStrip";
import { ExplainSidePanel } from "@/components/terminal/explain/ExplainSidePanel";
import { LearningHubLauncher } from "@/components/terminal/explain/LearningHubLauncher";
import { OnboardingResumeButton } from "@/components/terminal/OnboardingResumeButton";
import { AcademySessionGuard } from "@/components/terminal/explain/AcademySessionGuard";
import { AcademyPerformancePanel } from "@/components/terminal/explain/AcademyPerformancePanel";
import { AlphaInviteGate } from "@/components/terminal/AlphaInviteGate";
import { OperatorModeGuidanceStrip } from "@/components/terminal/OperatorModeGuidanceStrip";
import { MorningTradingPathStrip } from "@/components/terminal/MorningTradingPathStrip";
import { OperatorModeController } from "@/components/terminal/OperatorModeController";
import { DeskSessionBar } from "@/components/terminal/DeskSessionBar";
import { beginnerPanelSubtitle, beginnerPanelTitle } from "@/lib/beginner/beginnerTranslation";
import { DailyStateStrip } from "@/components/terminal/DailyStateStrip";
import { MarginCallStrip } from "@/components/terminal/MarginCallStrip";
import { AdaptiveOrchestratorBar } from "@/components/terminal/AdaptiveOrchestratorBar";
import { TerminalExperienceBar } from "@/components/terminal/TerminalExperienceBar";
import { WedgeMissionStrip } from "@/components/terminal/WedgeMissionStrip";
import { DeskSwitcher } from "@/components/terminal/DeskSwitcher";
import { WatchlistStrip } from "@/components/terminal/WatchlistStrip";
import { StreamReconnectBanner } from "@/components/terminal/StreamReconnectBanner";
import { KeyboardShortcutOverlay } from "@/components/terminal/KeyboardShortcutOverlay";
import { WorkspaceHeaderTelemetry } from "@/components/terminal/WorkspaceHeaderTelemetry";
import {
  PositionsTable,
  TradeTicket,
  WidgetByType,
} from "@/components/terminal/widgetRegistry";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import {
  attachWorkspaceScrollRoot,
  isWorkspaceScrolling,
  lastWorkspaceScrollWithin,
  noteWorkspaceScroll,
  restoreWorkspaceScroll,
} from "@/lib/runtime/workspaceScroll";
import { useWorkspaceScrollAnchor } from "@/lib/runtime/useWorkspaceScroll";
import { academyPanelPinLayout, isAcademyHeaderTarget } from "@/lib/education/academyPanelPin";
import { layoutFingerprint, layoutsEqual } from "@/lib/telemetry/layoutUtils";
import { telemetryPipeline } from "@/lib/telemetry/TelemetryPipeline";
import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";
import { TERMINAL_LAYOUT, terminalSkin, TERMINAL_TYPO, DENSITY_PRESETS, MODE_CHROME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useTerminalStore } from "@/store/terminalStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import { terminalBus } from "@/store/eventBus";
import { NEVER_HIDE_PANEL_IDS } from "@/lib/adaptive/PanelPriorityEngine";
import {
  FULL_WORKSPACE_LABEL,
  FULL_WORKSPACE_LAYOUT,
  WEDGE_ADVANCED_PANEL_IDS,
  FULL_WORKSPACE_DEFAULT_MODE,
  WEDGE_DEFAULT_MODE,
  WEDGE_PRODUCT_LABEL,
  resolveWorkspaceLayout,
} from "@/lib/wedge/WedgeManifest";
import { useWedgeStore } from "@/store/useWedgeStore";
import { useDeskStore } from "@/store/useDeskStore";
import { DESKS } from "@/lib/desks/DeskRegistry";
import type { WidgetType, WorkspaceWidget } from "@/types/terminal-schema";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const WorkspaceSystems = dynamic(
  () =>
    import("@/components/terminal/WorkspaceSystems").then((m) => ({
      default: m.WorkspaceSystems,
    })),
  { ssr: false },
);

const OnboardingWalkthrough = dynamic(
  () => import("@/components/terminal/OnboardingWalkthrough").then((m) => m.OnboardingWalkthrough),
  { ssr: false },
);

const FirstFifteenMinutesWelcome = dynamic(
  () =>
    import("@/components/beginner/FirstFifteenMinutesWelcome").then((m) => m.FirstFifteenMinutesWelcome),
  { ssr: false },
);

const LearningCommandCenter = dynamic(
  () =>
    import("@/components/terminal/explain/LearningCommandCenter").then((m) => m.LearningCommandCenter),
  { ssr: false },
);

const AcademyOverlayHost = dynamic(
  () => import("@/components/terminal/explain/AcademyOverlayHost").then((m) => m.AcademyOverlayHost),
  { ssr: false },
);

const AcademyWorkflowGuide = dynamic(
  () => import("@/components/terminal/explain/AcademyWorkflowGuide").then((m) => m.AcademyWorkflowGuide),
  { ssr: false },
);

const DecisionReplayReview = dynamic(
  () => import("@/components/terminal/widgets/DecisionReplayReview").then((m) => m.DecisionReplayReview),
  { ssr: false },
);

const ArticleReaderOverlay = dynamic(
  () => import("@/components/terminal/widgets/ArticleReaderOverlay").then((m) => m.ArticleReaderOverlay),
  { ssr: false },
);

const CORE_WORKSPACE_PANELS = NEVER_HIDE_PANEL_IDS;

const GridLayout = dynamic(
  () =>
    import("react-grid-layout").then((mod) => {
      const Grid = mod.default ?? (mod as { ReactGridLayout?: typeof mod.default }).ReactGridLayout;
      if (!Grid) {
        throw new Error("react-grid-layout: missing default export");
      }
      return Grid;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center font-mono text-[10px] text-slate-500">
        LOADING WORKSPACE GRID…
      </div>
    ),
  },
);

function initialWorkspaceLayout(): Layout[] {
  return resolveWorkspaceLayout(useWedgeStore.getState().deskFocusMode);
}

const PANEL_TELEMETRY: Record<string, string> = {
  hyperbook: "L2 DEPTH",
  chart: "OHLCV",
  intelligence: "TAPE",
  copilot: "AI LAYER",
  alerts: "RULE ENGINE",
  proactive: "AGENTIC",
  teamdesk: "TEAM NET",
  ticket: "EXEC",
  positions: "RISK",
  diagnostics: "TOTE",
  alphalab: "QUANT",
  infra: "PLATFORM",
  domladder: "DOM OFA",
  slippageradar: "SLIP RADAR",
  decision: "CONTEXT",
  surveillance: "SURVEILLANCE",
  knowledgegraph: "KNOWLEDGE GRAPH",
  traderjournal: "JOURNAL",
  research: "RESEARCH",
  dailyops: "DAILY OPS",
  marketstate: "MARKET STATE",
  dailybriefing: "DAILY BRIEFING",
  marketcoverage: "COVERAGE",
  reliability: "RELIABILITY",
  newswire: "NEWSWIRE",
  paperblotter: "PAPER BLOTTER",
  liveblotter: "LIVE BLOTTER",
  settlementledger: "SETTLEMENT",
  screener: "SCREENER",
  tradesurveillance: "TRADE SURV",
  instrumentmaster: "INSTRUMENT MASTER",
  crossvenue: "CROSS-VENUE",
  ingestion: "INGEST",
  intelengine: "INTEL",
  collab: "COLLAB",
  enterpriseops: "ENTERPRISE",
  integrations: "INTEGRATE",
  propintel: "EQ INTEL",
  ecosystem: "ECOSYSTEM",
  globalstrategy: "GLOBAL STRAT",
  commercial: "PRODUCT",
  execintel: "EXEC INTEL",
  portfoliodesk: "PORTFOLIO DESK",
  derivdesk: "DERIVATIVES DESK",
  systemicintel: "SYSTEMIC INTEL",
  memorydesk: "MARKET MEMORY",
  researchdesk: "RESEARCH DESK",
  platformdesk: "PLATFORM DESK",
  mobiledesk: "MOBILE OPS",
  opscommand: "OPS COMMAND",
  billingdesk: "BILLING DESK",
  deskops: "DESK OPS",
  globaldesk: "GLOBAL INTEL",
  operatordesk: "OPERATOR AI",
  unifiedops: "UNIFIED OPS",
  liveexec: "LIVE EXEC",
  marketcmd: "MARKET CMD",
  maturitydesk: "TERMINAL POLISH",
  livedeploy: "LIVE DEPLOY",
  explaindesk: "OPERATOR GUIDE",
  operatorjournal: "OPERATOR JOURNAL",
  livementor: "LIVE MENTOR",
  operatormode: "OPERATOR MODE",
};

function widgetContent(type: WidgetType) {
  return <WidgetByType type={type} />;
}

type WorkspaceGridProps = {
  activeLayout: Layout[];
  width: number;
  gridRowHeight: number;
  visible: WorkspaceWidget[];
  maximizedId: string | null;
  beginnerMode: boolean;
  deskFocusMode: boolean;
  deskTransitioning: boolean;
  reducedMotion: boolean;
  onCommitLayout: (next: Layout[]) => void;
  onToggleMaximize: (id: string) => void;
};

function workspaceGridPropsEqual(prev: WorkspaceGridProps, next: WorkspaceGridProps): boolean {
  if (
    prev.width !== next.width ||
    prev.gridRowHeight !== next.gridRowHeight ||
    prev.maximizedId !== next.maximizedId ||
    prev.beginnerMode !== next.beginnerMode ||
    prev.deskFocusMode !== next.deskFocusMode ||
    prev.deskTransitioning !== next.deskTransitioning ||
    prev.reducedMotion !== next.reducedMotion
  ) {
    return false;
  }
  if (layoutFingerprint(prev.activeLayout) !== layoutFingerprint(next.activeLayout)) return false;
  if (prev.visible.length !== next.visible.length) return false;
  for (let i = 0; i < prev.visible.length; i++) {
    if (prev.visible[i]?.id !== next.visible[i]?.id) return false;
  }
  return true;
}

function gridContainerHeight(layout: Layout[], rowHeight: number, marginY: number, padY: number): number {
  if (!layout.length) return rowHeight * 12;
  let rows = 0;
  for (const item of layout) {
    rows = Math.max(rows, item.y + item.h);
  }
  return rows * rowHeight + Math.max(0, rows - 1) * marginY + padY * 2;
}

const WorkspaceGrid = memo(function WorkspaceGrid({
  activeLayout,
  width,
  gridRowHeight,
  visible,
  maximizedId,
  beginnerMode,
  deskFocusMode,
  deskTransitioning,
  reducedMotion,
  onCommitLayout,
  onToggleMaximize,
}: WorkspaceGridProps) {
  const pauseLivePanels = useCallback(() => noteWorkspaceScroll(), []);
  const marginY = TERMINAL_LAYOUT.gridMargin[1];
  const padY = 2;
  const containerHeight = useMemo(
    () => gridContainerHeight(activeLayout, gridRowHeight, marginY, padY),
    [activeLayout, gridRowHeight, marginY],
  );

  return (
    <div
      className={deskTransitioning && !reducedMotion ? "transition-opacity duration-200" : undefined}
      style={{ opacity: deskTransitioning && !reducedMotion ? 0.35 : 1, minHeight: containerHeight }}
    >
      <GridLayout
        className="layout"
        layout={activeLayout}
        cols={12}
        rowHeight={gridRowHeight}
        width={width}
        margin={TERMINAL_LAYOUT.gridMargin}
        containerPadding={[2, 2]}
        draggableHandle=".panel-drag-handle"
        onDragStart={pauseLivePanels}
        onDrag={pauseLivePanels}
        onResizeStart={pauseLivePanels}
        onResize={pauseLivePanels}
        onDragStop={onCommitLayout}
        onResizeStop={onCommitLayout}
        compactType={null}
        isResizable={!maximizedId}
        isDraggable={!maximizedId}
        useCSSTransforms
      >
        {visible.map((panel) => (
          <div key={panel.id} className="overflow-hidden rounded-none" data-panel-id={panel.id}>
            <PanelShell
              title={beginnerMode ? beginnerPanelTitle(panel.id, panel.title) : panel.title}
              subtitle={beginnerMode ? beginnerPanelSubtitle(panel.id) : undefined}
              panelId={panel.id}
              telemetry={PANEL_TELEMETRY[panel.id] ?? "SYS"}
              dragHandleClassName="panel-drag-handle"
              maximized={maximizedId === panel.id}
              onToggleMaximize={() => onToggleMaximize(panel.id)}
            >
              <DeferredPanelContent
                panelId={panel.id}
                forceMount={maximizedId === panel.id}
                deskFocusMode={deskFocusMode}
              >
                {panel.id === "ticket" ? (
                  <TradeTicket />
                ) : panel.id === "positions" ? (
                  <PositionsTable />
                ) : (
                  widgetContent(panel.type)
                )}
              </DeferredPanelContent>
            </PanelShell>
          </div>
        ))}
      </GridLayout>
    </div>
  );
}, workspaceGridPropsEqual);

export function WorkspaceManager() {
  const widgets = useTerminalStore((s) => s.widgets);
  const removeWidget = useTerminalStore((s) => s.removeWidget);
  const deskFocusMode = useWedgeStore((s) => s.deskFocusMode);
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);
  const activeDeskId = useDeskStore((s) => s.activeDeskId);
  const deskTransitioning = useDeskStore((s) => s.transitioning);
  const [layout, setLayout] = useState<Layout[]>(initialWorkspaceLayout);
  const [maximizedId, setMaximizedId] = useState<string | null>(() => loadMaximizedPanelId());
  const [width, setWidth] = useState(1400);
  const widthMeasureRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const layoutFpRef = useRef(layoutFingerprint(initialWorkspaceLayout()));
  const { allowScrollReset } = useWorkspaceScrollAnchor(scrollRef);
  const suppressLayoutTelemetryRef = useRef(false);
  const widthRef = useRef(1400);
  const gridReadyRef = useRef(false);
  const academyPinnedPanelRef = useRef<string | null>(null);
  const academyMaximizedRef = useRef(false);

  const highlightPanelId = useOperatorGuideStore((s) => s.highlightPanelId);

  const extraPanels: WorkspaceWidget[] = useMemo(
    () => [
      { id: "ticket", type: "hyperbook", title: "TRADE TICKET" },
      { id: "positions", type: "hyperbook", title: "POSITIONS" },
      { id: "alerts", type: "alerts", title: "ALERTS" },
      { id: "teamdesk", type: "teamdesk", title: "TEAM NET" },
      { id: "diagnostics", type: "diagnostics", title: "DIAGNOSTICS" },
      { id: "alphalab", type: "alphalab", title: "ALPHA LAB" },
      { id: "infra", type: "infra", title: "PLATFORM INFRA" },
      { id: "domladder", type: "domladder", title: "DOM LADDER" },
      { id: "slippageradar", type: "slippageradar", title: "SLIPPAGE RADAR" },
      { id: "decision", type: "decision", title: "MARKET CONTEXT" },
      { id: "surveillance", type: "surveillance", title: "SURVEILLANCE" },
      { id: "knowledgegraph", type: "knowledgegraph", title: "KNOWLEDGE GRAPH" },
      { id: "traderjournal", type: "traderjournal", title: "TRADER JOURNAL" },
      { id: "research", type: "research", title: "RESEARCH" },
      { id: "dailyops", type: "dailyops", title: "DAILY OPERATIONS" },
      { id: "marketstate", type: "marketstate", title: "MARKET STATE LAYER" },
      { id: "dailybriefing", type: "dailybriefing", title: "DAILY BRIEFING ENGINE" },
      { id: "marketcoverage", type: "marketcoverage", title: "MARKET COVERAGE" },
      { id: "reliability", type: "reliability", title: "RELIABILITY" },
      { id: "newswire", type: "newswire", title: "MARKET NEWSWIRE" },
      { id: "paperblotter", type: "paperblotter", title: "PAPER BLOTTER" },
      { id: "liveblotter", type: "liveblotter", title: "LIVE BLOTTER" },
      { id: "settlementledger", type: "settlementledger", title: "SETTLEMENT" },
      { id: "screener", type: "screener", title: "MARKET SCREENER" },
      { id: "instrumentmaster", type: "instrumentmaster", title: "INSTRUMENT MASTER" },
      { id: "crossvenue", type: "crossvenue", title: "CROSS-VENUE QUOTES" },
      { id: "ingestion", type: "ingestion", title: "DATA INGEST" },
      { id: "intelengine", type: "intelengine", title: "MARKET INTELLIGENCE" },
      { id: "collab", type: "collab", title: "TEAM COLLABORATION" },
      { id: "enterpriseops", type: "enterpriseops", title: "ENTERPRISE OPS" },
      { id: "integrations", type: "integrations", title: "INDUSTRY INTEGRATIONS" },
      { id: "propintel", type: "propintel", title: "PROPRIETARY INTEL" },
      { id: "ecosystem", type: "ecosystem", title: "CRYPTO FINANCIAL OS" },
      { id: "globalstrategy", type: "globalstrategy", title: "GLOBAL INFRA STRATEGY" },
      { id: "commercial", type: "commercial", title: "PRODUCT · COMMERCIAL" },
      { id: "execintel", type: "execintel", title: "EXECUTION INTEL" },
      { id: "portfoliodesk", type: "portfoliodesk", title: "PORTFOLIO DESK" },
      { id: "derivdesk", type: "derivdesk", title: "DERIVATIVES DESK" },
      { id: "systemicintel", type: "systemicintel", title: "SYSTEMIC INTEL" },
      { id: "memorydesk", type: "memorydesk", title: "MARKET MEMORY" },
      { id: "researchdesk", type: "researchdesk", title: "RESEARCH DESK" },
      { id: "platformdesk", type: "platformdesk", title: "PLATFORM DESK" },
      { id: "mobiledesk", type: "mobiledesk", title: "MOBILE OPS" },
      { id: "opscommand", type: "opscommand", title: "OPS COMMAND" },
      { id: "billingdesk", type: "billingdesk", title: "BILLING DESK" },
      { id: "deskops", type: "deskops", title: "DESK OPS" },
      { id: "globaldesk", type: "globaldesk", title: "GLOBAL INTEL" },
      { id: "operatordesk", type: "operatordesk", title: "OPERATOR AI" },
      { id: "unifiedops", type: "unifiedops", title: "UNIFIED OPS" },
      { id: "liveexec", type: "liveexec", title: "LIVE EXEC" },
      { id: "marketcmd", type: "marketcmd", title: "MARKET CMD" },
      { id: "maturitydesk", type: "maturitydesk", title: "TERMINAL POLISH" },
      { id: "livedeploy", type: "livedeploy", title: "LIVE DEPLOY" },
      { id: "explaindesk", type: "explaindesk", title: "OPERATOR GUIDE" },
      { id: "operatorjournal", type: "operatorjournal", title: "OPERATOR JOURNAL" },
      { id: "livementor", type: "livementor", title: "LIVE MENTOR" },
      { id: "operatormode", type: "operatormode", title: "OPERATOR MODE" },
    ],
    [],
  );

  const applyAdaptiveLayout = useCallback(
    (next: Layout[], options?: { resetScroll?: boolean }) => {
      const fp = layoutFingerprint(next);
      if (fp === layoutFpRef.current) return;
      if (isWorkspaceScrolling() && !options?.resetScroll) return;
      const root = scrollRef.current;
      const savedScroll = options?.resetScroll ? 0 : (root?.scrollTop ?? 0);
      suppressLayoutTelemetryRef.current = true;
      layoutFpRef.current = fp;
      setLayout(next);
      if (root && savedScroll > 0) restoreWorkspaceScroll(root, savedScroll);
      queueMicrotask(() => {
        suppressLayoutTelemetryRef.current = false;
      });
    },
    [],
  );

  // Layout resolution priority:
  //   1. Full platform (EXPAND) always wins when desk-focus is off.
  //   2. An active specialized desk drives its own hand-tuned grid.
  //   3. Otherwise fall back to the wedge HL core layout.
  useEffect(() => {
    const setMode = useAdaptiveWorkspaceStore.getState().setMode;
    if (!deskFocusMode) {
      applyAdaptiveLayout(FULL_WORKSPACE_LAYOUT);
      setMode(FULL_WORKSPACE_DEFAULT_MODE);
      return;
    }
    if (activeDeskId) {
      applyAdaptiveLayout(useDeskStore.getState().layoutFor(activeDeskId));
      setMode(DESKS[activeDeskId].mode);
      return;
    }
    applyAdaptiveLayout(resolveWorkspaceLayout(true));
    setMode(WEDGE_DEFAULT_MODE);
  }, [deskFocusMode, activeDeskId, applyAdaptiveLayout]);

  const prevDeskScrollKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!deskFocusMode) {
      prevDeskScrollKeyRef.current = "full";
      return;
    }
    const key = activeDeskId ?? "execution";
    if (prevDeskScrollKeyRef.current === key) return;
    prevDeskScrollKeyRef.current = key;
    allowScrollReset();
    const root = scrollRef.current;
    if (root) root.scrollTo({ top: 0, behavior: "auto" });
  }, [deskFocusMode, activeDeskId, allowScrollReset]);

  useEffect(() => {
    return terminalBus.on("workspace:snapshot-restore", ({ layout: restored }) => {
      if (!restored.length) return;
      const root = scrollRef.current;
      const savedScroll = root?.scrollTop ?? 0;
      applyAdaptiveLayout(restored);
      if (root && savedScroll > 0) restoreWorkspaceScroll(root, savedScroll);
    });
  }, [applyAdaptiveLayout]);

  // PHASE 9 — clear the brief cross-fade once the new desk has mounted.
  const reducedMotion = useTerminalExperienceStore((s) => s.reducedMotion);
  useEffect(() => {
    if (!deskTransitioning) return;
    const t = window.setTimeout(
      () => useDeskStore.getState().endTransition(),
      reducedMotion ? 0 : 240,
    );
    return () => window.clearTimeout(t);
  }, [deskTransitioning, reducedMotion]);

  const allPanels = useMemo(() => {
    const base = [...widgets];
    for (const e of extraPanels) {
      if (!base.find((w) => w.id === e.id)) base.push(e);
    }
    return base.map((p) => ({
      ...p,
      title: p.title.toUpperCase(),
    }));
  }, [widgets, extraPanels]);

  useEffect(() => {
    const hidden =
      deskFocusMode
        ? Array.from(WEDGE_ADVANCED_PANEL_IDS).filter((id) => !layout.some((l) => l.i === id))
        : [];
    useAdaptiveWorkspaceStore.setState({ hiddenPanelIds: hidden, collapsedPanelIds: [] });
  }, [deskFocusMode, layout]);

  // Live academy bridges pin their target panel into the workspace (wedge mode hides museum panels by default).
  useEffect(() => {
    if (!highlightPanelId || isAcademyHeaderTarget(highlightPanelId)) {
      if (academyPinnedPanelRef.current) {
        const pinned = academyPinnedPanelRef.current;
        academyPinnedPanelRef.current = null;
        setLayout((prev) => prev.filter((item) => item.i !== pinned));
      }
      if (academyMaximizedRef.current) {
        academyMaximizedRef.current = false;
        setMaximizedId(null);
      }
      return;
    }

    setLayout((prev) => {
      if (prev.some((item) => item.i === highlightPanelId)) return prev;
      academyPinnedPanelRef.current = highlightPanelId;
      return [...prev, academyPanelPinLayout(highlightPanelId)];
    });

    setMaximizedId((prev) => (prev === highlightPanelId ? prev : highlightPanelId));
    academyMaximizedRef.current = true;

    useAdaptiveWorkspaceStore.setState((s) => ({
      hiddenPanelIds: s.hiddenPanelIds.filter((id) => id !== highlightPanelId),
    }));
  }, [highlightPanelId]);

  useEffect(() => {
    const off = terminalBus.on("widget:focus", ({ widgetId }) => {
      if (widgetId === "header-strip") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        const headerEl =
          document.getElementById("live-desk-bridge-target") ??
          document.querySelector<HTMLElement>('[data-livedesk-panel="header-strip"]');
        if (headerEl) {
          headerEl.classList.add("ring-2", "ring-cyan-500/60");
          window.setTimeout(() => {
            headerEl.classList.remove("ring-2", "ring-cyan-500/60");
          }, 1400);
        }
        return;
      }

      const pinAndHighlight = () => {
        const root = scrollRef.current;
        if (!root) return;
        const el = root.querySelector<HTMLElement>(`[data-panel-id="${widgetId}"]`);
        if (!el) return;
        const bridgeChrome = document.querySelector("[data-academy-bridge-chrome]");
        const userIsScrolling =
          isWorkspaceScrolling() || lastWorkspaceScrollWithin(2500) || root.scrollTop > 48;
        if (!bridgeChrome && !userIsScrolling) {
          const rootRect = root.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          const mostlyVisible =
            elRect.top >= rootRect.top - 32 && elRect.bottom <= rootRect.bottom + 32;
          if (!mostlyVisible) {
            el.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" });
          }
        }
        el.classList.add("ring-2", "ring-cyan-500/60", "ring-inset");
        window.setTimeout(() => {
          el.classList.remove("ring-2", "ring-cyan-500/60", "ring-inset");
        }, 1400);
        setMaximizedId((m) => (m && m !== widgetId ? null : m));
      };

      const root = scrollRef.current;
      if (!root) return;
      const el = root.querySelector<HTMLElement>(`[data-panel-id="${widgetId}"]`);
      if (!el) {
        setLayout((prev) => {
          if (prev.some((item) => item.i === widgetId)) return prev;
          return [...prev, academyPanelPinLayout(widgetId)];
        });
        useAdaptiveWorkspaceStore.setState((s) => ({
          hiddenPanelIds: s.hiddenPanelIds.filter((id) => id !== widgetId),
        }));
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(pinAndHighlight);
        });
        return;
      }
      pinAndHighlight();
    });
    return off;
  }, []);

  useEffect(() => {
    const measureNode = widthMeasureRef.current;
    const scrollNode = scrollRef.current;
    if (!measureNode || !scrollNode) return;

    const applyWidth = (w: number) => {
      const rounded = Math.round(w);
      if (rounded <= 0) return;
      if (Math.abs(rounded - widthRef.current) < 2) return;
      const savedScroll = scrollNode.scrollTop;
      widthRef.current = rounded;
      setWidth(rounded);
      if (savedScroll > 0 && !isWorkspaceScrolling()) {
        restoreWorkspaceScroll(scrollNode, savedScroll);
      }
    };

    const detachScroll = attachWorkspaceScrollRoot(scrollNode);

    const ro = new ResizeObserver((entries) => {
      applyWidth(entries[0]?.contentRect.width ?? 0);
    });
    ro.observe(measureNode);
    applyWidth(measureNode.clientWidth);
    const raf = requestAnimationFrame(() => applyWidth(measureNode.clientWidth));
    const readyTimer = window.setTimeout(() => {
      gridReadyRef.current = true;
    }, 0);
    return () => {
      detachScroll();
      cancelAnimationFrame(raf);
      window.clearTimeout(readyTimer);
      ro.disconnect();
    };
  }, []);

  /** Only commit layout on user drag/resize — onLayoutChange loops with width/compact. */
  const hiddenPanelIds = useAdaptiveWorkspaceStore((s) => s.hiddenPanelIds);
  const terminalMode = useAdaptiveWorkspaceStore((s) => s.mode);
  const density = useTerminalExperienceStore((s) => s.density);
  const gridRowHeight = DENSITY_PRESETS[density].gridRowHeight;
  const modeChrome = MODE_CHROME[terminalMode];

  const commitLayout = useCallback(
    (next: Layout[]) => {
      if (maximizedId || !gridReadyRef.current) return;
      const fp = layoutFingerprint(next);
      if (fp === layoutFpRef.current) return;
      layoutFpRef.current = fp;
      setLayout(next);
      // PHASE 8 — workspace memory: persist the user's tuned grid for the
      // active desk so it is restored on return / reload.
      if (!suppressLayoutTelemetryRef.current) {
        const desk = useDeskStore.getState();
        if (desk.activeDeskId && useWedgeStore.getState().deskFocusMode) {
          desk.saveDeskLayout(desk.activeDeskId, next);
        }
      }
      if (!suppressLayoutTelemetryRef.current) {
        useAdaptiveWorkspaceStore.getState().lockUserLayout();
      }
      if (!suppressLayoutTelemetryRef.current) {
        terminalBus.emit("workspace:layout-commit", {});
      }
      if (suppressLayoutTelemetryRef.current) return;
      telemetryPipeline.enqueue(
        useTraderTelemetryStore.getState().trackInteraction({
          kind: "layout_change",
          panelId: "workspace",
          routeParts: ["layout", "drag"],
        }),
      );
    },
    [maximizedId],
  );

  const toggleMaximize = useCallback((id: string) => {
    setMaximizedId((m) => {
      const next = m === id ? null : id;
      saveMaximizedPanelId(next);
      layoutFpRef.current = `${next ?? "restore"}:${id}:${Date.now()}`;
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
      });
      return next;
    });
  }, []);

  const closePanel = useCallback(
    (id: string) => {
      if (
        ["hyperbook", "chart", "intelligence", "copilot", "proactive", "teamdesk", "macro"].includes(
          id,
        )
      ) {
        removeWidget(id);
      }
      setLayout((l) => l.filter((item) => item.i !== id));
      setMaximizedId((m) => {
        if (m !== id) return m;
        saveMaximizedPanelId(null);
        return null;
      });
    },
    [removeWidget],
  );

  useEffect(() => {
    if (!maximizedId) return;
    if (!layout.some((item) => item.i === maximizedId)) {
      setMaximizedId(null);
      saveMaximizedPanelId(null);
    }
  }, [layout, maximizedId]);

  const maxPanelRows = useMemo(() => {
    const marginY = TERMINAL_LAYOUT.gridMargin[1];
    const chromePx = 96;
    const available =
      typeof window !== "undefined" ? Math.max(480, window.innerHeight - chromePx) : 720;
    return Math.max(22, Math.ceil(available / (gridRowHeight + marginY)));
  }, [gridRowHeight, width]);

  const activeLayout = useMemo(() => {
    if (!maximizedId) return layout;
    const item = layout.find((l) => l.i === maximizedId);
    return item ? [{ ...item, x: 0, y: 0, w: 12, h: maxPanelRows }] : layout;
  }, [layout, maximizedId, maxPanelRows]);

  const visible = useMemo(() => {
    const ids = new Set(activeLayout.map((l) => l.i));
    const hidden = new Set(hiddenPanelIds);
    const pinned = highlightPanelId && !isAcademyHeaderTarget(highlightPanelId) ? highlightPanelId : null;
    return allPanels.filter(
      (p) =>
        ids.has(p.id) &&
        (CORE_WORKSPACE_PANELS.has(p.id) || !hidden.has(p.id) || p.id === pinned),
    );
  }, [allPanels, activeLayout, hiddenPanelIds, highlightPanelId]);

  return (
    <div className={cn("flex h-screen flex-col overflow-hidden", terminalSkin.canvas)}>
      <AlphaInviteGate />
      <FirstFifteenMinutesWelcome />
      <OnboardingWalkthrough />
      <KeyboardShortcutOverlay />
      <ExplainSidePanel />
      <GuidedFocusIndicator />
      <DecisionReplayReview />
      <AcademyOverlayHost />
      <AcademyWorkflowGuide />
      <OperatorModeController />
      <ArticleReaderOverlay />
      <LiveDeskBridgeStrip />
      <LearningCommandCenter />
      <AcademySessionGuard />
      <AcademyPerformancePanel />
      <header
        className={cn(
          "flex shrink-0 items-center gap-2 border-b-[0.5px] bg-slate-950 px-1 py-0.5",
          modeChrome.border,
        )}
      >
        <div className="flex shrink-0 items-center gap-2 border-r-[0.5px] border-slate-800 pr-2">
          <span className={cn(TERMINAL_TYPO.label, beginnerMode ? "text-slate-300" : "text-[#ff9900]")}>
            {beginnerMode ? "EQ" : "EQUILIBRIUM"}
          </span>
          <span
            className={cn(TERMINAL_TYPO.micro, beginnerMode ? modeChrome.accent : "text-[#888888]")}
            title={modeChrome.label}
          >
            {deskFocusMode ? WEDGE_PRODUCT_LABEL : FULL_WORKSPACE_LABEL}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-visible">
          <OmniBar />
          <DeskSessionBar />
          {beginnerMode ? <OnboardingResumeButton /> : null}
          <LearningHubLauncher />
          {!beginnerMode ? <DailyStateStrip /> : null}
          {!beginnerMode ? <MarginCallStrip /> : null}
        </div>

        {!beginnerMode ? <WorkspaceHeaderTelemetry /> : null}

        {!beginnerMode ? (
          <AdaptiveOrchestratorBar baseLayout={layout} onApplyLayout={applyAdaptiveLayout} />
        ) : null}

        <TerminalExperienceBar />

        <WalletStatus />
      </header>

      <DeskSwitcher />

      <StreamReconnectBanner />

      <WatchlistStrip />

      <MorningTradingPathStrip />

      <OperatorModeGuidanceStrip />

      <WedgeMissionStrip />

      <div ref={widthMeasureRef} className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <WorkspaceSystems layout={layout} deskFocusMode={deskFocusMode} onAdaptiveLayout={applyAdaptiveLayout} />
        <div
          ref={scrollRef}
          data-workspace-scroll
          className="eq-workspace-scroll relative min-h-0 flex-1 p-0"
        >
        {visible.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 p-4">
            <p className={cn(TERMINAL_TYPO.label, "text-slate-400")}>NO PANELS VISIBLE</p>
            <button
              type="button"
              className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-cyan-400")}
              onClick={() => {
                applyAdaptiveLayout(
                  !deskFocusMode
                    ? FULL_WORKSPACE_LAYOUT
                    : activeDeskId
                      ? useDeskStore.getState().layoutFor(activeDeskId)
                      : resolveWorkspaceLayout(true),
                );
                useAdaptiveWorkspaceStore.setState({
                  hiddenPanelIds: [],
                  collapsedPanelIds: [],
                });
              }}
            >
              {!deskFocusMode
                ? "RESTORE FULL LAYOUT"
                : activeDeskId
                  ? `RESTORE ${DESKS[activeDeskId].label} DESK`
                  : "RESTORE DESK LAYOUT"}
            </button>
          </div>
        ) : null}
        <WorkspaceGrid
          activeLayout={activeLayout}
          width={width}
          gridRowHeight={gridRowHeight}
          visible={visible}
          maximizedId={maximizedId}
          beginnerMode={beginnerMode}
          deskFocusMode={deskFocusMode}
          deskTransitioning={deskTransitioning}
          reducedMotion={reducedMotion}
          onCommitLayout={commitLayout}
          onToggleMaximize={toggleMaximize}
        />
        </div>
      </div>
    </div>
  );
}
