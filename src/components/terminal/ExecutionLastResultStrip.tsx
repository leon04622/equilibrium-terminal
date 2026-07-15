"use client";

import { useHyperliquidStore } from "@/store/hyperliquidStore";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Last live/paper execution result with builder audit tag and HL hint. */
export function ExecutionLastResultStrip() {
  const event = useHyperliquidStore((s) => s.lastExecutionEvent);
  if (!event) return null;

  const ageSec = Math.floor((Date.now() - event.at) / 1000);
  if (ageSec > 120) return null;

  const ok = event.outcome === "ok";
  const builderTag = event.builderAttached ? "BLDR 0.01%" : event.mode === "live" ? "NO BLDR" : "PAPER";

  return (
    <div
      data-trade-region="exec-last-result"
      className={cn(
        terminalSkin.borderB,
        "px-1 py-0.5",
        ok ? "bg-emerald-950/20" : "bg-rose-950/25",
      )}
    >
      <div className="flex items-center gap-1">
        <span className={cn(TERMINAL_TYPO.micro, ok ? terminalSkin.textUp : terminalSkin.textDown)}>
          {ok ? "FILLED" : "REJECTED"}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {event.action === "close_position" ? "CLOSE" : "ORDER"} · {event.side.toUpperCase()} {event.size}{" "}
          {event.coin} · {builderTag}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>{ageSec}s</span>
      </div>
      <p className={cn(TERMINAL_TYPO.micro, "truncate text-slate-400")}>{event.detail}</p>
      {!ok && event.hint ? (
        <p className={cn(TERMINAL_TYPO.micro, terminalSkin.textWarn)}>{event.hint}</p>
      ) : null}
    </div>
  );
}
