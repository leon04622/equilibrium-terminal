import type { NewsSourceTier } from "@/types/institutional-news";

export interface RssSourceDefinition {
  id: string;
  source: string;
  url: string;
  tier: NewsSourceTier;
  priority: number;
  verified: boolean;
}

/** Curated institutional wire — regulatory, macro, exchange, crypto desk sources. */
export const INSTITUTIONAL_RSS_SOURCES: RssSourceDefinition[] = [
  // Regulatory
  {
    id: "sec-press",
    source: "SEC",
    url: "https://www.sec.gov/news/pressreleases.rss",
    tier: "regulatory",
    priority: 92,
    verified: true,
  },
  {
    id: "fed-press",
    source: "FED",
    url: "https://www.federalreserve.gov/feeds/press_all.xml",
    tier: "regulatory",
    priority: 90,
    verified: true,
  },
  // Macro
  {
    id: "cnbc-markets",
    source: "CNBC",
    url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
    tier: "macro",
    priority: 86,
    verified: true,
  },
  {
    id: "marketwatch",
    source: "MARKETWATCH",
    url: "https://feeds.marketwatch.com/marketwatch/topstories/",
    tier: "macro",
    priority: 84,
    verified: true,
  },
  // Crypto institutional
  {
    id: "the-block",
    source: "THE BLOCK",
    url: "https://www.theblock.co/rss.xml",
    tier: "crypto",
    priority: 82,
    verified: true,
  },
  {
    id: "blockworks",
    source: "BLOCKWORKS",
    url: "https://blockworks.co/feed",
    tier: "crypto",
    priority: 80,
    verified: true,
  },
  {
    id: "coindesk",
    source: "COINDESK",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml",
    tier: "crypto",
    priority: 78,
    verified: true,
  },
  {
    id: "dlnews",
    source: "DL NEWS",
    url: "https://www.dlnews.com/arc/outboundfeeds/rss/",
    tier: "crypto",
    priority: 77,
    verified: true,
  },
  {
    id: "bitcoin-magazine",
    source: "BTC MAG",
    url: "https://bitcoinmagazine.com/feed",
    tier: "crypto",
    priority: 75,
    verified: true,
  },
  {
    id: "cointelegraph",
    source: "COINTELEGRAPH",
    url: "https://cointelegraph.com/rss",
    tier: "crypto",
    priority: 74,
    verified: true,
  },
  {
    id: "decrypt",
    source: "DECRYPT",
    url: "https://decrypt.co/feed",
    tier: "crypto",
    priority: 72,
    verified: true,
  },
  // Exchange / protocol
  {
    id: "binance-announce",
    source: "BINANCE",
    url: "https://www.binance.com/en/support/announcement/rss",
    tier: "exchange",
    priority: 94,
    verified: true,
  },
];

export const TIER_PRIORITY: Record<NewsSourceTier, number> = {
  squawk: 98,
  exchange: 94,
  hl: 93,
  regulatory: 90,
  macro: 86,
  crypto: 72,
};
