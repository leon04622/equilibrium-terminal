"use client";

import { useMemo, useState } from "react";
import { BookA, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { Glossary } from "@/lib/education/Glossary";
import { TranslationEngine } from "@/lib/education/TranslationEngine";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import type { GlossaryTerm } from "@/types/education";

function TermCard({ term, beginnerFirst }: { term: GlossaryTerm; beginnerFirst: boolean }) {
  const [showPro, setShowPro] = useState(false);
  return (
    <div className="border border-slate-800 bg-slate-900/40 p-1.5">
      <div className="flex items-center justify-between">
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-200")}>{term.term}</span>
        <button
          type="button"
          onClick={() => setShowPro((v) => !v)}
          className={cn(TERMINAL_TYPO.micro, "text-slate-500 hover:text-slate-300")}
        >
          {showPro ? "PLAIN" : "PRO"}
        </button>
      </div>
      <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-200")}>
        {showPro ? term.professional : beginnerFirst ? term.simple : term.professional}
      </p>
      <div className="mt-1.5 space-y-1">
        <Line label="WHY IT MATTERS" tone="text-amber-400" body={term.whyItMatters} />
        <Line label="CHECK NEXT" tone="text-cyan-400" body={term.checkNext} />
        <Line label="AVOID" tone="text-rose-400" body={term.beginnerMistake} />
      </div>
    </div>
  );
}

function Line({ label, tone, body }: { label: string; tone: string; body: string }) {
  return (
    <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>
      <span className={cn(tone, "mr-1")}>{label}:</span>
      {body}
    </p>
  );
}

/**
 * Plain-English translation surface. Shows the jargon detected in the current
 * panel's live guidance, expanded into what it means / why it matters / what to
 * check / what to avoid — plus a searchable glossary.
 */
export function PlainEnglishPanel({ contextText }: { contextText?: string }) {
  const [query, setQuery] = useState("");
  const audience = useOperatorGuideStore((s) => s.selectedAudience);
  const beginnerFirst = audience === "beginner";

  const contextTerms = useMemo(
    () => (contextText ? TranslationEngine.termsIn(contextText).slice(0, 4) : []),
    [contextText],
  );
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return Glossary.search(query).slice(0, 8);
  }, [query]);

  const shown = query.trim() ? results : contextTerms;

  return (
    <div className="mb-3 border border-slate-800 bg-slate-950/60 p-1.5">
      <div className="mb-1.5 flex items-center gap-1">
        <BookA className="h-3 w-3 text-cyan-400" />
        <span className={cn(TERMINAL_TYPO.micro, "text-cyan-300")}>PLAIN ENGLISH</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>· every term, no jargon</span>
      </div>

      <div className="mb-1.5 flex items-center gap-1 border border-slate-800 bg-slate-900 px-1.5">
        <Search className="h-3 w-3 text-slate-600" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Look up a term (spread, funding, slippage…)"
          className={cn(
            TERMINAL_TYPO.micro,
            "w-full bg-transparent py-1 text-slate-200 placeholder:text-slate-600 focus:outline-none",
          )}
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className={cn(TERMINAL_TYPO.micro, "text-slate-500 hover:text-slate-300")}
          >
            CLR
          </button>
        ) : null}
      </div>

      {shown.length === 0 ? (
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {query.trim()
            ? "No matching term. Try spread, liquidity, funding, or leverage."
            : "No jargon detected here. Search any market term above."}
        </p>
      ) : (
        <>
          {!query.trim() ? (
            <p className={cn(TERMINAL_TYPO.micro, "mb-1 text-slate-600")}>TERMS USED IN THIS PANEL</p>
          ) : null}
          <div className="space-y-1.5">
            {shown.map((term) => (
              <TermCard key={term.id} term={term} beginnerFirst={beginnerFirst} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
