import { NextResponse } from "next/server";
import {
  DEFAULT_CANDLE_HISTORY_BARS,
  alignedHistoryWindow,
  fetchCandleSnapshot,
  resolveHlCoin,
  type HlCandleInterval,
} from "@/lib/hyperliquid/candles";
import { buildGuardContext, enforceRateLimit } from "@/lib/security/ApiSecurityGuard";

export const runtime = "nodejs";

const HL_INTERVALS = new Set<string>([
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "8h",
  "12h",
  "1d",
  "3d",
  "1w",
  "1M",
]);

export async function GET(request: Request) {
  const ctx = buildGuardContext(request);
  const limited = enforceRateLimit(ctx, "market_candles", 60, 60_000);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const coin = searchParams.get("coin") ?? "BTC";
  const interval = (searchParams.get("interval") ?? "1m") as HlCandleInterval;
  const bars = Math.min(
    800,
    Math.max(50, Number.parseInt(searchParams.get("bars") ?? String(DEFAULT_CANDLE_HISTORY_BARS), 10) || DEFAULT_CANDLE_HISTORY_BARS),
  );

  if (!HL_INTERVALS.has(interval)) {
    return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
  }

  try {
    const { startTime, endTime } = alignedHistoryWindow(interval, bars);
    const hlCoin = resolveHlCoin(coin);
    const candles = await fetchCandleSnapshot(hlCoin, interval, startTime, endTime);
    return NextResponse.json({ coin: hlCoin, interval, candles, updatedAt: Date.now() });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Candle fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
