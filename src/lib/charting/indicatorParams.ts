import { INDICATOR_BY_ID } from "@/lib/charting/indicatorCatalog";

export type IndicatorParamKey =
  | "period"
  | "stdDev"
  | "percent"
  | "fastPeriod"
  | "slowPeriod"
  | "signalPeriod";

export interface IndicatorParamSpec {
  key: IndicatorParamKey;
  label: string;
  min: number;
  max: number;
  step?: number;
  default: number;
}

export type IndicatorParamValues = Partial<Record<IndicatorParamKey, number>>;

const PERIOD_DEFAULTS: Record<string, number> = {
  ema: 21,
  ema_9: 9,
  ema_50: 50,
  sma: 20,
  smma: 7,
  wma: 20,
  hma: 21,
  vwma: 20,
  tema: 20,
  dema: 20,
  rsi: 14,
  cci: 20,
  cmo: 14,
  mfi: 14,
  momentum: 10,
  roc: 12,
  williams_r: 14,
  dpo: 21,
  trix: 15,
  atr: 14,
  adx: 14,
  aroon: 25,
  stoch: 14,
  stoch_rsi: 14,
  bb: 20,
  donchian: 20,
  keltner: 20,
  supertrend: 10,
  linreg: 20,
  chop: 14,
  hv: 20,
  cmf: 20,
  force_index: 13,
  elder_ray: 13,
  envelope: 20,
  w52_hl: 252,
};

function periodSpec(id: string, fallback = 14): IndicatorParamSpec {
  const def = INDICATOR_BY_ID[id];
  return {
    key: "period",
    label: "Length",
    min: 2,
    max: 500,
    step: 1,
    default: PERIOD_DEFAULTS[id] ?? def?.period ?? fallback,
  };
}

/** Input schema per indicator (HL / TradingView style). */
export const INDICATOR_PARAM_SPECS: Record<string, IndicatorParamSpec[]> = {
  ema: [periodSpec("ema")],
  ema_9: [periodSpec("ema_9")],
  ema_50: [periodSpec("ema_50")],
  sma: [periodSpec("sma")],
  smma: [periodSpec("smma")],
  wma: [periodSpec("wma")],
  hma: [periodSpec("hma")],
  vwma: [periodSpec("vwma")],
  tema: [periodSpec("tema")],
  dema: [periodSpec("dema")],
  linreg: [periodSpec("linreg")],
  rsi: [periodSpec("rsi")],
  cci: [periodSpec("cci")],
  cmo: [periodSpec("cmo")],
  mfi: [periodSpec("mfi")],
  momentum: [periodSpec("momentum")],
  roc: [periodSpec("roc")],
  williams_r: [periodSpec("williams_r")],
  dpo: [periodSpec("dpo")],
  trix: [periodSpec("trix")],
  atr: [periodSpec("atr")],
  adx: [periodSpec("adx")],
  aroon: [periodSpec("aroon")],
  stoch: [periodSpec("stoch")],
  stoch_rsi: [periodSpec("stoch_rsi")],
  chop: [periodSpec("chop")],
  hv: [periodSpec("hv")],
  cmf: [periodSpec("cmf")],
  force_index: [periodSpec("force_index")],
  elder_ray: [periodSpec("elder_ray")],
  supertrend: [periodSpec("supertrend")],
  bb: [
    periodSpec("bb"),
    { key: "stdDev", label: "StdDev", min: 0.5, max: 5, step: 0.1, default: 2 },
  ],
  donchian: [periodSpec("donchian")],
  keltner: [periodSpec("keltner")],
  envelope: [
    periodSpec("envelope"),
    { key: "percent", label: "Percent", min: 0.1, max: 10, step: 0.1, default: 2.5 },
  ],
  macd: [
    { key: "fastPeriod", label: "Fast length", min: 2, max: 100, step: 1, default: 12 },
    { key: "slowPeriod", label: "Slow length", min: 2, max: 200, step: 1, default: 26 },
    { key: "signalPeriod", label: "Signal", min: 2, max: 50, step: 1, default: 9 },
  ],
  w52_hl: [{ key: "period", label: "Lookback bars", min: 20, max: 500, step: 1, default: 252 }],
};

export function paramSpecsFor(id: string): IndicatorParamSpec[] {
  return INDICATOR_PARAM_SPECS[id] ?? [];
}

export function hasIndicatorSettings(id: string): boolean {
  return paramSpecsFor(id).length > 0;
}

export function defaultIndicatorParams(id: string): IndicatorParamValues {
  const specs = paramSpecsFor(id);
  const out: IndicatorParamValues = {};
  for (const s of specs) out[s.key] = s.default;
  return out;
}

export function resolveIndicatorParams(
  id: string,
  saved?: IndicatorParamValues,
): Required<Pick<IndicatorParamValues, "period">> & IndicatorParamValues {
  const specs = paramSpecsFor(id);
  const resolved: IndicatorParamValues = {};
  for (const s of specs) {
    const raw = saved?.[s.key];
    const n = raw != null ? Number(raw) : s.default;
    const clamped = Math.min(s.max, Math.max(s.min, Number.isFinite(n) ? n : s.default));
    resolved[s.key] = s.step != null && s.step < 1 ? Math.round(clamped / s.step) * s.step : Math.round(clamped);
  }
  if (resolved.period == null) {
    resolved.period = PERIOD_DEFAULTS[id] ?? INDICATOR_BY_ID[id]?.period ?? 14;
  }
  return resolved as Required<Pick<IndicatorParamValues, "period">> & IndicatorParamValues;
}

export function indicatorSettingsFingerprint(
  indicators: string[],
  settings: Record<string, IndicatorParamValues>,
): string {
  return indicators
    .map((id) => {
      const p = resolveIndicatorParams(id, settings[id]);
      return `${id}:${JSON.stringify(p)}`;
    })
    .join("|");
}

/** Short label for the studies bar chip, e.g. "SMA (50)". */
export function indicatorChipLabel(id: string, saved?: IndicatorParamValues): string {
  const meta = INDICATOR_BY_ID[id];
  if (!meta) return id;
  const specs = paramSpecsFor(id);
  if (specs.length === 0) return meta.name;
  const params = resolveIndicatorParams(id, saved);
  if (specs.length === 1 && specs[0]!.key === "period") {
    return `${meta.name} (${params.period})`;
  }
  const parts = specs.map((s) => params[s.key]).filter((v) => v != null);
  return parts.length ? `${meta.name} (${parts.join(", ")})` : meta.name;
}

export function sanitizeIndicatorSettings(
  raw: unknown,
): Record<string, IndicatorParamValues> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, IndicatorParamValues> = {};
  for (const [id, vals] of Object.entries(raw as Record<string, IndicatorParamValues>)) {
    if (!INDICATOR_BY_ID[id]) continue;
    if (!vals || typeof vals !== "object") continue;
    out[id] = resolveIndicatorParams(id, vals);
  }
  return out;
}
