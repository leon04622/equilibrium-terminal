"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Check, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MMVisual } from "@/lib/education/marketMechanicsScenes";

/**
 * The animated market playground.
 *
 * Each concept is a small, self-contained visual that animates on its own
 * internal loop — decoupled from narration timing so the lesson can never get
 * out of sync. When `reduceMotion` is set, every visual jumps to a calm, fully
 * readable rest state instead of looping.
 */

const BUY = {
  text: "text-emerald-300",
  bg: "bg-emerald-500/15",
  border: "border-emerald-500/40",
  solid: "bg-emerald-500/70",
};
const SELL = {
  text: "text-rose-300",
  bg: "bg-rose-500/15",
  border: "border-rose-500/40",
  solid: "bg-rose-500/70",
};

/** Loop 0..steps-1 every intervalMs. When not animating, returns restStep. */
function useLoop(steps: number, intervalMs: number, animate: boolean, restStep?: number): number {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!animate || steps <= 1) return;
    setStep(0);
    const id = window.setInterval(() => setStep((s) => (s + 1) % steps), intervalMs);
    return () => window.clearInterval(id);
  }, [steps, intervalMs, animate]);
  return animate ? step : restStep ?? steps - 1;
}

function Chip({
  price,
  tone,
  className,
  dim,
}: {
  price: number | string;
  tone: typeof BUY | typeof SELL;
  className?: string;
  dim?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md border px-2.5 py-1 font-mono text-xs font-semibold transition-all duration-500",
        tone.bg,
        tone.border,
        tone.text,
        dim && "opacity-30",
        className,
      )}
    >
      {price}
    </div>
  );
}

/** A vertical stack of n little blocks (a "crowd" of waiting orders). */
function Crowd({ n, tone, className }: { n: number; tone: typeof BUY | typeof SELL; className?: string }) {
  return (
    <div className={cn("flex flex-col-reverse items-center gap-1", className)}>
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className={cn("h-2.5 w-9 rounded-sm transition-all duration-500", tone.solid)}
          style={{ opacity: 0.55 + (i / Math.max(1, n)) * 0.45 }}
        />
      ))}
    </div>
  );
}

function StageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-950 p-4">
      {children}
    </div>
  );
}

function SideLabel({ text, tone }: { text: string; tone: typeof BUY | typeof SELL }) {
  return (
    <span className={cn("font-mono text-[10px] font-semibold uppercase tracking-wide", tone.text)}>
      {text}
    </span>
  );
}

/* ----------------------------- LESSON 1 ----------------------------------- */
function Negotiation({ animate }: { animate: boolean }) {
  const buyerPrices = [100, 101, 102, 103];
  const sellerPrices = [105, 104, 103, 103];
  const step = useLoop(4, 1300, animate, 3);
  const agreed = step >= 3;
  const shift = step * 18; // px the figures move toward the centre

  return (
    <StageFrame>
      <div className="flex w-full max-w-md items-center justify-between gap-4">
        <div
          className="flex flex-col items-center gap-2 transition-transform duration-700"
          style={{ transform: `translateX(${shift}px)` }}
        >
          <Chip price={`$${buyerPrices[step]}`} tone={BUY} />
          <span className={cn("h-10 w-10 rounded-full border-2", BUY.border, BUY.bg)} />
          <SideLabel text="Buyer" tone={BUY} />
        </div>

        <div className="flex flex-col items-center gap-1">
          {agreed ? (
            <div className="flex flex-col items-center gap-1 text-emerald-300">
              <span className="flex items-center gap-1 rounded-md border border-emerald-500/50 bg-emerald-500/15 px-2 py-1 font-mono text-xs font-semibold">
                <Check className="h-3.5 w-3.5" /> TRADE @ $103
              </span>
            </div>
          ) : (
            <span className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-slate-500">
              no trade
            </span>
          )}
        </div>

        <div
          className="flex flex-col items-center gap-2 transition-transform duration-700"
          style={{ transform: `translateX(-${shift}px)` }}
        >
          <Chip price={`$${sellerPrices[step]}`} tone={SELL} />
          <span className={cn("h-10 w-10 rounded-full border-2", SELL.border, SELL.bg)} />
          <SideLabel text="Seller" tone={SELL} />
        </div>
      </div>
    </StageFrame>
  );
}

/* --------------------------- LESSON 2 / 4 --------------------------------- */
function WaitingRoom({ labelled }: { labelled?: boolean }) {
  const buyers = [102, 101, 100, 99];
  const sellers = [104, 105, 106, 107];
  return (
    <StageFrame>
      <div className="flex w-full max-w-lg items-stretch justify-between gap-3">
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <SideLabel text={labelled ? "BIDS" : "Buyers waiting"} tone={BUY} />
          {labelled ? <span className="font-mono text-[9px] text-slate-500">(buyers)</span> : null}
          {buyers.map((p) => (
            <Chip key={p} price={`$${p}`} tone={BUY} className="eq-mm-float w-20" />
          ))}
        </div>

        <div className="flex flex-col items-center justify-center px-1">
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-400">
            Market
          </span>
          <span className="mt-1 font-mono text-[9px] text-slate-600">waiting room</span>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1.5">
          <SideLabel text={labelled ? "ASKS" : "Sellers waiting"} tone={SELL} />
          {labelled ? <span className="font-mono text-[9px] text-slate-500">(sellers)</span> : null}
          {sellers.map((p) => (
            <Chip key={p} price={`$${p}`} tone={SELL} className="eq-mm-float w-20" />
          ))}
        </div>
      </div>
    </StageFrame>
  );
}

