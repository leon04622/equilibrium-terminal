"use client";

import { cn } from "@/lib/utils";
import { DENSITY_PRESETS, type TerminalDensity } from "@/lib/theme/institutional";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import { useWedgeStore } from "@/store/useWedgeStore";
import { RuntimePerformanceStrip } from "@/components/terminal/RuntimePerformanceStrip";
import { resolveDeploymentEnvironment } from "@/config/environments";
import { useCommercialStore } from "@/store/useCommercialStore";
import { useAlphaStore } from "@/store/useAlphaStore";
import { useExecutionAnalyticsStore } from "@/store/useExecutionAnalyticsStore";
import { usePortfolioDeskStore } from "@/store/usePortfolioDeskStore";
import { useDerivativesDeskStore } from "@/store/useDerivativesDeskStore";
import { useSystemicIntelligenceStore } from "@/store/useSystemicIntelligenceStore";
import { useMarketMemoryStore } from "@/store/useMarketMemoryStore";
import { useResearchDeskStore } from "@/store/useResearchDeskStore";
import { usePlatformDeskStore } from "@/store/usePlatformDeskStore";
import { useMobileDeskStore } from "@/store/useMobileDeskStore";
import { useOpsCommandStore } from "@/store/useOpsCommandStore";
import { useBillingDeskStore } from "@/store/useBillingDeskStore";
import { useDeskOpsStore } from "@/store/useDeskOpsStore";
import { useGlobalIntelStore } from "@/store/useGlobalIntelStore";
import { useOperatorAiStore } from "@/store/useOperatorAiStore";
import { useUnifiedOpsStore } from "@/store/useUnifiedOpsStore";
import { useLiveExecStore } from "@/store/useLiveExecStore";
import { useMarketCommandStore } from "@/store/useMarketCommandStore";
import { useProductMaturityStore } from "@/store/useProductMaturityStore";
import { useLiveDeploymentStore } from "@/store/useLiveDeploymentStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import { useHardeningStore } from "@/store/useHardeningStore";
import { useDevOpsStore } from "@/store/useDevOpsStore";
import { terminalBus } from "@/store/eventBus";

const DENSITIES: TerminalDensity[] = ["compact", "standard", "comfortable"];

