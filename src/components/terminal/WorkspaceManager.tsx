"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Layout } from "react-grid-layout";
import { HyperBook } from "@/components/terminal/widgets/HyperBook";
import { ChartWidget } from "@/components/terminal/ChartWidget";
import { MacroMatrix } from "@/components/terminal/widgets/MacroMatrix";
import { TacticalIntelligenceWire } from "@/components/terminal/widgets/TacticalIntelligenceWire";
import { AiCopilot } from "@/components/terminal/AiCopilot";
import { OmniBar } from "@/components/terminal/OmniBar";
import { PanelShell } from "@/components/terminal/PanelShell";
import { WalletStatus } from "@/components/terminal/WalletStatus";
import { TradeTicket } from "@/components/terminal/TradeTicket";
import { PositionsTable } from "@/components/terminal/PositionsTable";
import { AlertPanel } from "@/components/terminal/widgets/AlertPanel";
import { ProactiveMonitor } from "@/components/terminal/widgets/ProactiveMonitor";
import { TeamDeskGrid } from "@/components/terminal/widgets/TeamDeskGrid";
import { DiagnosticsDashboard } from "@/components/terminal/widgets/DiagnosticsDashboard";
import { AlphaLabConsole } from "@/components/terminal/widgets/AlphaLabConsole";
import { InfraDiagnostics } from "@/components/terminal/widgets/InfraDiagnostics";
import { DomLadder } from "@/components/terminal/widgets/DomLadder";
import { SlippageRadar } from "@/components/terminal/widgets/SlippageRadar";
import { DecisionCommandCenter } from "@/components/terminal/widgets/DecisionCommandCenter";
import { MarketSurveillanceMonitor } from "@/components/terminal/widgets/MarketSurveillanceMonitor";
import { KnowledgeGraphConsole } from "@/components/terminal/widgets/KnowledgeGraphConsole";
import { TraderJournalPanel } from "@/components/terminal/widgets/TraderJournalPanel";
import { ResearchWorkspacePanel } from "@/components/terminal/widgets/ResearchWorkspacePanel";
import { DailyOperatingConsole } from "@/components/terminal/widgets/DailyOperatingConsole";
import { MarketCoverageConsole } from "@/components/terminal/widgets/MarketCoverageConsole";
import { ReliabilityConsole } from "@/components/terminal/widgets/ReliabilityConsole";
import { InformationDistributionConsole } from "@/components/terminal/widgets/InformationDistributionConsole";
import { DataIngestionConsole } from "@/components/terminal/widgets/DataIngestionConsole";
import { MarketIntelligenceConsole } from "@/components/terminal/widgets/MarketIntelligenceConsole";
import { CollaborationConsole } from "@/components/terminal/widgets/CollaborationConsole";
import { EnterpriseOperationsConsole } from "@/components/terminal/widgets/EnterpriseOperationsConsole";
import { IndustryIntegrationsConsole } from "@/components/terminal/widgets/IndustryIntegrationsConsole";
import { ProprietaryIntelligenceConsole } from "@/components/terminal/widgets/ProprietaryIntelligenceConsole";
import { CryptoEcosystemConsole } from "@/components/terminal/widgets/CryptoEcosystemConsole";
import { GlobalStrategyConsole } from "@/components/terminal/widgets/GlobalStrategyConsole";
import { CommercialProductConsole } from "@/components/terminal/widgets/CommercialProductConsole";
import { ExecutionIntelligenceConsole } from "@/components/terminal/widgets/ExecutionIntelligenceConsole";
import { PortfolioDeskConsole } from "@/components/terminal/widgets/PortfolioDeskConsole";
import { DerivativesDeskConsole } from "@/components/terminal/widgets/DerivativesDeskConsole";
import { SystemicIntelligenceConsole } from "@/components/terminal/widgets/SystemicIntelligenceConsole";
import { MarketMemoryConsole } from "@/components/terminal/widgets/MarketMemoryConsole";
import { ResearchDeskConsole } from "@/components/terminal/widgets/ResearchDeskConsole";
import { PlatformDeskConsole } from "@/components/terminal/widgets/PlatformDeskConsole";
import { MobileDeskConsole } from "@/components/terminal/widgets/MobileDeskConsole";
import { OpsCommandConsole } from "@/components/terminal/widgets/OpsCommandConsole";
import { BillingDeskConsole } from "@/components/terminal/widgets/BillingDeskConsole";
import { DeskOpsConsole } from "@/components/terminal/widgets/DeskOpsConsole";
import { GlobalIntelConsole } from "@/components/terminal/widgets/GlobalIntelConsole";
import { OperatorAiConsole } from "@/components/terminal/widgets/OperatorAiConsole";
import { UnifiedOpsConsole } from "@/components/terminal/widgets/UnifiedOpsConsole";
import { LiveExecConsole } from "@/components/terminal/widgets/LiveExecConsole";
import { MarketCommandConsole } from "@/components/terminal/widgets/MarketCommandConsole";
import { ProductMaturityConsole } from "@/components/terminal/widgets/ProductMaturityConsole";
import { LiveDeploymentConsole } from "@/components/terminal/widgets/LiveDeploymentConsole";
import { ExplainDeskConsole } from "@/components/terminal/widgets/ExplainDeskConsole";
import { OperatorJournalConsole } from "@/components/terminal/widgets/OperatorJournalConsole";
import { LiveMentorConsole } from "@/components/terminal/widgets/LiveMentorConsole";
import { DecisionReplayReview } from "@/components/terminal/widgets/DecisionReplayReview";
import { ExplainSidePanel } from "@/components/terminal/explain/ExplainSidePanel";
import { GuidedFocusIndicator } from "@/components/terminal/explain/GuidedFocusIndicator";
import { CinematicOrderBookLesson } from "@/components/terminal/explain/CinematicOrderBookLesson";
import { MarketMechanicsSimulator } from "@/components/terminal/explain/MarketMechanicsSimulator";
import { LessonLiveBridge } from "@/components/terminal/explain/LessonLiveBridge";
import { FundingCrowdingSimulator } from "@/components/terminal/explain/FundingCrowdingSimulator";
import { FundingLiveBridge } from "@/components/terminal/explain/FundingLiveBridge";
import { TradeTypesSimulator } from "@/components/terminal/explain/TradeTypesSimulator";
import { TradeTypesLiveBridge } from "@/components/terminal/explain/TradeTypesLiveBridge";
import { LiquidationsSimulator } from "@/components/terminal/explain/LiquidationsSimulator";
import { LiquidationsLiveBridge } from "@/components/terminal/explain/LiquidationsLiveBridge";
import { RiskManagementSimulator } from "@/components/terminal/explain/RiskManagementSimulator";
import { RiskManagementLiveBridge } from "@/components/terminal/explain/RiskManagementLiveBridge";
import { SlippageSimulator } from "@/components/terminal/explain/SlippageSimulator";
import { SlippageLiveBridge } from "@/components/terminal/explain/SlippageLiveBridge";
import { ExecutionSimulator } from "@/components/terminal/explain/ExecutionSimulator";
import { ExecutionLiveBridge } from "@/components/terminal/explain/ExecutionLiveBridge";
import { PortfolioRiskSimulator } from "@/components/terminal/explain/PortfolioRiskSimulator";
import { PortfolioRiskLiveBridge } from "@/components/terminal/explain/PortfolioRiskLiveBridge";
import { DailyOperationsSimulator } from "@/components/terminal/explain/DailyOperationsSimulator";
import { DailyOperationsLiveBridge } from "@/components/terminal/explain/DailyOperationsLiveBridge";
import { OperatorJournalSimulator } from "@/components/terminal/explain/OperatorJournalSimulator";
import { OperatorJournalLiveBridge } from "@/components/terminal/explain/OperatorJournalLiveBridge";
import { LiveDeskSimulator } from "@/components/terminal/explain/LiveDeskSimulator";
import { LiveDeskLiveBridge } from "@/components/terminal/explain/LiveDeskLiveBridge";
import { LearningHubLauncher } from "@/components/terminal/explain/LearningHubLauncher";
import { LearningCommandCenter } from "@/components/terminal/explain/LearningCommandCenter";
import { AcademySessionGuard } from "@/components/terminal/explain/AcademySessionGuard";
import { AcademyPerformancePanel } from "@/components/terminal/explain/AcademyPerformancePanel";
import { AlphaInviteGate } from "@/components/terminal/AlphaInviteGate";
import { OnboardingWalkthrough } from "@/components/terminal/OnboardingWalkthrough";
import { DailyStateStrip } from "@/components/terminal/DailyStateStrip";
import { AdaptiveOrchestratorBar } from "@/components/terminal/AdaptiveOrchestratorBar";
import { TerminalExperienceBar } from "@/components/terminal/TerminalExperienceBar";
import { WedgeMissionStrip } from "@/components/terminal/WedgeMissionStrip";
import { DeskSwitcher } from "@/components/terminal/DeskSwitcher";
import { WorkspaceSystems } from "@/components/terminal/WorkspaceSystems";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { layoutFingerprint, layoutsEqual } from "@/lib/telemetry/layoutUtils";
import { telemetryPipeline } from "@/lib/telemetry/TelemetryPipeline";
import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";
import { TERMINAL_LAYOUT, terminalSkin, TERMINAL_TYPO, DENSITY_PRESETS, MODE_CHROME, TRUST_SIGNAL, type PanelStatus } from "@/lib/theme";
import { resolvePanelEmphasis } from "@/lib/theme/equilibrium-visual";
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
  marketcoverage: "COVERAGE",
  reliability: "RELIABILITY",
  newswire: "NEWSWIRE",
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
};

