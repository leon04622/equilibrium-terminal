"use client";

import { useEffect, useMemo, useState } from "react";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import {
  DailyBriefingEngine,
  MarketStateLayer,
  PersonalOpsEngine,
  SessionClockEngine,
} from "@/lib/daily";
import { LiveDeskClockEngine } from "@/lib/daily/LiveDeskClockEngine";
import { LiveDeskStripRegions } from "@/components/terminal/LiveDeskStripRegions";
import type { LDBridgeRegion } from "@/lib/education/liveDeskBridgeSteps";
import type { DailyOperationsSnapshot } from "@/types/daily-operations";
import { useDailyOperationsStore } from "@/store/useDailyOperationsStore";
import { useLiveDeskBridgeStore } from "@/store/useLiveDeskBridgeStore";
import { LIVE_DESK_BRIDGE_STEPS } from "@/lib/education/liveDeskBridgeSteps";

export const LIVE_DESK_BRIDGE_TARGET_ID = "live-desk-bridge-target";

function buildSnapshot(): DailyOperationsSnapshot | null {
  try {
    const store = useDailyOperationsStore.getState();
    return (
      store.snapshot ?? {
        clock: SessionClockEngine.snapshot(),
        briefing: DailyBriefingEngine.build(),
        marketState: MarketStateLayer.build(),
        memory: store.memory,
        personal: PersonalOpsEngine.build(store.personalPins, store.checklist, store.favoriteCoins),
        prioritizedAlerts: [],
      }
    );
  } catch {
    return null;
  }
}

function spotlightRegion(stepIndex: number): LDBridgeRegion {
  const step = LIVE_DESK_BRIDGE_STEPS[stepIndex];
  if (!step) return null;
  if (step.mode === "recognize" && step.recognize?.accept.length) {
    return step.recognize.accept[0] ?? "panel";
  }
  return step.region ?? null;
}

export function LiveDeskBridgeStrip() {
  const active = useLiveDeskBridgeStore((s) => s.active);
  const stepIndex = useLiveDeskBridgeStore((s) => s.step);
  const storeSnapshot = useDailyOperationsStore((s) => s.snapshot);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);

  const snapshot = storeSnapshot ?? (active ? buildSnapshot() : null);
  const activeRegion = spotlightRegion(stepIndex);
  const recognizeMode = LIVE_DESK_BRIDGE_STEPS[stepIndex]?.mode === "recognize";

  const pulse = useMemo(() => {
    if (!snapshot) return null;
    return LiveDeskClockEngine.pulse(snapshot.clock, snapshot.marketState, now);
  }, [snapshot, now]);

  if (!active || !snapshot || !pulse) return null;

  return (
    <div
      id={LIVE_DESK_BRIDGE_TARGET_ID}
      data-livedesk-panel="header-strip"
      data-livedesk-region="panel"
      data-panel-id="header-strip"
      className={cn(
        "fixed inset-x-0 top-[34px] z-[145] flex items-center gap-3 border-b border-cyan-800/50 bg-slate-950/98 px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.55)] backdrop-blur-sm",
        TERMINAL_TYPO.dataSm,
      )}
    >
      <Radio className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
      <span className={cn(TERMINAL_TYPO.label, "shrink-0 text-cyan-300")}>LIVE DESK</span>
      <span className="shrink-0 text-slate-600">|</span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 overflow-x-auto">
        <LiveDeskStripRegions
          clock={snapshot.clock}
          marketState={snapshot.marketState}
          pulse={pulse}
          variant="bridge"
          activeRegion={activeRegion}
          recognizeMode={recognizeMode}
        />
      </div>
    </div>
  );
}
