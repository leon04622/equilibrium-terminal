"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import type { OBHighlight, OBSceneFx, OBSceneSpec } from "@/lib/education/orderBookLessonScenes";

/**
 * The animated mini order book — the cinematic "teacher". It renders a stylized
 * ladder where bar width = resting size, so liquidity appearing / vanishing and
 * the spread widening all animate smoothly via CSS transitions. A market-order
 * sweep walks up the asks to make slippage visually obvious.
 *
 * `fx` drives the first-principles act: a plain "PRICE" center, human-language
 * "BUYERS / SELLERS waiting" labels, a trade-happening flash, and a price-move
 * animation — all in plain English before any terminal jargon.
 *
 * Single-focus rule: when one region is being taught, every other region dims
 * so exactly one idea dominates. `reduceMotion` makes every change instant for
 * users who prefer reduced motion.
 */

const MAX_SIZE = 96; // scaling reference for bar widths
const ASK_PRICES = [100.05, 100.04, 100.03, 100.02, 100.01]; // top → bottom (i4..i0)
const BID_PRICES = [99.99, 99.98, 99.97, 99.96, 99.95]; // top → bottom (i0..i4)
const DIMMED = "opacity-20";

/** Should a region stay bright for the current highlight? */
function bright(region: OBHighlight, ...match: OBHighlight[]): boolean {
  if (region === "none" || region === "book") return true;
  return match.includes(region);
}

function Row({
  size,
  price,
  side,
  consumed,
  reduceMotion,
}: {
  size: number;
  price: number;
  side: "bid" | "ask";
  consumed?: boolean;
  reduceMotion?: boolean;
}) {
  const pct = Math.min(100, (size / MAX_SIZE) * 100);
  const isBid = side === "bid";
  const transition = reduceMotion ? "" : "transition-all duration-700 ease-out";
  const fadeTransition = reduceMotion ? "" : "transition-opacity duration-500";
  return (
    <div className="flex h-5 items-center gap-1">
      <span
        className={cn(
          TERMINAL_TYPO.micro,
          "w-12 shrink-0 text-right tabular-nums",
          isBid ? "text-emerald-500/70" : "text-rose-500/70",
        )}
      >
        {price.toFixed(2)}
      </span>
      <div className="relative h-3.5 flex-1 overflow-hidden bg-slate-900/40">
        <div
          className={cn(
            "absolute top-0 right-0 h-full",
            transition,
            isBid ? "bg-emerald-500/45" : "bg-rose-500/45",
            consumed && "bg-amber-400/70",
          )}
          style={{ width: `${pct}%`, opacity: size <= 0.5 ? 0 : 1 }}
        />
      </div>
      <span
        className={cn(TERMINAL_TYPO.micro, "w-7 shrink-0 tabular-nums text-slate-600", fadeTransition)}
        style={{ opacity: size <= 0.5 ? 0 : 1 }}
      >
        {size <= 0.5 ? "" : Math.round(size)}
      </span>
    </div>
  );
}

