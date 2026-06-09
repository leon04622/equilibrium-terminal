"use client";

import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { useFundingCrowdingStore } from "@/store/useFundingCrowdingStore";

export function FundingCrowdingLauncher() {
  const active = useFundingCrowdingStore((s) => s.active);
  const open = useFundingCrowdingStore((s) => s.open);

  return (
    <button
      type="button"
      onClick={open}
      title="Learn funding, crowding, and squeeze risk in plain language"
      className={cn(
        TERMINAL_TYPO.micro,
        "flex shrink-0 items-center gap-1 border px-2 py-0.5 transition-colors",
        active
          ? "border-violet-500/70 bg-violet-950/50 text-violet-200"
          : "border-violet-700/50 bg-violet-950/25 text-violet-300 hover:border-violet-500/70",
      )}
    >
      <TrendingUp className="h-3 w-3" />
      <span className="tracking-wide">LEARN FUNDING</span>
    </button>
  );
}
