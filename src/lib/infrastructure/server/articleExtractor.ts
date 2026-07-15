import { stripTags } from "@/lib/infrastructure/server/rssParser";

export interface ExtractedArticle {
  title: string;
  excerpt: string;
  paragraphs: string[];
  url: string;
  sourceHost: string;
  fetchedAt: number;
  partial: boolean;
}

const FETCH_TIMEOUT_MS = 4_000;
const MAX_HTML_BYTES = 1_500_000;
const CACHE_MS = 180_000;

const cache = new Map<string, { at: number; article: ExtractedArticle }>();

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
]);

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(h)) return true;
  if (h.endsWith(".local")) return true;
  if (/^10\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  return false;
}

export function validateArticleUrl(raw: string): { ok: true; url: URL } | { ok: false; reason: string } {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "unsupported_protocol" };
  }
  if (isPrivateHost(parsed.hostname)) {
    return { ok: false, reason: "blocked_host" };
  }
  return { ok: true, url: parsed };
}

function metaContent(html: string, key: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["']`, "i"),
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) return stripTags(match[1]);
  }
  return "";
}

function extractBlock(html: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = html.match(re);
  return match?.[1] ?? "";
}

function paragraphsFromHtml(block: string): string[] {
  const cleaned = block
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ");

  const paras: string[] = [];
  const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = pRe.exec(cleaned)) !== null) {
    const text = stripTags(match[1]);
    if (text.length >= 48) paras.push(text);
  }

  if (paras.length > 0) return paras.slice(0, 40);

  const text = stripTags(cleaned);
  if (text.length < 80) return [];
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 40)
    .slice(0, 24);
}

function parseArticleHtml(html: string, url: URL): ExtractedArticle {
  const title =
    metaContent(html, "og:title") ||
    metaContent(html, "twitter:title") ||
    stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "") ||
    url.hostname;

  const excerpt =
    metaContent(html, "og:description") ||
    metaContent(html, "description") ||
    metaContent(html, "twitter:description");

  const bodyBlock =
    extractBlock(html, "article") ||
    extractBlock(html, "main") ||
    html.match(/<div[^>]+role=["']main["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] ||
    "";

  let paragraphs = paragraphsFromHtml(bodyBlock);
  if (paragraphs.length === 0) paragraphs = paragraphsFromHtml(html);

  const partial = paragraphs.length === 0 && !excerpt;

  if (paragraphs.length === 0 && excerpt) {
    paragraphs = [excerpt];
  }

  return {
    title: title.slice(0, 240),
    excerpt: excerpt.slice(0, 480),
    paragraphs,
    url: url.toString(),
    sourceHost: url.hostname.replace(/^www\./, ""),
    fetchedAt: Date.now(),
    partial,
  };
}

function paragraphsFromWireText(body: string): string[] {
  const trimmed = body.trim();
  if (!trimmed) return ["Open the original source for the full release."];

  const bySentence = trimmed
    .split(/(?<=[.!?])\s+|\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 24);

  if (bySentence.length >= 2) return bySentence.slice(0, 16);
  if (trimmed.length >= 120) {
    const chunks = trimmed.match(/.{1,220}(\s|$)/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
    if (chunks.length >= 2) return chunks.slice(0, 12);
  }
  return [trimmed];
}

export function buildFallbackArticle(
  url: URL,
  headline: string,
  detail: string,
): ExtractedArticle {
  const body = detail.trim() || headline.trim();
  const paragraphs = paragraphsFromWireText(body);
  return {
    title: headline.trim() || url.hostname,
    excerpt: body.slice(0, 480),
    paragraphs,
    url: url.toString(),
    sourceHost: url.hostname.replace(/^www\./, ""),
    fetchedAt: Date.now(),
    partial: true,
  };
}

export async function fetchArticleContent(rawUrl: string): Promise<ExtractedArticle> {
  const validated = validateArticleUrl(rawUrl);
  if (!validated.ok) {
    throw new Error(validated.reason);
  }

  const key = validated.url.toString();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.article;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(key, {
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "EquilibriumTerminal/1.0 (+institutional newswire reader)",
      },
      next: { revalidate: 120 },
    });

    if (!res.ok) {
      throw new Error(`fetch_failed_${res.status}`);
    }

    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_HTML_BYTES) {
      throw new Error("response_too_large");
    }

    const html = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    const article = parseArticleHtml(html, validated.url);
    cache.set(key, { at: Date.now(), article });
    return article;
  } finally {
    clearTimeout(timer);
  }
}
