"use client";



import { HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";

import { TERMINAL_TYPO } from "@/lib/theme";

import { WHAT_IS_THIS, type BeginnerConceptId } from "@/lib/beginner/beginnerTranslation";



export function WhatIsThisCard({

  conceptId,

  compact = false,

  className,

}: {

  conceptId: BeginnerConceptId;

  compact?: boolean;

  className?: string;

}) {

  const entry = WHAT_IS_THIS[conceptId];

  if (!entry) return null;



  if (compact) {

    return (

      <p className={cn(TERMINAL_TYPO.micro, "text-slate-500", className)}>

        <span className="text-cyan-400/90">What is this?</span> {entry.body}

      </p>

    );

  }



  return (

    <div className={cn("border border-cyan-900/40 bg-cyan-950/15 px-2 py-1.5", className)}>

      <div className="flex items-start gap-1.5">

        <HelpCircle className="mt-0.5 h-3 w-3 shrink-0 text-cyan-400" />

        <div className="min-w-0">

          <p className={cn(TERMINAL_TYPO.micro, "font-semibold text-cyan-300")}>What is {entry.term}?</p>

          <p className={cn(TERMINAL_TYPO.micro, "mt-0.5 leading-snug text-slate-400")}>{entry.body}</p>

        </div>

      </div>

    </div>

  );

}


