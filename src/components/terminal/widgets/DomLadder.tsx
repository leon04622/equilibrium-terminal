"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { DomCanvasRenderer } from "@/lib/execution/DomCanvasRenderer";
import { useExecutionIntelligenceStore } from "@/store/useExecutionIntelligenceStore";

export function DomLadder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<DomCanvasRenderer | null>(null);
  const domVersion = useExecutionIntelligenceStore((s) => s.domVersion);
  const dom = useExecutionIntelligenceStore((s) => s.dom);
  const cvd = useExecutionIntelligenceStore((s) => s.cvd);
  const imbalance = useExecutionIntelligenceStore((s) => s.imbalance);
  const pipelineActive = useExecutionIntelligenceStore((s) => s.pipelineActive);
  const executionConfidence = useExecutionIntelligenceStore((s) => s.executionConfidence);

  useEffect(() => {
    rendererRef.current = new DomCanvasRenderer();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const renderer = rendererRef.current;
    if (!canvas || !container || !renderer) return;

    const paint = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      renderer.resize(canvas, rect.width, rect.height);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const packet = useExecutionIntelligenceStore.getState().dom;
        renderer.render(ctx, packet, { highlightMid: true });
      }
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(container);
    return () => ro.disconnect();
  }, [domVersion]);

  const skewLabel = imbalance.skew.toUpperCase();
  const cvdPrefix = cvd.delta >= 0 ? "+" : "";

  return (
    <div
      className={cn("flex h-full flex-col overflow-hidden rounded-none", terminalSkin.canvas)}
      data-domladder-panel="domladder"
      data-panel-id="domladder"
    >
      <div
        className={cn(
          terminalSkin.panelHeader,
          terminalSkin.borderB,
          "justify-between rounded-none px-1",
        )}
      >
        <span>DEPTH OF MARKET LADDER</span>
        <span className={TERMINAL_TYPO.micro}>
          <span className={pipelineActive ? terminalSkin.textUp : terminalSkin.textDown}>
            {pipelineActive ? "OFA ON" : "OFA OFF"}
          </span>
          <span className="text-slate-600"> · CVD </span>
          <span className={cvd.delta >= 0 ? terminalSkin.textUp : terminalSkin.textDown}>
            {cvdPrefix}
            {cvd.delta.toFixed(3)}
          </span>
          <span className="text-slate-600"> · CONF </span>
          <span className={terminalSkin.textAi}>{executionConfidence.toFixed(0)}%</span>
        </span>
      </div>

      <div
        className={cn(
          "grid shrink-0 grid-cols-4 gap-px border-b-[0.5px] border-slate-800 bg-slate-800 p-px",
        )}
      >
        <div className="rounded-none border-[0.5px] border-slate-800 bg-slate-950 px-1 py-0">
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>IMB</span>
          <p className={cn(TERMINAL_TYPO.dataSm, "tabular-nums text-slate-200")}>
            {imbalance.ratio.toFixed(2)}
          </p>
        </div>
        <div className="rounded-none border-[0.5px] border-slate-800 bg-slate-950 px-1 py-0">
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>SKEW</span>
          <p
            className={cn(
              TERMINAL_TYPO.dataSm,
              imbalance.skew === "bid"
                ? terminalSkin.textUp
                : imbalance.skew === "ask"
                  ? terminalSkin.textDown
                  : "text-slate-400",
            )}
          >
            {skewLabel}
          </p>
        </div>
        <div className="rounded-none border-[0.5px] border-slate-800 bg-slate-950 px-1 py-0">
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>SPREAD</span>
          <p className={cn(TERMINAL_TYPO.dataSm, "tabular-nums text-slate-200")}>
            {dom?.spreadBps !== null && dom?.spreadBps !== undefined
              ? `${dom.spreadBps.toFixed(2)} BP`
              : "—"}
          </p>
        </div>
        <div className="rounded-none border-[0.5px] border-slate-800 bg-slate-950 px-1 py-0">
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>MID</span>
          <p className={cn(TERMINAL_TYPO.dataSm, "tabular-nums", terminalSkin.textAi)}>
            {dom?.bestBid && dom?.bestAsk
              ? ((dom.bestBid + dom.bestAsk) / 2).toFixed(2)
              : "—"}
          </p>
        </div>
      </div>

      <div ref={containerRef} data-domladder-region="ladder" className="relative min-h-0 flex-1 rounded-none bg-slate-950">
        <canvas ref={canvasRef} className="block h-full w-full rounded-none" />
      </div>
    </div>
  );
}
