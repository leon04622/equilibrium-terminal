"use client";

import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import type { ExplainVisualCue as VisualCue } from "@/types/operator-guide";

const CUE_ART: Record<VisualCue["type"], string[]> = {
  spread_widen: [
    "  BID ░░     ASK ████",
    "  spread ───────► WIDE",
    "  mid ···············",
  ],
  spread_compress: [
    "  BID ████   ASK ████",
    "  spread ► tight",
    "  mid ═══════════════",
  ],
  bid_stack: [
    "  ████  bid reload",
    "  ████  at level",
    "  ────  mid",
  ],
  ask_reload: [
    "  ────  mid",
    "  ████  ask stack",
    "  ████  overhead",
  ],
  tape_buy: [
    "  ▲ $85k BUY",
    "  ▲ $42k BUY",
    "  book holds",
  ],
  tape_sell: [
    "  ▼ $120k SELL",
    "  ▼ ▼ cluster",
    "  spread widens",
  ],
  vol_expand: [
    "  |  |  |  |",
    "  range ► BREAK",
    "  vol ████████",
  ],
  funding_flip: [
    "  fund +0.08%",
    "      ▼ flip",
    "  fund −0.02%",
  ],
  liquidation: [
    "  price ▼▼▼",
    "  liq ████",
    "  book vacuum",
  ],
  breakout: [
    "  ─── resistance",
    "      ▲ break",
    "  ███ hold",
  ],
  flow_imbalance: [
    "  BUY ████",
    "  vs",
    "  SELL ██",
  ],
};

export function ExplainVisualCueCard({ cue }: { cue: VisualCue }) {
  const lines = CUE_ART[cue.type] ?? CUE_ART.flow_imbalance;

  return (
    <div className="border border-slate-800 bg-slate-900/60 p-1.5">
      <p className={cn(TERMINAL_TYPO.micro, "text-cyan-500")}>{cue.label}</p>
      <pre
        className={cn(
          TERMINAL_TYPO.micro,
          "mt-1 whitespace-pre font-mono text-[9px] leading-tight text-emerald-400/90",
        )}
        aria-hidden
      >
        {lines.join("\n")}
      </pre>
      <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-500")}>{cue.caption}</p>
    </div>
  );
}
