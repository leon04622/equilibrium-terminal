"use client";


import { usePlaygroundLoop } from "@/lib/education/usePlaygroundLoop";
import { AlertTriangle, Shield, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RMVisual } from "@/lib/education/riskManagementScenes";

const UP = { text: "text-emerald-300", bg: "bg-emerald-500/20", border: "border-emerald-500/50" };
const DOWN = { text: "text-rose-300", bg: "bg-rose-500/20", border: "border-rose-500/50" };
const AMBER = { text: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/40" };
const VIOLET = { text: "text-violet-300", bg: "bg-violet-500/15", border: "border-violet-500/40" };

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-emerald-950/15 to-slate-950 p-4">
      {children}
    </div>
  );
}

function WhyTradersFailScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(5, 1200, animate, 4, sceneKey);
  const aEquity = Math.max(20, 100 - (phase >= 2 ? (phase - 1) * 22 : 0));
  const bEquity = 100 - (phase >= 1 ? Math.min(phase, 3) * 3 : 0) + (phase >= 3 ? (phase - 2) * 4 : 0);
  return (
    <Stage>
      <div className="grid w-full max-w-[300px] grid-cols-2 gap-2">
        <div className={cn("border p-2", phase >= 2 ? DOWN.border : "border-slate-700")}>
          <p className="font-mono text-[9px] font-bold text-rose-300">TRADER A</p>
          <p className="font-mono text-[8px] text-slate-500">70% win rate · 8% risk</p>
          <div className="mt-2 h-16 border border-slate-800 bg-slate-900/50 relative">
            <div
              className={cn("absolute bottom-0 left-0 right-0 transition-all duration-700", phase >= 2 ? "bg-rose-500/40" : "bg-emerald-500/30")}
              style={{ height: `${aEquity}%` }}
            />
          </div>
          <p className={cn("mt-1 text-center font-mono text-[9px]", phase >= 3 ? DOWN.text : UP.text)}>
            {phase >= 3 ? "BLOWN UP" : `£${(aEquity * 100).toFixed(0)}`}
          </p>
        </div>
        <div className={cn("border p-2", UP.border)}>
          <p className="font-mono text-[9px] font-bold text-emerald-300">TRADER B</p>
          <p className="font-mono text-[8px] text-slate-500">45% win rate · 1.5% risk</p>
          <div className="mt-2 h-16 border border-slate-800 bg-slate-900/50 relative">
            <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/30 transition-all duration-700" style={{ height: `${Math.min(bEquity, 105)}%` }} />
          </div>
          <p className={cn("mt-1 text-center font-mono text-[9px]", UP.text)}>£{(Math.min(bEquity, 105) * 100).toFixed(0)} · STILL IN</p>
        </div>
      </div>
    </Stage>
  );
}

function PositionSizeScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 3, sceneKey);
  const move = phase >= 2;
  return (
    <Stage>
      <div className="flex w-full max-w-[280px] flex-col gap-2">
        <p className="text-center font-mono text-[9px] text-slate-500">Same setup · price drops 5%</p>
        <div className="grid grid-cols-2 gap-2">
          <div className={cn("border p-2", UP.border)}>
            <p className="font-mono text-[9px] text-emerald-300">SMALL SIZE</p>
            <p className={cn("font-mono text-lg font-bold tabular-nums", move ? DOWN.text : "text-slate-400")}>
              {move ? "-£50" : "—"}
            </p>
            <p className="font-mono text-[8px] text-slate-500">Account survives</p>
          </div>
          <div className={cn("border p-2", DOWN.border)}>
            <p className="font-mono text-[9px] text-rose-300">LARGE SIZE</p>
            <p className={cn("font-mono text-lg font-bold tabular-nums", move ? DOWN.text : "text-slate-400")}>
              {move ? "-£500" : "—"}
            </p>
            <p className="font-mono text-[8px] text-slate-500">Account damaged</p>
          </div>
        </div>
        {move ? <p className="text-center font-mono text-[9px] text-amber-300">Size determines damage</p> : null}
      </div>
    </Stage>
  );
}

function StopLossesScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1100, animate, 3, sceneKey);
  const stopped = phase >= 2 && phase < 3;
  const noStop = phase >= 3;
  return (
    <Stage>
      <div className="grid w-full max-w-[280px] grid-cols-2 gap-2">
        <div className={cn("border p-2", stopped ? UP.border : "border-slate-700")}>
          <Shield className="mx-auto h-4 w-4 text-emerald-400" />
          <p className="text-center font-mono text-[9px] text-emerald-300">WITH STOP</p>
          <p className={cn("text-center font-mono text-sm font-bold", stopped ? DOWN.text : "text-slate-500")}>
            {stopped ? "-2%" : "—"}
          </p>
          <p className="text-center font-mono text-[8px] text-slate-500">Capped loss</p>
        </div>
        <div className={cn("border p-2", noStop ? DOWN.border : "border-slate-700")}>
          <AlertTriangle className="mx-auto h-4 w-4 text-rose-400" />
          <p className="text-center font-mono text-[9px] text-rose-300">NO STOP</p>
          <p className={cn("text-center font-mono text-sm font-bold", noStop ? DOWN.text : "text-slate-500")}>
            {noStop ? "-18%" : "—"}
          </p>
          <p className="text-center font-mono text-[8px] text-slate-500">Uncapped damage</p>
        </div>
      </div>
    </Stage>
  );
}

function RiskPerTradeScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const idx = usePlaygroundLoop(4, 1300, animate, 0, sceneKey);
  const levels = [
    { pct: "1%", loss: "10 losses → -10%", tone: UP },
    { pct: "2%", loss: "10 losses → -18%", tone: UP },
    { pct: "5%", loss: "5 losses → -23%", tone: AMBER },
    { pct: "10%", loss: "3 losses → -27%", tone: DOWN },
  ];
  const cur = levels[idx]!;
  return (
    <Stage>
      <div className="flex w-full max-w-[260px] flex-col gap-2">
        <p className="text-center font-mono text-[9px] text-slate-500">Risk per trade on £10,000</p>
        <div className={cn("border px-3 py-2 text-center", cur.tone.border, cur.tone.bg)}>
          <p className={cn("font-mono text-2xl font-bold", cur.tone.text)}>{cur.pct}</p>
          <p className="font-mono text-[10px] text-slate-300">{cur.loss}</p>
        </div>
        <div className="flex justify-center gap-1">
          {levels.map((l, i) => (
            <span key={l.pct} className={cn("h-1 w-6", i === idx ? "bg-emerald-400" : "bg-slate-700")} />
          ))}
        </div>
      </div>
    </Stage>
  );
}

function RiskRewardScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const idx = usePlaygroundLoop(3, 1400, animate, 1, sceneKey);
  const ratios = [
    { rr: "1:1", need: "Need 50%+ wins", profit: "Break-even zone", tone: AMBER },
    { rr: "2:1", need: "Need 35% wins", profit: "Profitable over time", tone: UP },
    { rr: "3:1", need: "Need 25% wins", profit: "Room for mistakes", tone: VIOLET },
  ];
  const cur = ratios[idx]!;
  return (
    <Stage>
      <div className="flex w-full max-w-[240px] flex-col items-center gap-2">
        <div className="flex items-end gap-1">
          <div className="h-8 w-6 bg-rose-500/50" />
          <div className={cn("w-6 transition-all duration-500", cur.rr === "1:1" ? "h-8 bg-emerald-500/50" : cur.rr === "2:1" ? "h-16 bg-emerald-500/50" : "h-24 bg-emerald-500/50")} />
        </div>
        <p className={cn("font-mono text-xl font-bold", cur.tone.text)}>{cur.rr}</p>
        <p className="font-mono text-[10px] text-slate-300">{cur.need}</p>
        <p className={cn("font-mono text-[9px]", cur.tone.text)}>{cur.profit}</p>
      </div>
    </Stage>
  );
}

function DrawdownsScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const idx = usePlaygroundLoop(4, 1300, animate, 0, sceneKey);
  const rows = [
    { dd: "10%", recover: "11% gain to recover", tone: UP },
    { dd: "20%", recover: "25% gain to recover", tone: AMBER },
    { dd: "50%", recover: "100% gain to recover", tone: DOWN },
    { dd: "80%", recover: "400% gain to recover", tone: DOWN },
  ];
  const cur = rows[idx]!;
  return (
    <Stage>
      <div className="w-full max-w-[260px] space-y-1">
        {rows.map((r, i) => (
          <div
            key={r.dd}
            className={cn(
              "flex justify-between border px-2 py-1 font-mono text-[10px] transition-opacity",
              i === idx ? cn(r.tone.border, r.tone.bg, "opacity-100") : "border-slate-800 opacity-40",
            )}
          >
            <span className={i === idx ? r.tone.text : "text-slate-500"}>{r.dd} DD</span>
            <span className="text-slate-400">{r.recover}</span>
          </div>
        ))}
        <p className={cn("pt-1 text-center font-mono text-[9px]", cur.tone.text)}>Deeper hole → harder climb</p>
      </div>
    </Stage>
  );
}

function AccountSurvivalScene({ animate, sceneKey }: { animate: boolean; sceneKey: string }) {
  const phase = usePlaygroundLoop(4, 1200, animate, 3, sceneKey);
  return (
    <Stage>
      <div className="flex flex-col items-center gap-3 text-center">
        <Wallet className="h-8 w-8 text-emerald-400" />
        <p className="font-mono text-[11px] font-semibold text-slate-200">
          {phase < 2 ? "Maximum profit?" : phase < 3 ? "Long-term survival?" : "Stay in the game"}
        </p>
        <div className="flex gap-3">
          {phase < 2 ? (
            <TrendingUp className="h-6 w-6 text-amber-400" />
          ) : (
            <Shield className="h-6 w-6 text-emerald-400" />
          )}
          {phase >= 3 ? <TrendingDown className="h-6 w-6 text-slate-600 line-through" /> : null}
        </div>
        <p className="font-mono text-[9px] text-emerald-400/90">
          {phase >= 3 ? "Protect capital → more chances to compound" : "The goal is not one big win"}
        </p>
      </div>
    </Stage>
  );
}

function RecapScene() {
  const items = ["Size", "Stop", "1–2% risk", "2:1+ R:R", "Avoid deep DD", "Survive"];
  return (
    <Stage>
      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-sm font-bold text-emerald-200">HOW MUCH CAN I LOSE?</p>
        <div className="grid grid-cols-3 gap-1">
          {items.map((item) => (
            <span key={item} className="border border-emerald-700/40 bg-emerald-950/30 px-2 py-1 font-mono text-[9px] text-emerald-300">
              {item}
            </span>
          ))}
        </div>
        <p className="font-mono text-[9px] text-slate-400">Not: how much can I make?</p>
      </div>
    </Stage>
  );
}

export function RiskManagementPlayground({
  visual,
  reduceMotion,
  sceneKey = "",
  animate: animateProp,
}: {
  visual: RMVisual;
  reduceMotion: boolean;
  sceneKey?: string;
  animate?: boolean;
}) {
  const animate = animateProp ?? !reduceMotion;
  switch (visual) {
    case "whyTradersFail":
      return <WhyTradersFailScene animate={animate} sceneKey={sceneKey} />;
    case "positionSize":
      return <PositionSizeScene animate={animate} sceneKey={sceneKey} />;
    case "stopLosses":
      return <StopLossesScene animate={animate} sceneKey={sceneKey} />;
    case "riskPerTrade":
      return <RiskPerTradeScene animate={animate} sceneKey={sceneKey} />;
    case "riskReward":
      return <RiskRewardScene animate={animate} sceneKey={sceneKey} />;
    case "volatilityRisk":
      return <DrawdownsScene animate={animate} sceneKey={sceneKey} />;
    case "drawdowns":
      return <DrawdownsScene animate={animate} sceneKey={sceneKey} />;
    case "accountSurvival":
      return <AccountSurvivalScene animate={animate} sceneKey={sceneKey} />;
    case "recap":
      return <RecapScene />;
    default:
      return null;
  }
}
