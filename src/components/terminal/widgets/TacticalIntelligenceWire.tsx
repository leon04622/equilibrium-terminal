"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { terminalBus } from "@/store/eventBus";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { TacticalWireItem, WireDirection, WireSeverity } from "@/types/market-atmosphere";
import type { IntelligenceItem } from "@/types/terminal-schema";

function subscribeWire(cb: () => void) {
  return useMarketAtmosphereStore.subscribe((s) => s.wireVersion, () => cb());
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

function WireCluster({ item }: { item: TacticalWireItem }) {
  const clearFlash = useMarketAtmosphereStore((s) => s.clearWireFlash);
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);

  useEffect(() => {
    if (!item.isNew) return;
    const t = window.setTimeout(() => clearFlash(item.id), 380);
    return () => window.clearTimeout(t);
  }, [clearFlash, item.id, item.isNew]);

  return (
    <button
      type="button"
      onClick={() => {
        selectAssetByCoin(item.coin, "tactical-wire");
        terminalBus.emit("intelligence:signal", {
          id: item.id,
          coin: item.coin,
          kind: item.channel === "on-chain" ? "whale" : "social",
        });
      }}
      className={cn(
        "w-full border-b-[0.5px] border-slate-800 px-1 py-0.5 text-left",
        "hover:bg-slate-900/90",
        severityFlash(item.severity, item.isNew),
      )}
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
  );
}

function seedWireIfEmpty(): void {
  const store = useMarketAtmosphereStore.getState();
  if (store.wire.length > 0) return;
  const intel = useTerminalStore.getState().intelligence;
  if (intel.length > 0) {
    for (const item of intel.slice(0, 8)) {
      store.ingestIntelligenceWire({
        id: item.id,
        coin: item.coin,
        headline: item.title,
        channel:
          item.channel === "on-chain"
            ? "on-chain"
            : item.channel === "social"
              ? "social"
              : "market",
        severity: item.severity,
        notionalUsd: item.notionalUsd,
        timestamp: item.timestamp,
      });
    }
    return;
  }
  const seed: IntelligenceItem[] = [
    {
      id: "wire-seed-1",
      coin: "HYPE",
      channel: "market",
      title: "FUNDING FLIP · 8H CROSS POS",
      detail: "OI building",
      severity: "watch",
      notionalUsd: 420_000,
      timestamp: Date.now() - 90_000,
    },
    {
      id: "wire-seed-2",
      coin: "BTC",
      channel: "on-chain",
      title: "LIQ CLUSTER PROXIMITY",
      detail: "1.2% below spot",
      severity: "critical",
      notionalUsd: 1_200_000,
      timestamp: Date.now() - 30_000,
    },
  ];
  for (const s of seed) {
    store.ingestIntelligenceWire({
      id: s.id,
      coin: s.coin,
      headline: s.title,
      channel: s.channel === "on-chain" ? "on-chain" : "market",
      severity: s.severity,
      notionalUsd: s.notionalUsd,
      timestamp: s.timestamp,
    });
  }
}

export function TacticalIntelligenceWire() {
  useSyncExternalStore(subscribeWire, getWire, getWire);
  const wire = useMarketAtmosphereStore((s) => s.wire);
  const regime = useMarketAtmosphereStore((s) => s.regime);
  const connectionStatus = useTerminalStore((s) => s.connectionStatus);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);

  useEffect(() => {
    seedWireIfEmpty();
  }, []);

  useEffect(() => {
    if (wire.length > prevLenRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
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
    <div className={cn("flex h-full flex-col overflow-hidden rounded-none", terminalSkin.canvas)}>
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

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
        {wire.length === 0 ? (
          <p className={cn(TERMINAL_TYPO.dataSm, "p-1 text-slate-500")}>
            AWAITING TACTICAL VECTORS
          </p>
        ) : (
          wire.map((item) => <WireCluster key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
