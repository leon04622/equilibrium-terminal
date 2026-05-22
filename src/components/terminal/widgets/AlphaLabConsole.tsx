"use client";

import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { useQuantResearchStore } from "@/store/useQuantResearchStore";
import type { MarketRegime, SignalCandidate } from "@/types/quant-research";

function MetricCell({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "up" | "down" | "warn" | "ai";
}) {
  const toneClass =
    tone === "up"
      ? terminalSkin.textUp
      : tone === "down"
        ? terminalSkin.textDown
        : tone === "warn"
          ? terminalSkin.textWarn
          : tone === "ai"
            ? terminalSkin.textAi
            : "text-slate-300";

  return (
    <div className="flex min-w-0 flex-col gap-0 rounded-none border-[0.5px] border-slate-800 bg-slate-950 px-1 py-0.5">
      <span className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>{label}</span>
      <span
        className={cn(
          TERMINAL_TYPO.dataSm,
          "font-mono tracking-tighter uppercase tabular-nums",
          toneClass,
        )}
      >
        {value}
        {unit ? (
          <span className={cn(TERMINAL_TYPO.micro, "ml-0.5 text-slate-600")}>{unit}</span>
        ) : null}
      </span>
    </div>
  );
}

function RegimeHeatCell({
  regime,
  sharpe,
}: {
  regime: MarketRegime;
  sharpe: number;
}) {
  const intensity = Math.min(1, Math.max(0, sharpe / 2));
  const bg =
    intensity >= 0.7
      ? "bg-[#00ff88]/25"
      : intensity >= 0.4
        ? "bg-[#ffaa00]/20"
        : "bg-[#ff3366]/15";

  return (
    <div
      className={cn(
        "flex flex-col rounded-none border-[0.5px] border-slate-800 px-1 py-0.5",
        bg,
      )}
    >
      <span className={cn(TERMINAL_TYPO.micro, "truncate text-slate-500")}>
        {regime.replace(/_/g, " ").slice(0, 14)}
      </span>
      <span className={cn(TERMINAL_TYPO.dataSm, "tabular-nums text-slate-200")}>
        {sharpe.toFixed(2)}
      </span>
    </div>
  );
}

function SignalRow({
  signal,
  selected,
  onSelect,
  onRun,
}: {
  signal: SignalCandidate;
  selected: boolean;
  onSelect: () => void;
  onRun: () => void;
}) {
  const statusColor =
    signal.status === "active"
      ? terminalSkin.textUp
      : signal.status === "decaying"
        ? terminalSkin.textWarn
        : signal.status === "retired"
          ? terminalSkin.textDown
          : terminalSkin.textAi;

  return (
    <div
      className={cn(
        "border-b-[0.5px] border-slate-800 px-1 py-0.5",
        selected && "bg-slate-900/80",
        "hover:bg-slate-900/60",
      )}
    >
      <div className={cn(terminalSkin.row, "gap-1")}>
        <button
          type="button"
          onClick={onSelect}
          className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-left")}
        >
          {signal.name}
        </button>
        <span className={cn(TERMINAL_TYPO.micro, "w-8", statusColor)}>
          {signal.status.slice(0, 4).toUpperCase()}
        </span>
        <span className={cn(TERMINAL_TYPO.dataSm, "w-10 tabular-nums", terminalSkin.textAi)}>
          {signal.confidenceIndex.toFixed(0)}
        </span>
        <span className={cn(TERMINAL_TYPO.dataSm, "w-10 tabular-nums text-slate-400")}>
          {signal.liveSharpe.toFixed(2)}
        </span>
        <button
          type="button"
          onClick={onRun}
          className={cn(
            TERMINAL_TYPO.micro,
            "shrink-0 rounded-none border-[0.5px] border-[#00e5ff]/50 bg-[#00e5ff]/10 px-1 text-[#00e5ff] hover:bg-[#00e5ff]/20",
          )}
        >
          RUN BT
        </button>
      </div>
      <p className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>
        {signal.coin} · {signal.hypothesis}
      </p>
    </div>
  );
}

