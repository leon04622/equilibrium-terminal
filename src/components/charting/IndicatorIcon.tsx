"use client";

import type { IndicatorDefinition } from "@/lib/charting/indicatorCatalog";

const STROKE = "#787b86";
const ACCENT = "#2962ff";

function MiniChart({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 48 28" className="h-7 w-12 shrink-0" aria-hidden>
      <rect x="0" y="0" width="48" height="28" fill="#131722" rx="2" />
      {children}
    </svg>
  );
}

function pathFromPoints(points: string): React.ReactNode {
  return <path d={points} fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />;
}

const ICON_RENDERERS: Record<string, () => React.ReactNode> = {
  ema: () => (
    <MiniChart>
      <path d="M2 20 L12 16 L22 18 L34 8 L46 10" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      <path d="M2 22 L46 14" fill="none" stroke={STROKE} strokeWidth="1" opacity="0.5" />
    </MiniChart>
  ),
  sma: () => (
    <MiniChart>
      <path d="M2 18 L14 14 L26 16 L38 10 L46 12" fill="none" stroke="#22c55e" strokeWidth="1.5" />
    </MiniChart>
  ),
  smma: () => (
    <MiniChart>
      <path d="M2 19 L16 15 L30 14 L46 9" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
    </MiniChart>
  ),
  rsi: () => (
    <MiniChart>
      <rect x="2" y="6" width="44" height="16" fill="none" stroke="#334155" strokeWidth="0.5" />
      {pathFromPoints("M2 18 Q14 8 26 14 T46 10")}
      <line x1="2" y1="12" x2="46" y2="12" stroke="#475569" strokeWidth="0.5" strokeDasharray="2 2" />
    </MiniChart>
  ),
  macd: () => (
    <MiniChart>
      <rect x="4" y="14" width="4" height="8" fill="#26a69a" opacity="0.7" />
      <rect x="12" y="10" width="4" height="12" fill="#ef5350" opacity="0.7" />
      <rect x="20" y="12" width="4" height="10" fill="#26a69a" opacity="0.7" />
      <path d="M2 8 L46 6" fill="none" stroke="#f59e0b" strokeWidth="1" />
      <path d="M2 10 L46 12" fill="none" stroke="#a855f7" strokeWidth="1" />
    </MiniChart>
  ),
  vwap: () => (
    <MiniChart>
      <path d="M2 20 L46 12" fill="none" stroke="#e879f9" strokeWidth="1.5" strokeDasharray="3 2" />
      <path d="M2 22 L46 18" fill="none" stroke={STROKE} strokeWidth="1" opacity="0.4" />
    </MiniChart>
  ),
  vol_profile_visible: () => (
    <MiniChart>
      <rect x="38" y="8" width="3" height="14" fill="#f59e0b" opacity="0.8" />
      <rect x="42" y="6" width="3" height="16" fill="#2962ff" opacity="0.8" />
      <rect x="34" y="10" width="3" height="12" fill="#f59e0b" opacity="0.5" />
      <path d="M2 20 L46 20" fill="none" stroke={STROKE} strokeWidth="1" />
    </MiniChart>
  ),
  vol_profile_fixed: () => (
    <MiniChart>
      <rect x="36" y="10" width="4" height="12" fill="#787b86" opacity="0.7" />
      <rect x="41" y="7" width="4" height="15" fill="#787b86" opacity="0.9" />
    </MiniChart>
  ),
  bb: () => (
    <MiniChart>
      <path d="M2 10 Q24 4 46 10" fill="none" stroke="#94a3b8" strokeWidth="1" />
      <path d="M2 20 L46 20" fill="none" stroke="#2962ff" strokeWidth="1.5" />
      <path d="M2 26 Q24 32 46 26" fill="none" stroke="#94a3b8" strokeWidth="1" />
    </MiniChart>
  ),
  stoch_rsi: () => (
    <MiniChart>
      <path d="M2 16 L12 10 L22 18 L32 8 L46 14" fill="none" stroke="#2962ff" strokeWidth="1" />
      <path d="M2 20 L14 14 L28 16 L46 12" fill="none" stroke="#f97316" strokeWidth="1" />
    </MiniChart>
  ),
  volume: () => (
    <MiniChart>
      {[4, 10, 16, 22, 28, 34, 40].map((x, i) => (
        <rect
          key={x}
          x={x}
          y={20 - (i % 3) * 4 - 4}
          width="3"
          height={(i % 3) * 4 + 4}
          fill={i % 2 ? "#26a69a" : "#ef5350"}
          opacity="0.75"
        />
      ))}
    </MiniChart>
  ),
};

function genericIcon(def: IndicatorDefinition): React.ReactNode {
  const color = def.color ?? ACCENT;
  const pane = def.pane;
  if (pane === "pane") {
    return (
      <MiniChart>
        <path
          d="M4 18 Q16 8 28 16 T44 10"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          opacity={def.implemented ? 1 : 0.35}
        />
      </MiniChart>
    );
  }
  return (
    <MiniChart>
      <path
        d="M2 20 L46 14"
        fill="none"
        stroke={STROKE}
        strokeWidth="1"
        opacity="0.35"
      />
      <path
        d="M2 18 L14 16 L28 12 L46 8"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity={def.implemented ? 1 : 0.35}
      />
    </MiniChart>
  );
}

export function IndicatorIcon({ def }: { def: IndicatorDefinition }) {
  const baseId = def.id;
  const render = ICON_RENDERERS[baseId] ?? (() => genericIcon(def));
  return <>{render()}</>;
}
