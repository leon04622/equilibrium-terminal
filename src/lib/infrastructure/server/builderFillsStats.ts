import lz4 from "lz4js";
import type {
  BuilderFillAnalytics,
  BuilderFillDaySummary,
  BuilderFillRow,
} from "@/types/builder-fills";

const HL_BUILDER_FILLS_BASE = "https://stats-data.hyperliquid.xyz/Mainnet/builder_fills";

function ymd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function isoDay(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function parseCsv(text: string): BuilderFillRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].split(",");
  const idx = (name: string) => header.indexOf(name);

  const timeI = idx("time");
  const userI = idx("user");
  const coinI = idx("coin");
  const sideI = idx("side");
  const pxI = idx("px");
  const szI = idx("sz");
  const feeI = idx("builder_fee");

  if (timeI < 0 || coinI < 0 || pxI < 0 || szI < 0) return [];

  const rows: BuilderFillRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const px = Number.parseFloat(cols[pxI] ?? "");
    const sz = Number.parseFloat(cols[szI] ?? "");
    if (!Number.isFinite(px) || !Number.isFinite(sz)) continue;
    const builderFee = feeI >= 0 ? Number.parseFloat(cols[feeI] ?? "0") : 0;
    rows.push({
      time: cols[timeI] ?? "",
      user: userI >= 0 ? cols[userI] ?? "" : "",
      coin: cols[coinI] ?? "",
      side: sideI >= 0 ? cols[sideI] ?? "" : "",
      px,
      sz,
      builderFee: Number.isFinite(builderFee) ? builderFee : 0,
      notionalUsd: px * sz,
    });
  }
  return rows;
}

async function fetchDayCsv(builderAddress: string, date: Date): Promise<BuilderFillRow[]> {
  const addr = builderAddress.toLowerCase();
  const url = `${HL_BUILDER_FILLS_BASE}/${addr}/${ymd(date)}.csv.lz4`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (res.status === 404) return [];
  if (!res.ok) return [];

  const compressed = new Uint8Array(await res.arrayBuffer());
  try {
    const decompressed = lz4.decompress(compressed);
    const text = new TextDecoder().decode(decompressed);
    return parseCsv(text);
  } catch {
    return [];
  }
}

export async function fetchBuilderFillAnalytics(
  builderAddress: string,
  lookbackDays = 7,
): Promise<BuilderFillAnalytics> {
  const days = Math.min(Math.max(lookbackDays, 1), 30);
  const now = new Date();
  const byDay: BuilderFillDaySummary[] = [];
  const allRows: Array<BuilderFillRow & { day: string }> = [];

  for (let offset = 0; offset < days; offset++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    d.setUTCDate(d.getUTCDate() - offset);
    const dayLabel = isoDay(d);
    const rows = await fetchDayCsv(builderAddress, d);
    if (rows.length === 0) continue;

    let notionalUsd = 0;
    let builderFeeUsd = 0;
    for (const row of rows) {
      notionalUsd += row.notionalUsd;
      builderFeeUsd += row.builderFee;
      allRows.push({ ...row, day: dayLabel });
    }
    byDay.push({
      date: dayLabel,
      fillCount: rows.length,
      notionalUsd,
      builderFeeUsd,
    });
  }

  const coinMap = new Map<string, { fillCount: number; notionalUsd: number; builderFeeUsd: number }>();
  for (const row of allRows) {
    const cur = coinMap.get(row.coin) ?? { fillCount: 0, notionalUsd: 0, builderFeeUsd: 0 };
    cur.fillCount += 1;
    cur.notionalUsd += row.notionalUsd;
    cur.builderFeeUsd += row.builderFee;
    coinMap.set(row.coin, cur);
  }

  const topCoins = Array.from(coinMap.entries())
    .map(([coin, stats]) => ({ coin, ...stats }))
    .sort((a, b) => b.notionalUsd - a.notionalUsd)
    .slice(0, 8);

  allRows.sort((a, b) => (a.time < b.time ? 1 : -1));
  const recentFills = allRows.slice(0, 12).map(({ day: _day, ...row }) => row);

  const fillCount = allRows.length;
  const notionalUsd = allRows.reduce((s, r) => s + r.notionalUsd, 0);
  const builderFeeUsd = allRows.reduce((s, r) => s + r.builderFee, 0);

  return {
    builderAddress: builderAddress.toLowerCase(),
    daysQueried: days,
    daysWithData: byDay.length,
    fillCount,
    notionalUsd,
    builderFeeUsd,
    lastFillAt: allRows[0]?.time ?? null,
    byDay: byDay.sort((a, b) => (a.date < b.date ? 1 : -1)),
    topCoins,
    recentFills,
    fetchedAt: Date.now(),
  };
}