export function AlphaLabConsole() {
  const matrix = useQuantResearchStore((s) => s.featureMatrix);
  const candidates = useQuantResearchStore((s) => s.candidates);
  const governance = useQuantResearchStore((s) => s.governance);
  const selectedSignalId = useQuantResearchStore((s) => s.selectedSignalId);
  const pipelineActive = useQuantResearchStore((s) => s.pipelineActive);
  const backtestLogs = useQuantResearchStore((s) => s.backtestLogs);

  const selected = useMemo(
    () => candidates.find((c) => c.id === selectedSignalId) ?? null,
    [candidates, selectedSignalId],
  );

  const handleRunBacktest = useCallback(() => {
    if (!selectedSignalId) return;
    const expId = useQuantResearchStore
      .getState()
      .queueExperiment(selectedSignalId, "ALPHA LAB RUN");
    window.setTimeout(() => {
      useQuantResearchStore.getState().runExperiment(expId);
    }, 0);
  }, [selectedSignalId]);

  const handleDecayTick = useCallback(() => {
    useQuantResearchStore.getState().applyDecayEvaluations();
  }, []);

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-none bg-slate-950",
        terminalSkin.canvas,
      )}
      data-panel-id="alphalab"
    >
      <div
        className={cn(
          terminalSkin.panelHeader,
          terminalSkin.borderB,
          "justify-between rounded-none px-1",
        )}
      >
        <span>ALPHA LAB</span>
        <span className={TERMINAL_TYPO.micro}>
          <span className={pipelineActive ? terminalSkin.textUp : terminalSkin.textDown}>
            {pipelineActive ? "PIPE ON" : "PIPE OFF"}
          </span>
          <span className="text-slate-600"> · FEAT/s </span>
          <span className="tabular-nums text-[#00e5ff]">
            {governance.featuresPerSecond.toFixed(1)}
          </span>
          <span className="text-slate-600"> · CYC </span>
          <span className="tabular-nums text-slate-400">
            {governance.pipelineCycleMs.toFixed(1)}ms
          </span>
        </span>
      </div>

      <div className="grid shrink-0 grid-cols-4 gap-px bg-slate-800 p-px">
        <MetricCell label="ACTIVE" value={String(governance.activeSignals)} tone="up" />
        <MetricCell label="DECAY" value={String(governance.decayingSignals)} tone="warn" />
        <MetricCell label="RETIRED" value={String(governance.retiredSignals)} tone="down" />
        <MetricCell
          label="AVG CONF"
          value={governance.avgConfidence.toFixed(0)}
          tone="ai"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-b-[0.5px] border-slate-800">
        <div
          className={cn(
            terminalSkin.row,
            terminalSkin.borderB,
            "shrink-0 gap-1 bg-slate-900/40 px-1",
            TERMINAL_TYPO.micro,
          )}
        >
          <span>FEATURE MATRIX</span>
          <span className="ml-auto text-slate-600">{matrix.length} COINS</span>
        </div>
        <div className="max-h-[28%] shrink-0 overflow-auto">
          {matrix.length === 0 ? (
            <p className={cn(TERMINAL_TYPO.dataSm, "p-1 text-slate-500")}>
              AWAITING STREAMING FEATURE EXTRACTION…
            </p>
          ) : (
            matrix.map((row) => (
              <div
                key={row.coin}
                className="border-b-[0.5px] border-slate-800 px-1 py-0.5"
              >
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "w-10 font-bold", terminalSkin.textUp)}>
                    {row.coin}
                  </span>
                  {row.features.slice(0, 4).map((f) => (
                    <span
                      key={f.id}
                      className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-500")}
                    >
                      {f.kind.slice(0, 4)}={f.value.toFixed(3)}
                    </span>
                  ))}
                  <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
                    {row.features[0]?.regime.replace(/_/g, " ").slice(0, 10) ?? "—"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div
          className={cn(
            terminalSkin.row,
            terminalSkin.borderB,
            "shrink-0 gap-1 px-1",
            TERMINAL_TYPO.micro,
          )}
        >
          <span>SIGNAL</span>
          <span>STAT</span>
          <span>CONF</span>
          <span>SR</span>
          <span className="ml-auto">BT</span>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {candidates.map((sig) => (
            <SignalRow
              key={sig.id}
              signal={sig}
              selected={sig.id === selectedSignalId}
              onSelect={() => useQuantResearchStore.getState().selectSignal(sig.id)}
              onRun={() => {
                useQuantResearchStore.getState().selectSignal(sig.id);
                const expId = useQuantResearchStore
                  .getState()
                  .queueExperiment(sig.id, `RUN ${sig.name}`);
                window.setTimeout(() => {
                  useQuantResearchStore.getState().runExperiment(expId);
                }, 0);
              }}
            />
          ))}
        </div>
      </div>

      {selected ? (
        <div className="shrink-0 border-t-[0.5px] border-slate-800">
          <div
            className={cn(
              terminalSkin.row,
              "justify-between px-1 py-0.5",
              TERMINAL_TYPO.micro,
            )}
          >
            <span className="text-slate-500">REGIME HEATMAP · {selected.name}</span>
            <span className="tabular-nums text-slate-400">
              WR {(selected.liveWinRate * 100).toFixed(0)}% · MDD{" "}
              {(selected.validationMaxDrawdown * 100).toFixed(0)}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-px bg-slate-800 p-px">
            {selected.regimeDependencies.map((r) => (
              <RegimeHeatCell key={r.regime} regime={r.regime} sharpe={r.sharpeRatio} />
            ))}
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "flex shrink-0 items-center gap-1 border-t-[0.5px] border-slate-800 px-1 py-0.5",
        )}
      >
        <button
          type="button"
          onClick={handleRunBacktest}
          className={cn(
            TERMINAL_TYPO.micro,
            "rounded-none border-[0.5px] border-[#00ff88]/50 bg-[#00ff88]/10 px-2 py-0.5 text-[#00ff88] hover:bg-[#00ff88]/20",
          )}
        >
          RUN SELECTED BACKTEST
        </button>
        <button
          type="button"
          onClick={handleDecayTick}
          className={cn(
            TERMINAL_TYPO.micro,
            "rounded-none border-[0.5px] border-slate-700 px-2 py-0.5 text-slate-400 hover:bg-slate-900",
          )}
        >
          FORCE DECAY TICK
        </button>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto tabular-nums text-slate-600")}>
          LOGS {backtestLogs.length}
        </span>
      </div>
    </div>
  );
}
