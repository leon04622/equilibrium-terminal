"use client";

import { memo, useEffect, useSyncExternalStore } from "react";
import { cn, formatPrice, formatSize, formatSpreadBps } from "@/lib/utils";
import { terminalSkin, TERMINAL_LAYOUT, TERMINAL_TYPO } from "@/lib/theme";
import type { OrderBookLevel } from "@/types/hyperliquid";
import { terminalBus } from "@/store/eventBus";
import { useHyperliquidStore } from "@/store/hyperliquidStore";

const DEPTH_LEVELS = 24;

function subscribeBook(callback: () => void) {
  return useHyperliquidStore.subscribe((s) => s.bookVersion, () => callback());
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

const DepthRow = memo(function DepthRow({
  level,
  side,
  maxSize,
  columns,
}: {
  level: OrderBookLevel;
  side: "bid" | "ask";
  maxSize: number;
  columns: "bid" | "ask";
}) {
  const widthPct = maxSize > 0 ? Math.min(100, (level.size / maxSize) * 100) : 0;
  const isBid = side === "bid";

  return (
    <div
      className={cn(
        "relative grid grid-cols-[1fr_auto] items-center px-1",
        TERMINAL_LAYOUT.bookRowClass,
        TERMINAL_TYPO.dataSm,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 rounded-none",
          isBid ? "right-0 " + terminalSkin.depthBid : "left-0 " + terminalSkin.depthAsk,
        )}
        style={{ width: `${widthPct}%` }}
      />
      <span
        className={cn(
          "relative z-10 tabular-nums",
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
      <span className="relative z-10 pl-2 text-right tabular-nums text-slate-400">
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

function BookPane({
  side,
  maxSize,
  padded,
  className,
}: {
  side: "bid" | "ask";
  maxSize: number;
  padded: (OrderBookLevel | null)[];
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}>
      <div
        className={cn(
          terminalSkin.borderB,
          TERMINAL_TYPO.micro,
          "flex shrink-0 justify-between px-1 py-0.5",
          side === "ask" ? terminalSkin.textDown : terminalSkin.textUp,
        )}
      >
        <span>{side === "ask" ? "ASK" : "BID"}</span>
        <span className="text-slate-500">PX · SZ</span>
      </div>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden",
          side === "bid" ? "flex flex-col justify-end" : "flex flex-col",
        )}
      >
        {padded.map((level, i) =>
          level ? (
            <DepthRow
              key={`${side}-${level.price}-${i}`}
              level={level}
              side={side}
              maxSize={maxSize}
              columns={side}
            />
          ) : (
            <EmptyRow key={`${side}-empty-${i}`} />
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

  useEffect(() => {
    return terminalBus.on("asset:select", () => {});
  }, []);

  useEffect(() => {
    if (midFlash === null) return;
    const t = window.setTimeout(() => clearMidFlash(), 200);
    return () => window.clearTimeout(t);
  }, [midFlash, clearMidFlash]);

  const bids = book?.bids.slice(0, DEPTH_LEVELS) ?? [];
  const asks = book?.asks.slice(0, DEPTH_LEVELS) ?? [];
  const maxBid = book?.maxBidSize ?? 1;
  const maxAsk = book?.maxAskSize ?? 1;

  const paddedBids: (OrderBookLevel | null)[] = [
    ...Array(Math.max(0, DEPTH_LEVELS - bids.length)).fill(null),
    ...bids,
  ];
  const paddedAsks: (OrderBookLevel | null)[] = [
    ...asks,
    ...Array(Math.max(0, DEPTH_LEVELS - asks.length)).fill(null),
  ];

  return (
    <div className={cn("flex h-full flex-col", terminalSkin.canvas)}>
      <div className="grid min-h-0 flex-1 grid-cols-2">
        <BookPane side="ask" maxSize={maxAsk} padded={paddedAsks} />
        <BookPane
          side="bid"
          maxSize={maxBid}
          padded={paddedBids}
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