function widgetContent(type: WidgetType) {
  switch (type) {
    case "hyperbook":
      return <HyperBook />;
    case "chart":
      return <ChartWidget />;
    case "intelligence":
      return <TacticalIntelligenceWire />;
    case "macro":
      return <MacroMatrix />;
    case "copilot":
      return <AiCopilot />;
    case "alerts":
      return <AlertPanel />;
    case "proactive":
      return <ProactiveMonitor />;
    case "teamdesk":
      return <TeamDeskGrid />;
    case "diagnostics":
      return <DiagnosticsDashboard />;
    case "alphalab":
      return <AlphaLabConsole />;
    case "infra":
      return <InfraDiagnostics />;
    case "domladder":
      return <DomLadder />;
    case "slippageradar":
      return <SlippageRadar />;
    case "decision":
      return <DecisionCommandCenter />;
    case "surveillance":
      return <MarketSurveillanceMonitor />;
    case "knowledgegraph":
      return <KnowledgeGraphConsole />;
    case "traderjournal":
      return <TraderJournalPanel />;
    case "research":
      return <ResearchWorkspacePanel />;
    case "dailyops":
      return <DailyOperatingConsole />;
    case "marketcoverage":
      return <MarketCoverageConsole />;
    case "reliability":
      return <ReliabilityConsole />;
    case "newswire":
      return <InformationDistributionConsole />;
    case "ingestion":
      return <DataIngestionConsole />;
    case "intelengine":
      return <MarketIntelligenceConsole />;
    case "collab":
      return <CollaborationConsole />;
    case "enterpriseops":
      return <EnterpriseOperationsConsole />;
    case "integrations":
      return <IndustryIntegrationsConsole />;
    case "propintel":
      return <ProprietaryIntelligenceConsole />;
    case "ecosystem":
      return <CryptoEcosystemConsole />;
    case "globalstrategy":
      return <GlobalStrategyConsole />;
    case "commercial":
      return <CommercialProductConsole />;
    case "execintel":
      return <ExecutionIntelligenceConsole />;
    case "portfoliodesk":
      return <PortfolioDeskConsole />;
    case "derivdesk":
      return <DerivativesDeskConsole />;
    case "systemicintel":
      return <SystemicIntelligenceConsole />;
    case "memorydesk":
      return <MarketMemoryConsole />;
    case "researchdesk":
      return <ResearchDeskConsole />;
    case "platformdesk":
      return <PlatformDeskConsole />;
    case "mobiledesk":
      return <MobileDeskConsole />;
    case "opscommand":
      return <OpsCommandConsole />;
    case "billingdesk":
      return <BillingDeskConsole />;
    case "deskops":
      return <DeskOpsConsole />;
    case "globaldesk":
      return <GlobalIntelConsole />;
    case "operatordesk":
      return <OperatorAiConsole />;
    case "unifiedops":
      return <UnifiedOpsConsole />;
    case "liveexec":
      return <LiveExecConsole />;
    case "marketcmd":
      return <MarketCommandConsole />;
    case "maturitydesk":
      return <ProductMaturityConsole />;
    case "livedeploy":
      return <LiveDeploymentConsole />;
    case "explaindesk":
      return <ExplainDeskConsole />;
    case "operatorjournal":
      return <OperatorJournalConsole />;
    case "livementor":
      return <LiveMentorConsole />;
    default:
      return null;
  }
}

