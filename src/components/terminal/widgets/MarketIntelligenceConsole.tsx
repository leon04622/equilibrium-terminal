"use client";

import { Brain, Sparkles } from "lucide-react";
import { useConsoleSnapshot } from "@/lib/runtime/consoleSnapshotFallback";
import { IntelligenceOrchestrator } from "@/lib/intelligence";
import { cn } from "@/lib/utils";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import {
  useMarketIntelligenceStore,
  type IntelligenceTab,
} from "@/store/useMarketIntelligenceStore";
import { useTerminalStore } from "@/store/terminalStore";

const TABS: { id: IntelligenceTab; label: string }[] = [
  { id: "events", label: "EVENTS" },
  { id: "state", label: "STATE" },
  { id: "assets", label: "ASSETS" },
  { id: "narrative", label: "SECTORS" },
  { id: "brief", label: "AI BRIEF" },
];

function sevColor(band: string): string {
  if (band === "critical") return terminalSkin.textDown;
  if (band === "watch") return terminalSkin.textWarn;
  return "text-slate-500";
}

export function MarketIntelligenceConsole() {
  const storeSnapshot = useMarketIntelligenceStore((s) => s.snapshot);
  const activeTab = useMarketIntelligenceStore((s) => s.activeTab);
  const setActiveTab = useMarketIntelligenceStore((s) => s.setActiveTab);
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);
  const snapshot = useConsoleSnapshot(storeSnapshot, () => IntelligenceOrchestrator.snapshot());

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Processing market intelligence…</p>
      </div>
    );
  }

  const { marketState, aiBrief, intelligenceScore } = snapshot;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Brain className="h-3 w-3 text-cyan-500" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>MARKET INTELLIGENCE</span>
        <span className={cn(TERMINAL_TYPO.micro, "border border-violet-500/30 px-1 text-violet-400")}>
          RULES
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          EQ {intelligenceScore}/100 · {marketState.compositeLabel}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-500")}>
          {snapshot.events.length} events
        </span>
      </header>

      <nav className={cn(terminalSkin.borderB, "flex shrink-0 flex-wrap gap-0.5 p-0.5")}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={cn(
              TERMINAL_TYPO.micro,
              "border border-slate-800 px-1",
              activeTab === t.id ? "text-cyan-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "events" ? (
          <section>
            {snapshot.events.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No ranked intelligence events.</p>
            ) : (
              snapshot.events.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => e.affectedAssets[0] && selectAssetByCoin(e.affectedAssets[0], "intel-engine")}
                  className={cn(
                    terminalSkin.row,
                    "mb-0 w-full border-b-[0.5px] border-slate-800 py-0.5 text-left hover:bg-slate-900/80",
                  )}
                >
                  <div className="flex gap-1">
                    <span className={cn(TERMINAL_TYPO.micro, "w-14 tabular-nums text-slate-600")}>
                      {formatTapeTime(e.timestamp).slice(0, 8)}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, "w-16 uppercase text-slate-500")}>
                      {e.category}
                    </span>
                    <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                      {e.summary}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, sevColor(e.severityBand))}>
                      {e.severityBand.toUpperCase()}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-600")}>
                      {e.compositeScore}
                    </span>
                  </div>
                  <p className={cn(TERMINAL_TYPO.micro, "pl-[4.5rem] text-slate-600")}>{e.detail}</p>
                </button>
              ))
            )}
          </section>
        ) : null}

        {activeTab === "state" ? (
          <section className="space-y-0.5">
            <Row label="Volatility" value={marketState.volatilityEnvironment} />
            <Row label="Liquidity" value={marketState.liquidityEnvironment} />
            <Row label="Leverage" value={marketState.leverageEnvironment} />
            <Row label="Sentiment" value={marketState.sentimentState} />
            <Row label="Macro risk" value={marketState.macroRiskLevel} />
            <Row label="Breadth" value={String(marketState.marketBreadth)} />
            <Row label="Regime" value={marketState.regime} />
            <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-cyan-500")}>{marketState.compositeLabel}</p>
          </section>
        ) : null}

        {activeTab === "assets" ? (
          <section>
            {snapshot.assetProfiles.map((a) => (
              <button
                key={a.coin}
                type="button"
                onClick={() => selectAssetByCoin(a.coin, "intel-engine")}
                className={cn(
                  terminalSkin.row,
                  "w-full border-b-[0.5px] border-slate-800 py-0.5 text-left hover:bg-slate-900/80",
                )}
              >
                <div className="flex gap-1">
                  <span className={cn(TERMINAL_TYPO.dataSm, "w-10 font-bold", terminalSkin.textUp)}>
                    {a.coin}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "flex-1 text-slate-300")}>{a.headline}</span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  flow {a.orderFlowBias} · whale {a.whaleFlowSignal} · narrative {a.narrativeActivity}
                </p>
              </button>
            ))}
          </section>
        ) : null}

        {activeTab === "narrative" ? (
          <section>
            {snapshot.sectorNarratives.map((s) => (
              <div key={s.id} className={cn(terminalSkin.borderB, "py-0.5")}>
                <div className="flex justify-between gap-1">
                  <span className={cn(TERMINAL_TYPO.micro, terminalSkin.textAi)}>{s.sector}</span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                    {s.direction} · {s.velocity}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  {s.summary} · {s.leaders.join(", ")}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "brief" && aiBrief ? (
          <section>
            <div className="flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 text-cyan-500" />
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>Organizational summary only</span>
              <span className={cn(TERMINAL_TYPO.micro, "border border-violet-500/30 px-1 text-violet-400")}>
                NO LLM
              </span>
            </div>
            <p className={cn(TERMINAL_TYPO.dataSm, "mt-1 text-slate-300")}>{aiBrief.summary}</p>
            <ul className="mt-1 space-y-0">
              {aiBrief.contextBullets.map((b) => (
                <li key={b} className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  · {b}
                </li>
              ))}
            </ul>
            <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-600")}>
              AI contextualizes events — trader judgment remains central. No trade directives.
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>{value}</span>
    </div>
  );
}
