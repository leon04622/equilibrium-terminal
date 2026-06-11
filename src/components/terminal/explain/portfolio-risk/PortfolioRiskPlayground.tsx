"use client";

import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import { AlertTriangle, BarChart3, Layers, PieChart, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PRVisual } from "@/lib/education/portfolioRiskScenes";

const UP = { text: "text-emerald-300", bg: "bg-emerald-500/20", border: "border-emerald-500/50" };
const DOWN = { text: "text-rose-300", bg: "bg-rose-500/20", border: "border-rose-500/50" };
const AMBER = { text: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/40" };

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-amber-950/15 to-slate-950 p-4">
      {children}
    </div>
  );
}

function WhatIsPortfolioRiskScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1200, animate, 3, sceneKey);
  return (
    <Stage>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-2">
        <div className={cn("border p-2", phase >= 2 ? AMBER.border : "border-slate-700")}>
          <p className="font-mono text-[9px] font-bold text-slate-300">TRADER A</p>
          <p className="font-mono text-[8px] text-slate-500">1 position</p>
          <Wallet className="mx-auto my-2 h-5 w-5 text-slate-500" />
          <p className="text-center font-mono text-[9px] text-slate-400">1 trade · manageable</p>
        </div>
        <div className={cn("border p-2", phase >= 3 ? DOWN.border : "border-slate-700")}>
          <p className="font-mono text-[9px] font-bold text-amber-300">TRADER B</p>
          <p className="font-mono text-[8px] text-slate-500">5 positions</p>
          <Layers className="mx-auto my-2 h-5 w-5 text-amber-400" />
          <p className={cn("text-center font-mono text-[9px]", phase >= 3 ? DOWN.text : "text-slate-400")}>
            {phase >= 3 ? "5 trades · NOT safer" : "5 trades · looks diversified"}
          </p>
        </div>
      </div>
      {phase >= 3 ? <p className="mt-2 text-center font-mono text-[9px] text-amber-300">More trades ≠ less risk</p> : null}
    </Stage>
  );
}

function CorrelationScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 3, sceneKey);
  const assets = ["BTC", "ETH", "SOL"];
  return (
    <Stage>
      <div className="flex w-full max-w-[280px] flex-col gap-2">
        <p className="text-center font-mono text-[9px] text-slate-500">Risk-off session · all moving down</p>
        <div className="flex justify-center gap-2">
          {assets.map((a, i) => (
            <div
              key={a}
              className={cn(
                "border px-2 py-1 font-mono text-[9px] transition-all duration-500",
                phase >= 2 ? DOWN.border : "border-slate-700",
                phase >= 2 ? DOWN.text : "text-slate-400",
              )}
              style={{ transform: phase >= 2 ? `translateY(${4 + i * 2}px)` : "none" }}
            >
              {a} ↓
            </div>
          ))}
        </div>
        {phase >= 3 ? (
          <p className="text-center font-mono text-[9px] text-rose-300">Correlated · losses stack together</p>
        ) : null}
      </div>
    </Stage>
  );
}

function ConcentrationScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 3, sceneKey);
  const drop = phase >= 2;
  return (
    <Stage>
      <div className="grid w-full max-w-[280px] grid-cols-2 gap-2">
        <div className={cn("border p-2", DOWN.border)}>
          <PieChart className="mx-auto h-4 w-4 text-rose-400" />
          <p className="text-center font-mono text-[9px] text-rose-300">100% BTC</p>
          <p className={cn("text-center font-mono text-sm font-bold", drop ? DOWN.text : "text-slate-500")}>
            {drop ? "-10%" : "—"}
          </p>
        </div>
        <div className={cn("border p-2", UP.border)}>
          <BarChart3 className="mx-auto h-4 w-4 text-emerald-400" />
          <p className="text-center font-mono text-[9px] text-emerald-300">BALANCED</p>
          <p className={cn("text-center font-mono text-sm font-bold", drop ? AMBER.text : "text-slate-500")}>
            {drop ? "-4%" : "—"}
          </p>
        </div>
      </div>
      {drop ? <p className="mt-2 text-center font-mono text-[9px] text-amber-300">BTC -10% · concentration hurts</p> : null}
    </Stage>
  );
}

function CapitalAllocationScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const idx = usePlaygroundLoop(3, 1300, animate, 0, sceneKey);
  const tiers = [
    { label: "SMALL", pct: "5%", note: "Experiment / low conviction", tone: UP },
    { label: "MEDIUM", pct: "15%", note: "Solid setup", tone: AMBER },
    { label: "LARGE", pct: "25%", note: "High conviction only", tone: DOWN },
  ];
  const cur = tiers[idx]!;
  return (
    <Stage>
      <div className="flex w-full max-w-[240px] flex-col items-center gap-2">
        <p className="font-mono text-[9px] text-slate-500">Capital allocation tiers</p>
        <div className={cn("w-full border p-3 transition-all duration-500", cur.tone.border, cur.tone.bg)}>
          <p className={cn("font-mono text-sm font-bold", cur.tone.text)}>{cur.label} · {cur.pct}</p>
          <p className="font-mono text-[9px] text-slate-400">{cur.note}</p>
        </div>
        <div className="flex gap-1">
          {tiers.map((t, i) => (
            <span
              key={t.label}
              className={cn("h-1.5 w-8", i === idx ? "bg-amber-400" : "bg-slate-700")}
            />
          ))}
        </div>
      </div>
    </Stage>
  );
}

function PortfolioDrawdownsScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 3, sceneKey);
  const losses = phase >= 2 ? ["BTC -3%", "ETH -4%", "SOL -5%", "ALT -6%"] : [];
  const total = phase >= 3 ? "-18% portfolio" : phase >= 2 ? "stacking…" : "—";
  return (
    <Stage>
      <div className="flex w-full max-w-[260px] flex-col gap-2">
        <TrendingDown className="mx-auto h-5 w-5 text-rose-400" />
        <div className="grid grid-cols-2 gap-1">
          {losses.map((l) => (
            <span key={l} className="border border-rose-800/40 bg-rose-950/20 px-1 py-0.5 font-mono text-[8px] text-rose-300">
              {l}
            </span>
          ))}
        </div>
        <p className={cn("text-center font-mono text-sm font-bold", phase >= 3 ? DOWN.text : "text-slate-500")}>{total}</p>
        {phase >= 3 ? <p className="text-center font-mono text-[9px] text-slate-400">Several losses · one portfolio event</p> : null}
      </div>
    </Stage>
  );
}

function HiddenRiskScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 3, sceneKey);
  const labels = ["BTC LONG", "ETH LONG", "SOL LONG", "ALT LONG"];
  return (
    <Stage>
      <div className="flex w-full max-w-[260px] flex-col gap-2">
        <p className="text-center font-mono text-[9px] text-slate-500">Looks diversified…</p>
        <div className="grid grid-cols-2 gap-1">
          {labels.map((l) => (
            <span
              key={l}
              className={cn(
                "border px-1 py-0.5 font-mono text-[8px] transition-colors",
                phase >= 2 ? "border-amber-600/50 text-amber-300" : "border-slate-700 text-slate-500",
              )}
            >
              {l}
            </span>
          ))}
        </div>
        {phase >= 3 ? (
          <>
            <AlertTriangle className="mx-auto h-4 w-4 text-amber-400" />
            <p className="text-center font-mono text-[9px] text-amber-300">All bet on crypto higher · hidden correlation</p>
          </>
        ) : null}
      </div>
    </Stage>
  );
}

function ExposureManagementScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const idx = usePlaygroundLoop(3, 1200, animate, 0, sceneKey);
  const rows = [
    { label: "SECTOR", value: "Crypto 92%", warn: true },
    { label: "MARKET", value: "Beta long", warn: true },
    { label: "DIRECTION", value: "Net long", warn: false },
  ];
  return (
    <Stage>
      <div className="w-full max-w-[240px] space-y-1">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={cn(
              "flex justify-between border px-2 py-1 font-mono text-[9px] transition-all",
              i === idx ? (r.warn ? "border-amber-600/50 bg-amber-950/20 text-amber-200" : UP.border) : "border-slate-800 text-slate-500",
            )}
          >
            <span>{r.label}</span>
            <span>{r.value}</span>
          </div>
        ))}
        <p className="pt-1 text-center font-mono text-[8px] text-slate-500">Track exposure before adding size</p>
      </div>
    </Stage>
  );
}

function RecapScene() {
  const items = ["Portfolio risk", "Concentration", "Correlation", "Exposure", "Allocation"];
  return (
    <Stage>
      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-sm font-bold text-amber-200">THINK PORTFOLIO-BY-PORTFOLIO</p>
        <div className="grid grid-cols-2 gap-1">
          {items.map((item) => (
            <span key={item} className="border border-amber-700/40 bg-amber-950/30 px-2 py-1 font-mono text-[9px] text-amber-300">
              {item}
            </span>
          ))}
        </div>
        <p className="font-mono text-[9px] text-slate-400">Not trade-by-trade</p>
      </div>
    </Stage>
  );
}

export function PortfolioRiskPlayground({
  visual,
  reduceMotion,
  sceneKey = "",
  animate: animateProp,
}: {
  visual: PRVisual;
  reduceMotion: boolean;
  sceneKey?: string;
  animate?: boolean;
}) {
  const animate = animateProp ?? !reduceMotion;
  switch (visual) {
    case "whatIsPortfolioRisk":
      return <WhatIsPortfolioRiskScene animate={animate} sceneKey={sceneKey} />;
    case "correlation":
      return <CorrelationScene animate={animate} sceneKey={sceneKey} />;
    case "concentrationRisk":
      return <ConcentrationScene animate={animate} sceneKey={sceneKey} />;
    case "capitalAllocation":
      return <CapitalAllocationScene animate={animate} sceneKey={sceneKey} />;
    case "portfolioDrawdowns":
      return <PortfolioDrawdownsScene animate={animate} sceneKey={sceneKey} />;
    case "hiddenRisk":
      return <HiddenRiskScene animate={animate} sceneKey={sceneKey} />;
    case "exposureManagement":
      return <ExposureManagementScene animate={animate} sceneKey={sceneKey} />;
    case "recap":
      return <RecapScene />;
    default:
      return null;
  }
}
