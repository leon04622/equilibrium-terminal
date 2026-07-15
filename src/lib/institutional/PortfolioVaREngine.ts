import { PortfolioHistoryEngine } from "@/lib/portfolio-desk/PortfolioHistoryEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { NormalizedCandle } from "@/types/terminal-schema";
import type { PortfolioVaRSnapshot, PositionVaRRow, VaRHorizonDays, VaRHorizonMetrics, VaRMethod } from "@/types/institutional-capabilities";

const Z_95 = 1.645;
const Z_99 = 2.326;
const PHI_Z_95 = 0.1031;
const PHI_Z_99 = 0.0267;
const CRYPTO_CORRELATION = 0.72;
const HORIZON_DAYS = 1;
const VAR_HORIZONS: VaRHorizonDays[] = [1, 5, 10];

const DEFAULT_DAILY_VOL_PCT: Record<string, number> = {
  BTC: 2.6,
  ETH: 3.4,
  SOL: 5.8,
  DOGE: 7.2,
  AVAX: 6.1,
  ARB: 6.5,
  OP: 6.4,
  WIF: 9.5,
  PEPE: 10.2,
};

function defaultVolPct(coin: string): number {
  const key = coin.toUpperCase();
  return DEFAULT_DAILY_VOL_PCT[key] ?? 6.8;
}

function logReturnsFromCandles(candles: NormalizedCandle[]): number[] {
  const sorted = [...candles].sort((a, b) => a.time - b.time);
  const returns: number[] = [];
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1]!.close;
    const curr = sorted[i]!.close;
    if (prev > 0 && curr > 0) returns.push(Math.log(curr / prev));
  }
  return returns;
}

function realizedDailyVolPct(candles: NormalizedCandle[]): number | null {
  const returns = logReturnsFromCandles(candles);
  if (returns.length < 8) return null;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  let varSum = 0;
  for (const r of returns) {
    const d = r - mean;
    varSum += d * d;
  }
  const stdev = Math.sqrt(varSum / returns.length);
  return Math.max(0.4, Math.min(18, stdev * 100));
}

function estimateCoinVolPct(coin: string, candles: NormalizedCandle[], selectedCoin: string): number {
  const fromCandles =
    coin.toUpperCase() === selectedCoin.toUpperCase() ? realizedDailyVolPct(candles) : null;
  if (fromCandles != null) return fromCandles;

  const btcVol = realizedDailyVolPct(candles);
  if (btcVol != null) {
    const upper = coin.toUpperCase();
    if (upper === "BTC") return btcVol;
    if (upper === "ETH") return Math.min(12, btcVol * 1.18);
    return Math.min(15, btcVol * 1.65);
  }

  return defaultVolPct(coin);
}

function normalEsMultiplier(confidence: 95 | 99): number {
  if (confidence === 99) return PHI_Z_99 / 0.01;
  return PHI_Z_95 / 0.05;
}

function parametricRisk(
  notionals: number[],
  vols: number[],
  accountValue: number,
  z: number,
): { varUsd: number; esUsd: number; dailyVolPct: number } {
  if (notionals.length === 0 || accountValue <= 0) {
    return { varUsd: 0, esUsd: 0, dailyVolPct: 0 };
  }

  let variance = 0;
  for (let i = 0; i < notionals.length; i += 1) {
    const riskI = (vols[i]! / 100) * notionals[i]!;
    variance += riskI * riskI;
    for (let j = i + 1; j < notionals.length; j += 1) {
      const riskJ = (vols[j]! / 100) * notionals[j]!;
      variance += 2 * CRYPTO_CORRELATION * riskI * riskJ;
    }
  }

  const stdevUsd = Math.sqrt(Math.max(variance, 0));
  const confidence = z === Z_99 ? 99 : 95;
  const esMultiplier = normalEsMultiplier(confidence as 95 | 99);
  const dailyVolPct =
    accountValue > 0 ? Math.round((stdevUsd / accountValue) * 10_000) / 100 : 0;

  return {
    varUsd: Math.round(stdevUsd * z * 100) / 100,
    esUsd: Math.round(stdevUsd * esMultiplier * 100) / 100,
    dailyVolPct,
  };
}

function historicalRisk(
  accountValue: number,
): { var95Usd: number; var99Usd: number; es95Usd: number; es99Usd: number; sampleSize: number } | null {
  const history = PortfolioHistoryEngine.points();
  if (history.length < 12) return null;

  const returns: number[] = [];
  for (let i = 1; i < history.length; i += 1) {
    const prev = history[i - 1]!.accountValueUsd;
    const curr = history[i]!.accountValueUsd;
    if (prev > 0) returns.push((curr - prev) / prev);
  }
  if (returns.length < 8) return null;

  const sorted = [...returns].sort((a, b) => a - b);
  const idx95 = Math.max(0, Math.floor(sorted.length * 0.05) - 1);
  const idx99 = Math.max(0, Math.floor(sorted.length * 0.01) - 1);
  const ret95 = sorted[idx95] ?? sorted[0]!;
  const ret99 = sorted[idx99] ?? sorted[0]!;
  const tail95 = sorted.slice(0, idx95 + 1);
  const tail99 = sorted.slice(0, idx99 + 1);
  const esRet95 = tail95.length ? tail95.reduce((a, b) => a + b, 0) / tail95.length : ret95;
  const esRet99 = tail99.length ? tail99.reduce((a, b) => a + b, 0) / tail99.length : ret99;

  const loss = (r: number) => Math.max(0, -r * accountValue);
  return {
    var95Usd: Math.round(loss(ret95) * 100) / 100,
    var99Usd: Math.round(loss(ret99) * 100) / 100,
    es95Usd: Math.round(loss(esRet95) * 100) / 100,
    es99Usd: Math.round(loss(esRet99) * 100) / 100,
    sampleSize: returns.length,
  };
}

