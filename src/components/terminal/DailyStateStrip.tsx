"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { DailyBriefingEngine, MarketStateLayer, PersonalOpsEngine, SessionClockEngine } from "@/lib/daily";
import { LiveDeskClockEngine } from "@/lib/daily/LiveDeskClockEngine";
import { LiveDeskStripRegions } from "@/components/terminal/LiveDeskStripRegions";
import type { DailyOperationsSnapshot } from "@/types/daily-operations";
import { useDailyOperationsStore } from "@/store/useDailyOperationsStore";
import { useLiveDeskBridgeStore } from "@/store/useLiveDeskBridgeStore";
import { useLiveDeskLessonStore } from "@/store/useLiveDeskLessonStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import { useOperatorModeStore } from "@/store/useOperatorModeStore";

function buildFallbackSnapshot(): DailyOperationsSnapshot | null {
  try {
    const store = useDailyOperationsStore.getState();
    return {
      clock: SessionClockEngine.snapshot(),
      briefing: DailyBriefingEngine.build(),
      marketState: MarketStateLayer.build(),
      memory: store.memory,
      personal: PersonalOpsEngine.build(store.personalPins, store.checklist, store.favoriteCoins),
      prioritizedAlerts: [],
    };
  } catch {
    return null;
  }
}

export function DailyStateStrip() {
  const snapshot = useDailyOperationsStore((s) => s.snapshot);
  const operatorActive = useOperatorModeStore((s) => s.active);
  const lessonActive = useLiveDeskLessonStore((s) => s.active);
  const bridgeActive = useLiveDeskBridgeStore((s) => s.active);
  const highlighted = useOperatorGuideStore((s) => s.highlightPanelId === "header-strip");
  const forceVisible = lessonActive || highlighted || operatorActive;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (typeof document !== "undefined" && document.hidden) return;
    const id = window.setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (bridgeActive) return null;

  let displaySnapshot: DailyOperationsSnapshot | null = snapshot;
  if (!displaySnapshot && forceVisible) {
    displaySnapshot = buildFallbackSnapshot();
  }
  if (!displaySnapshot) return null;

  const { clock, marketState } = displaySnapshot;
  const pulse = LiveDeskClockEngine.pulse(clock, marketState, now);

  return (
    <div
      data-livedesk-panel="header-strip"
      data-livedesk-region="panel"
      data-panel-id="header-strip"
      className={cn(
        "min-w-0 flex-1 items-center gap-2 overflow-hidden border-l border-slate-800 pl-2",
        forceVisible ? "flex" : "hidden xl:flex",
        highlighted && "rounded-sm ring-2 ring-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.25)]",
        TERMINAL_TYPO.micro,
      )}
    >
      <LiveDeskStripRegions clock={clock} marketState={marketState} pulse={pulse} variant="compact" />
    </div>
  );
}
