import type {
  ReputationTier,
  SharedSignal,
  SharedSignalOutcome,
  TraderProfile,
  TraderTrustMetrics,
} from "@/types/network";

export interface MarketOutcomeTick {
  coin: string;
  px: number;
  timestamp: number;
}

export interface ReputationEvaluation {
  walletAddress: `0x${string}`;
  score: number;
  tier: ReputationTier;
  metrics: TraderTrustMetrics;
  sybilPenalty: number;
}

function tierFromScore(score: number): ReputationTier {
  if (score >= 0.88) return "institutional";
  if (score >= 0.72) return "gold";
  if (score >= 0.55) return "silver";
  if (score >= 0.38) return "bronze";
  return "unverified";
}

function resolveOutcome(
  signal: SharedSignal,
  ticks: MarketOutcomeTick[],
): SharedSignalOutcome {
  if (signal.outcome !== "pending") return signal.outcome;
  const tick = ticks.find(
    (t) =>
      t.coin.toUpperCase() === signal.coin.toUpperCase() &&
      t.timestamp >= signal.timestamp,
  );
  if (!tick || signal.targetPx === null) return "pending";
  const move = (tick.px - signal.targetPx) / signal.targetPx;
  if (signal.stance === "bullish") return move > 0.002 ? "hit" : move < -0.002 ? "miss" : "pending";
  if (signal.stance === "bearish") return move < -0.002 ? "hit" : move > 0.002 ? "miss" : "pending";
  return Math.abs(move) < 0.002 ? "hit" : "miss";
}

export class ReputationEngine {
  evaluatePublisher(
    wallet: `0x${string}`,
    signals: SharedSignal[],
    ticks: MarketOutcomeTick[],
    allPublishers: TraderProfile[],
  ): ReputationEvaluation {
    const mine = signals.filter(
      (s) => s.publisherWallet.toLowerCase() === wallet.toLowerCase(),
    );
    const resolved = mine.map((s) => ({
      signal: s,
      outcome: resolveOutcome(s, ticks),
    }));

    const hits = resolved.filter((r) => r.outcome === "hit").length;
    const misses = resolved.filter((r) => r.outcome === "miss").length;
    const decided = hits + misses;
    const precision = decided > 0 ? hits / decided : 0.5;

    let drift = 0;
    for (const r of resolved) {
      if (r.outcome === "pending" || r.signal.targetPx === null) continue;
      const tick = ticks.find((t) => t.coin === r.signal.coin);
      if (!tick) continue;
      const err = Math.abs(tick.px - r.signal.targetPx) / r.signal.targetPx;
      drift += err;
    }
    drift = decided > 0 ? drift / decided : 0;

    const pnlSeries: number[] = [];
    let equity = 1;
    let peak = 1;
    let maxDrawdown = 0;
    for (const r of resolved) {
      if (r.outcome === "pending") continue;
      const ret = r.outcome === "hit" ? 0.02 : -0.015;
      equity *= 1 + ret;
      pnlSeries.push(equity);
      peak = Math.max(peak, equity);
      const dd = peak > 0 ? (peak - equity) / peak : 0;
      maxDrawdown = Math.max(maxDrawdown, dd);
    }

    const isolationIndex = this.computeIsolationIndex(wallet, mine, allPublishers);
    const sybilPenalty = this.computeSybilPenalty(wallet, allPublishers, mine);
    const communityFlags = misses > hits * 2 ? 1 : 0;

    const rawScore =
      precision * 0.42 +
      (1 - Math.min(1, drift * 8)) * 0.22 +
      (1 - maxDrawdown) * 0.18 +
      (1 - isolationIndex) * 0.12 +
      (communityFlags === 0 ? 0.06 : 0);

    const score = Math.max(0, Math.min(0.99, rawScore * (1 - sybilPenalty)));

    const metrics: TraderTrustMetrics = {
      precision,
      drift,
      maxDrawdown,
      isolationIndex,
      communityFlags,
      validatedSignals: decided,
    };

    return {
      walletAddress: wallet,
      score,
      tier: tierFromScore(score),
      metrics,
      sybilPenalty,
    };
  }

  private computeIsolationIndex(
    wallet: `0x${string}`,
    signals: SharedSignal[],
    profiles: TraderProfile[],
  ): number {
    if (signals.length < 3) return 0.1;
    const times = signals.map((s) => s.timestamp).sort((a, b) => a - b);
    const bursts: number[] = [];
    for (let i = 1; i < times.length; i++) {
      bursts.push(times[i] - times[i - 1]);
    }
    const avgGap = bursts.reduce((a, b) => a + b, 0) / bursts.length;
    const rapidFire = bursts.filter((g) => g < 5_000).length / bursts.length;

    const deskPeers = profiles.filter((p) => p.deskId === signals[0]?.deskId);
    const sameSecond = deskPeers.filter(
      (p) =>
        p.walletAddress.toLowerCase() !== wallet.toLowerCase() &&
        Math.abs(p.lastActiveAt - times[times.length - 1]) < 2_000,
    ).length;

    return Math.min(1, rapidFire * 0.5 + sameSecond * 0.08 + (avgGap < 3_000 ? 0.25 : 0));
  }

  private computeSybilPenalty(
    wallet: `0x${string}`,
    profiles: TraderProfile[],
    signals: SharedSignal[],
  ): number {
    const cluster = profiles.filter(
      (p) =>
        p.verificationKey.slice(0, 10) ===
          profiles.find((x) => x.walletAddress === wallet)?.verificationKey.slice(0, 10) &&
        p.walletAddress.toLowerCase() !== wallet.toLowerCase(),
    );
    if (cluster.length < 2) return 0;
    const overlapCoins = new Set(signals.map((s) => s.coin));
    const coordinated = cluster.filter((p) =>
      p.assetTags.some((t) => overlapCoins.has(t)),
    ).length;
    return Math.min(0.55, coordinated * 0.12);
  }

  evaluateAll(
    signals: SharedSignal[],
    ticks: MarketOutcomeTick[],
    profiles: TraderProfile[],
  ): Map<string, ReputationEvaluation> {
    const wallets = new Set(profiles.map((p) => p.walletAddress.toLowerCase()));
    const out = new Map<string, ReputationEvaluation>();
    for (const w of Array.from(wallets)) {
      const evalResult = this.evaluatePublisher(
        w as `0x${string}`,
        signals,
        ticks,
        profiles,
      );
      out.set(w, evalResult);
    }
    return out;
  }
}

export const reputationEngine = new ReputationEngine();
