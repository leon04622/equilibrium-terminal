"use client";

import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { isBloombergChrome } from "@/lib/theme/bloomberg";
import { resolveMoneySafety } from "@/lib/beginner/beginnerTranslation";
import { useHyperliquidAuthContext } from "@/contexts/HyperliquidAuthContext";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import { useDeskExecutionStore } from "@/store/useDeskExecutionStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";

export function MoneySafetyStrip() {
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);
  const { isConnected, isAuthorized } = useHyperliquidAuthContext();
  const deskMode = useDeskExecutionStore((s) => s.mode);
  const claims = useProductionConfigStore((s) => s.claims);

  if (!beginnerMode) return null;

  const safety = resolveMoneySafety({
    isConnected,
    isAuthorized,
    deskMode,
    hasDeskSession: Boolean(claims),
  });

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1.5 border px-1.5 py-0.5",
        isBloombergChrome(beginnerMode)
          ? "border-[#ff9900]/30 bg-black"
          : "border-slate-800 bg-slate-950/80",
        TERMINAL_TYPO.micro,
      )}
      title={safety.hint}
    >
      <span
        className={cn(
          "rounded-sm border px-1 py-px font-semibold",
          safety.connection === "CONNECTED"
            ? "border-emerald-800/50 text-emerald-400"
            : "border-slate-700 text-slate-500",
        )}
      >
        {safety.connection}
      </span>
      <span
        className={cn(
          "rounded-sm border px-1 py-px font-semibold",
          safety.trading === "LIVE"
            ? "border-rose-800/50 text-rose-400"
            : safety.trading === "PAPER"
              ? "border-cyan-800/50 text-cyan-400"
              : "border-slate-700 text-slate-500",
        )}
      >
        {safety.trading}
      </span>
      {claims ? (
        <span className="rounded-sm border border-emerald-800/40 px-1 py-px text-emerald-500">SIGNED IN</span>
      ) : null}
    </div>
  );
}
