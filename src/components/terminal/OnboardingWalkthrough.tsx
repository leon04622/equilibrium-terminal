"use client";

import { useMemo } from "react";
import { BookOpen, ClipboardList, Loader2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { CommercialOrchestrator } from "@/lib/commercial/CommercialOrchestrator";
import { OnboardingEngine } from "@/lib/commercial/OnboardingEngine";
import { warmAcademyAssets } from "@/lib/education/warmAcademyAssets";
import { armLessonVoice } from "@/lib/education/LessonNarrator";
import { useHyperliquidAuthContext } from "@/contexts/HyperliquidAuthContext";
import { terminalBus } from "@/store/eventBus";
import { useCommercialStore } from "@/store/useCommercialStore";
import { useLearningAcademyStore } from "@/store/useLearningAcademyStore";
import { useOperatorModeStore } from "@/store/useOperatorModeStore";
import type { OnboardingStepId } from "@/types/commercial-product";
import { WhatIsThisCard } from "@/components/beginner/WhatIsThisCard";
import {
  ONBOARDING_WHAT_IS,
  WHY_AM_I_DOING_THIS,
} from "@/lib/beginner/beginnerTranslation";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";

export function OnboardingWalkthrough() {
  const open = useCommercialStore((s) => s.walkthroughOpen);
  const setWalkthroughOpen = useCommercialStore((s) => s.setWalkthroughOpen);
  const snapshot = useCommercialStore((s) => s.snapshot);
  const openAcademy = useLearningAcademyStore((s) => s.open);
  const {
    isConnected,
    isConnecting,
    isAuthorized,
    authStatus,
    connectWallet,
    approveAgent,
  } = useHyperliquidAuthContext();
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);

  const steps = snapshot?.onboarding ?? OnboardingEngine.steps();
  const current = useMemo(() => steps.find((s) => !s.completed) ?? steps[steps.length - 1], [steps]);
  const pct = OnboardingEngine.completionPct();

  if (!open || !current) return null;

  const refreshSnapshot = () => {
    useCommercialStore.getState().setSnapshot(CommercialOrchestrator.snapshot());
  };

  const advance = (id: OnboardingStepId) => {
    OnboardingEngine.completeStep(id);
    refreshSnapshot();
    const nextPct = OnboardingEngine.completionPct();
    if (id === "complete" || nextPct >= 100) {
      OnboardingEngine.completeStep("complete");
      setWalkthroughOpen(false);
    }
  };

  const startOperatorMode = () => {
    useOperatorModeStore.getState().activateLite();
    terminalBus.emit("widget:focus", { widgetId: "operatormode" });
    advance("start_operator_mode");
  };

  const openLearningHub = () => {
    armLessonVoice();
    warmAcademyAssets();
    openAcademy();
    advance("start_learning");
  };

  const dismiss = () => {
    OnboardingEngine.dismiss();
    setWalkthroughOpen(false);
  };

  const isExchangeConnect = current.id === "exchange_connect";
  const isStartOperator = current.id === "start_operator_mode";
  const isStartLearning = current.id === "start_learning";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[200] flex items-end justify-center p-2 sm:items-center"
      role="dialog"
      aria-label="Onboarding"
    >
      <div
        className={cn(
          "pointer-events-auto w-full max-w-md border border-slate-700 bg-slate-950/95 shadow-2xl",
          terminalSkin.border,
          (isStartOperator || isStartLearning || isExchangeConnect) && "border-violet-700/60",
        )}
      >
        <header className={cn(terminalSkin.borderB, "flex items-center justify-between px-2 py-1")}>
          <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>
            {beginnerMode ? "GETTING STARTED" : "INSTITUTIONAL ONBOARDING"}
          </span>
          <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-500")}>{pct}%</span>
        </header>
        <div className="px-2 py-2">
          <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-200")}>{current.title}</p>
          <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-500")}>{current.detail}</p>
          {beginnerMode && WHY_AM_I_DOING_THIS[current.id] ? (
            <p className={cn(TERMINAL_TYPO.micro, "mt-2 text-emerald-400/90")}>
              Why: {WHY_AM_I_DOING_THIS[current.id]}
            </p>
          ) : null}
          {beginnerMode && current.id === "welcome" ? (
            <WhatIsThisCard conceptId="platform" className="mt-2" />
          ) : null}
          {beginnerMode && ONBOARDING_WHAT_IS[current.id] ? (
            <WhatIsThisCard conceptId={ONBOARDING_WHAT_IS[current.id]!} className="mt-2" />
          ) : null}
          {beginnerMode && isExchangeConnect && isConnected && !isAuthorized ? (
            <WhatIsThisCard conceptId="agent-1ct" className="mt-2" />
          ) : null}
          {isExchangeConnect ? (
            <p className={cn(TERMINAL_TYPO.micro, "mt-2 text-cyan-400/90")}>
              {authStatus === "agent_ready"
                ? beginnerMode
                  ? "Wallet connected and agent approved — live trading is possible. Header shows LIVE."
                  : "Wallet connected and agent approved — ready for execution."
                : isConnected && !isAuthorized
                  ? beginnerMode
                    ? "Wallet connected — approve the agent to enable live trading. Until then: READ ONLY."
                    : "Wallet connected — approve the Hyperliquid agent (1CT) to trade."
                  : beginnerMode
                    ? "Connect your wallet first. Until then the platform is read-only — no real trades."
                    : "Connect your wallet, then approve the agent for live execution."}
            </p>
          ) : null}
          {isStartOperator ? (
            <p className={cn(TERMINAL_TYPO.micro, "mt-2 text-violet-400/90")}>
              {beginnerMode
                ? "Your daily checklist — briefing, conditions, routine, live desk, then trade plan. No lessons required."
                : "Operator Mode Lite walks you through briefing → market state → ops → live desk → execution plan. No Academy required."}
            </p>
          ) : null}
          {isStartLearning ? (
            <p className={cn(TERMINAL_TYPO.micro, "mt-2 text-cyan-400/90")}>
              Optional — Academy lessons enhance Operator Mode Pro. Your daily workflow lives in Operator Mode.
            </p>
          ) : null}
          <div className="mt-2 h-0.5 bg-slate-800">
            <div className="h-full bg-cyan-600 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <footer className={cn(terminalSkin.borderT, "flex flex-wrap gap-1 p-1")}>
          {isExchangeConnect ? (
            <>
              {!isConnected ? (
                <button
                  type="button"
                  onClick={() => void connectWallet()}
                  disabled={isConnecting}
                  className={cn(
                    INSTITUTIONAL_INTERACTION.tabButton,
                    "flex flex-1 items-center justify-center gap-1.5 text-cyan-200",
                  )}
                >
                  {isConnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wallet className="h-3.5 w-3.5" />}
                  CONNECT WALLET
                </button>
              ) : !isAuthorized ? (
                <button
                  type="button"
                  onClick={() => void approveAgent()}
                  disabled={authStatus === "approving"}
                  className={cn(
                    INSTITUTIONAL_INTERACTION.tabButton,
                    "flex flex-1 items-center justify-center gap-1.5 text-amber-200",
                  )}
                >
                  {authStatus === "approving" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Wallet className="h-3.5 w-3.5" />
                  )}
                  APPROVE AGENT / 1CT
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => advance("exchange_connect")}
                  className={cn(INSTITUTIONAL_INTERACTION.tabButton, "flex-1 text-emerald-300")}
                >
                  CONTINUE
                </button>
              )}
              <button
                type="button"
                onClick={() => advance("exchange_connect")}
                className={cn(INSTITUTIONAL_INTERACTION.tabButton, "text-slate-500")}
              >
                SKIP FOR NOW
              </button>
            </>
          ) : isStartOperator ? (
            <button
              type="button"
              onClick={startOperatorMode}
              className={cn(
                INSTITUTIONAL_INTERACTION.tabButton,
                "flex flex-1 items-center justify-center gap-1.5 text-violet-200",
              )}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              START {beginnerMode ? "DAILY CHECKLIST" : "OPERATOR MODE"}
            </button>
          ) : isStartLearning ? (
            <>
              <button
                type="button"
                onClick={openLearningHub}
                className={cn(
                  INSTITUTIONAL_INTERACTION.tabButton,
                  "flex flex-1 items-center justify-center gap-1.5 text-cyan-200",
                )}
              >
                <BookOpen className="h-3.5 w-3.5" />
                OPEN ACADEMY
              </button>
              <button
                type="button"
                onClick={() => advance("start_learning")}
                className={cn(INSTITUTIONAL_INTERACTION.tabButton, "text-slate-500")}
              >
                SKIP
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => advance(current.id)}
              className={cn(INSTITUTIONAL_INTERACTION.tabButton, "flex-1 text-cyan-300")}
            >
              {current.id === "complete" ? "FINISH" : "CONTINUE"}
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className={cn(INSTITUTIONAL_INTERACTION.tabButton, "text-slate-600")}
          >
            {OnboardingEngine.shouldShowResumeHint() ? "PAUSE" : "DISMISS"}
          </button>
        </footer>
        {OnboardingEngine.shouldShowResumeHint() ? (
          <p className={cn(TERMINAL_TYPO.micro, "border-t border-slate-800 px-2 py-1 text-slate-600")}>
            Paused? Use the GUIDE button in the header to resume anytime.
          </p>
        ) : null}
      </div>
    </div>
  );
}
