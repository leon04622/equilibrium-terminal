import { OptionsIngestionEngine } from "@/lib/derivatives/OptionsIngestionEngine";
import type { OptionsAnalytics } from "@/types/derivatives-intelligence";

export class OptionsAnalyticsEngine {
  static analyze(asset: string): OptionsAnalytics {
    const chain = OptionsIngestionEngine.chain(asset);
    const callOi = chain.filter((r) => r.side === "call").reduce((s, r) => s + r.openInterest, 0);
    const putOi = chain.filter((r) => r.side === "put").reduce((s, r) => s + r.openInterest, 0);
    const putCallRatio = callOi > 0 ? putOi / callOi : 1;

    const byStrike = new Map<number, { callOi: number; putOi: number }>();
    for (const r of chain) {
      const row = byStrike.get(r.strike) ?? { callOi: 0, putOi: 0 };
      if (r.side === "call") row.callOi += r.openInterest;
      else row.putOi += r.openInterest;
      byStrike.set(r.strike, row);
    }

    const strikeLadder = Array.from(byStrike.entries())
      .map(([strike, oi]) => ({ strike, ...oi }))
      .sort((a, b) => b.callOi + b.putOi - (a.callOi + a.putOi))
      .slice(0, 12);

    const totalOi = callOi + putOi || 1;
    const topStrike = strikeLadder[0];
    const topShare = topStrike ? (topStrike.callOi + topStrike.putOi) / totalOi : 0;
    const oiConcentrationScore = Math.min(100, Math.round(topShare * 200));

    let maxPainStrike = strikeLadder[0]?.strike ?? 0;
    let minPain = Number.POSITIVE_INFINITY;
    for (const { strike } of strikeLadder) {
      let pain = 0;
      for (const r of chain) {
        if (r.side === "call" && strike > r.strike) pain += (strike - r.strike) * r.openInterest;
        if (r.side === "put" && strike < r.strike) pain += (r.strike - strike) * r.openInterest;
      }
      if (pain < minPain) {
        minPain = pain;
        maxPainStrike = strike;
      }
    }

    return {
      putCallRatio: Math.round(putCallRatio * 100) / 100,
      maxPainStrike,
      oiConcentrationScore,
      ivSurfacePoints: chain.length,
      strikeLadder,
    };
  }
}
