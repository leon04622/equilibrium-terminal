"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import type { MacroCalendarEvent, MacroTickerData, MarketRegime } from "@/types/market-atmosphere";

function regimeLabel(regime: MarketRegime): string {
  switch (regime) {
    case "risk-on":
      return "RISK-ON";
    case "risk-off":
      return "RISK-OFF";
    case "compression":
      return "COMPRESS";
    case "liquidation":
      return "LIQ REGIME";
    default:
      return "NEUTRAL";
  }
}

function regimeColor(regime: MarketRegime): string {
  switch (regime) {
    case "risk-on":
      return terminalSkin.textUp;
    case "risk-off":
    case "liquidation":
      return terminalSkin.textDown;
    case "compression":
      return terminalSkin.textWarn;
    default:
      return "text-slate-500";
  }
}

function MacroRow({ row }: { row: MacroTickerData }) {
  const up = row.changePct >= 0;
  return (
    <div
      className={cn(
        terminalSkin.row,
        "grid grid-cols-[56px_1fr_72px_56px_56px] gap-1 border-b-[0.5px] border-slate-800 px-1 py-0.5",
      )}
    >
      <span className={cn(TERMINAL_TYPO.dataSm, "font-bold text-slate-400")}>{row.symbol}</span>
      <span className={cn(TERMINAL_TYPO.dataSm, "truncate text-slate-500")}>{row.label}</span>
      <span className={cn(TERMINAL_TYPO.dataSm, "justify-self-end tabular-nums text-slate-200")}>
        {row.symbol === "US10Y" ? row.last.toFixed(3) : row.last.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </span>
      <span
        className={cn(
          TERMINAL_TYPO.dataSm,
          "justify-self-end tabular-nums",
          up ? terminalSkin.textUp : terminalSkin.textDown,
        )}
      >
        {up ? "+" : ""}
        {row.changePct.toFixed(2)}%
      </span>
      <span className={cn(TERMINAL_TYPO.micro, "justify-self-end text-slate-600")}>
        H {row.symbol === "US10Y" ? row.sessionHigh.toFixed(3) : row.sessionHigh.toFixed(0)}
      </span>
    </div>
  );
}

function CalendarRow({ event }: { event: MacroCalendarEvent }) {
  const impactColor =
    event.impact === "high"
      ? terminalSkin.textDown
      : event.impact === "med"
        ? terminalSkin.textWarn
        : "text-slate-600";
  return (
    <div
      className={cn(
        terminalSkin.row,
        "grid grid-cols-[52px_1fr_48px_40px] gap-1 border-b-[0.5px] border-slate-800 px-1 py-0.5",
      )}
    >
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
        {formatTapeTime(event.scheduledAt).slice(0, 8)}
      </span>
      <span className={cn(TERMINAL_TYPO.dataSm, "truncate text-slate-400")}>{event.title}</span>
      <span className={cn(TERMINAL_TYPO.micro, impactColor)}>{event.impact.toUpperCase()}</span>
      <span className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>
        {event.forecast ?? "—"}
      </span>
    </div>
  );
}

export function MacroMatrix() {
  const macro = useMarketAtmosphereStore((s) => s.macro);
  const calendar = useMarketAtmosphereStore((s) => s.calendar);
  const stress = useMarketAtmosphereStore((s) => s.stress);
  const regime = useMarketAtmosphereStore((s) => s.regime);

  const sortedCalendar = useMemo(
    () => [...calendar].sort((a, b) => a.scheduledAt - b.scheduledAt).slice(0, 4),
    [calendar],
  );

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-none",
        "border-[0.5px] border-slate-800 bg-slate-950",
      )}
    >
      <div
        className={cn(
          terminalSkin.panelHeader,
          terminalSkin.borderB,
          "justify-between px-1",
        )}
      >
        <span>MACRO MATRIX</span>
        <span className={cn(TERMINAL_TYPO.micro, regimeColor(regime.regime))}>
          {regimeLabel(regime.regime)} · STR {stress.score}
        </span>
      </div>

      <div
        className={cn(
          terminalSkin.row,
          terminalSkin.borderB,
          "grid grid-cols-[56px_1fr_72px_56px_56px] gap-1 bg-slate-900/60 px-1 py-0.5",
        )}
      >
        <span>SYM</span>
        <span>INSTRUMENT</span>
        <span className="justify-self-end">LAST</span>
        <span className="justify-self-end">Δ%</span>
        <span className="justify-self-end">RNG</span>
      </div>

      <div className="shrink-0">
        {macro.map((row) => (
          <MacroRow key={row.symbol} row={row} />
        ))}
      </div>

      <div
        className={cn(
          terminalSkin.borderT,
          terminalSkin.borderB,
          "flex items-center justify-between px-1 py-0.5",
        )}
      >
        <span className={TERMINAL_TYPO.micro}>STRESS GAUGE</span>
        <span className={cn(TERMINAL_TYPO.micro, terminalSkin.textAi)}>
          AI {regime.confidencePulse.toFixed(0)}% · ACC {regime.narrativeAcceleration >= 0 ? "+" : ""}
          {regime.narrativeAcceleration}
        </span>
      </div>

      <div className="h-1.5 w-full border-b-[0.5px] border-slate-800 bg-slate-950">
        <div
          className="h-full rounded-none bg-[#ff3366]/80"
          style={{ width: `${stress.score}%` }}
        />
      </div>

      <div className={cn(terminalSkin.borderB, "px-1 py-0.5")}>
        <span className={TERMINAL_TYPO.micro}>MACRO CALENDAR</span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {sortedCalendar.map((event) => (
          <CalendarRow key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