function formatLatency(lastMessageAt: number | null): string {
  if (!lastMessageAt) return "LAT —";
  const ms = Date.now() - lastMessageAt;
  if (ms < 1000) return `LAT ${ms}ms`;
  return `LAT ${(ms / 1000).toFixed(1)}s`;
}

function panelStatus(panelId: string, connectionStatus: string): PanelStatus {
  const streamPanels = new Set(["hyperbook", "chart", "intelligence", "ticket", "macro"]);
  if (!streamPanels.has(panelId)) return "idle";
  if (connectionStatus === "connected") return "live";
  if (connectionStatus === "reconnecting") return "watch";
  return "offline";
}

function trustLabel(connectionStatus: string): string {
  if (connectionStatus === "connected") return TRUST_SIGNAL.stable;
  if (connectionStatus === "reconnecting") return TRUST_SIGNAL.degraded;
  return TRUST_SIGNAL.critical;
}

export function WorkspaceManager() {
  const widgets = useTerminalStore((s) => s.widgets);
  const removeWidget = useTerminalStore((s) => s.removeWidget);
  const selectedAsset = useTerminalStore((s) => s.selectedAsset);
  const connectionStatus = useTerminalStore((s) => s.connectionStatus);
  const lastMessageAt = useTerminalStore((s) => s.lastMessageAt);
  const deskFocusMode = useWedgeStore((s) => s.deskFocusMode);
  const activeDeskId = useDeskStore((s) => s.activeDeskId);
  const deskTransitioning = useDeskStore((s) => s.transitioning);
  const [layout, setLayout] = useState<Layout[]>(initialWorkspaceLayout);
  const [maximizedId, setMaximizedId] = useState<string | null>(null);
  const [width, setWidth] = useState(1400);
  const [clock, setClock] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutFpRef = useRef(layoutFingerprint(initialWorkspaceLayout()));
  const suppressLayoutTelemetryRef = useRef(false);
  const widthRef = useRef(1400);
  const gridReadyRef = useRef(false);

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
      { id: "marketcoverage", type: "marketcoverage", title: "MARKET COVERAGE" },
      { id: "reliability", type: "reliability", title: "RELIABILITY" },
      { id: "newswire", type: "newswire", title: "MARKET NEWSWIRE" },
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
    ],
    [],
  );

  const applyAdaptiveLayout = useCallback((next: Layout[]) => {
    if (layoutsEqual(next, layout)) return;
    const fp = layoutFingerprint(next);
    if (fp === layoutFpRef.current) return;
    suppressLayoutTelemetryRef.current = true;
    layoutFpRef.current = fp;
    setLayout(next);
    queueMicrotask(() => {
      suppressLayoutTelemetryRef.current = false;
    });
  }, [layout]);

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
    const tick = () => {
      const d = new Date();
      setClock(
        d.toISOString().slice(11, 23),
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const hidden =
      deskFocusMode
        ? Array.from(WEDGE_ADVANCED_PANEL_IDS).filter((id) => !layout.some((l) => l.i === id))
        : [];
    useAdaptiveWorkspaceStore.setState({ hiddenPanelIds: hidden, collapsedPanelIds: [] });
  }, [deskFocusMode, layout]);

  useEffect(() => {
    const off = terminalBus.on("widget:focus", ({ widgetId }) => {
      const root = containerRef.current;
      if (!root) return;
      const el = root.querySelector<HTMLElement>(`[data-panel-id="${widgetId}"]`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-cyan-500/60", "ring-inset");
      window.setTimeout(() => {
        el.classList.remove("ring-2", "ring-cyan-500/60", "ring-inset");
      }, 1400);
      setMaximizedId((m) => (m && m !== widgetId ? null : m));
    });
    return off;
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const applyWidth = (w: number) => {
      if (w > 0 && w !== widthRef.current) {
        widthRef.current = w;
        setWidth(w);
      }
    };
    const ro = new ResizeObserver((entries) => {
      applyWidth(Math.round(entries[0]?.contentRect.width ?? 0));
    });
    ro.observe(node);
    applyWidth(Math.round(node.clientWidth));
    const raf = requestAnimationFrame(() => applyWidth(Math.round(node.clientWidth)));
    const readyTimer = window.setTimeout(() => {
      gridReadyRef.current = true;
    }, 0);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(readyTimer);
      ro.disconnect();
    };
  }, []);

  /** Only commit layout on user drag/resize — onLayoutChange loops with width/compact. */
  const panelEmphasis = useAdaptiveWorkspaceStore((s) => s.panelEmphasis);
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
    setMaximizedId((m) => (m === id ? null : id));
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
    },
    [removeWidget],
  );

  const activeLayout = useMemo(() => {
    if (!maximizedId) return layout;
    const item = layout.find((l) => l.i === maximizedId);
    return item ? [{ ...item, x: 0, y: 0, w: 12, h: 24 }] : layout;
  }, [layout, maximizedId]);

  const visible = useMemo(() => {
    const ids = new Set(activeLayout.map((l) => l.i));
    const hidden = new Set(hiddenPanelIds);
    return allPanels.filter(
      (p) => ids.has(p.id) && (CORE_WORKSPACE_PANELS.has(p.id) || !hidden.has(p.id)),
    );
  }, [allPanels, activeLayout, hiddenPanelIds]);

  const streamColor =
    connectionStatus === "connected"
      ? terminalSkin.textUp
      : connectionStatus === "reconnecting"
        ? terminalSkin.textWarn
        : terminalSkin.textDown;

  return (
    <div className={cn("flex h-screen flex-col overflow-hidden", terminalSkin.canvas)}>
      <AlphaInviteGate />
      <OnboardingWalkthrough />
      <ExplainSidePanel />
      <GuidedFocusIndicator />
      <DecisionReplayReview />
      <MarketMechanicsSimulator />
      <CinematicOrderBookLesson />
      <LessonLiveBridge />
      <FundingCrowdingSimulator />
      <FundingLiveBridge />
      <TradeTypesSimulator />
      <TradeTypesLiveBridge />
      <LiquidationsSimulator />
      <LiquidationsLiveBridge />
      <RiskManagementSimulator />
      <RiskManagementLiveBridge />
      <SlippageSimulator />
      <SlippageLiveBridge />
      <ExecutionSimulator />
      <ExecutionLiveBridge />
      <PortfolioRiskSimulator />
      <PortfolioRiskLiveBridge />
      <DailyOperationsSimulator />
      <DailyOperationsLiveBridge />
      <OperatorJournalSimulator />
      <OperatorJournalLiveBridge />
      <LiveDeskSimulator />
      <LiveDeskLiveBridge />
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
          <span className={cn(TERMINAL_TYPO.label, "text-slate-300")}>EQ</span>
          <span className={cn(TERMINAL_TYPO.micro, modeChrome.accent)} title={modeChrome.label}>
            {deskFocusMode ? WEDGE_PRODUCT_LABEL : FULL_WORKSPACE_LABEL}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-visible">
          <OmniBar />
          <LearningHubLauncher />
          <DailyStateStrip />
        </div>

        <div
          className={cn(
            "hidden shrink-0 items-center gap-2 border-l-[0.5px] border-slate-800 pl-2 font-mono sm:flex",
            TERMINAL_TYPO.micro,
          )}
        >
          <span className="text-slate-500">UTC</span>
          <span className="tabular-nums text-slate-300">{clock}</span>
          <span className="text-slate-600">|</span>
          <span className={streamColor}>{connectionStatus.toUpperCase()}</span>
          <span className="text-slate-600">|</span>
          <span className={cn(TERMINAL_TYPO.micro, streamColor === terminalSkin.textUp ? "text-slate-500" : streamColor)}>
            {trustLabel(connectionStatus)}
          </span>
          <span className="text-slate-600">|</span>
          <span className="tabular-nums text-slate-500">{formatLatency(lastMessageAt)}</span>
          <span className="text-slate-600">|</span>
          <span className={terminalSkin.textUp}>
            {selectedAsset?.symbol ?? "—"}
          </span>
        </div>

        <AdaptiveOrchestratorBar baseLayout={layout} onApplyLayout={applyAdaptiveLayout} />

        <TerminalExperienceBar />

        <WalletStatus />
      </header>

      <DeskSwitcher />

      <WedgeMissionStrip />

      <div ref={containerRef} className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-0">
        <WorkspaceSystems layout={layout} onAdaptiveLayout={applyAdaptiveLayout} />
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
        <div
          className="transition-opacity duration-200"
          style={{ opacity: deskTransitioning && !reducedMotion ? 0.35 : 1 }}
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
          onDragStop={commitLayout}
          onResizeStop={commitLayout}
          compactType="vertical"
          isResizable={!maximizedId}
          isDraggable={!maximizedId}
        >
          {visible.map((panel) => (
            <div
              key={panel.id}
              className="overflow-hidden rounded-none"
              data-panel-id={panel.id}
            >
              <PanelShell
                title={panel.title}
                subtitle={selectedAsset?.symbol}
                panelId={panel.id}
                telemetry={PANEL_TELEMETRY[panel.id] ?? "SYS"}
                emphasis={resolvePanelEmphasis(panel.id, panelEmphasis[panel.id])}
                status={panelStatus(panel.id, connectionStatus)}
                loading={
                  connectionStatus !== "connected" &&
                  ["hyperbook", "chart", "intelligence", "macro"].includes(panel.id)
                }
                dragHandleClassName="panel-drag-handle"
                maximized={maximizedId === panel.id}
                onToggleMaximize={() => toggleMaximize(panel.id)}
              >
                {panel.id === "ticket" ? (
                  <TradeTicket />
                ) : panel.id === "positions" ? (
                  <PositionsTable />
                ) : (
                  widgetContent(panel.type)
                )}
              </PanelShell>
            </div>
          ))}
        </GridLayout>
        </div>
      </div>
    </div>
  );
}
