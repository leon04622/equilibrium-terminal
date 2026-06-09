"use client";

import { useEffect } from "react";
import { terminalBus } from "@/store/eventBus";
import { useAlertStore } from "@/store/useAlertStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useLiveCoachStore } from "@/store/useLiveCoachStore";
import { LiveContextEngine } from "@/lib/education/LiveContextEngine";
import type { CoachSeverity } from "@/types/live-coach";

/**
 * PHASE 1–5 — wire every live operational system through the LiveContextEngine
 * so the terminal continuously teaches what is happening and why.
 *
 * Sources:
 *   - alert engine triggers      → educational alert + visual sync
 *   - intelligence engine events → educational alert
 *   - spread deterioration watch → calm execution-quality coaching
 *
 * Everything is de-duplicated and calm-paced by the store + voice queue.
 */

const TICK_MS = 12_000;
const SPREAD_WARN_BPS = 6; // gap is getting expensive
const SPREAD_DANGER_BPS = 12; // execution conditions unstable

export function useLiveCoach(enabled = true): void {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const push = (alert: ReturnType<typeof LiveContextEngine.build>) =>
      useLiveCoachStore.getState().push(alert);

    // --- PHASE 1: live alert translation -----------------------------------
    const offAlert = terminalBus.on("alert:triggered", ({ id }) => {
      const alert = useAlertStore.getState().triggers.find((t) => t.id === id);
      if (!alert) return;
      push(LiveContextEngine.fromAlert(alert));
    });

    // --- PHASE 3: intelligence engine events -------------------------------
    const offIntel = terminalBus.on("intelligence:engine", ({ summary, coin, severity }) => {
      push(
        LiveContextEngine.build({
          technical: summary,
          source: "intelligence",
          severity: severity as CoachSeverity,
          coin,
        }),
      );
    });

    // --- PHASE 3: spread / execution-quality watcher -----------------------
    let lastSpreadBand: "ok" | "warn" | "danger" = "ok";
    const scan = () => {
      if (document.hidden) return;
      const { book, selectedAsset } = useTerminalStore.getState();
      const bps = book?.spreadBps;
      if (bps == null) return;
      const band: "ok" | "warn" | "danger" =
        bps >= SPREAD_DANGER_BPS ? "danger" : bps >= SPREAD_WARN_BPS ? "warn" : "ok";
      // Only coach on a deterioration transition — never every tick.
      if (band !== "ok" && band !== lastSpreadBand) {
        push(
          LiveContextEngine.build({
            technical: "Spread widening",
            source: "spread",
            severity: band === "danger" ? "watch" : "info",
            coin: selectedAsset?.coin,
            dedupeKey: `spread:${selectedAsset?.coin ?? "mkt"}:${band}`,
          }),
        );
      }
      lastSpreadBand = band;
    };
    const interval = window.setInterval(scan, TICK_MS);

    return () => {
      offAlert();
      offIntel();
      window.clearInterval(interval);
    };
  }, [enabled]);
}
