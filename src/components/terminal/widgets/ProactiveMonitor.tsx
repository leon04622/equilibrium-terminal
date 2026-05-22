"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { terminalBus } from "@/store/eventBus";
import { useAgentOperationsStore } from "@/store/useAgentOperationsStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { AgentKind, FusedOpportunity } from "@/types/agentic";

function subscribeFused(cb: () => void) {
  return useAgentOperationsStore.subscribe((s) => s.fusedVersion, () => cb());
}

function getFused(): FusedOpportunity[] {
  return useAgentOperationsStore.getState().fusedMatrix;
}

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    score >= 0.75
      ? "bg-[#00ff88]"
      : score >= 0.5
        ? "bg-[#ffaa00]"
        : "bg-[#ff3366]";
  return (
    <div className="flex h-[10px] w-16 shrink-0 items-stretch border-[0.5px] border-slate-800 bg-slate-950">
      <div
        className={cn("h-full rounded-none", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function AgentTelemetryRow({ agentId, status, tokens }: {
  agentId: AgentKind;
  status: string;
  tokens: number;
}) {
  return (
    <div className={cn(terminalSkin.row, "justify-between gap-1 px-1")}>
      <span className={TERMINAL_TYPO.micro}>{agentId.toUpperCase()}</span>
      <span
        className={cn(
          TERMINAL_TYPO.micro,
          status === "running" && terminalSkin.textAi,
          status === "queued" && terminalSkin.textWarn,
          status === "throttled" && terminalSkin.textDown,
          status === "idle" && "text-slate-600",
        )}
      >
        {status}
      </span>
      <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-500")}>
        {tokens}T
      </span>
    </div>
  );
}

function FusedRow({ op }: { op: FusedOpportunity }) {
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);
  const pct = Math.round(op.fusedConfidenceScore * 100);

  const loadWorkspace = () => {
    selectAssetByCoin(op.coin, "proactive-monitor");
    terminalBus.emit("agentic:workspace-load", {
      opportunityId: op.id,
      coin: op.coin,
    });
    terminalBus.emit("widget:focus", { widgetId: "chart" });
    terminalBus.emit("layout:refresh", {});
  };

  return (
    <div
      className={cn(
        "border-b-[0.5px] border-slate-800 px-1 py-0.5",
        "hover:bg-slate-900/80",
      )}
    >
      <div className={cn(terminalSkin.row, "gap-1")}>
        <span className={cn(TERMINAL_TYPO.dataSm, "w-14 tabular-nums text-slate-500")}>
          {formatTapeTime(op.timestamp).slice(0, 8)}
        </span>
        <span className={cn(TERMINAL_TYPO.dataSm, "w-10 font-bold", terminalSkin.textUp)}>
          {op.coin}
        </span>
        <ConfidenceBar score={op.fusedConfidenceScore} />
        <span className={cn(TERMINAL_TYPO.micro, "w-8 tabular-nums", terminalSkin.textAi)}>
          {pct}%
        </span>
        <span
          className={cn(
            TERMINAL_TYPO.micro,
            op.dominantStance === "bullish" && terminalSkin.textUp,
            op.dominantStance === "bearish" && terminalSkin.textDown,
            op.dominantStance === "neutral" && "text-slate-500",
          )}
        >
          {op.dominantStance}
        </span>
        <button
          type="button"
          onClick={loadWorkspace}
          className={cn(
            TERMINAL_TYPO.micro,
            "ml-auto shrink-0 border-[0.5px] border-[#00e5ff]/50 bg-[#00e5ff]/10 px-1 text-[#00e5ff] hover:bg-[#00e5ff]/20",
          )}
        >
          LOAD WS
        </button>
      </div>

      <p className={cn(TERMINAL_TYPO.dataSm, "truncate pl-[4.5rem] text-slate-300")}>
        {op.thesis}
      </p>

      <ul className="mt-0.5 space-y-0 pl-[4.5rem]">
        {op.supportingEvidence.slice(0, 4).map((b) => (
          <li key={`${b.provenance}-${b.key}`} className={TERMINAL_TYPO.micro}>
            <span className="text-slate-600">{b.key}=</span>
            <span className="text-slate-400">{b.value}</span>
            <span className="text-slate-700"> · {b.provenance}</span>
          </li>
        ))}
      </ul>

      <p className={cn(TERMINAL_TYPO.micro, "mt-0.5 truncate pl-[4.5rem] text-slate-600")}>
        PROV {op.provenanceKeys.join(" · ")}
        {op.contradictionPenalty > 0.05
          ? ` · DAMP −${(op.contradictionPenalty * 100).toFixed(0)}bps`
          : ""}
        {` · REL ${(op.relevanceScore * 100).toFixed(0)}%`}
      </p>
    </div>
  );
}

export function ProactiveMonitor() {
  useSyncExternalStore(subscribeFused, getFused, getFused);
  const fused = useAgentOperationsStore((s) => s.fusedMatrix);
  const agents = useAgentOperationsStore((s) => s.agents);
  const loopRunning = useAgentOperationsStore((s) => s.loopRunning);
  const tokenPressure = useAgentOperationsStore((s) => s.tokenPressure);
  const watchlist = useAgentOperationsStore((s) => s.watchlist);

  return (
    <div className={cn("flex h-full flex-col overflow-hidden", terminalSkin.canvas)}>
      <div
        className={cn(
          terminalSkin.panelHeader,
          terminalSkin.borderB,
          "justify-between px-1",
        )}
      >
        <span>AGENTIC OPS</span>
        <span className={TERMINAL_TYPO.micro}>
          <span className={loopRunning ? terminalSkin.textUp : terminalSkin.textDown}>
            {loopRunning ? "LOOP ON" : "LOOP OFF"}
          </span>
          <span className="text-slate-600"> · TOK </span>
          <span className="tabular-nums text-[#00e5ff]">
            {(tokenPressure * 100).toFixed(0)}%
          </span>
          <span className="text-slate-600"> · WL {watchlist.entries.length}</span>
        </span>
      </div>

      <div className={cn(terminalSkin.borderB, "shrink-0 px-1 py-0.5")}>
        <p className={cn(TERMINAL_TYPO.micro, "mb-0.5 text-slate-600")}>AGENT TELEMETRY</p>
        {agents.map((a) => (
          <AgentTelemetryRow
            key={a.agentId}
            agentId={a.agentId}
            status={a.status}
            tokens={a.tokensUsed}
          />
        ))}
      </div>

      <div
        className={cn(
          terminalSkin.row,
          terminalSkin.borderB,
          "gap-1 bg-slate-900/40 px-1",
        )}
      >
        <span>TIME</span>
        <span>SYM</span>
        <span>FUSE</span>
        <span>SCORE</span>
        <span>STANCE</span>
        <span className="ml-auto">ACTION</span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {fused.length === 0 ? (
          <p className={cn(TERMINAL_TYPO.dataSm, "p-1 text-slate-500")}>
            AWAITING MULTI-AGENT CONSENSUS · FUSION ENGINE IDLE
          </p>
        ) : (
          fused.map((op) => <FusedRow key={op.id} op={op} />)
        )}
      </div>
    </div>
  );
}
