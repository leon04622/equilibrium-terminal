"use client";

import { useEffect, useState } from "react";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useTerminalStore } from "@/store/terminalStore";
import { useExternalNewsStore } from "@/store/useExternalNewsStore";

function formatLatency(lastMessageAt: number | null): string {
  if (!lastMessageAt) return "LAT —";
  const ms = Date.now() - lastMessageAt;
  if (ms < 1000) return `LAT ${ms}ms`;
  return `LAT ${(ms / 1000).toFixed(1)}s`;
}

/** Isolated header telemetry — avoids re-rendering the workspace grid on every tick / WS message. */
export function WorkspaceHeaderTelemetry() {
  const lastMessageAt = useTerminalStore((s) => s.lastMessageAt);
  const selectedAsset = useTerminalStore((s) => s.selectedAsset);
  const newsStatus = useExternalNewsStore((s) => s.status);
  const [clock, setClock] = useState("");
  const [latencyLabel, setLatencyLabel] = useState(() => formatLatency(lastMessageAt));

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(d.toISOString().slice(11, 23));
      setLatencyLabel(formatLatency(useTerminalStore.getState().lastMessageAt));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setLatencyLabel(formatLatency(lastMessageAt));
  }, [lastMessageAt]);

  const wireLive =
    (newsStatus?.rssLiveCount ?? 0) > 0 ||
    (newsStatus?.macroFredLiveCount ?? 0) > 0 ||
    newsStatus?.macroTreasuryLive ||
    (newsStatus?.hlWireLiveCount ?? 0) > 0 ||
    (newsStatus?.squawkBuffered ?? 0) > 0;
  const wireColor = wireLive ? terminalSkin.textUp : terminalSkin.textWarn;
  const wireParts = [
    (newsStatus?.rssLiveCount ?? 0) > 0 ? `RSS ${newsStatus?.rssLiveCount}` : null,
    (newsStatus?.hlWireLiveCount ?? 0) > 0 ? `HL ${newsStatus?.hlWireLiveCount}` : null,
    (newsStatus?.macroFredLiveCount ?? 0) > 0 ? `MACRO ${newsStatus?.macroFredLiveCount}` : null,
    (newsStatus?.squawkBuffered ?? 0) > 0 ? `SQ ${newsStatus?.squawkBuffered}` : null,
  ].filter(Boolean);
  const wireLabel = wireParts.length > 0 ? `WIRE ${wireParts.join(" · ")}` : "WIRE —";

  return (
    <div
      className={cn(
        "hidden shrink-0 items-center gap-2 border-l-[0.5px] border-slate-800 pl-2 font-mono sm:flex",
        TERMINAL_TYPO.micro,
      )}
    >
      <span className="text-slate-500">UTC</span>
      <span className="tabular-nums text-slate-300">{clock}</span>
      <span className="text-slate-600">|</span>
      <span className="tabular-nums text-slate-500">{latencyLabel}</span>
      <span className="text-slate-600">|</span>
      <span className={wireColor}>{wireLabel}</span>
      <span className="text-slate-600">|</span>
      <span className={terminalSkin.textUp}>{selectedAsset?.symbol ?? "—"}</span>
    </div>
  );
}
