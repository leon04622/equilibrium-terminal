"use client";

import { memo, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { cn, formatPrice, formatSize, formatSpreadBps } from "@/lib/utils";
import { terminalSkin, TERMINAL_LAYOUT, TERMINAL_TYPO } from "@/lib/theme";
import type { OrderBookLevel } from "@/types/hyperliquid";
import { subscribePaused } from "@/lib/runtime/workspaceScroll";
import { terminalBus } from "@/store/eventBus";
import { useHyperliquidStore } from "@/store/hyperliquidStore";

const DEPTH_LEVELS = 24;
const WALL_RATIO = 2.4;

export type DepthDisplayMode = "raw" | "cumulative";

function subscribeBook(callback: () => void) {
  return subscribePaused(
    (onChange) => useHyperliquidStore.subscribe((s) => s.bookVersion, onChange),
    getBookVersion,
  )(callback);
}

function getBookVersion() {
  return useHyperliquidStore.getState().bookVersion;
}

function getBook() {
  return useHyperliquidStore.getState().book;
}

function getMidFlash() {
  return useHyperliquidStore.getState().midFlash;
}

/** Detect liquidity walls — size much larger than peers at nearby levels. */
function wallThreshold(levels: OrderBookLevel[]): number {
  if (levels.length === 0) return Infinity;
  const sizes = levels.map((l) => l.size).filter((s) => s > 0);
  if (sizes.length === 0) return Infinity;
  const sorted = [...sizes].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
  return Math.max(median * WALL_RATIO, sorted[sorted.length - 1]! * 0.55);
}

function cumulativeSizes(levels: OrderBookLevel[]): number[] {
  let sum = 0;
  return levels.map((l) => {
    sum += l.size;
    return sum;
  });
}

const DepthRow = memo(function DepthRow({
  level,
  side,
  barSize,
  maxBar,
  isWall,
  columns,
}: {
  level: OrderBookLevel;
  side: "bid" | "ask";
  barSize: number;
  maxBar: number;
  isWall: boolean;
  columns: "bid" | "ask";
}) {
  const widthPct = maxBar > 0 ? Math.min(100, (barSize / maxBar) * 100) : 0;
  const isBid = side === "bid";

  return (
    <div
      className={cn(
        "relative grid grid-cols-[1fr_auto] items-center px-0.5",
        TERMINAL_LAYOUT.bookRowClass,
        TERMINAL_TYPO.dataSm,
        isWall && "bg-slate-800/30",
      )}
      data-book-level={level.price}
    >
      {/* Center-out depth bar: bids grow left from spine, asks grow right from spine. */}
      <div className="relative h-full min-h-[16px]">
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 rounded-none transition-[width,opacity] duration-300 ease-out",
            isBid
              ? cn("right-0", terminalSkin.depthBid, isWall && "bg-[#00ff88]/35 ring-1 ring-emerald-500/25")
              : cn("left-0", terminalSkin.depthAsk, isWall && "bg-[#ff3366]/35 ring-1 ring-rose-500/25"),
          )}
          style={{ width: `${widthPct}%` }}
        />
        <span
          className={cn(
            "relative z-10 tabular-nums",
            isBid ? "float-right pr-1" : "float-left pl-1",
            columns === "bid"
              ? isBid
                ? terminalSkin.textUp
                : "text-slate-600"
              : !isBid
                ? terminalSkin.textDown
                : "text-slate-600",
          )}
        >
          {formatPrice(level.price)}
        </span>
      </div>
      <span
        className={cn(
          "relative z-10 w-12 shrink-0 text-right tabular-nums",
          isWall ? "font-semibold text-slate-200" : "text-slate-400",
        )}
      >
        {formatSize(level.size)}
      </span>
    </div>
  );
});

const EmptyRow = memo(function EmptyRow() {
  return <div className={cn(TERMINAL_LAYOUT.bookRowClass, "h-[18px]")} />;
});

const MidStrip = memo(function MidStrip({
  mid,
  spread,
  spreadBps,
  flash,
  symbol,
}: {
  mid: number | null;
  spread: number | null;
  spreadBps: number | null;
  flash: "up" | "down" | null;
  symbol: string;
}) {
  return (
    <div
      data-book-region="spread"
      className={cn(
        "flex shrink-0 items-center justify-between border-y-[0.5px] border-slate-800 bg-slate-900 px-1",
        TERMINAL_LAYOUT.bookRowClass,
        flash === "up" && terminalSkin.flashUp,
        flash === "down" && terminalSkin.flashDown,
      )}
    >
      <span className={TERMINAL_TYPO.micro}>{symbol}</span>
      <span className={cn(TERMINAL_TYPO.dataLg, "text-slate-100")}>
        {mid !== null ? formatPrice(mid) : "—"}
      </span>
      <span className={TERMINAL_TYPO.dataSm}>
        <span className="text-slate-500">SPR </span>
        {spread !== null ? formatPrice(spread, 4) : "—"}
        <span className="text-slate-500"> · </span>
        {formatSpreadBps(spreadBps)}
      </span>
    </div>
  );
});

interface DepthRowData {
  level: OrderBookLevel;
  barSize: number;
  isWall: boolean;
}

