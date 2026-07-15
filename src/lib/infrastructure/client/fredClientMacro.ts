import type { InstitutionalNewsHeadline } from "@/types/institutional-news";

const SERIES = [
  { id: "FEDFUNDS", label: "Fed Funds Rate", priority: 91 },
  { id: "DGS10", label: "10-Year Treasury", priority: 87 },
  { id: "UNRATE", label: "Unemployment Rate", priority: 88 },
  { id: "CPIAUCSL", label: "CPI (All Urban)", priority: 89 },
] as const;

function observationStart(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 18);
  return d.toISOString().slice(0, 10);
}

function parseLastCsvLine(text: string): { date: string; value: string } | null {
  const lines = text.trim().split(/\r?\n/).filter((l) => l && !l.startsWith("#"));
  for (let i = lines.length - 1; i >= 1; i--) {
    const parts = lines[i].split(",");
    const date = parts[0]?.trim();
    const value = parts[1]?.trim();
    if (date && value && value !== ".") return { date, value };
  }
  return null;
}

function formatValue(seriesId: string, raw: string): string {
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  if (seriesId === "CPIAUCSL") return n.toFixed(1);
  return n.toFixed(2);
}

/** Browser-side FRED CSV — supplements server macro when Vercel cannot reach FRED. */
export async function fetchClientFredMacroHeadlines(): Promise<InstitutionalNewsHeadline[]> {
  if (typeof window === "undefined") return [];

  const cosd = observationStart();
  const out: InstitutionalNewsHeadline[] = [];

  for (const series of SERIES) {
    try {
      const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(series.id)}&cosd=${cosd}`;
      const res = await fetch(url, {
        headers: { Range: "bytes=-768", Accept: "text/csv" },
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok && res.status !== 206) continue;
      const row = parseLastCsvLine(await res.text());
      if (!row) continue;
      const value = formatValue(series.id, row.value);
      const unit = series.id === "CPIAUCSL" ? "" : "%";
      out.push({
        id: `FRED-${series.id}-${row.date}`,
        headline: `${series.label} · ${value}${unit} · ${row.date}`,
        detail: `FRED ${series.id} (client CSV) — macro desk context.`,
        source: "FRED",
        tier: "macro",
        timestamp: Date.parse(`${row.date}T12:00:00Z`) || Date.now(),
        coin: null,
        url: `https://fred.stlouisfed.org/series/${series.id}`,
        verified: true,
        priority: series.priority - 1,
      });
    } catch {
      continue;
    }
  }

  return out;
}
