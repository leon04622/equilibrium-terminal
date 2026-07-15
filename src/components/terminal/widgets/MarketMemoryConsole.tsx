"use client";

import { useEffect } from "react";
import { History } from "lucide-react";
import { useConsoleSnapshot } from "@/lib/runtime/consoleSnapshotFallback";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { MarketMemoryOrchestrator } from "@/lib/market-memory/MarketMemoryOrchestrator";
import { MarketReplayOrchestrator } from "@/lib/market-memory/MarketReplayOrchestrator";
import { MARKET_MEMORY_BRIDGE_STEPS } from "@/lib/education/marketMemoryBridgeSteps";
import { useMarketMemoryStore, type MarketMemoryTab } from "@/store/useMarketMemoryStore";
import { useMarketMemoryBridgeStore } from "@/store/useMarketMemoryBridgeStore";
import { useMarketMemoryLessonStore } from "@/store/useMarketMemoryLessonStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import type { MarketMemoryDashboardModeId } from "@/types/market-memory";

const TABS: { id: MarketMemoryTab; label: string }[] = [
  { id: "replay", label: "REPLAY" },
  { id: "archive", label: "ARCHIVE" },
  { id: "regime", label: "REGIME" },
  { id: "search", label: "SEARCH" },
  { id: "analogs", label: "ANALOGS" },
  { id: "liquidity", label: "LIQUIDITY" },
  { id: "narrative", label: "NARR" },
  { id: "portfolio", label: "RISK MEM" },
  { id: "research", label: "NOTES" },
  { id: "modes", label: "MODES" },
];

const TAB_IDS = new Set<string>(TABS.map((t) => t.id));

function spotlightRegion(stepIndex: number) {
  const step = MARKET_MEMORY_BRIDGE_STEPS[stepIndex];
  if (!step) return null;
  if (step.mode === "recognize" && step.recognize?.accept.length) {
    return step.recognize.accept[0] ?? null;
  }
  return step.region;
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between border-b border-slate-800/80 py-0.5">
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.micro, tone ?? "text-slate-400")}>{value}</span>
    </div>
  );
}

