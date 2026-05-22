"use client";

import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";

export function PanelLoadingState({ label = "SYNC" }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[80px] flex-col items-center justify-center gap-1 p-2">
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "inline-block h-1 w-1 bg-slate-600",
              "animate-pulse",
              i === 1 && "[animation-delay:120ms]",
              i === 2 && "[animation-delay:240ms]",
            )}
          />
        ))}
      </div>
      <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}…</p>
    </div>
  );
}
