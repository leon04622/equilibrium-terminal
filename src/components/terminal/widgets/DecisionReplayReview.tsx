"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Play, Pause, ChevronRight, SkipForward, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { DecisionReplayEngine } from "@/lib/operator-journal/DecisionReplayEngine";
import { useOperatorJournalStore } from "@/store/useOperatorJournalStore";
import type { ReplayWindowMinutes } from "@/types/decision-replay";

const WINDOWS: ReplayWindowMinutes[] = [1, 5, 15, 30];
const SPEEDS = [1, 2, 4, 8] as const;

const TONE_COLOR: Record<string, string> = {
  good: "text-emerald-400",
  neutral: "text-amber-400",
  poor: "text-rose-400",
};

function fmtTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function DecisionReplayReview() {
  const activeReplay = useOperatorJournalStore((s) => s.activeReplay);
  const closeReplay = useOperatorJournalStore((s) => s.closeReplay);
  const addReflection = useOperatorJournalStore((s) => s.addReflection);

  const [windowMinutes, setWindowMinutes] = useState<ReplayWindowMinutes>(15);
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(2);
  const [reflection, setReflection] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bundle = useMemo(() => {
    if (!activeReplay) return null;
    const payload = DecisionReplayEngine.buildPayload(activeReplay.decision, activeReplay.flagKind);
    return DecisionReplayEngine.buildBundle(payload, windowMinutes);
  }, [activeReplay, windowMinutes]);

  useEffect(() => {
    if (!activeReplay) return;
    setReflection(activeReplay.decision.reflection ?? "");
    setPlayhead(0);
    setPlaying(false);
  }, [activeReplay]);

  useEffect(() => {
    if (!playing || !bundle) return;
    timerRef.current = setInterval(() => {
      setPlayhead((p) => {
        if (p >= bundle.candles.length - 1) {
          setPlaying(false);
          return p;
        }
        return p + 1;
      });
    }, Math.max(60, 360 / speed));
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, speed, bundle]);

  if (!activeReplay || !bundle) return null;

  const { candles, decisionIndex, coaching, execution, behavioralHighlight, payload } = bundle;
  const visible = Math.max(1, playhead + 1);

  const lows = candles.map((c) => c.low);
  const highs = candles.map((c) => c.high);
  const minP = Math.min(...lows);
  const maxP = Math.max(...highs);
  const range = maxP - minP || 1;
  const W = 640;
  const H = 200;
  const bw = W / candles.length;
  const y = (p: number) => H - ((p - minP) / range) * (H - 12) - 6;

  const atDecision = playhead >= decisionIndex;
  const decisionCandle = candles[decisionIndex];

  const save = () => addReflection(payload.decisionId, reflection.trim());

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-800 px-2 py-1">
          <Crosshair className="h-3.5 w-3.5 text-cyan-400" />
          <span className={cn(TERMINAL_TYPO.label, "text-cyan-200")}>REPLAY-ASSISTED REVIEW</span>
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>
            {payload.kind.toUpperCase()} · {payload.asset} · {fmtTime(payload.at)}
          </span>
          <button
            type="button"
            onClick={closeReplay}
            className="ml-auto text-slate-500 hover:text-slate-200"
            aria-label="Close replay"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[1fr_300px]">
          {/* Left — chart + controls */}
          <div className="flex flex-col gap-2 border-r border-slate-800 p-2">
            <div className="relative w-full border border-slate-800 bg-slate-900/40">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ aspectRatio: `${W}/${H}` }}>
                {/* decision marker line */}
                <line
                  x1={decisionIndex * bw + bw / 2}
                  x2={decisionIndex * bw + bw / 2}
                  y1={0}
                  y2={H}
                  stroke="#22d3ee"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.7}
                />
                {candles.map((c, i) => {
                  const shown = i < visible;
                  const up = c.close >= c.open;
                  const color = !shown
                    ? "#1e293b"
                    : up
                      ? "#34d399"
                      : "#fb7185";
                  const cx = i * bw + bw / 2;
                  return (
                    <g key={c.time} opacity={shown ? 1 : 0.25}>
                      <line x1={cx} x2={cx} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth={1} />
                      <rect
                        x={i * bw + bw * 0.2}
                        width={bw * 0.6}
                        y={Math.min(y(c.open), y(c.close))}
                        height={Math.max(1, Math.abs(y(c.open) - y(c.close)))}
                        fill={color}
                      />
                    </g>
                  );
                })}
                {/* playhead */}
                <line
                  x1={playhead * bw + bw / 2}
                  x2={playhead * bw + bw / 2}
                  y1={0}
                  y2={H}
                  stroke="#f8fafc"
                  strokeWidth={0.75}
                  opacity={0.5}
                />
              </svg>
              {/* decision marker label */}
              <div className="absolute left-1 top-1 border border-cyan-800 bg-slate-950/90 px-1 py-0.5">
                <p className={cn(TERMINAL_TYPO.micro, "text-cyan-300")}>
                  ◆ {payload.kind.toUpperCase()} · C{payload.confidence} · {payload.emotion}
                </p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {payload.regime} · {payload.volatilityState} · {payload.liquidityState}
                  {decisionCandle ? ` · ${decisionCandle.close.toFixed(2)}` : ""}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="flex items-center gap-1 border border-slate-700 px-2 py-0.5 text-slate-200 hover:border-cyan-700"
              >
                {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                <span className={TERMINAL_TYPO.micro}>{playing ? "PAUSE" : "PLAY"}</span>
              </button>
              <button
                type="button"
                onClick={() => setPlayhead((p) => Math.min(candles.length - 1, p + 1))}
                className="flex items-center gap-1 border border-slate-700 px-2 py-0.5 text-slate-300 hover:border-cyan-700"
              >
                <ChevronRight className="h-3 w-3" />
                <span className={TERMINAL_TYPO.micro}>STEP</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setPlayhead(decisionIndex);
                }}
                className="flex items-center gap-1 border border-cyan-800 px-2 py-0.5 text-cyan-300 hover:bg-cyan-950/40"
              >
                <SkipForward className="h-3 w-3" />
                <span className={TERMINAL_TYPO.micro}>JUMP TO DECISION</span>
              </button>

              <div className="ml-auto flex items-center gap-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>SPD</span>
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeed(s)}
                    className={cn(
                      TERMINAL_TYPO.micro,
                      "px-1 py-0.5",
                      speed === s ? "bg-cyan-900/50 text-cyan-200" : "text-slate-500",
                    )}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>WINDOW</span>
              {WINDOWS.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWindowMinutes(w)}
                  className={cn(
                    TERMINAL_TYPO.micro,
                    "px-1.5 py-0.5",
                    windowMinutes === w ? "bg-slate-700 text-slate-100" : "text-slate-500",
                  )}
                >
                  {w}m
                </button>
              ))}
              <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
                bar {visible}/{candles.length} · {atDecision ? "post-decision" : "pre-decision"}
              </span>
            </div>

            {/* Execution quality replay */}
            {execution.applicable ? (
              <div className="border border-slate-800 p-1.5">
                <p className={cn(TERMINAL_TYPO.micro, "text-cyan-600")}>EXECUTION QUALITY AT DECISION</p>
                <div className="mt-1 grid grid-cols-4 gap-1 text-center">
                  <div>
                    <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>SPREAD</p>
                    <p className={cn(TERMINAL_TYPO.micro, "text-slate-200")}>
                      {execution.spreadBps.toFixed(1)}bps
                    </p>
                  </div>
                  <div>
                    <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>DEPTH</p>
                    <p className={cn(TERMINAL_TYPO.micro, "text-slate-200")}>{execution.depthScore}</p>
                  </div>
                  <div>
                    <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>SLIP EST</p>
                    <p className={cn(TERMINAL_TYPO.micro, "text-slate-200")}>
                      {execution.slippageEstBps.toFixed(1)}bps
                    </p>
                  </div>
                  <div>
                    <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>CHASE</p>
                    <p
                      className={cn(
                        TERMINAL_TYPO.micro,
                        execution.chaseRisk === "high"
                          ? "text-rose-400"
                          : execution.chaseRisk === "elevated"
                            ? "text-amber-400"
                            : "text-emerald-400",
                      )}
                    >
                      {execution.chaseRisk}
                    </p>
                  </div>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-400")}>{execution.timingQuality}</p>
              </div>
            ) : null}

            {behavioralHighlight ? (
              <div className="border-l-2 border-rose-500 bg-rose-950/20 p-1.5">
                <p className={cn(TERMINAL_TYPO.micro, "text-rose-400")}>BEHAVIORAL PATTERN</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{behavioralHighlight}</p>
              </div>
            ) : null}
          </div>

          {/* Right — coaching + reflection */}
          <div className="flex flex-col gap-2 p-2">
            <div>
              <p className={cn(TERMINAL_TYPO.micro, "text-cyan-600")}>BEFORE</p>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{coaching.before}</p>
            </div>
            <div>
              <p className={cn(TERMINAL_TYPO.micro, "text-cyan-600")}>AT THE DECISION</p>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{coaching.atPoint}</p>
            </div>
            <div>
              <p className={cn(TERMINAL_TYPO.micro, "text-cyan-600")}>AFTER</p>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{coaching.after}</p>
            </div>

            <div className="space-y-0.5 border-t border-slate-800 pt-1.5">
              <p className={cn(TERMINAL_TYPO.micro, TONE_COLOR[coaching.liquidityVerdict.tone])}>
                LIQ · {coaching.liquidityVerdict.text}
              </p>
              <p className={cn(TERMINAL_TYPO.micro, TONE_COLOR[coaching.volatilityVerdict.tone])}>
                VOL · {coaching.volatilityVerdict.text}
              </p>
              <p className={cn(TERMINAL_TYPO.micro, TONE_COLOR[coaching.spreadVerdict.tone])}>
                SPRD · {coaching.spreadVerdict.text}
              </p>
            </div>

            {payload.thesis ? (
              <div>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>LOGGED THESIS</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{payload.thesis}</p>
              </div>
            ) : null}

            <div className="mt-auto border-t border-slate-800 pt-1.5">
              <p className={cn(TERMINAL_TYPO.micro, "text-amber-500")}>REVIEW</p>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{coaching.reviewPrompt}</p>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Post-replay reflection — what would you do differently?"
                rows={3}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "mt-1 w-full resize-none border border-slate-800 bg-slate-900 p-1 text-slate-200 outline-none focus:border-cyan-800",
                )}
              />
              <button
                type="button"
                onClick={save}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "mt-1 w-full border border-cyan-700/60 bg-cyan-950/40 py-1 text-cyan-200 hover:bg-cyan-900/50",
                )}
              >
                SAVE REFLECTION
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