/* ----------------------------- LESSON 3 ----------------------------------- */
function PriceMove({ animate }: { animate: boolean }) {
  const step = useLoop(2, 2400, animate, 0);
  const up = step === 0;
  const price = up ? 104 : 98;
  return (
    <StageFrame>
      <div className="flex w-full max-w-md items-end justify-between gap-4">
        <div className="flex flex-col items-center gap-2">
          <Crowd n={up ? 6 : 2} tone={BUY} />
          <SideLabel text="Buyers" tone={BUY} />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span
            className={cn(
              "flex items-center gap-1 font-mono text-2xl font-bold tabular-nums transition-colors duration-500",
              up ? "text-emerald-300" : "text-rose-300",
            )}
          >
            {up ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}${price}
          </span>
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-wide transition-colors duration-500",
              up ? "text-emerald-400/80" : "text-rose-400/80",
            )}
          >
            {up ? "price rising" : "price falling"}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Crowd n={up ? 2 : 6} tone={SELL} />
          <SideLabel text="Sellers" tone={SELL} />
        </div>
      </div>
    </StageFrame>
  );
}

/* ----------------------------- LESSON 5 ----------------------------------- */
function Spread() {
  return (
    <StageFrame>
      <div className="flex w-full max-w-xs flex-col items-center gap-0">
        <Chip price="$103  ·  lowest ask" tone={SELL} className="w-56 justify-between" />
        <div className="relative my-1 flex w-56 flex-col items-center">
          <div className="h-px w-full border-t border-dashed border-amber-500/50" />
          <span className="my-1.5 rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1 font-mono text-[11px] font-semibold text-amber-300">
            SPREAD = $3
          </span>
          <div className="h-px w-full border-t border-dashed border-amber-500/50" />
        </div>
        <Chip price="$100  ·  highest bid" tone={BUY} className="w-56 justify-between" />
        <span className="mt-3 font-mono text-[10px] text-slate-500">the gap you pay to cross sides</span>
      </div>
    </StageFrame>
  );
}

/* ----------------------------- LESSON 6 ----------------------------------- */
function Liquidity() {
  return (
    <StageFrame>
      <div className="flex w-full max-w-lg items-stretch justify-center gap-6">
        <div className="flex flex-col items-center gap-2 rounded-lg border border-emerald-700/30 bg-emerald-950/10 p-3">
          <div className="flex items-end gap-1.5">
            <Crowd n={7} tone={BUY} />
            <Crowd n={7} tone={SELL} />
          </div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
            Deep
          </span>
          <span className="font-mono text-[9px] text-slate-500">lots waiting · price barely moves</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border border-rose-700/30 bg-rose-950/10 p-3">
          <div className="flex items-end gap-1.5">
            <Crowd n={2} tone={BUY} />
            <Crowd n={1} tone={SELL} />
          </div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-rose-300">
            Thin
          </span>
          <span className="font-mono text-[9px] text-slate-500">few waiting · price jumps easily</span>
        </div>
      </div>
    </StageFrame>
  );
}

/* ----------------------------- LESSON 7 ----------------------------------- */
function Imbalance() {
  return (
    <StageFrame>
      <div className="flex w-full max-w-md items-end justify-between gap-4">
        <div className="flex flex-col items-center gap-2">
          <Crowd n={8} tone={BUY} />
          <SideLabel text="Buyers (many)" tone={BUY} />
        </div>
        <div className="flex flex-col items-center gap-1 text-emerald-300">
          <ArrowUp className="h-6 w-6" />
          <span className="font-mono text-[10px] uppercase tracking-wide text-emerald-400/80">
            pressure up
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Crowd n={2} tone={SELL} />
          <SideLabel text="Sellers (few)" tone={SELL} />
        </div>
      </div>
    </StageFrame>
  );
}

