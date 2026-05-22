import type { MacroSymbol, MacroTickerData } from "@/types/market-atmosphere";

/** Deterministic micro-jitter for macro tape when live feeds are unavailable. */
function jitter(base: number, scale: number): number {
  const t = Date.now() / 1000;
  const wave = Math.sin(t * 0.37 + base) * scale;
  return base + wave;
}

export function simulateMacroTick(row: MacroTickerData): Partial<MacroTickerData> {
  const scale =
    row.symbol === "US10Y"
      ? 0.0025
      : row.symbol === "DXY"
        ? 0.04
        : row.symbol === "YM"
          ? 8
          : row.symbol === "NQ"
            ? 12
            : 1.2;

  const last = jitter(row.last, scale);
  const changePct = ((last - row.last) / row.last) * 100 + row.changePct * 0.92;
  const sessionHigh = Math.max(row.sessionHigh, last);
  const sessionLow = Math.min(row.sessionLow, last);

  return {
    last: Number(last.toFixed(row.symbol === "US10Y" ? 3 : 2)),
    changePct: Number(changePct.toFixed(2)),
    sessionHigh: Number(sessionHigh.toFixed(row.symbol === "US10Y" ? 3 : 2)),
    sessionLow: Number(sessionLow.toFixed(row.symbol === "US10Y" ? 3 : 2)),
    updatedAt: Date.now(),
  };
}

export function dominantMacroFromTape(
  macro: MacroTickerData[],
): MacroSymbol | null {
  if (!macro.length) return null;
  let best: MacroTickerData | null = null;
  let bestAbs = -1;
  for (const row of macro) {
    const abs = Math.abs(row.changePct);
    if (abs > bestAbs) {
      bestAbs = abs;
      best = row;
    }
  }
  return best?.symbol ?? null;
}
