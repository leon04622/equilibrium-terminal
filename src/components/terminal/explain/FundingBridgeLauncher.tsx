"use client";

import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { useFundingBridgeStore } from "@/store/useFundingBridgeStore";

export function FundingBridgeLauncher() {
  const active = useFundingBridgeStore((s) => s.active);
  const start = useFundingBridgeStore((s) => s.start);

  return (
    <button
      type="button"
      onClick={start}
      title="Live funding walkthrough on the derivatives desk"
      className={cn(
        TERMINAL_TYPO.micro,
        "flex shrink-0 items-center gap-1 border px-2 py-0.5 transition-colors",
        active
          ? "border-violet-500/70 bg-violet-950/50 text-violet-200"
          : "border-violet-700/40 bg-violet-950/20 text-violet-300/90 hover:border-violet-500/70",
      )}
    >
      <Radio className="h-3 w-3" />
      <span className="tracking-wide">FUNDING LIVE</span>
    </button>
  );
}
