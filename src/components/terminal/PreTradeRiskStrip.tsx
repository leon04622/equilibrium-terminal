"use client";

import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { usePreTradeServerCheck } from "@/hooks/usePreTradeServerCheck";
import { useInstitutionalRiskStore } from "@/store/useInstitutionalRiskStore";

interface PreTradeRiskStripProps {
  coin: string;
  side: "buy" | "sell";
  size: number;
  markPx: number | null;
  leverage: number;
  isPerp: boolean;
}

export function PreTradeRiskStrip({
  coin,
  side,
  size,
  markPx,
  leverage,
  isPerp,
}: PreTradeRiskStripProps) {
  const limits = useInstitutionalRiskStore((s) => s.limits);
  const order = useMemo(
    () =>
      markPx && size > 0 && limits.enabled
        ? { coin, side, size, markPx, leverage, isPerp }
        : null,
    [coin, side, size, markPx, leverage, isPerp, limits.enabled],
  );
  const decision = usePreTradeServerCheck(order);

  if (!decision) return null;

  if (decision.severity === "ok") {
    if (!decision.serverVerified) return null;
    return (
      <div
        className={cn(
          "flex items-center gap-1 border border-emerald-900/40 bg-emerald-950/20 px-1.5 py-0.5 text-emerald-300",
          TERMINAL_TYPO.micro,
        )}
      >
        <ShieldCheck className="h-3 w-3 shrink-0" />
        <span>Pre-trade limits OK · server verified</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-1 border px-1.5 py-1",
        decision.severity === "block"
          ? "border-rose-800/50 bg-rose-950/30 text-rose-200"
          : "border-amber-800/50 bg-amber-950/25 text-amber-200",
        TERMINAL_TYPO.micro,
      )}
    >
      <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0" />
      <div>
        <p className="font-semibold uppercase">
          {decision.severity === "block" ? "Pre-trade limit breach" : "Pre-trade warning"}
          {decision.serverVerified ? " · SRV" : ""}
        </p>
        {decision.reasons.map((r) => (
          <p key={r} className="text-[9px] opacity-90">
            {r}
          </p>
        ))}
      </div>
    </div>
  );
}
