"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  Radio,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { useMarketMechanicsStore } from "@/store/useMarketMechanicsStore";
import { useOrderBookLessonStore } from "@/store/useOrderBookLessonStore";
import { useLessonBridgeStore } from "@/store/useLessonBridgeStore";
import { useFundingCrowdingStore } from "@/store/useFundingCrowdingStore";
import { useFundingBridgeStore } from "@/store/useFundingBridgeStore";

/**
 * Single learning entry in the header — fixes launcher overlap.
 * The primary button is always "NEXT: FUNDING" so the next lesson is obvious.
 */
export function LearningHubLauncher() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const fundingActive = useFundingCrowdingStore((s) => s.active);
  const fundingBridgeActive = useFundingBridgeStore((s) => s.active);
  const openFunding = useFundingCrowdingStore((s) => s.open);
  const startFundingBridge = useFundingBridgeStore((s) => s.start);

  const openMarkets = useMarketMechanicsStore((s) => s.open);
  const openOrderBook = useOrderBookLessonStore((s) => s.open);
  const startObBridge = useLessonBridgeStore((s) => s.start);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const items = [
    {
      id: "funding",
      label: "Learn Funding & Crowding",
      hint: "NEXT LESSON — start here",
      icon: TrendingUp,
      accent: "violet",
      primary: true,
      onClick: () => {
        openFunding();
        setOpen(false);
      },
    },
    {
      id: "funding-live",
      label: "Funding Live Walkthrough",
      hint: "Find funding in the real derivatives desk",
      icon: Radio,
      accent: "violet",
      onClick: () => {
        startFundingBridge();
        setOpen(false);
      },
    },
    {
      id: "markets",
      label: "Market Mechanics",
      hint: "How markets work (beginner)",
      icon: Sparkles,
      accent: "emerald",
      onClick: () => {
        openMarkets();
        setOpen(false);
      },
    },
    {
      id: "orderbook",
      label: "Order Book Lesson",
      hint: "Cinematic order book walkthrough",
      icon: GraduationCap,
      accent: "cyan",
      onClick: () => {
        openOrderBook();
        setOpen(false);
      },
    },
    {
      id: "ob-live",
      label: "Order Book Live Bridge",
      hint: "Use the real order book",
      icon: Radio,
      accent: "cyan",
      onClick: () => {
        startObBridge();
        setOpen(false);
      },
    },
  ] as const;

  const accentBorder = {
    violet: "border-violet-500/70 bg-violet-950/40 text-violet-100 hover:bg-violet-950/60",
    emerald: "hover:border-emerald-600/50",
    cyan: "hover:border-cyan-600/50",
  };

  const fundingRunning = fundingActive || fundingBridgeActive;

  return (
    <div ref={rootRef} className="relative flex shrink-0 items-center gap-1">
      {/* Primary — always visible, can't be buried under the clock strip */}
      <button
        type="button"
        onClick={openFunding}
        title="Next lesson: Funding & Market Crowding — what funding is, who pays whom, squeezes"
        className={cn(
          TERMINAL_TYPO.micro,
          "flex items-center gap-1.5 border px-2.5 py-1 font-semibold transition-colors",
          fundingRunning
            ? "border-violet-400 bg-violet-900/60 text-violet-100"
            : "border-violet-500/80 bg-violet-950/50 text-violet-100 shadow-[0_0_12px_rgba(139,92,246,0.25)] hover:bg-violet-900/50",
        )}
      >
        <TrendingUp className="h-3.5 w-3.5" />
        <span className="whitespace-nowrap tracking-wide">NEXT: LEARN FUNDING</span>
      </button>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="All learning modules"
        className={cn(
          TERMINAL_TYPO.micro,
          "flex items-center gap-0.5 border border-slate-700 bg-slate-900/60 px-1.5 py-1 text-slate-400 hover:border-slate-500 hover:text-slate-200",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <BookOpen className="h-3 w-3" />
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-[300] mt-1 w-64 border border-slate-700 bg-slate-950 py-1 shadow-xl"
        >
          <p className={cn(TERMINAL_TYPO.micro, "border-b border-slate-800 px-2 py-1.5 text-slate-500")}>
            LEARNING PATH
          </p>
          {items.map((item) => {
            const Icon = item.icon;
            const isPrimary = "primary" in item && item.primary;
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={item.onClick}
                className={cn(
                  "flex w-full items-start gap-2 border-l-2 border-transparent px-2 py-2 text-left transition-colors hover:bg-slate-900/80",
                  isPrimary && "border-violet-500 bg-violet-950/30",
                  accentBorder[item.accent as keyof typeof accentBorder],
                )}
              >
                <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", isPrimary ? "text-violet-300" : "text-slate-500")} />
                <span className="min-w-0">
                  <span className={cn("block font-mono text-[11px] font-semibold", isPrimary ? "text-violet-100" : "text-slate-200")}>
                    {item.label}
                  </span>
                  <span className="block font-mono text-[9px] leading-snug text-slate-500">{item.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
