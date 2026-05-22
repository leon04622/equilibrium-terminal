"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Layout } from "react-grid-layout";
import { HyperBook } from "@/components/terminal/HyperBook";
import { PanelShell } from "@/components/terminal/PanelShell";
import { CommandBar } from "@/components/terminal/CommandBar";
import { TradeTicket } from "@/components/terminal/TradeTicket";
import { PositionsTable } from "@/components/terminal/PositionsTable";
import { WalletStatus } from "@/components/terminal/WalletStatus";
import { useHyperliquidStore } from "@/store/hyperliquidStore";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const GridLayout = dynamic(() => import("react-grid-layout").then((m) => m.default), {
  ssr: false,
});

type PanelKind = "orderbook" | "trades" | "ticket" | "positions";

interface WorkspacePanel {
  id: string;
  kind: PanelKind;
}

const DEFAULT_LAYOUT: Layout[] = [
  { i: "book-1", x: 0, y: 0, w: 5, h: 22, minW: 3, minH: 12 },
  { i: "ticket-1", x: 5, y: 0, w: 3, h: 22, minW: 2, minH: 14 },
  { i: "positions-1", x: 8, y: 0, w: 4, h: 11, minW: 3, minH: 8 },
  { i: "tape-1", x: 8, y: 11, w: 4, h: 11, minW: 2, minH: 6 },
];

const DEFAULT_PANELS: WorkspacePanel[] = [
  { id: "book-1", kind: "orderbook" },
  { id: "ticket-1", kind: "ticket" },
  { id: "positions-1", kind: "positions" },
  { id: "tape-1", kind: "trades" },
];

function TradesTape() {
  const trades = useHyperliquidStore((s) => s.recentTrades);
  return (
    <div className="flex h-full flex-col overflow-auto p-2 font-mono text-[11px]">
      {trades.length === 0 ? (
        <p className="text-terminal-muted">Waiting for trades…</p>
      ) : (
        trades.slice(0, 40).map((t) => (
          <div
            key={`${t.tid}-${t.time}`}
            className="grid grid-cols-[auto_1fr_auto] gap-2 border-b border-white/5 py-0.5"
          >
            <span className={t.side === "buy" ? "text-neon-green" : "text-neon-ruby"}>
              {t.side === "buy" ? "BUY" : "SELL"}
            </span>
            <span className="text-white/90">{t.price}</span>
            <span className="text-right text-terminal-muted">{t.size}</span>
          </div>
        ))
      )}
    </div>
  );
}

function panelTitle(kind: PanelKind): string {
  switch (kind) {
    case "orderbook":
      return "HyperBook";
    case "ticket":
      return "Trade Ticket";
    case "positions":
      return "Positions";
    case "trades":
      return "Tape";
  }
}

function PanelContent({ kind }: { kind: PanelKind }) {
  switch (kind) {
    case "orderbook":
      return <HyperBook />;
    case "ticket":
      return <TradeTicket />;
    case "positions":
      return <PositionsTable />;
    case "trades":
      return <TradesTape />;
  }
}

export function TerminalWorkspace() {
  const [panels, setPanels] = useState<WorkspacePanel[]>(DEFAULT_PANELS);
  const [layout, setLayout] = useState<Layout[]>(DEFAULT_LAYOUT);
  const [maximizedId, setMaximizedId] = useState<string | null>(null);
  const [width, setWidth] = useState(1200);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedAsset = useHyperliquidStore((s) => s.selectedAsset);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    ro.observe(node);
    setWidth(node.clientWidth);
    return () => ro.disconnect();
  }, []);

  const onLayoutChange = useCallback(
    (next: Layout[]) => {
      if (maximizedId) return;
      setLayout(next);
    },
    [maximizedId],
  );

  const toggleMaximize = useCallback((id: string) => {
    setMaximizedId((prev) => (prev === id ? null : id));
  }, []);

  const clonePanel = useCallback((panel: WorkspacePanel) => {
    const newId = `${panel.kind}-${Date.now()}`;
    setPanels((p) => [...p, { id: newId, kind: panel.kind }]);
    setLayout((l) => [
      ...l,
      {
        i: newId,
        x: 0,
        y: Infinity,
        w: 4,
        h: 16,
        minW: 3,
        minH: 10,
      },
    ]);
  }, []);

  const activeLayout = useMemo(() => {
    if (!maximizedId) return layout;
    const item = layout.find((l) => l.i === maximizedId);
    if (!item) return layout;
    return [{ ...item, x: 0, y: 0, w: 12, h: 30 }];
  }, [layout, maximizedId]);

  const visiblePanels = useMemo(() => {
    if (!maximizedId) return panels;
    return panels.filter((p) => p.id === maximizedId);
  }, [panels, maximizedId]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-4 border-b border-terminal-border/60 bg-terminal-panel/40 px-4 py-2 backdrop-blur-glass">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_12px_hsl(var(--neon-green))]" />
          <h1 className="text-sm font-semibold tracking-[0.2em] text-white/95">
            EQUILIBRIUM
          </h1>
          <span className="font-mono text-[10px] text-terminal-muted">2026</span>
        </div>
        <CommandBar />
        <WalletStatus />
        <div className="hidden font-mono text-[10px] text-terminal-muted xl:block">
          {selectedAsset?.coin ?? "—"}
        </div>
      </header>

      <div ref={containerRef} className="relative min-h-0 flex-1 p-2">
        <GridLayout
          className="layout"
          layout={activeLayout}
          cols={12}
          rowHeight={24}
          width={width}
          margin={[8, 8]}
          containerPadding={[0, 0]}
          draggableHandle=".panel-drag-handle"
          onLayoutChange={onLayoutChange}
          compactType="vertical"
          isResizable={!maximizedId}
          isDraggable={!maximizedId}
        >
          {visiblePanels.map((panel) => (
            <div key={panel.id} className="overflow-hidden">
              <PanelShell
                title={panelTitle(panel.kind)}
                subtitle={selectedAsset?.symbol}
                dragHandleClassName="panel-drag-handle cursor-grab"
                maximized={maximizedId === panel.id}
                onToggleMaximize={() => toggleMaximize(panel.id)}
                onClone={() => clonePanel(panel)}
              >
                <PanelContent kind={panel.kind} />
              </PanelShell>
            </div>
          ))}
        </GridLayout>
      </div>
    </div>
  );
}
