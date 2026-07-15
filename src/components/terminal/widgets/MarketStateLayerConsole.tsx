"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import {
  MarketStateClassificationEngine,
  type DeskStateLabel,
} from "@/lib/daily/MarketStateClassificationEngine";
import { MarketStateHistoryEngine } from "@/lib/daily/MarketStateHistoryEngine";
import { useMarketStateBridgeStore } from "@/store/useMarketStateBridgeStore";
import { useMarketStateLessonStore } from "@/store/useMarketStateLessonStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import { MARKET_STATE_BRIDGE_STEPS } from "@/lib/education/marketStateBridgeSteps";

const STATE_STYLE: Record<DeskStateLabel, string> = {
  CALM: "border-emerald-700/50 bg-emerald-950/30 text-emerald-300",
  ACTIVE: "border-cyan-700/50 bg-cyan-950/30 text-cyan-300",
  THIN: "border-amber-700/50 bg-amber-950/30 text-amber-300",
  STRESS: "border-rose-700/50 bg-rose-950/30 text-rose-300",
};

function spotlightRegion(stepIndex: number) {
  const step = MARKET_STATE_BRIDGE_STEPS[stepIndex];
  if (!step) return null;
  if (step.mode === "recognize" && step.recognize?.accept.length) {
    return step.recognize.accept[0] ?? null;
  }
  return step.region;
}

export function MarketStateLayerConsole() {
  const bridgeActive = useMarketStateBridgeStore((s) => s.active);
  const lessonActive = useMarketStateLessonStore((s) => s.active);
  const bridgeStep = useMarketStateBridgeStore((s) => s.step);
  const highlighted = useOperatorGuideStore((s) => s.highlightPanelId === "marketstate");
  const academyActive = bridgeActive || lessonActive || highlighted;
  const activeRegion = academyActive ? spotlightRegion(bridgeStep) : null;
  const recognizeMode = bridgeActive && MARKET_STATE_BRIDGE_STEPS[bridgeStep]?.mode === "recognize";

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 4000);
    return () => window.clearInterval(id);
  }, []);

  const ctx = useMemo(() => {
    void tick;
    const c = MarketStateClassificationEngine.classify();
    MarketStateHistoryEngine.record(c.deskState, c.confidence);
    const history = MarketStateHistoryEngine.recent(6);
    return { c, history };
  }, [tick]);

  const regionClass = (id: string) =>
    cn(
      "rounded-sm transition-all duration-300",
      academyActive && "cursor-pointer",
      activeRegion === id && "ring-1 ring-violet-400/70 bg-violet-950/30",
      activeRegion === id && recognizeMode && "animate-pulse ring-2 ring-violet-300",
    );

  return (
    <div
      data-marketstate-panel="marketstate"
      data-marketstate-region="panel"
      data-panel-id="marketstate"
      className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto p-2"
    >
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        <Layers className="h-3.5 w-3.5 text-violet-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-violet-200")}>MARKET STATE LAYER</span>
        <Activity className="ml-auto h-3 w-3 text-slate-600" />
      </div>

      <div
        data-marketstate-region="classification"
        className={cn("border px-2 py-1.5", STATE_STYLE[ctx.c.deskState], regionClass("classification"))}
      >
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>CLASSIFICATION</p>
        <p data-marketstate-region="desk-state" className={cn("font-mono text-sm font-bold", regionClass("desk-state"))}>
          {ctx.c.deskState}
        </p>
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{ctx.c.deskTone}</p>
      </div>

      <div data-marketstate-region="confidence" className={cn("border border-slate-800 px-2 py-1", regionClass("confidence"))}>
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>CONFIDENCE</p>
        <p className="font-mono text-lg tabular-nums text-violet-300">{ctx.c.confidence}%</p>
      </div>

      <div data-marketstate-region="signals" className={cn("space-y-0.5 border border-slate-800 p-2", regionClass("signals"))}>
        <p className={cn(TERMINAL_TYPO.micro, "mb-1 text-slate-500")}>SUPPORTING SIGNALS</p>
        {ctx.c.supportingSignals.map((s) => (
          <div
            key={s.id}
            data-marketstate-region={s.id === "vol" ? "volatility" : s.id === "liq" ? "liquidity" : undefined}
            className={cn(
              "flex justify-between gap-2 border-b border-slate-800/80 py-0.5 font-mono text-[10px] last:border-0",
              s.id === "vol" && regionClass("volatility"),
              s.id === "liq" && regionClass("liquidity"),
            )}
          >
            <span className="text-slate-500">{s.label}</span>
            <span className="text-slate-300">{s.value}</span>
          </div>
        ))}
      </div>

      <p data-marketstate-region="composite" className={cn(TERMINAL_TYPO.micro, terminalSkin.textAi, regionClass("composite"))}>
        {ctx.c.layer.compositeLabel}
      </p>

      <div data-marketstate-region="history" className={cn("border border-slate-800 p-2", regionClass("history"))}>
        <p className={cn(TERMINAL_TYPO.micro, "mb-1 text-slate-500")}>STATE HISTORY</p>
        {ctx.history.length === 0 ? (
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Transitions log as conditions evolve.</p>
        ) : (
          ctx.history.map((h) => (
            <div key={h.at} className="flex justify-between gap-2 border-b border-slate-800/80 py-0.5 font-mono text-[10px] last:border-0">
              <span className="text-slate-400">
                {h.from ? `${h.from} → ${h.state}` : h.state}
              </span>
              <span className="text-slate-600">{new Date(h.at).toLocaleTimeString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
