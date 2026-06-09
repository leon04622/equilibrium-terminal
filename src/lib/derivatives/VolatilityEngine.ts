import { OptionsIngestionEngine } from "@/lib/derivatives/OptionsIngestionEngine";
import { useTerminalStore } from "@/store/terminalStore";
import type { VolatilityMetrics, VolatilityRegime } from "@/types/derivatives-intelligence";

function realizedVolFromCandles(): number {
  const candles = useTerminalStore.getState().candles;
  if (candles.length < 5) return 0.22;
  const returns: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1]!.close;
    const cur = candles[i]!.close;
    if (prev > 0) returns.push(Math.log(cur / prev));
  }
  if (!returns.length) return 0.22;
  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance =
    returns.reduce((s, r) => s + (r - mean) ** 2, 0) / Math.max(returns.length - 1, 1);
  return Math.sqrt(variance) * Math.sqrt(365 * 24 * 60) * 100;
}

export class VolatilityEngine {
  static metrics(asset: string): VolatilityMetrics {
    const chain = OptionsIngestionEngine.chain(asset);
    const calls = chain.filter((r) => r.side === "call" && r.markIv > 0);
    const puts = chain.filter((r) => r.side === "put" && r.markIv > 0);

    const impliedVolAtm =
      calls.length > 0
        ? calls.slice(0, 8).reduce((s, r) => s + r.markIv, 0) / Math.min(8, calls.length)
        : 45;

    const realizedVol = realizedVolFromCandles();
    const volSpread = impliedVolAtm - realizedVol;

    const putIv = puts.slice(0, 6).reduce((s, r) => s + r.markIv, 0) / Math.max(puts.slice(0, 6).length, 1);
    const callIv = calls.slice(0, 6).reduce((s, r) => s + r.markIv, 0) / Math.max(calls.slice(0, 6).length, 1);
    const skew25d = putIv - callIv;

    const expiries = Array.from(new Set(chain.map((r) => r.expiry))).slice(0, 3);
    let termStructureSlope = 0;
    if (expiries.length >= 2) {
      const near = chain.filter((r) => r.expiry === expiries[0]).reduce((s, r) => s + r.markIv, 0);
      const far = chain.filter((r) => r.expiry === expiries[1]).reduce((s, r) => s + r.markIv, 0);
      const n = chain.filter((r) => r.expiry === expiries[0]).length || 1;
      const f = chain.filter((r) => r.expiry === expiries[1]).length || 1;
      termStructureSlope = far / f - near / n;
    }

    const smileCurvature = Math.abs(skew25d) * 0.4 + Math.abs(termStructureSlope) * 0.2;
    const compressionScore = Math.max(0, Math.min(100, Math.round(100 - impliedVolAtm - realizedVol * 0.5)));

    let regime: VolatilityRegime = "neutral";
    if (volSpread > 8 || impliedVolAtm > 55) regime = "expansion";
    else if (volSpread < -5 && impliedVolAtm < 35) regime = "compression";
    else if (impliedVolAtm > 65 || volSpread > 15) regime = "stress";

    return {
      impliedVolAtm: Math.round(impliedVolAtm * 10) / 10,
      realizedVol: Math.round(realizedVol * 10) / 10,
      volSpread: Math.round(volSpread * 10) / 10,
      regime,
      termStructureSlope: Math.round(termStructureSlope * 10) / 10,
      skew25d: Math.round(skew25d * 10) / 10,
      smileCurvature: Math.round(smileCurvature * 10) / 10,
      compressionScore,
    };
  }
}
