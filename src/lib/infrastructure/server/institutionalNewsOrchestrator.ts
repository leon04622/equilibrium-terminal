import {
  INSTITUTIONAL_RSS_SOURCES,
  TIER_PRIORITY,
} from "@/lib/infrastructure/server/institutionalNewsSources";
import {
  fetchCryptoPanicHeadlines,
  getCryptoPanicStatus,
  isCryptoPanicEnabled,
} from "@/lib/infrastructure/server/cryptoPanicFeed";
import {
  fetchMacroDataHeadlines,
  getMacroDataStatus,
} from "@/lib/infrastructure/server/macroDataFeed";
import {
  getTreeOfAlphaHeadlines,
  getTreeOfAlphaStatus,
} from "@/lib/infrastructure/server/treeOfAlphaBridge";
import { normalizeHeadlineKey, parseRssItems } from "@/lib/infrastructure/server/rssParser";
import {
  fetchHlDerivativesWireHeadlines,
  getHlDerivativesWireStatus,
} from "@/lib/infrastructure/server/hlDerivativesWire";
import type {
  InstitutionalNewsHeadline,
  InstitutionalNewsStatus,
} from "@/types/institutional-news";

export type { InstitutionalNewsHeadline, InstitutionalNewsStatus };

const FETCH_TIMEOUT_MS = 8_000;
const CACHE_MS = 45_000;

let cache: { at: number; items: InstitutionalNewsHeadline[]; liveRss: number } | null = null;

async function fetchRssSource(
  def: (typeof INSTITUTIONAL_RSS_SOURCES)[number],
): Promise<InstitutionalNewsHeadline[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(def.url, {
      signal: controller.signal,
      headers: { Accept: "application/rss+xml, application/xml, text/xml, application/atom+xml" },
      next: { revalidate: 45 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRssItems(xml, def.source).map((row) => ({
      id: `${def.source}-${row.timestamp}-${normalizeHeadlineKey(row.headline).slice(0, 20).replace(/\s/g, "_")}`,
      headline: row.headline.slice(0, 160),
      detail: row.detail,
      source: def.source,
      tier: def.tier,
      timestamp: row.timestamp,
      coin: row.coin,
      url: row.url,
      verified: def.verified,
      priority: def.priority,
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function dedupeHeadlines(items: InstitutionalNewsHeadline[]): InstitutionalNewsHeadline[] {
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

export async function getInstitutionalNewsHeadlines(
  limit = 64,
): Promise<InstitutionalNewsHeadline[]> {
  const cap = Math.min(96, Math.max(1, limit));
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return cache.items.slice(0, cap);
  }

  getTreeOfAlphaStatus();

  const [rssBatches, panic, squawk, macro, hlWire] = await Promise.all([
    Promise.all(INSTITUTIONAL_RSS_SOURCES.map((def) => fetchRssSource(def))),
    fetchCryptoPanicHeadlines(40),
    Promise.resolve(getTreeOfAlphaHeadlines(48)),
    fetchMacroDataHeadlines(10),
    fetchHlDerivativesWireHeadlines(8),
  ]);

  const liveRss = rssBatches.filter((batch) => batch.length > 0).length;
  const mergedRest = dedupeHeadlines([...squawk, ...hlWire, ...panic, ...rssBatches.flat()]);
  const macroDesk = dedupeHeadlines(macro);
  const pinnedIds = new Set(macroDesk.map((row) => row.id));
  const merged = [...macroDesk, ...mergedRest.filter((row) => !pinnedIds.has(row.id))];

  cache = {
    at: Date.now(),
    items: merged.length > 0 ? merged : cache?.items ?? [],
    liveRss,
  };

  return cache.items.slice(0, cap);
}

export function getInstitutionalNewsStatus(): InstitutionalNewsStatus {
  const tree = getTreeOfAlphaStatus();
  const panic = getCryptoPanicStatus();
  const macro = getMacroDataStatus();
  const hl = getHlDerivativesWireStatus();
  return {
    feedId: "eq-institutional-wire-v2",
    rssSourceCount: INSTITUTIONAL_RSS_SOURCES.length,
    rssLiveCount: cache?.liveRss ?? 0,
    squawkConnected: tree.connected,
    squawkBuffered: tree.buffered,
    squawkAuthenticated: tree.authenticated,
    cryptoPanicEnabled: isCryptoPanicEnabled(),
    cryptoPanicLive: panic.live,
    cryptoPanicCount: panic.count,
    macroFredEnabled: macro.fredEnabled,
    macroFredLiveCount: macro.fredLiveCount,
    macroTreasuryLive: macro.treasuryLive,
    hlWireLiveCount: hl.count,
    lastFetchAt: cache?.at ?? 0,
    tiers: ["squawk", "exchange", "regulatory", "macro", "crypto", "hl"],
  };
}

/** Back-compat alias used by existing routes/hooks. */
export async function getCryptoNewsHeadlines(limit = 48): Promise<InstitutionalNewsHeadline[]> {
  return getInstitutionalNewsHeadlines(limit);
}

export type CryptoNewsHeadline = InstitutionalNewsHeadline;
