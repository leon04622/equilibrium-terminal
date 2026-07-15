import type { InstitutionalNewsHeadline } from "@/types/institutional-news";

const FETCH_TIMEOUT_MS = 10_000;
const CACHE_MS = 900_000;

interface FredObservation {
  date?: string;
  value?: string;
}

interface FredSeriesDef {
  id: string;
  label: string;
  priority: number;
}

const FRED_MACRO_SERIES: FredSeriesDef[] = [
  { id: "FEDFUNDS", label: "Fed Funds Rate", priority: 91 },
  { id: "CPIAUCSL", label: "CPI (All Urban)", priority: 89 },
  { id: "UNRATE", label: "Unemployment Rate", priority: 88 },
  { id: "DGS10", label: "10-Year Treasury", priority: 87 },
  { id: "T10YIE", label: "10Y Breakeven Inflation", priority: 86 },
];

const TREASURY_SERIES = [
  { key: "Treasury Bills", label: "T-Bills Avg Rate", priority: 90 },
  { key: "Treasury Notes", label: "T-Notes Avg Rate", priority: 91 },
  { key: "Treasury Inflation-Protected Securities (TIPS)", label: "TIPS Avg Rate", priority: 90 },
] as const;

let cache: { at: number; items: InstitutionalNewsHeadline[]; fredLive: number; treasuryLive: boolean } | null =
  null;

function fredApiKey(): string | null {
  return process.env.EQUILIBRIUM_FRED_API_KEY?.trim() || null;
}

function parseObservationDate(date: string): number {
  const ts = Date.parse(`${date}T12:00:00Z`);
  return Number.isFinite(ts) ? ts : Date.now();
}

function formatValue(seriesId: string, raw: string): string {
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  if (seriesId === "CPIAUCSL") return n.toFixed(1);
  return n.toFixed(2);
}

function fredCsvObservationStart(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 24);
  return d.toISOString().slice(0, 10);
}