/* ----------------------------- LESSON 8 ----------------------------------- */
function Slippage({ animate }: { animate: boolean }) {
  const levels = [103, 104, 105, 106];
  const step = useLoop(5, 900, animate, 4); // 0 = nothing filled, 4 = all filled
  const filled = step;
  const avgByStep = [0, 103, 103.5, 104, 104.5];
  const avg = avgByStep[filled] || 0;
  return (
    <StageFrame>
      <div className="flex w-full max-w-sm flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
          a BUY order eats the cheapest sellers first
        </span>
        <div className="flex w-full flex-col gap-1">
          {levels.map((p, i) => {
            const isFilled = i < filled;
            return (
              <div
                key={p}
                className={cn(
                  "flex items-center justify-between rounded-md border px-3 py-1.5 font-mono text-xs transition-all duration-300",
                  isFilled
                    ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-200"
                    : cn(SELL.border, SELL.bg, SELL.text),
                )}
              >
                <span>${p}</span>
                <span className="text-[10px] opacity-80">{isFilled ? "filled" : "waiting"}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-500">avg fill</span>
          <span className="rounded-md border border-cyan-400/50 bg-cyan-500/10 px-2 py-0.5 font-semibold text-cyan-200">
            {avg ? `$${avg.toFixed(2)}` : "—"}
          </span>
          <span className="text-[10px] text-slate-500">(started at $103)</span>
        </div>
      </div>
    </StageFrame>
  );
}

/* ----------------------------- LESSON 9 ----------------------------------- */
function Danger({ animate }: { animate: boolean }) {
  const levels = [103, 109, 118];
  const step = useLoop(4, 1000, animate, 3);
  const filled = step;
  const avgByStep = [0, 103, 106, 110];
  const avg = avgByStep[filled] || 0;
  const blown = filled >= 3;
  return (
    <StageFrame>
      <div className="flex w-full max-w-sm flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
          thin book · only a few sellers waiting
        </span>
        <div className="flex w-full flex-col gap-2">
          {levels.map((p, i) => {
            const isFilled = i < filled;
            return (
              <div
                key={p}
                className={cn(
                  "flex items-center justify-between rounded-md border px-3 py-1.5 font-mono text-xs transition-all duration-300",
                  isFilled
                    ? "border-rose-400/70 bg-rose-500/20 text-rose-100"
                    : cn(SELL.border, SELL.bg, SELL.text),
                )}
              >
                <span>${p}</span>
                <span className="text-[10px] opacity-80">{i > 0 ? "big gap ↑" : "best"}</span>
              </div>
            );
          })}
        </div>
        <div
          className={cn(
            "mt-1 flex items-center gap-2 rounded-md border px-2 py-1 font-mono text-xs transition-all duration-300",
            blown
              ? "border-rose-500/70 bg-rose-500/15 text-rose-200 eq-mm-pulse"
              : "border-slate-700 text-slate-400",
          )}
        >
          <TriangleAlert className="h-3.5 w-3.5" />
          {blown ? `Filled ~$${avg} — paid way above $103` : "watch the fill price climb"}
        </div>
      </div>
    </StageFrame>
  );
}

/* --------------------------- INTRO / RECAP -------------------------------- */
function Intro() {
  return (
    <StageFrame>
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <span className={cn("h-12 w-12 rounded-full border-2 eq-mm-float", BUY.border, BUY.bg)} />
          <SideLabel text="Buyer" tone={BUY} />
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-400">
          <span className="font-mono text-2xl font-bold text-slate-200">$ ?</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">price</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span
            className={cn("h-12 w-12 rounded-full border-2 eq-mm-float", SELL.border, SELL.bg)}
            style={{ animationDelay: "0.4s" }}
          />
          <SideLabel text="Seller" tone={SELL} />
        </div>
      </div>
    </StageFrame>
  );
}

function Recap() {
  const items = [
    "How a trade happens",
    "Why buyers and sellers wait",
    "What the order book is",
    "Why price moves",
  ];
  return (
    <StageFrame>
      <div className="flex w-full max-w-xs flex-col gap-2">
        {items.map((t) => (
          <div
            key={t}
            className="flex items-center gap-2 rounded-md border border-emerald-700/30 bg-emerald-950/10 px-3 py-1.5 font-mono text-xs text-emerald-200"
          >
            <Check className="h-3.5 w-3.5 text-emerald-400" /> {t}
          </div>
        ))}
        <div className="mt-1 flex items-center gap-2 rounded-md border border-cyan-700/40 bg-cyan-950/20 px-3 py-1.5 font-mono text-xs text-cyan-200">
          <ArrowRight className="h-3.5 w-3.5" /> Next: the real order book
        </div>
      </div>
    </StageFrame>
  );
}

export function MarketPlayground({
  visual,
  reduceMotion,
}: {
  visual: MMVisual;
  reduceMotion: boolean;
}) {
  const animate = !reduceMotion;
  switch (visual) {
    case "negotiation":
      return <Negotiation animate={animate} />;
    case "waitingRoom":
      return <WaitingRoom />;
    case "bidsAsks":
      return <WaitingRoom labelled />;
    case "priceMove":
      return <PriceMove animate={animate} />;
    case "spread":
      return <Spread />;
    case "liquidity":
      return <Liquidity />;
    case "imbalance":
      return <Imbalance />;
    case "slippage":
      return <Slippage animate={animate} />;
    case "danger":
      return <Danger animate={animate} />;
    case "recap":
      return <Recap />;
    case "intro":
    default:
      return <Intro />;
  }
}
