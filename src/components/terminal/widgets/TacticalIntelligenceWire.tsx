"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { openWireArticle } from "@/store/useArticleReaderStore";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { subscribePaused } from "@/lib/runtime/workspaceScroll";
import { ensureWireSeeded } from "@/lib/distribution/wireSeed";
import { focusWireSymbol } from "@/lib/workflow/wireSymbolFocus";
import { terminalBus } from "@/store/eventBus";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { TacticalWireItem, WireDirection, WireSeverity } from "@/types/market-atmosphere";

function subscribeWire(callback: () => void) {
  return subscribePaused(
    (onChange) => useMarketAtmosphereStore.subscribe((s) => s.wireVersion, onChange),
    () => useMarketAtmosphereStore.getState().wireVersion,
  )(callback);
}

function getWire(): TacticalWireItem[] {
  return useMarketAtmosphereStore.getState().wire;
}

function directionColor(direction: WireDirection): string {
  switch (direction) {
    case "bullish":
      return terminalSkin.textUp;
    case "bearish":
      return terminalSkin.textDown;
    default:
      return "text-slate-500";
  }
}

function severityFlash(severity: WireSeverity, isNew: boolean): string {
  if (!isNew) return "";
  if (severity === "critical") return terminalSkin.flashDown;
  if (severity === "watch") return terminalSkin.flashUp;
  return "bg-slate-900/40";
}

const OPEN_ORIGINAL_BTN = cn(
  TERMINAL_TYPO.micro,
  "inline-flex shrink-0 items-center gap-0.5 border border-[#ff9900]/45 bg-[#ff9900]/10 px-1.5 py-0.5 text-[#ff9900] hover:bg-[#ff9900]/20",
);

function WireCluster({ item }: { item: TacticalWireItem }) {
  const clearFlash = useMarketAtmosphereStore((s) => s.clearWireFlash);

  useEffect(() => {
    if (!item.isNew) return;
    const t = window.setTimeout(() => clearFlash(item.id), 380);
    return () => window.clearTimeout(t);
  }, [clearFlash, item.id, item.isNew]);

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (item.articleUrl) {
      if (e.shiftKey) {
        window.open(item.articleUrl, "_blank", "noopener,noreferrer");
        return;
      }
      openWireArticle({
        url: item.articleUrl,
        headline: item.headline,
        detail: item.channel,
        source: "TACTICAL WIRE",
        timestamp: item.timestamp,
        coin: item.coin,
      });
      if (item.coin) focusWireSymbol(item.coin, "tactical-wire");
      return;
    }
    focusWireSymbol(item.coin, "tactical-wire");
    terminalBus.emit("intelligence:signal", {
      id: item.id,
      coin: item.coin,
      kind: item.channel === "on-chain" ? "whale" : "social",
    });
  };

  return (
    <div
      className={cn(
        "flex items-stretch border-b-[0.5px] border-slate-800",
        "hover:bg-slate-900/90",
        severityFlash(item.severity, item.isNew),
      )}
    >
      <button
        type="button"
        title={
          item.articleUrl
            ? "Read in terminal (Shift+click opens browser)"
            : `Focus ${item.coin}`
        }
        onClick={handleClick}
        className="min-w-0 flex-1 px-1 py-0.5 text-left"
      >
        <div className="flex items-center gap-1">
          <span className={cn(TERMINAL_TYPO.micro, "w-[62px] shrink-0 text-slate-600")}>
            {formatTapeTime(item.timestamp).slice(0, 8)}
          </span>
          <span
            className={cn(
              TERMINAL_TYPO.dataSm,
              "w-10 shrink-0 font-bold",
              item.severity === "critical"
                ? terminalSkin.textDown
                : item.severity === "watch"
                  ? terminalSkin.textWarn
                  : terminalSkin.textUp,
            )}
          >
            {item.coin}
          </span>
          <span className={cn(TERMINAL_TYPO.micro, directionColor(item.direction))}>
            {item.direction.slice(0, 4).toUpperCase()}
          </span>
          <span className={cn(TERMINAL_TYPO.micro, terminalSkin.textAi)}>
            CNF {item.confidenceIndex}%
          </span>
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
            ACC {item.acceleration >= 0 ? "+" : ""}
            {item.acceleration}
          </span>
          <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
            {item.channel.toUpperCase()}
          </span>
        </div>
        <p className={cn(TERMINAL_TYPO.dataSm, "truncate pl-[74px] text-slate-300")}>
          {item.headline}
          {item.notionalUsd ? (
            <span className="text-slate-600">
              {" "}
              · ${Math.round(item.notionalUsd).toLocaleString()}
            </span>
          ) : null}
        </p>
      </button>
      {item.articleUrl ? (
        <button
          type="button"
          title="Open original article in browser"
          className={cn(OPEN_ORIGINAL_BTN, "my-0.5 mr-0.5 self-center")}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            window.open(item.articleUrl!, "_blank", "noopener,noreferrer");
          }}
        >
          <ExternalLink className="h-2.5 w-2.5" />
          ORIGINAL
        </button>
      ) : null}
    </div>
  );
}

export function TacticalIntelligenceWire() {
  useSyncExternalStore(subscribeWire, getWire, getWire);
  const wire = getWire();
  const regime = useMarketAtmosphereStore.getState().regime;
  const connectionStatus = useTerminalStore((s) => s.connectionStatus);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);

  useEffect(() => {
    ensureWireSeeded();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (wire.length > prevLenRef.current && el && el.scrollTop < 48) {
      el.scrollTop = 0;
    }
    prevLenRef.current = wire.length;
  }, [wire.length]);

  const streamColor =
    connectionStatus === "connected"
      ? terminalSkin.textUp
      : connectionStatus === "reconnecting"
        ? terminalSkin.textWarn
        : terminalSkin.textDown;

  return (
    <div
      data-market-panel="intelligence"
      data-crossmarket-panel="intelligence"
      data-intelligencedesk-panel="intelligence"
      data-market-region="panel"
      data-crossmarket-region="panel"
      data-intelligencedesk-region="panel"
      data-live-panel
      className={cn("flex h-full flex-col overflow-hidden rounded-none", terminalSkin.canvas)}
    >
      <div
        className={cn(
          terminalSkin.panelHeader,
          terminalSkin.borderB,
          "justify-between px-1",
        )}
      >
        <span>TACTICAL WIRE</span>
        <span className={TERMINAL_TYPO.micro}>
          <span className={streamColor}>{connectionStatus.toUpperCase()}</span>
          {" · "}
          {wire.length} VEC · PULSE {regime.confidencePulse.toFixed(0)}%
        </span>
      </div>

      <div
        className={cn(
          terminalSkin.row,
          terminalSkin.borderB,
          "gap-1 px-1 py-0.5 text-slate-600",
        )}
      >
        <span className="w-[62px]">TIME</span>
        <span className="w-10">SYM</span>
        <span>DIR · CNF · ACC</span>
      </div>

      <div ref={scrollRef} data-market-region="feed" data-crossmarket-region="feed" data-intelligencedesk-region="feed" className="min-h-0 flex-1 overflow-auto">
        {wire.length === 0 ? (
          <p className={cn(TERMINAL_TYPO.dataSm, "p-1 text-slate-500")}>
            AWAITING TACTICAL VECTORS
          </p>
        ) : (
          wire.slice(0, 64).map((item) => <WireCluster key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
