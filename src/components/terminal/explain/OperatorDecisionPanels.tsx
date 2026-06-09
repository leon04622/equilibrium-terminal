"use client";

import { useState } from "react";
import { Check, Eye, Scale, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import type { CauseEffectDecision } from "@/lib/education/liveBookCoach";

/**
 * OPERATOR DECISION MODE UI — Phases 3, 4, 5, 6.
 * Compact panels for scenario choice, observational pause, and good/bad compare.
 */

export interface DecisionOption {
  id: string;
  label: string;
  traits: string[];
  correct: boolean;
}

export interface CompareSide {
  id: string;
  title: string;
  traits: string[];
  good: boolean;
}

/** PHASE 3 — pick which environment you'd rather trade in. */
export function DecisionScenario({
  prompt,
  options,
  explanation,
  onResolved,
}: {
  prompt: string;
  options: DecisionOption[];
  explanation: string;
  onResolved: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const resolved = picked !== null;
  const wasCorrect = options.find((o) => o.id === picked)?.correct ?? false;

  const pick = (id: string) => {
    if (resolved) return;
    setPicked(id);
    const ok = options.find((o) => o.id === id)?.correct ?? false;
    onResolved(ok);
  };

  return (
    <div className="mt-2 space-y-2">
      <p className="font-mono text-xs text-amber-200">{prompt}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const selected = picked === opt.id;
          const showResult = resolved && selected;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => pick(opt.id)}
              disabled={resolved}
              className={cn(
                "border p-2 text-left transition-colors",
                !resolved && "hover:border-cyan-600/50",
                showResult
                  ? opt.correct
                    ? "border-emerald-600/60 bg-emerald-950/30"
                    : "border-rose-600/50 bg-rose-950/20"
                  : selected
                    ? "border-cyan-500/60 bg-cyan-950/30"
                    : "border-slate-700 bg-slate-900/40",
              )}
            >
              <p className={cn(TERMINAL_TYPO.label, "text-slate-100")}>{opt.label}</p>
              <ul className="mt-1 space-y-0.5">
                {opt.traits.map((t) => (
                  <li key={t} className="font-mono text-[10px] text-slate-400">
                    · {t}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
      {resolved ? (
        <p
          className={cn(
            "flex items-start gap-1.5 font-mono text-[11px] leading-snug",
            wasCorrect ? "text-emerald-300" : "text-amber-300",
          )}
        >
          {wasCorrect ? <Check className="mt-0.5 h-3 w-3 shrink-0" /> : <X className="mt-0.5 h-3 w-3 shrink-0" />}
          {explanation}
        </p>
      ) : null}
    </div>
  );
}

/** PHASE 4 — pause, ask what changed, then reveal. */
export function ObservationalPause({
  question,
  reveal,
  ced,
  onRevealed,
}: {
  question: string;
  reveal: string;
  ced?: CauseEffectDecision;
  onRevealed?: () => void;
}) {
  const [shown, setShown] = useState(false);

  const revealNow = () => {
    setShown(true);
    onRevealed?.();
  };

  return (
    <div className="mt-2 space-y-2">
      <p className="flex items-center gap-1.5 font-mono text-xs text-violet-200">
        <Eye className="h-3.5 w-3.5" />
        {shown ? reveal : question}
      </p>
      {!shown ? (
        <button
          type="button"
          onClick={revealNow}
          className={cn(
            TERMINAL_TYPO.micro,
            "border border-violet-700/50 bg-violet-950/30 px-2 py-1 text-violet-200 hover:bg-violet-950/50",
          )}
        >
          REVEAL WHAT CHANGED
        </button>
      ) : ced ? (
        <div className="space-y-1 border-l-2 border-violet-700/40 pl-2 font-mono text-[10px] leading-snug text-slate-300">
          <p>
            <span className="text-slate-500">HAPPENED </span>
            {ced.happened}
          </p>
          <p>
            <span className="text-slate-500">WHY </span>
            {ced.whyItMatters}
          </p>
          <p>
            <span className="text-slate-500">TRADERS NOTICE </span>
            {ced.tradersNotice}
          </p>
          <p>
            <span className="text-slate-500">TRADERS DO </span>
            {ced.tradersDo}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** PHASE 6 — good vs bad conditions side by side. */
export function ConditionComparison({
  good,
  bad,
  onPicked,
}: {
  good: CompareSide;
  bad: CompareSide;
  onPicked: (pickedGood: boolean) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  const pick = (side: CompareSide) => {
    if (picked) return;
    setPicked(side.id);
    onPicked(side.good);
  };

  return (
    <div className="mt-2">
      <p className="mb-1.5 flex items-center gap-1 font-mono text-[10px] text-slate-400">
        <Scale className="h-3 w-3" /> Which would you rather trade in?
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[good, bad].map((side) => {
          const selected = picked === side.id;
          return (
            <button
              key={side.id}
              type="button"
              onClick={() => pick(side)}
              disabled={Boolean(picked)}
              className={cn(
                "border p-2 text-left",
                side.good ? "border-emerald-800/40" : "border-rose-800/40",
                selected && side.good && "bg-emerald-950/30 ring-1 ring-emerald-600/40",
                selected && !side.good && "bg-rose-950/20 ring-1 ring-rose-600/30",
                !picked && "hover:border-slate-600",
              )}
            >
              <p
                className={cn(
                  TERMINAL_TYPO.micro,
                  side.good ? "text-emerald-400" : "text-rose-400",
                )}
              >
                {side.title}
              </p>
              <ul className="mt-1 space-y-0.5">
                {side.traits.map((t) => (
                  <li key={t} className="font-mono text-[10px] text-slate-400">
                    · {t}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
      {picked ? (
        <p className="mt-1.5 font-mono text-[10px] text-emerald-300">
          {picked === good.id
            ? "Right — tight spread and healthy depth make execution cheaper and safer."
            : "That environment is harder to trade — wide spread and thin liquidity cost you on every fill."}
        </p>
      ) : null}
    </div>
  );
}

/** PHASE 7 — ORDER BOOK PRE-TRADE CHECK at lesson completion. */
export function PreTradeCheckPanel({
  buyItems,
  sellItems,
}: {
  buyItems: { id: string; label: string; state: string; note: string }[];
  sellItems: { id: string; label: string; state: string; note: string }[];
}) {
  const stateIcon = (state: string) =>
    state === "good" ? "text-emerald-400" : state === "warn" || state === "danger" ? "text-amber-400" : "text-slate-400";

  const Section = ({
    title,
    items,
  }: {
    title: string;
    items: { id: string; label: string; state: string; note: string }[];
  }) => (
    <div>
      <p className={cn(TERMINAL_TYPO.micro, "mb-1 text-cyan-500")}>{title}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-1.5 rounded-sm border border-slate-800 bg-slate-900/40 px-2 py-1"
          >
            <Check className={cn("mt-px h-3 w-3 shrink-0", stateIcon(item.state))} />
            <div>
              <span className="font-mono text-[10px] font-semibold text-slate-200">{item.label}</span>
              <p className="font-mono text-[9px] leading-snug text-slate-500">{item.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mt-2 space-y-2 rounded-md border border-cyan-800/40 bg-cyan-950/15 p-2">
      <p className={cn(TERMINAL_TYPO.label, "text-cyan-200")}>ORDER BOOK PRE-TRADE CHECK</p>
      <Section title="BEFORE BUYING" items={buyItems} />
      <Section title="BEFORE SELLING" items={sellItems} />
    </div>
  );
}
