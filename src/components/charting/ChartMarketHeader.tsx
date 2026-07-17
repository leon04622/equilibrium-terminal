"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import {
  displayPair,
  formatFundingCountdown,
  formatUsd,
  formatPriceHl,
  fundingCountdownMs,
} from "@/lib/market/hlMarketContexts";
import { marketRowForCoin, useHlMarketContexts } from "@/hooks/useHlMarketContexts";
import { useTerminalStore } from "@/store/terminalStore";
import { MarketSearchTrigger } from "@/components/charting/MarketSearchModal";

function StatLabel({ children, dotted }: { children: React.ReactNode; dotted?: boolean }) {
  return (
    <span
      className={cn(
        TERMINAL_TYPO.micro,
        "text-[10px] normal-case tracking-normal text-slate-500",
        dotted && "cursor-help border-b border-dotted border-slate-600",
      )}
    >
      {children}
    </span>
  );
}

function StatValue({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("text-[12px] font-semibold tabular-nums text-slate-100", className)}>
      {children}
    </span>
  );
}

export function ChartMarketHeader({ coin }: { coin: string }) {
  const selectedAsset = useTerminalStore((s) => s.selectedAsset);
  const { rows } = useHlMarketContexts(true);
  const row = marketRowForCoin(rows, coin);

  const [fundingMs, setFundingMs] = useState(() => fundingCountdownMs());

  useEffect(() => {
    const id = window.setInterval(() => setFundingMs(fundingCountdownMs()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const displayName =
    row?.displayName ??
    (selectedAsset ? displayPair(selectedAsset) : `${coin}-USDC`);

  const changeAbs = row?.change24hAbs;
  const changePct = row?.change24hPct;
  const changeUp = changeAbs != null && changeAbs >= 0;

  return (
    <div
      className="flex shrink-0 items-center gap-4 overflow-x-auto border-b border-[#2a2e39] bg-[#0b0e11] px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <MarketSearchTrigger
        displayName={displayName}
        isHip3={row?.isHip3}
        maxLeverage={row?.maxLeverage}
      />

      <div className="flex min-w-0 flex-1 items-center gap-5">
        <div className="flex shrink-0 flex-col gap-0.5">
          <StatLabel dotted>Mark</StatLabel>
          <StatValue>{formatPriceHl(row?.markPrice ?? null)}</StatValue>
        </div>
        <div className="flex shrink-0 flex-col gap-0.5">
          <StatLabel dotted>Oracle</StatLabel>
          <StatValue>{formatPriceHl(row?.oraclePrice ?? null)}</StatValue>
        </div>
        <div className="flex shrink-0 flex-col gap-0.5">
          <StatLabel>24h Change</StatLabel>
          {changeAbs != null && changePct != null ? (
            <StatValue className={changeUp ? terminalSkin.textUp : terminalSkin.textDown}>
              {changeUp ? "+" : ""}
              {changeAbs.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              / {changeUp ? "+" : ""}
              {changePct.toFixed(2)}%
            </StatValue>
          ) : (
            <StatValue>—</StatValue>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-0.5">
          <StatLabel>24h Volume</StatLabel>
          <StatValue>{formatUsd(row?.volume24hUsd ?? null)}</StatValue>
        </div>
        <div className="flex shrink-0 flex-col gap-0.5">
          <StatLabel dotted>Open Interest</StatLabel>
          <StatValue>{formatUsd(row?.openInterestUsd ?? null)}</StatValue>
        </div>
        <div className="flex shrink-0 flex-col gap-0.5">
          <StatLabel dotted>Funding / Countdown</StatLabel>
          <div className="flex items-baseline gap-2">
            <span className="text-[12px] font-semibold tabular-nums text-[#26a69a]">
              {row?.funding8hPct != null ? `${row.funding8hPct.toFixed(4)}%` : "—"}
            </span>
            <span className="text-[12px] tabular-nums text-slate-300">
              {formatFundingCountdown(fundingMs)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
