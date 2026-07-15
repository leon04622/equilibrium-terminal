"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Landmark, Sunrise } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { DailyBriefingOutlookEngine } from "@/lib/daily/DailyBriefingOutlookEngine";
import { useDailyBriefingBridgeStore } from "@/store/useDailyBriefingBridgeStore";
import { useDailyBriefingLessonStore } from "@/store/useDailyBriefingLessonStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import { useExternalNewsStore } from "@/store/useExternalNewsStore";
import { DAILY_BRIEFING_BRIDGE_STEPS } from "@/lib/education/dailyBriefingBridgeSteps";

const TONE_STYLE = {
  calm: "border-emerald-700/50 bg-emerald-950/30 text-emerald-300",
  active: "border-cyan-700/50 bg-cyan-950/30 text-cyan-300",
  stressed: "border-rose-700/50 bg-rose-950/30 text-rose-300",
  mixed: "border-amber-700/50 bg-amber-950/30 text-amber-300",
};

function spotlightRegion(stepIndex: number) {
  const step = DAILY_BRIEFING_BRIDGE_STEPS[stepIndex];
  if (!step) return null;
  if (step.mode === "recognize" && step.recognize?.accept.length) {
    return step.recognize.accept[0] ?? null;
  }
  return step.region;
}

export function DailyBriefingConsole() {
  const bridgeActive = useDailyBriefingBridgeStore((s) => s.active);
  const lessonActive = useDailyBriefingLessonStore((s) => s.active);
  const bridgeStep = useDailyBriefingBridgeStore((s) => s.step);
  const highlighted = useOperatorGuideStore((s) => s.highlightPanelId === "dailybriefing");
  const academyActive = bridgeActive || lessonActive || highlighted;
  const activeRegion = academyActive ? spotlightRegion(bridgeStep) : null;
  const recognizeMode = bridgeActive && DAILY_BRIEFING_BRIDGE_STEPS[bridgeStep]?.mode === "recognize";

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 5000);
    return () => window.clearInterval(id);
  }, []);

  const ctx = useMemo(() => {
    void tick;
    return DailyBriefingOutlookEngine.build();
  }, [tick]);

  const regionClass = (id: string) =>
    cn(
      "rounded-sm transition-all duration-300",
      academyActive && "cursor-pointer",
      activeRegion === id && "ring-1 ring-amber-400/70 bg-amber-950/30",
      activeRegion === id && recognizeMode && "animate-pulse ring-2 ring-amber-300",
    );

  const { briefing, marketOutlook, riskOutlook, opportunityOutlook, guidance, recommendations } = ctx;

  const headlines = useExternalNewsStore((s) => s.headlines);
  const macroDesk = useMemo(
    () =>
      headlines
        .filter((h) => h.tier === "macro" || h.source === "FRED" || h.source === "US TREASURY")
        .slice(0, 4),
    [headlines],
  );

  return (
    <div
      data-dailybriefing-panel="dailybriefing"
      data-dailybriefing-region="panel"
      data-panel-id="dailybriefing"
      className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto p-2"
    >
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        <Sunrise className="h-3.5 w-3.5 text-amber-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-amber-200")}>DAILY BRIEFING ENGINE</span>
        <FileText className="ml-auto h-3 w-3 text-slate-600" />
      </div>

      <div data-dailybriefing-region="summary" className={cn("border border-slate-800 p-2", regionClass("summary"))}>
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>SUMMARY</p>
        <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-200")}>{briefing.headline}</p>
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {briefing.macroEventsToday} macro events · alert pressure {briefing.alertPressure.toFixed(0)}
        </p>
      </div>

      {macroDesk.length > 0 ? (
        <div
          data-dailybriefing-region="macro-desk"
          className={cn("border border-slate-800 p-2", regionClass("macro-desk"))}
        >
          <p className={cn(TERMINAL_TYPO.micro, "mb-1 flex items-center gap-1 text-slate-500")}>
            <Landmark className="h-3 w-3 text-amber-500" />
            MACRO DESK
          </p>
          {macroDesk.map((row) => (
            <p key={row.id} className={cn(TERMINAL_TYPO.micro, "border-b border-slate-800/80 py-0.5 text-slate-400 last:border-0")}>
              <span className="text-amber-600/80">{row.source}</span> · {row.headline}
            </p>
          ))}
        </div>
      ) : null}

      <div
        data-dailybriefing-region="market-outlook"
        className={cn("border px-2 py-1.5", TONE_STYLE[marketOutlook.tone], regionClass("market-outlook"))}
      >
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>MARKET OUTLOOK</p>
        <p className="font-mono text-sm font-bold uppercase">{marketOutlook.tone}</p>
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{marketOutlook.summary}</p>
      </div>

      <div data-dailybriefing-region="risk-outlook" className={cn("border border-slate-800 px-2 py-1", regionClass("risk-outlook"))}>
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>RISK OUTLOOK</p>
        <p className="font-mono text-sm font-bold uppercase text-rose-300">{riskOutlook.level}</p>
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{riskOutlook.summary}</p>
      </div>

      <div
        data-dailybriefing-region="opportunity-outlook"
        className={cn("border border-slate-800 px-2 py-1", regionClass("opportunity-outlook"))}
      >
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>OPPORTUNITY OUTLOOK</p>
        <p className="font-mono text-sm font-bold uppercase text-cyan-300">{opportunityOutlook.level}</p>
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{opportunityOutlook.summary}</p>
      </div>

      <div data-dailybriefing-region="guidance" className={cn("border border-amber-800/40 bg-amber-950/15 p-2", regionClass("guidance"))}>
        <p className={cn(TERMINAL_TYPO.micro, "text-amber-500")}>OPERATIONAL GUIDANCE</p>
        <p className={cn(TERMINAL_TYPO.micro, "text-amber-100")}>{guidance}</p>
      </div>

      <div data-dailybriefing-region="recommendations" className={cn("border border-slate-800 p-2", regionClass("recommendations"))}>
        <p className={cn(TERMINAL_TYPO.micro, "mb-1 text-slate-500")}>RECOMMENDATIONS</p>
        {recommendations.map((r) => (
          <p key={r} className={cn(TERMINAL_TYPO.micro, "border-b border-slate-800/80 py-0.5 text-slate-400 last:border-0")}>
            {r}
          </p>
        ))}
      </div>

      <div data-dailybriefing-region="bullets" className={cn("min-h-0 flex-1 overflow-y-auto border border-slate-800 p-1", regionClass("bullets"))}>
        <p className={cn(TERMINAL_TYPO.micro, "mb-1 text-slate-500")}>BRIEFING ITEMS</p>
        {briefing.bullets.slice(0, 8).map((b) => (
          <div key={b.id} className="mb-0.5 border-b border-slate-800/80 py-0.5 last:border-0">
            <span
              className={cn(
                TERMINAL_TYPO.micro,
                b.severity === "critical" ? terminalSkin.textDown : b.severity === "watch" ? terminalSkin.textWarn : "text-slate-500",
              )}
            >
              {b.category.toUpperCase()}
            </span>
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{b.headline}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