function blend(
  parametric: number,
  historical: number | null,
  sampleSize: number,
): number {
  if (historical == null) return parametric;
  const histWeight = sampleSize >= 30 ? 0.45 : sampleSize >= 15 ? 0.3 : 0.15;
  return parametric * (1 - histWeight) + historical * histWeight;
}

function scaleHorizons(
  accountValue: number,
  var95Usd: number,
  var99Usd: number,
  es95Usd: number,
  es99Usd: number,
): VaRHorizonMetrics[] {
  return VAR_HORIZONS.map((horizonDays) => {
    const scale = Math.sqrt(horizonDays);
    const hVar95 = var95Usd * scale;
    const hVar99 = var99Usd * scale;
    const hEs95 = es95Usd * scale;
    return {
      horizonDays,
      var95Usd: Math.round(hVar95 * 100) / 100,
      var95Pct: Math.round((hVar95 / accountValue) * 10_000) / 100,
      var99Usd: Math.round(hVar99 * 100) / 100,
      var99Pct: Math.round((hVar99 / accountValue) * 10_000) / 100,
      expectedShortfall95Usd: Math.round(hEs95 * 100) / 100,
      expectedShortfall95Pct: Math.round((hEs95 / accountValue) * 10_000) / 100,
    };
  });
}

export class PortfolioVaREngine {
  static horizonMetrics(
    snap: PortfolioVaRSnapshot,
    horizonDays: VaRHorizonDays = 1,
  ): VaRHorizonMetrics {
    return (
      snap.horizons.find((h) => h.horizonDays === horizonDays) ??
      snap.horizons[0] ?? {
        horizonDays: 1,
        var95Usd: snap.var95Usd,
        var95Pct: snap.var95Pct,
        var99Usd: snap.var99Usd,
        var99Pct: snap.var99Pct,
        expectedShortfall95Usd: snap.expectedShortfall95Usd,
        expectedShortfall95Pct: snap.expectedShortfall95Pct,
      }
    );
  }
  static snapshot(): PortfolioVaRSnapshot {
    const state = useTerminalStore.getState();
    const accountValue = Math.max(state.accountValue ?? 0, 1);
    const candles = state.candles;
    const selectedCoin = state.selectedAsset?.coin ?? "BTC";

    const positions = state.positions.map((p) => ({
      coin: p.coin,
      notionalUsd: Math.abs(p.size * p.markPrice),
    }));

    const vols = positions.map((p) =>
      estimateCoinVolPct(p.coin, candles, selectedCoin),
    );
    const notionals = positions.map((p) => p.notionalUsd);

    const param95 = parametricRisk(notionals, vols, accountValue, Z_95);
    const param99 = parametricRisk(notionals, vols, accountValue, Z_99);
    const hist = historicalRisk(accountValue);

    let method: VaRMethod = hist ? "blended" : "parametric";
    if (positions.length === 0 && hist) method = "historical";
    if (!hist && positions.length > 0) method = "parametric";

    const var95Usd = blend(param95.varUsd, hist?.var95Usd ?? null, hist?.sampleSize ?? 0);
    const var99Usd = blend(param99.varUsd, hist?.var99Usd ?? null, hist?.sampleSize ?? 0);
    const es95Usd = blend(param95.esUsd, hist?.es95Usd ?? null, hist?.sampleSize ?? 0);
    const es99Usd = blend(
      param99.esUsd,
      hist?.es99Usd ?? null,
      hist?.sampleSize ?? 0,
    );

    const totalNotional = notionals.reduce((a, b) => a + b, 0) || 1;
    const positionRows: PositionVaRRow[] = positions.map((p, i) => {
      const vol = vols[i]!;
      const var95 = (vol / 100) * p.notionalUsd * Z_95;
      return {
        coin: p.coin,
        notionalUsd: Math.round(p.notionalUsd),
        weightPct: Math.round((p.notionalUsd / totalNotional) * 1000) / 10,
        dailyVolPct: Math.round(vol * 10) / 10,
        var95Usd: Math.round(var95),
        contributionPct:
          var95Usd > 0 ? Math.round((var95 / var95Usd) * 1000) / 10 : 0,
      };
    });

    positionRows.sort((a, b) => b.var95Usd - a.var95Usd);

    const horizons = scaleHorizons(accountValue, var95Usd, var99Usd, es95Usd, es99Usd);

    return {
      accountValueUsd: accountValue,
      method,
      horizonDays: HORIZON_DAYS,
      correlationAssumption: CRYPTO_CORRELATION,
      var95Usd,
      var95Pct: Math.round((var95Usd / accountValue) * 10_000) / 100,
      var99Usd,
      var99Pct: Math.round((var99Usd / accountValue) * 10_000) / 100,
      expectedShortfall95Usd: es95Usd,
      expectedShortfall95Pct: Math.round((es95Usd / accountValue) * 10_000) / 100,
      expectedShortfall99Usd: es99Usd,
      expectedShortfall99Pct: Math.round((es99Usd / accountValue) * 10_000) / 100,
      portfolioDailyVolPct: param95.dailyVolPct,
      positions: positionRows,
      horizons,
      historicalSampleSize: hist?.sampleSize ?? 0,
      computedAt: Date.now(),
    };
  }
}
