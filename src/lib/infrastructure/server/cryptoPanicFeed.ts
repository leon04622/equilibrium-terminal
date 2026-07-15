import type { InstitutionalNewsHeadline } from "@/types/institutional-news";
import { guessCoin, normalizeHeadlineKey } from "@/lib/infrastructure/server/rssParser";

const FETCH_TIMEOUT_MS = 10_000;
/** CryptoPanic recommends ≥30s between requests. */
const CACHE_MS = 35_000;

const PANIC_FILTERS = ["important", "hot", "rising"] as const;
type PanicFilter = (typeof PANIC_FILTERS)[number];

let cache: { at: number; items: InstitutionalNewsHeadline[] } | null = null;
let lastFetchCount = 0;
let lastFetchOk = false;

function authToken(): string | null {
  return process.env.EQUILIBRIUM_CRYPTOPANIC_AUTH_TOKEN?.trim() || null;
}

interface CryptoPanicPost {
  id?: number;
  title?: string;
  description?: string;
  published_at?: string;
  url?: string;
  source?: { title?: string; domain?: string };
  currencies?: Array<{ code?: string }>;
  votes?: { important?: number; negative?: number; positive?: number };
}

function mapPost(post: CryptoPanicPost, filter: PanicFilter): InstitutionalNewsHeadline | null {
  const headline = (post.title ?? "").trim();
  if (!headline) return null;
  const detail = (post.description ?? headline).slice(0, 320);
  const coin = post.currencies?.[0]?.code ?? guessCoin(`${headline} ${detail}`);
  const sourceName = (post.source?.title ?? post.source?.domain ?? "AGGREGATOR").toUpperCase();
  const timestamp = post.published_at ? Date.parse(post.published_at) : Date.now();
  const voteImportant = (post.votes?.important ?? 0) > 0;
  const sentiment = (post.votes?.positive ?? 0) - (post.votes?.negative ?? 0);

  const priority =
    filter === "important"
      ? 92 + (voteImportant ? 4 : 0)
      : filter === "hot"
        ? 86 + Math.min(6, sentiment)
        : 83;

  return {
    id: `CP-${filter}-${post.id ?? normalizeHeadlineKey(headline)}`,
    headline,
    detail,
    source: `PANIC · ${sourceName}`,
    tier: filter === "important" || voteImportant ? "exchange" : "crypto",
    timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
    coin,
    url: post.url ?? null,
    verified: true,
    priority,
  };
}

async function fetchFilterPosts(
  token: string,
  filter: PanicFilter,
): Promise<InstitutionalNewsHeadline[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const endpoints = [
    "https://cryptopanic.com/api/developer/v2/posts/",
    "https://cryptopanic.com/api/v1/posts/",
  ];

  try {
    for (const base of endpoints) {
      const url = new URL(base);
      url.searchParams.set("auth_token", token);
      url.searchParams.set("public", "true");
      url.searchParams.set("filter", filter);
      url.searchParams.set("kind", "news");
      url.searchParams.set("regions", "en");

      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        next: { revalidate: 35 },
      });
      if (!res.ok) continue;

      const body = (await res.json()) as { results?: CryptoPanicPost[] };
      const items = (body.results ?? [])
        .map((post) => mapPost(post, filter))
        .filter((row): row is InstitutionalNewsHeadline => row !== null);
      if (items.length > 0) return items;
    }
    return [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function dedupePanic(items: InstitutionalNewsHeadline[]): InstitutionalNewsHeadline[] {
  const seen = new Set<string>();
  const out: InstitutionalNewsHeadline[] = [];
  for (const item of items.sort((a, b) => b.priority - a.priority || b.timestamp - a.timestamp)) {
    const key = normalizeHeadlineKey(item.headline);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/** 70+ source aggregator — important / hot / rising filters (requires auth token). */
export async function fetchCryptoPanicHeadlines(limit = 36): Promise<InstitutionalNewsHeadline[]> {
  const token = authToken();
  if (!token) {
    lastFetchOk = false;
    lastFetchCount = 0;
    return [];
  }

  if (cache && Date.now() - cache.at < CACHE_MS) {
    lastFetchOk = cache.items.length > 0;
    lastFetchCount = cache.items.length;
    return cache.items.slice(0, limit);
  }

  const batches = await Promise.all(PANIC_FILTERS.map((filter) => fetchFilterPosts(token, filter)));
  const merged = dedupePanic(batches.flat());

  lastFetchOk = merged.length > 0;
  lastFetchCount = merged.length;
  cache = { at: Date.now(), items: merged.length > 0 ? merged : cache?.items ?? [] };

  return cache.items.slice(0, limit);
}

export function isCryptoPanicEnabled(): boolean {
  return Boolean(authToken());
}

export function getCryptoPanicStatus(): { live: boolean; count: number; filters: string[] } {
  return {
    live: lastFetchOk,
    count: lastFetchCount,
    filters: [...PANIC_FILTERS],
  };
}