export function TerminalExperienceBar() {
  const density = useTerminalExperienceStore((s) => s.density);
  const calmMode = useTerminalExperienceStore((s) => s.calmMode);
  const reducedMotion = useTerminalExperienceStore((s) => s.reducedMotion);
  const setDensity = useTerminalExperienceStore((s) => s.setDensity);
  const setCalmMode = useTerminalExperienceStore((s) => s.setCalmMode);
  const setReducedMotion = useTerminalExperienceStore((s) => s.setReducedMotion);
  const deskFocusMode = useWedgeStore((s) => s.deskFocusMode);
  const toggleDeskFocusMode = useWedgeStore((s) => s.toggleDeskFocusMode);
  const opsScore = useDevOpsStore((s) => s.snapshot?.operationalScore);
  const readyScore = useCommercialStore((s) => s.snapshot?.marketReadinessScore);
  const launchScore = useHardeningStore((s) => s.snapshot?.launchReadinessScore);
  const alphaScore = useAlphaStore((s) => s.snapshot?.operationalScore);
  const execScore = useExecutionAnalyticsStore((s) => s.snapshot?.analyticsScore);
  const portfolioScore = usePortfolioDeskStore((s) => s.snapshot?.portfolioHealthScore);
  const derivScore = useDerivativesDeskStore((s) => s.snapshot?.derivativesScore);
  const systemicScore = useSystemicIntelligenceStore((s) => s.snapshot?.systemicScore);
  const memoryScore = useMarketMemoryStore((s) => s.snapshot?.memoryScore);
  const researchScore = useResearchDeskStore((s) => s.snapshot?.researchScore);
  const platformScore = usePlatformDeskStore((s) => s.snapshot?.platformScore);
  const awarenessScore = useMobileDeskStore((s) => s.snapshot?.awarenessScore);
  const controlScore = useOpsCommandStore((s) => s.snapshot?.controlScore);
  const billingScore = useBillingDeskStore((s) => s.snapshot?.commercialScore);
  const orgScore = useDeskOpsStore((s) => s.snapshot?.orgScore);
  const globalScore = useGlobalIntelStore((s) => s.snapshot?.globalScore);
  const assistantScore = useOperatorAiStore((s) => s.snapshot?.assistantScore);
  const unifiedScore = useUnifiedOpsStore((s) => s.snapshot?.unifiedScore);
  const liveExecScore = useLiveExecStore((s) => s.snapshot?.liveExecScore);
  const situationalScore = useMarketCommandStore((s) => s.snapshot?.situationalScore);
  const polishScore = useProductMaturityStore((s) => s.snapshot?.polishScore);
  const deploymentScore = useLiveDeploymentStore((s) => s.snapshot?.deploymentScore);
  const guideScore = useOperatorGuideStore((s) => s.snapshot?.guideScore);
  const explainModeActive = useOperatorGuideStore((s) => s.explainModeActive);
  const toggleExplainMode = useOperatorGuideStore((s) => s.toggleExplainMode);
  const envLabel = resolveDeploymentEnvironment().toUpperCase().slice(0, 4);

  return (
    <div className="flex shrink-0 items-center gap-1 border-l border-slate-800 pl-2">
      <button
        type="button"
        onClick={() => toggleDeskFocusMode()}
        className={cn(
          TERMINAL_TYPO.micro,
          "px-1 py-0.5",
          deskFocusMode ? "text-cyan-500" : "text-slate-600 hover:text-slate-400",
        )}
        title={
          deskFocusMode
            ? "V1 wedge active — open full workspace (all phases / dev panels)"
            : "Return to V1 Hyperliquid execution desk"
        }
      >
        {deskFocusMode ? "EXPAND" : "DESK"}
      </button>
      <button
        type="button"
        onClick={() => terminalBus.emit("widget:focus", { widgetId: "chart" })}
        className={cn(TERMINAL_TYPO.micro, "hidden px-1 py-0.5 text-slate-600 hover:text-slate-400 md:inline")}
        title="Scroll to chart"
      >
        CHART
      </button>
      <button
        type="button"
        onClick={() => {
          toggleExplainMode();
          terminalBus.emit("guide:explain-toggle", {
            active: !explainModeActive,
          });
        }}
        className={cn(
          TERMINAL_TYPO.micro,
          "px-1 py-0.5",
          explainModeActive ? "text-cyan-500" : "text-slate-600 hover:text-slate-400",
        )}
        title="Explain mode — click panels for operational guidance (?)"
      >
        EXPLAIN
      </button>
      <select
        value={density}
        onChange={(e) => setDensity(e.target.value as TerminalDensity)}
        className={cn(TERMINAL_TYPO.micro, "max-w-[5.5rem] border-0 bg-transparent py-0 text-slate-500 outline-none")}
        title="Panel density"
      >
        {DENSITIES.map((d) => (
          <option key={d} value={d}>
            {DENSITY_PRESETS[d].label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setCalmMode(!calmMode)}
        className={cn(
          TERMINAL_TYPO.micro,
          "px-1 py-0.5",
          calmMode ? "text-cyan-500" : "text-slate-600 hover:text-slate-400",
        )}
        title="Calm mode — suppress aggressive flashes"
      >
        CALM
      </button>
      <span
        className={cn(
          TERMINAL_TYPO.micro,
          "hidden px-1 text-slate-600 lg:inline",
          opsScore !== undefined && opsScore < 80 ? terminalSkin.textWarn : "",
        )}
        title="Operational score"
      >
        {envLabel}
        {opsScore !== undefined ? `·${opsScore}` : ""}
        {readyScore !== undefined ? `·R${readyScore}` : ""}
        {launchScore !== undefined ? `·L${launchScore}` : ""}
        {alphaScore !== undefined ? `·A${alphaScore}` : ""}
        {execScore !== undefined ? `·X${execScore}` : ""}
        {portfolioScore !== undefined ? `·P${portfolioScore}` : ""}
        {derivScore !== undefined ? `·V${derivScore}` : ""}
        {systemicScore !== undefined ? `·K${systemicScore}` : ""}
        {memoryScore !== undefined ? `·H${memoryScore}` : ""}
        {researchScore !== undefined ? `·J${researchScore}` : ""}
        {platformScore !== undefined ? `·E${platformScore}` : ""}
        {awarenessScore !== undefined ? `·M${awarenessScore}` : ""}
        {controlScore !== undefined ? `·C${controlScore}` : ""}
        {billingScore !== undefined ? `·B${billingScore}` : ""}
        {orgScore !== undefined ? `·D${orgScore}` : ""}
        {globalScore !== undefined ? `·G${globalScore}` : ""}
        {assistantScore !== undefined ? `·O${assistantScore}` : ""}
        {unifiedScore !== undefined ? `·U${unifiedScore}` : ""}
        {liveExecScore !== undefined ? `·F${liveExecScore}` : ""}
        {situationalScore !== undefined ? `·S${situationalScore}` : ""}
        {polishScore !== undefined ? `·T${polishScore}` : ""}
        {deploymentScore !== undefined ? `·N${deploymentScore}` : ""}
        {guideScore !== undefined ? `·W${guideScore}` : ""}
      </span>
      <RuntimePerformanceStrip />
      <button
        type="button"
        onClick={() => setReducedMotion(!reducedMotion)}
        className={cn(
          TERMINAL_TYPO.micro,
          "hidden px-1 py-0.5 sm:inline",
          reducedMotion ? "text-cyan-500" : "text-slate-600 hover:text-slate-400",
        )}
        title="Reduced motion"
      >
        MOTION
      </button>
    </div>
  );
}
