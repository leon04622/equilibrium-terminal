import type { NormalizedCandle } from "@/types/terminal-schema";
import type { IndicatorDefinition } from "@/lib/charting/indicatorCatalog";
import {
  resolveIndicatorParams,
  type IndicatorParamValues,
} from "@/lib/charting/indicatorParams";
import {
  computeAd,
  computeAdx,
  computeAroon,
  computeAtr,
  computeBollinger,
  computeCci,
  computeCmo,
  computeDpo,
  computeDonchian,
  computeEma,
  computeHma,
  computeIchimoku,
  computeKeltner,
  computeMacd,
  computeMfi,
  computeMomentum,
  computeObv,
  computePsar,
  computeRoc,
  computeRsi,
  computeSmma,
  computeSma,
  computeStochastic,
  computeStochRsi,
  computeSupertrend,
  computeTrix,
  computeUltimateOscillator,
  computeVolumeOscillator,
  computeVwap,
  computeWilliamsR,
  computeWma,
  computeW52HighLow,
  computeAcceleratorOscillator,
  computeAccumulativeSwingIndex,
  computeAwesomeOscillator,
  computeBalanceOfPower,
  computeChaikinMoneyFlow,
  computeChaikinOscillator,
  computeChoppinessIndex,
  computeDema,
  computeElderRay,
  computeEnvelope,
  computeForceIndex,
  computeHistoricalVolatility,
  computeLinearRegression,
  computeTema,
  computeTrueStrengthIndex,
  computeVwma,
  computeWilliamsAlligator,
  type IndicatorSeriesSet,
} from "@/lib/charting/indicators";

export type { IndicatorSeriesSet };