/** Public FRED CSV — no API key; used when EQUILIBRIUM_FRED_API_KEY is unset. */
async function fetchFredCsvLatest(series: FredSeriesDef): Promise<InstitutionalNewsHeadline | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const cosd = fredCsvObservationStart();
    const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(series.id)}&cosd=${cosd}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "text/csv,text/plain,*/*",
        "User-Agent": "EquilibriumTerminal/1.0 (macro-desk)",
        Referer: "https://fred.stlouisfed.org/",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const text = await res.text();
    const lines = text.trim().split(/\r?\n/).filter((l) => l && !l.startsWith("#"));
    if (lines.length < 2) return null;
    let date: string | undefined;
    let raw: string | undefined;
    for (let i = lines.length - 1; i >= 1; i--) {
      const parts = lines[i].split(",");
      const candidateDate = parts[0]?.trim();
      const candidateRaw = parts[1]?.trim();
      if (candidateDate && candidateRaw && candidateRaw !== ".") {
        date = candidateDate;
        raw = candidateRaw;
        break;
      }
    }
    if (!date || !raw) return null;
    const value = formatValue(series.id, raw);
    const unit = series.id === "CPIAUCSL" ? "" : "%";
    return {
      id: `FRED-${series.id}-${date}`,
      headline: `${series.label} · ${value}${unit} · ${date}`,
      detail: `FRED ${series.id} (public CSV) — macro desk context for rates, inflation, and labor.`,
      source: "FRED",
      tier: "macro",
      timestamp: parseObservationDate(date),
      coin: null,
      url: `https://fred.stlouisfed.org/series/${series.id}`,
      verified: true,
      priority: series.priority - 1,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFredLatest(series: FredSeriesDef, apiKey: string): Promise<InstitutionalNewsHeadline | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const url = new URL("https://api.stlouisfed.org/fred/series/observations");
    url.searchParams.set("series_id", series.id);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("file_type", "json");
    url.searchParams.set("sort_order", "desc");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;

    const body = (await res.json()) as { observations?: FredObservation[] };
    const obs = body.observations?.find((row) => row.value && row.value !== ".");
    if (!obs?.value || !obs.date) return null;

    const value = formatValue(series.id, obs.value);
    const unit = series.id === "CPIAUCSL" ? "" : "%";
    const headline = `${series.label} · ${value}${unit} · ${obs.date}`;

    return {
      id: `FRED-${series.id}-${obs.date}`,
      headline,
      detail: `FRED ${series.id} latest observation — macro desk context for rates, inflation, and labor.`,
      source: "FRED",
      tier: "macro",
      timestamp: parseObservationDate(obs.date),
      coin: null,
      url: `https://fred.stlouisfed.org/series/${series.id}`,
      verified: true,
      priority: series.priority,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchTreasuryYieldCurveHeadlines(): Promise<InstitutionalNewsHeadline[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const year = new Date().getFullYear();
    const url = `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=daily_treasury_yield_curve&field_tdr_date_value=${year}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/xml,text/xml,*/*",
        "User-Agent": "EquilibriumTerminal/1.0 (macro-desk)",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];

    const text = await res.text();
    const entries = text.match(/<entry>[\s\S]*?<\/entry>/g);
    const last = entries?.[entries.length - 1];
    if (!last) return [];

    const dateRaw = last.match(/<d:NEW_DATE[^>]*>([^<]+)/)?.[1];
    const date = dateRaw?.slice(0, 10);
    if (!date) return [];

    const curveFields = [
      { key: "BC_10YEAR", label: "10Y Treasury Par Yield", priority: 92 },
      { key: "BC_2YEAR", label: "2Y Treasury Par Yield", priority: 85 },
    ] as const;

    const out: InstitutionalNewsHeadline[] = [];
    for (const def of curveFields) {
      const rate = last.match(new RegExp(`<d:${def.key}[^>]*>([^<]+)`))?.[1]?.trim();
      if (!rate) continue;
      out.push({
        id: `TREAS-YIELD-${def.key}-${date}`,
        headline: `${def.label} · ${rate}% · ${date}`,
        detail: "U.S. Treasury daily par yield curve (CMT) — macro rates context.",
        source: "US TREASURY",
        tier: "macro",
        timestamp: parseObservationDate(date),
        coin: null,
        url: "https://home.treasury.gov/resource-center/data-chart-center/interest-rates",
        verified: true,
        priority: def.priority,
      });
    }
    return out;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function fetchTreasuryMacroHeadlines(): Promise<InstitutionalNewsHeadline[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const url = new URL(
      "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates",
    );
    url.searchParams.set("fields", "record_date,avg_interest_rate_amt,security_desc");
    url.searchParams.set("sort", "-record_date");
    url.searchParams.set("page[size]", "24");

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];

    const body = (await res.json()) as {
      data?: Array<{ record_date?: string; avg_interest_rate_amt?: string; security_desc?: string }>;
    };

    const latestByType = new Map<string, { date: string; rate: string }>();
    for (const row of body.data ?? []) {
      const desc = row.security_desc?.trim();
      const date = row.record_date?.trim();
      const rate = row.avg_interest_rate_amt?.trim();
      if (!desc || !date || !rate || latestByType.has(desc)) continue;
      latestByType.set(desc, { date, rate });
    }

    const out: InstitutionalNewsHeadline[] = [];
    for (const def of TREASURY_SERIES) {
      const row = latestByType.get(def.key);
      if (!row) continue;
      out.push({
        id: `TREAS-${def.key.replace(/\W/g, "_")}-${row.date}`,
        headline: `${def.label} · ${row.rate}% · ${row.date}`,
        detail: "U.S. Treasury average interest rates — fiscal data macro context.",
        source: "US TREASURY",
        tier: "macro",
        timestamp: parseObservationDate(row.date),
        coin: null,
        url: "https://home.treasury.gov/policy-issues/financing-the-government/interest-rate-statistics",
        verified: true,
        priority: def.priority,
      });
    }
    return out;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFredCsvBatch(): Promise<InstitutionalNewsHeadline[]> {
  const rows = await Promise.all(FRED_MACRO_SERIES.map((series) => fetchFredCsvLatest(series)));
  return rows.filter((row): row is InstitutionalNewsHeadline => row !== null);
}

async function fetchFredRows(): Promise<InstitutionalNewsHeadline[]> {
  const apiKey = fredApiKey();
  if (apiKey) {
    const rows = await Promise.all(FRED_MACRO_SERIES.map((series) => fetchFredLatest(series, apiKey)));
    const items = rows.filter((row): row is InstitutionalNewsHeadline => row !== null);
    if (items.length > 0) return items;
  }
  return fetchFredCsvBatch();
}

export async function fetchMacroDataHeadlines(limit = 12): Promise<InstitutionalNewsHeadline[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return cache.items.slice(0, limit);
  }

  const [fredItems, treasuryRows, yieldRows] = await Promise.all([
    fetchFredRows(),
    fetchTreasuryMacroHeadlines(),
    fetchTreasuryYieldCurveHeadlines(),
  ]);
  const merged = [...fredItems, ...treasuryRows, ...yieldRows].sort(
    (a, b) => b.priority - a.priority || b.timestamp - a.timestamp,
  );

  cache = {
    at: Date.now(),
    items: merged.length > 0 ? merged : cache?.items ?? [],
    fredLive: fredItems.length,
    treasuryLive: treasuryRows.length > 0 || yieldRows.length > 0,
  };

  return cache.items.slice(0, limit);
}

export function isFredMacroEnabled(): boolean {
  return true;
}

export function getMacroDataStatus(): {
  fredEnabled: boolean;
  fredLiveCount: number;
  treasuryLive: boolean;
  seriesCount: number;
} {
  return {
    fredEnabled: isFredMacroEnabled(),
    fredLiveCount: cache?.fredLive ?? 0,
    treasuryLive: cache?.treasuryLive ?? false,
    seriesCount: FRED_MACRO_SERIES.length + TREASURY_SERIES.length,
  };
}
