"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { STALE_MS } from "@/lib/hyperliquid/constants";
import { useTerminalStore } from "@/store/terminalStore";

/** Non-blocking banner when the HL stream is reconnecting or stale. */
export function StreamReconnectBanner() {
  const connectionStatus = useTerminalStore((s) => s.connectionStatus);
  const lastMessageAt = useTerminalStore((s) => s.lastMessageAt);

  const [stale, setStale] = useState(false);

  useEffect(() => {
    const tick = () => {
      const last = useTerminalStore.getState().lastMessageAt;
      const status = useTerminalStore.getState().connectionStatus;
      setStale(
        status === "connected" &&
          last !== null &&
          Date.now() - last > STALE_MS * 0.75,
      );
    };
    tick();
    const id = window.setInterval(tick, 2000);
    return () => window.clearInterval(id);
  }, [connectionStatus, lastMessageAt]);

  if (connectionStatus === "connected" && !stale) return null;

  const label =
    connectionStatus === "connecting"
      ? "CONNECTING TO HL STREAM"
      : connectionStatus === "reconnecting" || stale
        ? "RECONNECTING · MARKET DATA PAUSED"
        : "STREAM OFFLINE · EXECUTION BLOCKED";

  const tone =
    connectionStatus === "disconnected"
      ? terminalSkin.textDown
      : terminalSkin.textWarn;

  return (
    <div
      role="status"
      className={cn(
        "flex shrink-0 items-center justify-center border-b-[0.5px] border-amber-900/60 bg-amber-950/40 px-2 py-0.5",
        TERMINAL_TYPO.micro,
        tone,
      )}
    >
      <span className="animate-pulse">{label}</span>
      {lastMessageAt ? (
        <span className="ml-2 text-slate-600">
          last tick {(Math.max(0, Date.now() - lastMessageAt) / 1000).toFixed(0)}s ago
        </span>
      ) : null}
    </div>
  );
}
