"use client";

import { Link2, Pause, Play, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { useChartAnalyticsStore } from "@/store/useChartAnalyticsStore";
import type { ChartTimeframe } from "@/types/chart-analytics";

const TIMEFRAMES: ChartTimeframe[] = ["1s", "1m", "5m", "15m", "1h", "4h", "1d"];

export function ChartAnalyticsToolbar({ coin }: { coin: string }) {
  const snapshot = useChartAnalyticsStore((s) => s.snapshot);
  const timeframe = useChartAnalyticsStore((s) => s.timeframe);
  const setTimeframe = useChartAnalyticsStore((s) => s.setTimeframe);
  const setLinked = useChartAnalyticsStore((s) => s.setLinked);
  const replayPlay = useChartAnalyticsStore((s) => s.replayPlay);
  const replayPause = useChartAnalyticsStore((s) => s.replayPause);
  const replayLive = useChartAnalyticsStore((s) => s.replayLive);
  const replayScrub = useChartAnalyticsStore((s) => s.replayScrub);

  const replay = snapshot?.replay;
  const linked = snapshot?.sync.linked ?? true;

  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-1 border-b border-terminal-border/50 px-1 py-0.5",
        TERMINAL_TYPO.micro,
      )}
    >
      <span className="text-slate-400">{coin}</span>
      <span className="text-slate-600">·</span>
      <span className={terminalSkin.textUp}>CHART OPS</span>

      <select
        value={timeframe}
        onChange={(e) => setTimeframe(e.target.value as ChartTimeframe)}
        className="border-0 bg-transparent text-slate-400 outline-none"
        title="Timeframe"
      >
        {TIMEFRAMES.map((tf) => (
          <option key={tf} value={tf}>
            {tf}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setLinked(!linked)}
        className={cn("px-1", linked ? "text-cyan-500" : "text-slate-600")}
        title="Linked multi-chart sync"
      >
        <Link2 className="inline h-2.5 w-2.5" /> SYNC
      </button>

      <span className="text-slate-600">|</span>
      <button
        type="button"
        onClick={replayLive}
        className={cn("px-1", replay?.mode === "live" ? "text-cyan-500" : "text-slate-600")}
        title="Live stream"
      >
        <Radio className="inline h-2.5 w-2.5" /> LIVE
      </button>
      <button
        type="button"
        onClick={replayPlay}
        className="px-1 text-slate-500 hover:text-slate-300"
        title="Replay playback"
      >
        <Play className="inline h-2.5 w-2.5" />
      </button>
      <button
        type="button"
        onClick={replayPause}
        className="px-1 text-slate-500 hover:text-slate-300"
        title="Pause replay"
      >
        <Pause className="inline h-2.5 w-2.5" />
      </button>

      {replay && replay.rangeEnd > replay.rangeStart ? (
        <input
          type="range"
          min={replay.rangeStart}
          max={replay.rangeEnd}
          value={replay.playheadTime ?? replay.rangeEnd}
          onChange={(e) => replayScrub(Number(e.target.value))}
          className="h-1 w-20 accent-cyan-600"
          title="Scrub replay"
        />
      ) : null}

      <span className="ml-auto text-slate-600">
        {snapshot?.barCount ?? 0} bars · Δ {snapshot?.flow.cumulativeDelta.toFixed(2) ?? "—"}
        {snapshot?.microstructure.spreadBps != null
          ? ` · ${snapshot.microstructure.spreadBps.toFixed(1)} bps`
          : ""}
      </span>
    </div>
  );
}