export function computeIndicatorOutput(
  id: string,
  candles: NormalizedCandle[],
  meta?: IndicatorDefinition,
  userParams?: IndicatorParamValues,
): IndicatorSeriesSet | null {
  if (!candles.length) return null;

  const p = resolveIndicatorParams(id, userParams);
  const period = p.period;

  switch (id) {
    case "ema":
      return { type: "line", key: "ema", data: computeEma(candles, period), color: meta?.color ?? "#f59e0b" };
    case "ema_9":
      return { type: "line", key: "ema9", data: computeEma(candles, period), color: "#fbbf24" };
    case "ema_50":
      return { type: "line", key: "ema50", data: computeEma(candles, period), color: "#2962ff" };
    case "sma":
      return { type: "line", key: "sma", data: computeSma(candles, period), color: meta?.color ?? "#cbd5e1" };
    case "smma":
      return { type: "line", key: "smma", data: computeSmma(candles, period), color: meta?.color ?? "#22d3ee" };
    case "wma":
      return { type: "line", key: "wma", data: computeWma(candles, period), color: meta?.color ?? "#94a3b8" };
    case "hma":
      return { type: "line", key: "hma", data: computeHma(candles, period), color: meta?.color ?? "#14b8a6" };
    case "vwap":
      return { type: "line", key: "vwap", data: computeVwap(candles), color: meta?.color ?? "#e879f9" };
    case "bb":
      return {
        type: "bands",
        key: "bb",
        bands: computeBollinger(candles, period, p.stdDev ?? 2),
        colors: meta?.colors,
      };
    case "donchian":
      return { type: "bands", key: "donchian", bands: computeDonchian(candles, period), colors: meta?.colors };
    case "keltner":
      return { type: "bands", key: "keltner", bands: computeKeltner(candles, period), colors: meta?.colors };
    case "ichimoku":
      return { type: "multi", key: "ichimoku", series: computeIchimoku(candles) };
    case "psar":
      return { type: "dots", key: "psar", data: computePsar(candles), color: meta?.color ?? "#f472b6" };
    case "supertrend":
      return { type: "line", key: "supertrend", data: computeSupertrend(candles, period), color: meta?.color ?? "#22c55e" };
    case "w52_hl":
      return { type: "multi", key: "w52", series: computeW52HighLow(candles, period) };
    case "rsi":
      return { type: "line", key: "rsi", data: computeRsi(candles, period), color: meta?.color ?? "#a855f7" };
    case "macd":
      return {
        type: "macd",
        key: "macd",
        ...computeMacd(candles, p.fastPeriod ?? 12, p.slowPeriod ?? 26, p.signalPeriod ?? 9),
      };
    case "stoch":
      return { type: "multi", key: "stoch", series: computeStochastic(candles, period) };
    case "stoch_rsi":
      return { type: "multi", key: "stoch_rsi", series: computeStochRsi(candles, period) };
    case "cci":
      return { type: "line", key: "cci", data: computeCci(candles, period), color: meta?.color ?? "#c084fc" };
    case "cmo":
      return { type: "line", key: "cmo", data: computeCmo(candles, period), color: meta?.color ?? "#2dd4bf" };
    case "mfi":
      return { type: "line", key: "mfi", data: computeMfi(candles, period), color: meta?.color ?? "#10b981" };
    case "momentum":
      return { type: "line", key: "momentum", data: computeMomentum(candles, period), color: meta?.color ?? "#0ea5e9" };
    case "roc":
      return { type: "line", key: "roc", data: computeRoc(candles, period), color: meta?.color ?? "#fcd34d" };
    case "williams_r":
      return { type: "line", key: "williams_r", data: computeWilliamsR(candles, period), color: meta?.color ?? "#f87171" };
    case "dpo":
      return { type: "line", key: "dpo", data: computeDpo(candles, period), color: meta?.color ?? "#a78bfa" };
    case "trix":
      return { type: "line", key: "trix", data: computeTrix(candles, period), color: meta?.color ?? "#e879f9" };
    case "uo":
      return { type: "line", key: "uo", data: computeUltimateOscillator(candles), color: meta?.color ?? "#34d399" };
    case "ao":
      return { type: "histogram", key: "ao", data: computeAcceleratorOscillator(candles), color: meta?.color ?? "#06b6d4" };
    case "asi":
      return { type: "line", key: "asi", data: computeAccumulativeSwingIndex(candles), color: meta?.color ?? "#f97316" };
    case "atr":
      return { type: "line", key: "atr", data: computeAtr(candles, period), color: meta?.color ?? "#fb923c" };
    case "adx":
      return { type: "line", key: "adx", data: computeAdx(candles, period), color: meta?.color ?? "#eab308" };
    case "aroon":
      return { type: "multi", key: "aroon", series: computeAroon(candles, period) };
    case "obv":
      return { type: "line", key: "obv", data: computeObv(candles), color: meta?.color ?? "#64748b" };
    case "ad":
      return { type: "line", key: "ad", data: computeAd(candles), color: meta?.color ?? "#84cc16" };
    case "volume_osc":
      return { type: "line", key: "volume_osc", data: computeVolumeOscillator(candles), color: meta?.color ?? "#94a3b8" };
    case "vol_profile_fixed":
    case "vol_profile_visible":
      return null;
    case "awesome":
      return { type: "histogram", key: "awesome", data: computeAwesomeOscillator(candles), color: meta?.color ?? "#26a69a" };
    case "cmf":
      return { type: "line", key: "cmf", data: computeChaikinMoneyFlow(candles, period), color: meta?.color ?? "#22d3ee" };
    case "chaikin_osc":
      return { type: "line", key: "chaikin_osc", data: computeChaikinOscillator(candles), color: meta?.color ?? "#38bdf8" };
    case "bop":
      return { type: "line", key: "bop", data: computeBalanceOfPower(candles), color: meta?.color ?? "#f472b6" };
    case "chop":
      return { type: "line", key: "chop", data: computeChoppinessIndex(candles, period), color: meta?.color ?? "#a3e635" };
    case "hv":
      return { type: "line", key: "hv", data: computeHistoricalVolatility(candles, period), color: meta?.color ?? "#fb7185" };
    case "linreg":
      return { type: "line", key: "linreg", data: computeLinearRegression(candles, period), color: meta?.color ?? "#fcd34d" };
    case "vwma":
      return { type: "line", key: "vwma", data: computeVwma(candles, period), color: meta?.color ?? "#7dd3fc" };
    case "tema":
      return { type: "line", key: "tema", data: computeTema(candles, period), color: meta?.color ?? "#c4b5fd" };
    case "dema":
      return { type: "line", key: "dema", data: computeDema(candles, period), color: meta?.color ?? "#93c5fd" };
    case "tsi":
      return { type: "line", key: "tsi", data: computeTrueStrengthIndex(candles), color: meta?.color ?? "#e879f9" };
    case "alligator":
      return { type: "multi", key: "alligator", series: computeWilliamsAlligator(candles) };
    case "force_index":
      return { type: "line", key: "force_index", data: computeForceIndex(candles, period), color: meta?.color ?? "#f97316" };
    case "elder_ray":
      return { type: "multi", key: "elder_ray", series: computeElderRay(candles, period) };
    case "envelope":
      return {
        type: "bands",
        key: "envelope",
        bands: computeEnvelope(candles, period, p.percent ?? 2.5),
        colors: meta?.colors,
      };
    default:
      return null;
  }
}

export function isVolumeProfileIndicator(id: string): boolean {
  return id === "vol_profile_fixed" || id === "vol_profile_visible";
}
