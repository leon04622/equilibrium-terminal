"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Icon-only affordance — never expose "right arrow" to speech or visible fallback text. */
export function AcademyNextLabel({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span>NEXT</span>
      <ArrowRight className="h-3 w-3 shrink-0" aria-hidden strokeWidth={2} />
    </span>
  );
}

export function AcademyPrevLabel({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <ArrowLeft className="h-3 w-3 shrink-0" aria-hidden strokeWidth={2} />
    </span>
  );
}
