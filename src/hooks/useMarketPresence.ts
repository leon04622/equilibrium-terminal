"use client";

import { useEffect, useRef } from "react";
import {
  buildOverlayFrame,
  computeStressGauge,
  dominantMacroFromTape,
  inferRegime,
  simulateMacroTick,
} from "@/lib/presence";
import { terminalBus } from "@/store/eventBus";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { IntelligenceItem } from "@/types/terminal-schema";

const OVERLAY_MS = 120;
const ATMOSPHERE_MS = 480;
const MACRO_MS = 2_000;

function mapIntelToWire(item: IntelligenceItem): void {
  useMarketAtmosphereStore.getState().ingestIntelligenceWire({
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

/**
 * Throttled background heartbeat for Phase 10 presence systems.
 * Isolated from order execution — overlay + macro + regime only.
 */
export function useMarketPresence(): void {
  const overlayVersionRef = useRef(0);

  useEffect(() => {
    let overlayTimer: number | null = null;
    let atmosphereTimer: number | null = null;
    let macroTimer: number | null = null;

    const scheduleOverlay = () => {
      if (overlayTimer) return;
      overlayTimer = window.setTimeout(() => {
        overlayTimer = null;
        const terminal = useTerminalStore.getState();
        const coin = terminal.selectedCoin;
        overlayVersionRef.current += 1;
        const frame = buildOverlayFrame({
          coin,
          book: terminal.book,
          trades: terminal.trades,
          candles: terminal.candles,
          overlayVersion: overlayVersionRef.current,
        });
        useMarketAtmosphereStore.getState().setOverlay(frame);
      }, OVERLAY_MS);
    };

    const scheduleAtmosphere = () => {
      if (atmosphereTimer) return;
      atmosphereTimer = window.setTimeout(() => {
        atmosphereTimer = null;
        const terminal = useTerminalStore.getState();
        const store = useMarketAtmosphereStore.getState();
        const stress = computeStressGauge(terminal.book, terminal.trades);
        store.applyStress(stress);
        const regime = inferRegime(stress, stress.bookImbalance);
        const narrativeAcceleration = Math.round(
          stress.bookImbalance * 40 + (stress.velocityRatio - 1) * 35,
        );
        store.setRegime({
          regime,
          narrativeAcceleration,
          dominantMacro: dominantMacroFromTape(store.macro),
        });
        store.touchHeartbeat();
      }, ATMOSPHERE_MS);
    };

    const scheduleMacro = () => {
      if (macroTimer) return;
      macroTimer = window.setTimeout(() => {
        macroTimer = null;
        const store = useMarketAtmosphereStore.getState();
        for (const row of store.macro) {
          store.applyMacroTick(row.symbol, simulateMacroTick(row));
        }
        store.pulseConfidence(
          Math.sin(Date.now() / 4_000) > 0 ? 0.4 : -0.4,
        );
      }, MACRO_MS);
    };

    const offBook = useTerminalStore.subscribe(
      (s) => s.bookVersion,
      () => {
        scheduleOverlay();
        scheduleAtmosphere();
      },
    );

    const offTrades = useTerminalStore.subscribe(
      (s) => s.trades[0]?.id,
      () => {
        scheduleOverlay();
        scheduleAtmosphere();
      },
    );

    const offCandles = useTerminalStore.subscribe(
      (s) => s.candleVersion,
      () => scheduleOverlay(),
    );

    const offCoin = useTerminalStore.subscribe(
      (s) => s.selectedCoin,
      () => scheduleOverlay(),
    );

    const offIntel = useTerminalStore.subscribe(
      (s) => s.intelligenceVersion,
      () => {
        const latest = useTerminalStore.getState().intelligence[0];
        if (latest) mapIntelToWire(latest);
      },
    );

    const offAlert = terminalBus.on("alert:triggered", ({ id, coin, severity }) => {
      useMarketAtmosphereStore.getState().ingestIntelligenceWire({
        id: `wire-alert-${id}`,
        coin,
        headline: `ALERT TRIGGER · ${coin}`,
        channel: "agentic",
        severity,
        timestamp: Date.now(),
        acceleration: severity === "critical" ? 48 : 24,
      });
    });

    const offFused = terminalBus.on("agentic:fused", ({ coin, score }) => {
      useMarketAtmosphereStore.getState().ingestIntelligenceWire({
        id: `wire-fused-${Date.now()}`,
        coin,
        headline: `FUSION SIGNAL · CONF ${Math.round(score * 100)}%`,
        channel: "agentic",
        severity: score >= 0.82 ? "critical" : score >= 0.65 ? "watch" : "info",
        timestamp: Date.now(),
        confidenceIndex: Math.round(score * 100),
        direction: "bullish",
        acceleration: Math.round(score * 40),
      });
    });

    scheduleOverlay();
    scheduleAtmosphere();
    scheduleMacro();
    const macroInterval = window.setInterval(scheduleMacro, MACRO_MS);

    const existing = useTerminalStore.getState().intelligence;
    for (const item of existing.slice(0, 12)) {
      mapIntelToWire(item);
    }

    return () => {
      offBook();
      offTrades();
      offCandles();
      offCoin();
      offIntel();
      offAlert();
      offFused();
      if (overlayTimer) window.clearTimeout(overlayTimer);
      if (atmosphereTimer) window.clearTimeout(atmosphereTimer);
      if (macroTimer) window.clearTimeout(macroTimer);
      window.clearInterval(macroInterval);
    };
  }, []);
}
