export const COIN_TICKERS = [
  "BTC",
  "ETH",
  "SOL",
  "HYPE",
  "ARB",
  "AVAX",
  "DOGE",
  "XRP",
  "LINK",
  "UNI",
  "BNB",
  "MATIC",
  "POL",
  "OP",
  "SUI",
  "APT",
  "GALA",
  "WIF",
  "PEPE",
  "BONK",
] as const;

export function stripTags(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = block.match(re);
  return match ? stripTags(match[1]) : "";
}

export function guessCoin(text: string): string | null {
  const upper = text.toUpperCase();
  for (const ticker of COIN_TICKERS) {
    if (new RegExp(`\\b${ticker}\\b`).test(upper)) return ticker;
  }
  if (/\bBITCOIN\b/.test(upper)) return "BTC";
  if (/\bETHEREUM\b/.test(upper)) return "ETH";
  if (/\bSOLANA\b/.test(upper)) return "SOL";
  if (/\bHYPERLIQUID\b/.test(upper)) return "HYPE";
  return null;
}

export function normalizeHeadlineKey(headline: string): string {
  return headline
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 96);
}

export function parseRssItems(
  xml: string,
  source: string,
): Array<{
  headline: string;
  detail: string;
  timestamp: number;
  url: string | null;
  coin: string | null;
}> {
  const items: Array<{
    headline: string;
    detail: string;
    timestamp: number;
    url: string | null;
    coin: string | null;
  }> = [];
  const itemRe = /<item[\s\S]*?<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(xml)) !== null) {
    const block = match[0];
    const headline = extractTag(block, "title");
    if (!headline) continue;
    const detail = extractTag(block, "description").slice(0, 320);
    const pubRaw = extractTag(block, "pubDate") || extractTag(block, "updated");
    const link = extractTag(block, "link") || null;
    const timestamp = pubRaw ? Date.parse(pubRaw) : Date.now();
    const coin = guessCoin(`${headline} ${detail}`);
    items.push({
      headline,
      detail: detail || `${source} wire`,
      timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
      url: link,
      coin,
    });
  }
  return items;
}
