"use client";

import { useState } from "react";
import { FlaskConical, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { terminalBus } from "@/store/eventBus";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { ThesisBoard } from "@/types/trader-workflow";

const STATUSES: ThesisBoard["status"][] = ["active", "invalidated", "closed"];

export function ResearchWorkspacePanel() {
  const theses = useTraderWorkflowStore((s) => s.theses);
  const savedViews = useTraderWorkflowStore((s) => s.savedViews);
  const upsertThesis = useTraderWorkflowStore((s) => s.upsertThesis);
  const saveMarketView = useTraderWorkflowStore((s) => s.saveMarketView);
  const assetWorkspaceMode = useTraderWorkflowStore((s) => s.assetWorkspaceMode);
  const coin = useTerminalStore((s) => s.selectedAsset?.symbol ?? s.selectedCoin ?? "BTC");

  const [thesis, setThesis] = useState("");
  const [invalidation, setInvalidation] = useState("");
  const [status, setStatus] = useState<ThesisBoard["status"]>("active");

  const saveThesis = () => {
    if (!thesis.trim()) return;
    upsertThesis({
      coin,
      thesis: thesis.trim(),
      invalidation: invalidation.trim() || "—",
      status,
      notes: "",
    });
    setThesis("");
    setInvalidation("");
  };

  const loadView = (panelFocus: string[]) => {
    panelFocus.forEach((widgetId, i) => {
      window.setTimeout(() => terminalBus.emit("widget:focus", { widgetId }), i * 100);
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex items-center gap-2 px-1 py-0.5")}>
        <FlaskConical className="h-3 w-3 text-violet-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-violet-200")}>RESEARCH WORKSPACE</span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          MODE {assetWorkspaceMode.toUpperCase()}
        </span>
      </header>

      <section className={cn(terminalSkin.borderB, "shrink-0 p-1")}>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>THESIS BOARD · {coin}</span>
        <textarea
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
          placeholder="Thesis — human judgment, not AI trade calls"
          rows={2}
          className={cn(
            TERMINAL_TYPO.micro,
            "mt-0.5 w-full resize-none border border-slate-800 bg-slate-950 px-1 text-slate-300",
          )}
        />
        <input
          value={invalidation}
          onChange={(e) => setInvalidation(e.target.value)}
          placeholder="Invalidation level / condition"
          className={cn(
            TERMINAL_TYPO.micro,
            "mt-0.5 w-full border border-slate-800 bg-slate-950 px-1 text-slate-400",
          )}
        />
        <div className="mt-0.5 flex flex-wrap gap-0.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                TERMINAL_TYPO.micro,
                "border border-slate-800 px-1",
                status === s ? "text-violet-300" : "text-slate-600",
              )}
            >
              {s.toUpperCase()}
            </button>
          ))}
          <button
            type="button"
            onClick={saveThesis}
            className={cn(TERMINAL_TYPO.micro, "ml-auto text-cyan-400")}
          >
            SAVE THESIS
          </button>
        </div>
      </section>

      <section className={cn(terminalSkin.borderB, "min-h-0 flex-1 overflow-y-auto p-1")}>
        <div className="mb-0.5 flex items-center gap-1">
          <LayoutGrid className="h-3 w-3 text-slate-500" />
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>SAVED MARKET VIEWS</span>
          <button
            type="button"
            onClick={() =>
              saveMarketView({
                name: `${coin} OPS`,
                coin,
                description: "Current layout focus",
                panelFocus: ["chart", "knowledgegraph", "intelligence", "research"],
              })
            }
            className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-500 hover:text-cyan-400")}
          >
            + CAPTURE
          </button>
        </div>
        {savedViews.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => loadView(v.panelFocus)}
            className={cn(
              terminalSkin.row,
              "mb-0.5 w-full flex-col items-stretch px-1 py-0.5 text-left hover:bg-slate-900",
            )}
          >
            <span className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>{v.name}</span>
            <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
              {v.coin ?? "GLOBAL"} · {v.panelFocus.join(" · ")}
            </span>
          </button>
        ))}

        <span className={cn(TERMINAL_TYPO.micro, "mt-2 block text-slate-500")}>ACTIVE THESES</span>
        {theses.length === 0 ? (
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No theses tracked.</p>
        ) : (
          theses.slice(0, 12).map((t) => (
            <div key={t.id} className={cn(terminalSkin.borderB, "py-0.5")}>
              <span className={cn(TERMINAL_TYPO.micro, terminalSkin.textAi)}>
                {t.coin} · {t.status}
              </span>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{t.thesis}</p>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>INV {t.invalidation}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