export function MiniOrderBook({
  scene,
  highlight,
  sweep = false,
  reduceMotion = false,
  fx,
  onRegionClick,
}: {
  scene: OBSceneSpec;
  highlight: OBHighlight;
  sweep?: boolean;
  reduceMotion?: boolean;
  fx?: OBSceneFx;
  onRegionClick?: (region: "bids" | "asks" | "spread") => void;
}) {
  const clickable = Boolean(onRegionClick);
  const centerMode = fx?.center ?? "spread";
  const zoneLabels = Boolean(fx?.zoneLabels);
  const trade = Boolean(fx?.trade);
  const priceMove = fx?.priceMove;

  // Single-focus dimming: only the taught region(s) stay bright.
  const asksBright = bright(highlight, "asks", "imbalance", "danger");
  const bidsBright = bright(highlight, "bids", "bidwall", "imbalance");
  const spreadBright = bright(highlight, "spread", "danger");

  // Spread band grows with the bps value (clamped for layout).
  const spreadHeight =
    centerMode === "price" ? 30 : Math.max(16, Math.min(58, 14 + scene.spreadBps * 4.2));

  // Price-move animation: nudge the price marker after mount so it animates.
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    if (!priceMove) {
      setMoved(false);
      return;
    }
    if (reduceMotion) {
      setMoved(true);
      return;
    }
    setMoved(false);
    const t = setTimeout(() => setMoved(true), 420);
    return () => clearTimeout(t);
  }, [priceMove, reduceMotion]);
  const priceShiftPx = priceMove === "up" ? (moved ? -20 : 0) : priceMove === "down" ? (moved ? 20 : 0) : 0;

  // Market-order sweep: walk an index up the ask stack (near → far).
  const [sweepStep, setSweepStep] = useState(0);
  const sweepDone = sweepStep >= scene.asks.length;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    if (!sweep) {
      setSweepStep(0);
      return;
    }
    if (reduceMotion) {
      setSweepStep(scene.asks.length);
      return;
    }
    setSweepStep(0);
    timer.current = setInterval(() => {
      setSweepStep((s) => {
        if (s >= scene.asks.length) {
          if (timer.current) clearInterval(timer.current);
          return s;
        }
        return s + 1;
      });
    }, 560);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [sweep, reduceMotion, scene.asks.length]);

  const region = (r: "bids" | "asks" | "spread") => () => onRegionClick?.(r);
  const sectionTransition = reduceMotion ? "" : "transition-all duration-500";
  const moveTransition = reduceMotion ? "" : "transition-all duration-1000 ease-out";

  // Center band content depends on the act.
  const centerTone =
    trade
      ? "border-emerald-400/70 bg-emerald-950/40"
      : priceMove === "up"
        ? "border-emerald-400/70 bg-emerald-950/30"
        : priceMove === "down"
          ? "border-rose-400/70 bg-rose-950/30"
          : highlight === "spread"
            ? "border-amber-400/70 bg-amber-950/30"
            : "border-slate-700/60 bg-slate-900/30";

  return (
    <div className="mx-auto w-full max-w-[340px] select-none">
      {/* Plain-language seller zone label */}
      {zoneLabels ? (
        <p
          className={cn(
            "mb-1 text-center text-[10px] font-medium text-rose-300/80",
            sectionTransition,
            asksBright ? "opacity-100" : DIMMED,
          )}
        >
          SELLERS — waiting to sell higher ↑
        </p>
      ) : null}

      {/* ASKS — highest price on top (reverse index) */}
      <button
        type="button"
        disabled={!clickable}
        onClick={region("asks")}
        aria-label="Asks — sellers above the price"
        className={cn(
          "block w-full text-left",
          sectionTransition,
          asksBright ? "opacity-100" : DIMMED,
          highlight === "asks" && "rounded-sm ring-1 ring-rose-500/50",
          clickable && "cursor-pointer hover:brightness-125",
        )}
      >
        {[4, 3, 2, 1, 0].map((i) => (
          <Row
            key={`ask-${ASK_PRICES[4 - i]}`}
            size={sweep && i < sweepStep ? 0 : scene.asks[i]}
            price={ASK_PRICES[4 - i]}
            side="ask"
            consumed={sweep && i < sweepStep}
            reduceMotion={reduceMotion}
          />
        ))}
      </button>

      {/* CENTER band — PRICE marker (act one) or SPREAD reading (act two) */}
      <button
        type="button"
        disabled={!clickable}
        onClick={region("spread")}
        aria-label={centerMode === "price" ? "Current price" : "Spread — the gap between buyers and sellers"}
        style={{ height: spreadHeight, transform: `translateY(${priceShiftPx}px)` }}
        className={cn(
          "relative my-0.5 flex w-full items-center justify-between gap-2 border-y border-dashed px-2",
          sectionTransition,
          moveTransition,
          centerTone,
          centerMode === "price" ? "opacity-100" : spreadBright ? "opacity-100" : DIMMED,
          clickable && "cursor-pointer hover:brightness-125",
        )}
      >
        {centerMode === "price" ? (
          <>
            <span className={cn(TERMINAL_TYPO.micro, "text-slate-200")}>PRICE</span>
            {trade ? (
              <span
                className={cn(
                  TERMINAL_TYPO.micro,
                  "flex items-center gap-1 normal-case text-emerald-300",
                  reduceMotion ? "" : "animate-pulse",
                )}
              >
                <Check className="h-3 w-3" /> trade!
              </span>
            ) : priceMove === "up" ? (
              <span className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 normal-case text-emerald-300")}>
                <ArrowUp className="h-3 w-3" /> price rising
              </span>
            ) : priceMove === "down" ? (
              <span className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 normal-case text-rose-300")}>
                <ArrowDown className="h-3 w-3" /> price falling
              </span>
            ) : (
              <span className={cn(TERMINAL_TYPO.micro, "normal-case text-slate-500")}>
                buyers meet sellers
              </span>
            )}
          </>
        ) : (
          <>
            <span className={cn(TERMINAL_TYPO.micro, "text-amber-300/90")}>SPREAD</span>
            <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-400")}>
              {scene.spreadBps.toFixed(1)} bps
            </span>
          </>
        )}
      </button>

      {/* BIDS — nearest price on top */}
      <button
        type="button"
        disabled={!clickable}
        onClick={region("bids")}
        aria-label="Bids — buyers below the price"
        className={cn(
          "block w-full text-left",
          sectionTransition,
          bidsBright ? "opacity-100" : DIMMED,
          highlight === "bids" && "rounded-sm ring-1 ring-emerald-500/50",
          clickable && "cursor-pointer hover:brightness-125",
        )}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Row
            key={`bid-${BID_PRICES[i]}`}
            size={scene.bids[i]}
            price={BID_PRICES[i]}
            side="bid"
            reduceMotion={reduceMotion}
          />
        ))}
      </button>

      {/* Plain-language buyer zone label */}
      {zoneLabels ? (
        <p
          className={cn(
            "mt-1 text-center text-[10px] font-medium text-emerald-300/80",
            sectionTransition,
            bidsBright ? "opacity-100" : DIMMED,
          )}
        >
          BUYERS — waiting to buy lower ↓
        </p>
      ) : null}

      {/* Market-order sweep readout */}
      {sweep ? (
        <div className="mt-2 flex items-center justify-center gap-2">
          <span
            className={cn(
              TERMINAL_TYPO.micro,
              "border px-1.5 py-0.5",
              reduceMotion ? "" : "transition-all duration-300",
              sweepDone
                ? "border-rose-500/60 bg-rose-950/40 text-rose-200"
                : "border-amber-500/60 bg-amber-950/40 text-amber-200",
            )}
          >
            {sweepDone
              ? `BUY FILLED +${scene.spreadBps.toFixed(1)} bps HIGHER`
              : "BUY ORDER climbing…"}
          </span>
        </div>
      ) : null}
    </div>
  );
}