function BookPane({
  side,
  rows,
  maxBar,
  depthMode,
  className,
}: {
  side: "bid" | "ask";
  rows: (DepthRowData | null)[];
  maxBar: number;
  depthMode: DepthDisplayMode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}
      data-book-region={side === "ask" ? "asks" : "bids"}
    >
      <div
        className={cn(
          terminalSkin.borderB,
          TERMINAL_TYPO.micro,
          "flex shrink-0 justify-between px-1 py-0.5",
          side === "ask" ? terminalSkin.textDown : terminalSkin.textUp,
        )}
      >
        <span>{side === "ask" ? "ASK" : "BID"}</span>
        <span className="text-slate-500">
          {depthMode === "cumulative" ? "CUM · PX · SZ" : "PX · SZ"}
        </span>
      </div>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden",
          side === "bid" ? "flex flex-col justify-end" : "flex flex-col",
        )}
      >
        {rows.map((row, i) =>
          row ? (
            <DepthRow
              key={`${side}-${i}`}
              level={row.level}
              side={side}
              barSize={row.barSize}
              maxBar={maxBar}
              isWall={row.isWall}
              columns={side}
            />
          ) : (
            <EmptyRow key={`${side}-${i}`} />
          ),
        )}
      </div>
    </div>
  );
}

export function HyperBook() {
  useSyncExternalStore(subscribeBook, getBookVersion, getBookVersion);
  const book = useSyncExternalStore(subscribeBook, getBook, getBook);
  const midFlash = useSyncExternalStore(subscribeBook, getMidFlash, getMidFlash);
  const selectedAsset = useHyperliquidStore((s) => s.selectedAsset);
  const connectionStatus = useHyperliquidStore((s) => s.connectionStatus);
  const clearMidFlash = useHyperliquidStore((s) => s.clearMidFlash);

  const [depthMode, setDepthMode] = useState<DepthDisplayMode>("raw");

  useEffect(() => {
    return terminalBus.on("asset:select", () => {
      setDepthMode("raw");
      clearMidFlash();
    });
  }, [clearMidFlash]);

  useEffect(() => {
    if (midFlash === null) return;
    const t = window.setTimeout(() => clearMidFlash(), 200);
    return () => window.clearTimeout(t);
  }, [midFlash, clearMidFlash]);

  const bids = book?.bids.slice(0, DEPTH_LEVELS) ?? [];
  const asks = book?.asks.slice(0, DEPTH_LEVELS) ?? [];

  const bidBarSizes = useMemo(() => {
    if (depthMode === "cumulative") return cumulativeSizes(bids);
    return bids.map((l) => l.size);
  }, [bids, depthMode]);

  const askBarSizes = useMemo(() => {
    if (depthMode === "cumulative") return cumulativeSizes(asks);
    return asks.map((l) => l.size);
  }, [asks, depthMode]);

  const bidWallAt = wallThreshold(bids);
  const askWallAt = wallThreshold(asks);

  const askRows: (DepthRowData | null)[] = [
    ...asks.map((level, i) => ({
      level,
      barSize: askBarSizes[i] ?? level.size,
      isWall: level.size >= askWallAt,
    })),
    ...Array(Math.max(0, DEPTH_LEVELS - asks.length)).fill(null),
  ];

  const bidRows: (DepthRowData | null)[] = [
    ...Array(Math.max(0, DEPTH_LEVELS - bids.length)).fill(null),
    ...bids.map((level, i) => ({
      level,
      barSize: bidBarSizes[i] ?? level.size,
      isWall: level.size >= bidWallAt,
    })),
  ];

  const maxBidBar = Math.max(...bidRows.filter(Boolean).map((r) => r!.barSize), 1);
  const maxAskBar = Math.max(...askRows.filter(Boolean).map((r) => r!.barSize), 1);

  return (
    <div data-book-panel="hyperbook" data-live-panel className={cn("flex h-full flex-col", terminalSkin.canvas)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-between border-b-[0.5px] border-slate-800 px-1 py-0.5",
          TERMINAL_TYPO.micro,
        )}
      >
        <span className="text-slate-500">DEPTH</span>
        <div className="flex gap-0.5">
          {(["raw", "cumulative"] as DepthDisplayMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setDepthMode(m)}
              className={cn(
                "px-1.5 py-0.5 uppercase",
                depthMode === m
                  ? "bg-slate-800 text-cyan-300"
                  : "text-slate-600 hover:text-slate-400",
              )}
            >
              {m === "raw" ? "RAW" : "CUM"}
            </button>
          ))}
        </div>
      </div>

      <div className="relative grid min-h-0 flex-1 grid-cols-2">
        {/* Center spine — price stays centered between bid/ask depth. */}
        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-px -translate-x-1/2 bg-cyan-500/20"
          aria-hidden="true"
        />
        <BookPane side="ask" rows={askRows} maxBar={maxAskBar} depthMode={depthMode} />
        <BookPane
          side="bid"
          rows={bidRows}
          maxBar={maxBidBar}
          depthMode={depthMode}
          className="border-l-[0.5px] border-slate-800"
        />
      </div>

      <MidStrip
        mid={book?.mid ?? null}
        spread={book?.spread ?? null}
        spreadBps={book?.spreadBps ?? null}
        flash={midFlash}
        symbol={selectedAsset?.symbol ?? "—"}
      />

      <footer
        className={cn(
          "flex shrink-0 items-center justify-between border-t-[0.5px] border-slate-800 px-1",
          TERMINAL_TYPO.micro,
        )}
      >
        <span className="text-slate-500">{selectedAsset?.label ?? "—"}</span>
        <span
          className={cn(
            connectionStatus === "connected" && terminalSkin.textUp,
            connectionStatus === "reconnecting" && terminalSkin.textWarn,
            connectionStatus === "disconnected" && terminalSkin.textDown,
          )}
        >
          {connectionStatus.toUpperCase()}
        </span>
      </footer>
    </div>
  );
}