export function MarketMemoryConsole() {
  const storeSnapshot = useMarketMemoryStore((s) => s.snapshot);
  const snapshot = useConsoleSnapshot(storeSnapshot, () => MarketMemoryOrchestrator.snapshot("BTC"));
  const activeTab = useMarketMemoryStore((s) => s.activeTab);
  const searchQuery = useMarketMemoryStore((s) => s.searchQuery);
  const setActiveTab = useMarketMemoryStore((s) => s.setActiveTab);
  const setSearchQuery = useMarketMemoryStore((s) => s.setSearchQuery);
  const setActiveMode = useMarketMemoryStore((s) => s.setActiveMode);

  const bridgeActive = useMarketMemoryBridgeStore((s) => s.active);
  const lessonActive = useMarketMemoryLessonStore((s) => s.active);
  const bridgeStep = useMarketMemoryBridgeStore((s) => s.step);
  const highlighted = useOperatorGuideStore((s) => s.highlightPanelId === "memorydesk");
  const academyActive = bridgeActive || lessonActive || highlighted;
  const activeRegion = academyActive ? spotlightRegion(bridgeStep) : null;
  const recognizeMode = bridgeActive && MARKET_MEMORY_BRIDGE_STEPS[bridgeStep]?.mode === "recognize";

  useEffect(() => {
    if (!bridgeActive || !activeRegion || activeRegion === "panel") return;
    if (!TAB_IDS.has(activeRegion)) return;
    const tab = activeRegion as MarketMemoryTab;
    if (activeTab === tab) return;
    setActiveTab(tab);
  }, [bridgeActive, activeRegion, activeTab, setActiveTab]);

  if (!snapshot) {
    return (
      <div
        data-memorydesk-panel="memorydesk"
        data-memorydesk-region="panel"
        data-panel-id="memorydesk"
        className="flex h-full items-center justify-center p-2"
      >
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting market memory…</p>
      </div>
    );
  }

  const applyMode = (id: MarketMemoryDashboardModeId) => {
    MarketMemoryOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  const regionClass = (id: string) =>
    cn(
      "rounded-sm transition-all duration-300",
      academyActive && "cursor-pointer",
      activeRegion === id && "ring-2 ring-cyan-400/90 bg-cyan-950/40",
      activeRegion === id && recognizeMode && "animate-pulse ring-2 ring-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.35)]",
    );

  return (
    <div
      data-memorydesk-panel="memorydesk"
      data-memorydesk-region="panel"
      data-panel-id="memorydesk"
      className="flex h-full flex-col overflow-hidden"
    >
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <History className="h-3 w-3 text-cyan-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>MARKET MEMORY</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {snapshot.asset} · {snapshot.currentRegime.label} · H{snapshot.memoryScore}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          {snapshot.telemetry.archiveSize} events
        </span>
      </header>

      <nav className={cn(terminalSkin.borderB, "flex shrink-0 flex-wrap gap-0.5 p-0.5")}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            data-memorydesk-tab={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              INSTITUTIONAL_INTERACTION.tabButton,
              activeTab === t.id ? "text-cyan-300" : "text-slate-600",
              regionClass(t.id),
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "replay" && (
          <section data-memorydesk-region="replay" className={cn("space-y-1", regionClass("replay"))}>
            <Row label="Mode" value={snapshot.replay.mode} />
            <Row label="Progress" value={`${snapshot.replay.progressPct}%`} />
            <Row label="Candles" value={String(snapshot.replay.candleCount)} />
            <Row label="Spread" value={snapshot.replay.spreadBps != null ? `${snapshot.replay.spreadBps.toFixed(1)} bps` : "—"} />
            <div className="flex gap-1 pt-1">
              <button type="button" className={cn(TERMINAL_TYPO.micro, "text-cyan-400")} onClick={() => MarketReplayOrchestrator.play()}>
                PLAY
              </button>
              <button type="button" className={cn(TERMINAL_TYPO.micro, "text-slate-500")} onClick={() => MarketReplayOrchestrator.pause()}>
                PAUSE
              </button>
              <button type="button" className={cn(TERMINAL_TYPO.micro, "text-slate-500")} onClick={() => MarketReplayOrchestrator.goLive()}>
                LIVE
              </button>
            </div>
            {snapshot.alerts.map((a) => (
              <p key={a.id} className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                {a.headline}
              </p>
            ))}
          </section>
        )}

        {activeTab === "archive" && (
          <section data-memorydesk-region="archive" className={regionClass("archive")}>
            {snapshot.archive.map((e) => (
              <div key={e.id} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {e.kind} · {new Date(e.timestamp).toLocaleTimeString()}
                </span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{e.headline}</p>
              </div>
            ))}
          </section>
        )}

        {activeTab === "regime" && (
          <section data-memorydesk-region="regime" className={cn("space-y-0.5", regionClass("regime"))}>
            <Row label="Volatility" value={snapshot.currentRegime.volatility} />
            <Row label="Liquidity" value={snapshot.currentRegime.liquidity} />
            <Row label="Leverage cycle" value={snapshot.currentRegime.leverageCycle} />
            <Row label="Macro" value={snapshot.currentRegime.macro} />
            <Row label="Narrative era" value={snapshot.currentRegime.narrativeEra} />
            {snapshot.regimes.slice(0, 6).map((r) => (
              <div key={r.id} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-cyan-500")}>{r.label}</span>
              </div>
            ))}
          </section>
        )}

        {activeTab === "search" && (
          <section data-memorydesk-region="search" className={regionClass("search")}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events…"
              className={cn(TERMINAL_TYPO.micro, "mb-1 w-full border border-slate-800 bg-slate-950 px-1 py-0.5 text-slate-400")}
            />
            {snapshot.searchResults.map((r) => (
              <div key={r.event.id} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {r.score} · {r.event.kind}
                </span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{r.event.headline}</p>
              </div>
            ))}
          </section>
        )}

        {activeTab === "analogs" && (
          <section data-memorydesk-region="analogs" className={regionClass("analogs")}>
            {snapshot.analogs.map((a) => (
              <div key={a.id} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-cyan-400")}>
                  {a.similarityPct}% · {a.label}
                </span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  {a.analogDate} · {a.summary}
                </p>
              </div>
            ))}
          </section>
        )}

        {activeTab === "liquidity" && (
          <section data-memorydesk-region="liquidity" className={regionClass("liquidity")}>
            {snapshot.liquidityHistory.slice(-10).map((p) => (
              <div key={p.timestamp} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {new Date(p.timestamp).toLocaleTimeString()}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "ml-1 text-slate-600")}>
                  depth {p.depthScore} · frag {p.fragmentation}
                </span>
              </div>
            ))}
          </section>
        )}

        {activeTab === "narrative" && (
          <section data-memorydesk-region="narrative" className={regionClass("narrative")}>
            {snapshot.narrativeEvolution.map((n) => (
              <div key={n.id} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-violet-400")}>{n.phase}</span>
                <span className={cn(TERMINAL_TYPO.micro, "ml-1 text-slate-600")}>
                  {n.sector} · accel {n.acceleration}
                </span>
              </div>
            ))}
          </section>
        )}

        {activeTab === "portfolio" && (
          <section data-memorydesk-region="portfolio">
            {snapshot.portfolioMemory.map((p) => (
              <div key={p.timestamp} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  lev {p.leverageRatio}x · dd {p.drawdownPct}%
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "ml-1 text-slate-600")}>
                  collateral {p.collateralHealth}
                </span>
              </div>
            ))}
          </section>
        )}

        {activeTab === "research" && (
          <section data-memorydesk-region="research">
            {snapshot.researchMemory.map((r) => (
              <div key={r.id} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {r.author} · {r.coin}
                </span>
                <p className={cn(TERMINAL_TYPO.micro, "text-cyan-400")}>{r.label}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{r.body.slice(0, 80)}</p>
              </div>
            ))}
          </section>
        )}

        {activeTab === "modes" && (
          <section data-memorydesk-region="modes" className="space-y-1">
            {snapshot.dashboardModes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => applyMode(m.id)}
                className={cn(
                  "block w-full border border-slate-800 px-1 py-0.5 text-left",
                  snapshot.activeMode === m.id ? "border-cyan-700/60 bg-cyan-950/20" : "hover:bg-slate-900/50",
                )}
              >
                <span className={cn(TERMINAL_TYPO.micro, "text-cyan-300")}>{m.label}</span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
              </button>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
