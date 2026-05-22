"use client";

import { useCallback, useMemo, useState } from "react";
import { GitBranch, Network, Search } from "lucide-react";
import { GraphQueryEngine } from "@/lib/knowledge-graph/GraphQueryEngine";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { useMarketKnowledgeGraphStore } from "@/store/useMarketKnowledgeGraphStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { GraphEntity } from "@/types/market-knowledge-graph";

function MiniGraph({
  entities,
  links,
  centerId,
  onSelect,
}: {
  entities: GraphEntity[];
  links: { from: string; to: string }[];
  centerId: string | null;
  onSelect: (id: string) => void;
}) {
  const positions = useMemo(() => {
    const pos = new Map<string, { x: number; y: number }>();
    const cx = 120;
    const cy = 72;
    const core = entities.find((e) => e.id === centerId) ?? entities[0];
    if (core) pos.set(core.id, { x: cx, y: cy });
    const rest = entities.filter((e) => e.id !== core?.id);
    rest.forEach((e, i) => {
      const angle = (i / Math.max(1, rest.length)) * Math.PI * 2;
      const r = 52 + (i % 3) * 8;
      pos.set(e.id, { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    });
    return pos;
  }, [entities, centerId]);

  return (
    <svg viewBox="0 0 240 144" className="h-36 w-full bg-slate-950">
      {links.map((l, i) => {
        const a = positions.get(l.from);
        const b = positions.get(l.to);
        if (!a || !b) return null;
        return (
          <line
            key={`${l.from}-${l.to}-${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#1e3a5f"
            strokeWidth={0.5}
          />
        );
      })}
      {entities.map((e) => {
        const p = positions.get(e.id);
        if (!p) return null;
        const isCenter = e.id === centerId;
        const color =
          e.kind === "asset"
            ? "#00ff88"
            : e.kind === "narrative"
              ? "#a78bfa"
              : e.kind === "event"
                ? "#ffaa00"
                : "#64748b";
        return (
          <g key={e.id} onClick={() => onSelect(e.id)} className="cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r={isCenter ? 5 : 3.5}
              fill={color}
              opacity={isCenter ? 1 : 0.85}
            />
            {isCenter ? (
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                className="fill-slate-400 text-[6px] font-mono"
              >
                {e.label.slice(0, 10)}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function KnowledgeGraphConsole() {
  const snapshot = useMarketKnowledgeGraphStore((s) => s.snapshot);
  const lastQuery = useMarketKnowledgeGraphStore((s) => s.lastQuery);
  const assetHub = useMarketKnowledgeGraphStore((s) => s.assetHub);
  const crossMarket = useMarketKnowledgeGraphStore((s) => s.crossMarket);
  const selectedEntityId = useMarketKnowledgeGraphStore((s) => s.selectedEntityId);
  const setLastQuery = useMarketKnowledgeGraphStore((s) => s.setLastQuery);
  const setSelectedEntityId = useMarketKnowledgeGraphStore((s) => s.setSelectedEntityId);
  const pipelineActive = useMarketKnowledgeGraphStore((s) => s.pipelineActive);
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);
  const [query, setQuery] = useState("");

  const runQuery = useCallback(() => {
    if (!query.trim()) return;
    const result = GraphQueryEngine.query(query.trim());
    setLastQuery(result);
    if (result.matches[0]) setSelectedEntityId(result.matches[0].entity.id);
  }, [query, setLastQuery, setSelectedEntityId]);

  const subgraph = lastQuery?.subgraph ?? {
    entities: assetHub?.relatedEntities ?? [],
    links: assetHub?.graphLinks ?? [],
  };
  const centerId =
    selectedEntityId ?? (assetHub ? `asset:${assetHub.coin}` : subgraph.entities[0]?.id ?? null);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header
        className={cn(
          terminalSkin.borderB,
          "flex shrink-0 flex-wrap items-center gap-2 px-1 py-0.5",
        )}
      >
        <Network className="h-3 w-3 text-cyan-500" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>KNOWLEDGE GRAPH</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {snapshot.entityCount}E · {snapshot.linkCount}L
        </span>
        <span
          className={cn(
            TERMINAL_TYPO.micro,
            pipelineActive ? terminalSkin.textUp : "text-slate-600",
          )}
        >
          {pipelineActive ? "SYNC" : "—"}
        </span>
      </header>

      <div className={cn(terminalSkin.borderB, "flex shrink-0 gap-1 p-1")}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runQuery()}
          placeholder="AI sector · ETH narratives · negative funding…"
          className={cn(
            TERMINAL_TYPO.micro,
            "min-w-0 flex-1 border border-slate-800 bg-slate-950 px-1 py-0.5 text-slate-300 outline-none",
          )}
        />
        <button
          type="button"
          onClick={runQuery}
          className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-1 text-cyan-400")}
        >
          <Search className="inline h-3 w-3" />
        </button>
      </div>

      {lastQuery ? (
        <p className={cn(TERMINAL_TYPO.micro, "shrink-0 px-1 text-slate-500")}>
          {lastQuery.interpretation} · {lastQuery.elapsedMs.toFixed(1)}ms
        </p>
      ) : null}

      <MiniGraph
        entities={subgraph.entities}
        links={subgraph.links}
        centerId={centerId}
        onSelect={setSelectedEntityId}
      />

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-px bg-slate-900">
        <section className="min-h-0 overflow-y-auto bg-slate-950 p-1">
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>ENTITIES</span>
          {(lastQuery?.matches ?? []).slice(0, 8).map((m) => (
            <button
              key={m.entity.id}
              type="button"
              onClick={() => {
                setSelectedEntityId(m.entity.id);
                if (m.entity.coin) selectAssetByCoin(m.entity.coin, "knowledge-graph");
              }}
              className={cn(
                terminalSkin.row,
                "mb-0.5 w-full flex-col items-stretch px-1 py-0.5 text-left hover:bg-slate-900",
                selectedEntityId === m.entity.id && "bg-slate-900",
              )}
            >
              <span className={cn(TERMINAL_TYPO.micro, terminalSkin.textAi)}>
                {m.entity.kind.toUpperCase()}
              </span>
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{m.entity.label}</span>
            </button>
          ))}
        </section>

        <section className="min-h-0 overflow-y-auto bg-slate-950 p-1">
          {assetHub ? (
            <>
              <span className={cn(TERMINAL_TYPO.micro, "text-violet-400")}>
                {assetHub.symbol} HUB
              </span>
              <p className={cn(TERMINAL_TYPO.micro, "mt-0.5 text-slate-500")}>
                {assetHub.aiSummary}
              </p>
              {assetHub.sections.map((sec) => (
                <div key={sec.id} className="mt-1">
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{sec.title}</span>
                  {sec.items.map((it) => (
                    <div key={it.label} className="flex justify-between gap-1">
                      <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{it.label}</span>
                      <span
                        className={cn(
                          TERMINAL_TYPO.micro,
                          it.emphasis === "warn"
                            ? terminalSkin.textWarn
                            : it.emphasis === "up"
                              ? terminalSkin.textUp
                              : "text-slate-300",
                        )}
                      >
                        {it.value}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </>
          ) : null}
        </section>
      </div>

      <section className={cn(terminalSkin.borderT, "max-h-20 shrink-0 overflow-y-auto p-1")}>
        <GitBranch className="mr-1 inline h-3 w-3 text-slate-500" />
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>CROSS-MARKET</span>
        {crossMarket.slice(0, 3).map((c) => (
          <p key={c.id} className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
            {c.headline}
          </p>
        ))}
      </section>
    </div>
  );
}
