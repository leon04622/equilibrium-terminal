"use client";

import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { REGIME_VISUAL } from "@/lib/theme/equilibrium-visual";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";

export function ChartOperationalHud() {
  const coin = useTerminalStore((s) => s.selectedCoin);
  const connection = useTerminalStore((s) => s.connectionStatus);
  const book = useTerminalStore((s) => s.book);
  const intelCount = useTerminalStore((s) => s.intelligence.length);
  const regime = useMarketAtmosphereStore((s) => s.regime.regime);
  const stress = useMarketAtmosphereStore((s) => s.stress);
  const reducedMotion = useTerminalExperienceStore((s) => s.reducedMotion);

  const regimeVis = REGIME_VISUAL[regime];
  const spreadBps = stress.spreadBps.toFixed(1);
  const stressScore = stress.score.toFixed(0);
  const live = connection === "connected";

  return (
    <div className="pointer-events-none absolute inset-0 z-[15] flex flex-col justify-between">
      <div
        className="flex items-stretch border-b border-slate-800/90"
        style={{ background: regimeVis.ribbon }}
      >
        <span
          data-chart-region="regime"
          className={cn(
            TERMINAL_TYPO.micro,
            "border-r border-slate-800/80 px-1.5 py-0.5 text-slate-300",
          )}
        >
          {regimeVis.label}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "px-1.5 py-0.5 text-slate-500")}>
          {coin} · STRESS {stressScore}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto px-1.5 py-0.5 text-slate-600")}>
          SPR {spreadBps}bps
        </span>
        <span
          className={cn(
            TERMINAL_TYPO.micro,
            "flex items-center gap-1 border-l border-slate-800/80 px-1.5 py-0.5",
            live ? terminalSkin.textUp : terminalSkin.textWarn,
          )}
        >
          <span
            className={cn(
              "inline-block h-1 w-1 rounded-full bg-current",
              live && !reducedMotion && "eq-live-pulse",
            )}
          />
          {live ? "STREAM" : connection.toUpperCase()}
        </span>
      </div>

      <div className="flex items-end justify-between gap-0.5 px-0.5 pb-0.5">
        <div className="flex flex-wrap gap-0.5">
          <HudChip label="MID" value={book?.mid ? book.mid.toFixed(2) : "—"} region="mid" />
          <HudChip label="INTEL" value={String(intelCount)} accent />
          <HudChip label="LIQ" value={stress.bookImbalance >= 0 ? "BID" : "ASK"} />
        </div>
        <div className="flex flex-wrap justify-end gap-0.5">
          <HudChip label="EXEC ZONE" value="ACTIVE" />
          <HudChip label="DEPTH" value="OVERLAY" accent />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-6 bottom-6 border-x border-cyan-950/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-6 bottom-6 w-px bg-gradient-to-b from-transparent via-cyan-900/30 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-12 top-6 bottom-6 w-px bg-gradient-to-b from-transparent via-slate-700/40 to-transparent"
        aria-hidden
      />
    </div>
  );
}

function HudChip({
  label,
  value,
  accent,
  region,
}: {
  label: string;
  value: string;
  accent?: boolean;
  region?: string;
}) {
  return (
    <span
      data-chart-region={region}
      className={cn(
        TERMINAL_TYPO.micro,
        "border border-slate-800/90 bg-slate-950/85 px-1 py-px",
        accent ? "text-cyan-500/90" : "text-slate-500",
      )}
    >
      <span className="text-slate-600">{label} </span>
      <span className={accent ? "text-cyan-400/90" : "text-slate-400"}>{value}</span>
    </span>
  );
}
