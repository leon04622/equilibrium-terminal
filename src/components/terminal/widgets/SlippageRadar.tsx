"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";
import type { ExecutionCopilotFlag } from "@/types/execution-intelligence";

function MetricCell({
  label,
  value,
  unit,
  tone,
  region,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "up" | "down" | "warn" | "ai";
  region?: string;
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
    <div
      className="flex min-w-0 flex-col gap-0 rounded-none border-[0.5px] border-slate-800 bg-slate-950 px-1 py-0"
      data-slip-region={region}
    >
      <span className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.dataSm, "uppercase tabular-nums tracking-tighter", toneClass)}>
        {value}
        {unit ? (
          <span className={cn(TERMINAL_TYPO.micro, "ml-0.5 text-slate-600")}>{unit}</span>
        ) : null}
      </span>
    </div>
  );
}

function flagTone(flag: ExecutionCopilotFlag): "up" | "down" | "warn" | "ai" {
  if (flag.severity === "critical") return "down";
  if (flag.severity === "watch") return "warn";
  return "ai";
}

export function SlippageRadar() {
  const slippage = useExecutionIntelligenceStore((s) => s.slippage);
  const copilotTape = useExecutionIntelligenceStore((s) => s.copilotTape);
  const participants = useExecutionIntelligenceStore((s) => s.participants);
  const executionConfidence = useExecutionIntelligenceStore((s) => s.executionConfidence);
  const icebergProbability = useExecutionIntelligenceStore((s) => s.icebergProbability);
  const spoofingProbability = useExecutionIntelligenceStore((s) => s.spoofingProbability);
  const pipelineActive = useExecutionIntelligenceStore((s) => s.pipelineActive);
  const liquidityVoids = useExecutionIntelligenceStore((s) => s.liquidityVoids);

  const slipTone =
    slippage.riskTier === "critical" || slippage.riskTier === "high"
      ? "down"
      : slippage.riskTier === "elevated"
        ? "warn"
        : "up";

  const tape = useMemo(() => copilotTape.slice(0, 10), [copilotTape]);

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-none border-[0.5px] border-slate-800 bg-slate-950",
        terminalSkin.canvas,
      )}
      data-panel-id="slippageradar"
      data-slip-panel="slippageradar"
    >
      <div
        className={cn(
          terminalSkin.panelHeader,
          terminalSkin.borderB,
          "justify-between rounded-none px-1",
        )}
      >
        <span>SLIPPAGE RADAR</span>
        <span className={TERMINAL_TYPO.micro}>
          <span className={pipelineActive ? terminalSkin.textUp : terminalSkin.textDown}>
            {pipelineActive ? "EXEC ON" : "EXEC OFF"}
          </span>
          <span className="text-slate-600"> | CONF </span>
          <span className={terminalSkin.textAi}>{executionConfidence.toFixed(0)}%</span>
        </span>
      </div>

      <div className="grid shrink-0 grid-cols-4 gap-px bg-slate-800 p-px">
        <MetricCell
          label="SLIP"
          value={slippage.slippageBps.toFixed(2)}
          unit="BP"
          tone={slipTone}
          region="slip-bps"
        />
        <MetricCell
          label="SPREAD"
          value={slippage.spreadBps.toFixed(2)}
          unit="BP"
          tone={slippage.spreadBps > 5 ? "warn" : "up"}
          region="spread-bps"
        />
        <MetricCell
          label="VEL"
          value={slippage.velocityTicksPerSec.toFixed(1)}
          unit="T/S"
          tone="ai"
        />
        <MetricCell label="RISK" value={slippage.riskTier.toUpperCase()} tone={slipTone} region="risk-tier" />
        <MetricCell label="ICE" value={`${icebergProbability.toFixed(0)}%`} tone="ai" />
        <MetricCell label="SPOOF" value={`${spoofingProbability.toFixed(0)}%`} tone="warn" />
        <MetricCell
          label="VOIDS"
          value={String(liquidityVoids.length)}
          tone={liquidityVoids.length > 0 ? "warn" : "up"}
        />
        <MetricCell label="PARTIC" value={String(participants.length)} tone="ai" />
      </div>

      <div className="min-h-0 flex-1 overflow-auto border-t-[0.5px] border-slate-800 px-1 py-0.5">
        <p className={cn(TERMINAL_TYPO.micro, "mb-0.5 text-slate-600")}>EXECUTION COPILOT TAPE</p>
        <div className="space-y-px">
          {tape.length === 0 ? (
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>NO ANOMALIES</p>
          ) : (
            tape.map((flag) => (
              <div
                key={flag.id}
                className="rounded-none border-[0.5px] border-slate-800 bg-slate-950/90 px-1 py-0.5"
              >
                <span
                  className={cn(
                    TERMINAL_TYPO.micro,
                    flagTone(flag) === "down"
                      ? terminalSkin.textDown
                      : flagTone(flag) === "warn"
                        ? terminalSkin.textWarn
                        : terminalSkin.textAi,
                  )}
                >
                  {flag.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
