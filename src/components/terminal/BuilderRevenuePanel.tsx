"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { useBuilderRevenue } from "@/hooks/useBuilderRevenue";
import { useBuilderFillAnalytics } from "@/hooks/useBuilderFillAnalytics";
import { formatHlUsd } from "@/types/hyperliquid-referral";
import {
  BUILDER_MAX_FEE_RATE,
  BUILDER_ORDER_FEE_RATE,
  builderFeeLabel,
} from "@/lib/hyperliquid/builder";

function StatRow({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 py-0.5">
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.micro, "tabular-nums", tone ?? "text-slate-300")}>{value}</span>
    </div>
  );
}

export function BuilderRevenuePanel({ compact = false }: { compact?: boolean }) {
  const { builderAddress, state, loading, error, updatedAt, refresh } = useBuilderRevenue();
  const {
    analytics: fills,
    loading: fillsLoading,
    error: fillsError,
    refresh: refreshFills,
  } = useBuilderFillAnalytics(7);

  const addrShort = `${builderAddress.slice(0, 8)}…${builderAddress.slice(-6)}`;

  const fmtUsd = (n: number | null | undefined) => {
    if (n == null || !Number.isFinite(n)) return "—";
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}k`;
    return `$${n.toFixed(2)}`;
  };

  return (
    <div
      className={cn(
        compact ? "space-y-1" : "space-y-2 rounded-none border-[0.5px] border-slate-800 bg-slate-950 p-2",
      )}
      data-builder-revenue-panel
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn(TERMINAL_TYPO.label, "text-amber-300")}>BUILDER CODE</span>
        <button
          type="button"
          onClick={() => {
            void refresh();
            void refreshFills();
          }}
          disabled={loading || fillsLoading}
          className={cn(TERMINAL_TYPO.micro, "text-slate-600 hover:text-slate-400")}
          title="Refresh builder stats"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        </button>
      </div>

      <StatRow label="Address" value={addrShort} />
      <StatRow label="Perp fill fee" value={builderFeeLabel()} />
      <StatRow label="Max approval" value={BUILDER_MAX_FEE_RATE} />

      {error ? (
        <p className={cn(TERMINAL_TYPO.micro, terminalSkin.textWarn)}>{error}</p>
      ) : (
        <>
          <StatRow
            label="Builder rewards"
            value={formatHlUsd(state?.builderRewards)}
            tone={terminalSkin.textUp}
          />
          <StatRow label="Unclaimed" value={formatHlUsd(state?.unclaimedRewards)} tone="text-cyan-300" />
          <StatRow label="Claimed" value={formatHlUsd(state?.claimedRewards)} />
          {!compact ? (
            <StatRow label="Builder volume" value={formatHlUsd(state?.cumVlm)} />
          ) : null}
        </>
      )}

      {!compact ? (
        <div className="mt-1 border-t border-slate-800/80 pt-1">
          <p className={cn(TERMINAL_TYPO.micro, "text-amber-300/90")}>7D FILL ANALYTICS (HL CSV)</p>
          {fillsError ? (
            <p className={cn(TERMINAL_TYPO.micro, terminalSkin.textWarn)}>{fillsError}</p>
          ) : (
            <>
              <StatRow label="Fills (7d)" value={fills ? String(fills.fillCount) : "—"} />
              <StatRow
                label="Routed notional"
                value={fmtUsd(fills?.notionalUsd)}
                tone={terminalSkin.textUp}
              />
              <StatRow label="Builder fees (7d)" value={fmtUsd(fills?.builderFeeUsd)} tone="text-cyan-300" />
              <StatRow
                label="Days with data"
                value={fills ? `${fills.daysWithData}/${fills.daysQueried}` : "—"}
              />
              {fills && fills.topCoins.length > 0 ? (
                <p className={cn(TERMINAL_TYPO.micro, "pt-0.5 text-slate-500")}>
                  Top: {fills.topCoins.slice(0, 3).map((c) => `${c.coin} ${fmtUsd(c.notionalUsd)}`).join(" · ")}
                </p>
              ) : fills && fills.fillCount === 0 ? (
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  No builder-attached fills in the last 7 days yet.
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {!compact ? (
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          Users approve {BUILDER_ORDER_FEE_RATE} on first live perp trade. Claim rewards via Hyperliquid
          referral portal when fills route through this desk.
        </p>
      ) : null}

      {updatedAt ? (
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-700")}>
          Updated {new Date(updatedAt).toLocaleTimeString()}
        </p>
      ) : null}
    </div>
  );
}
