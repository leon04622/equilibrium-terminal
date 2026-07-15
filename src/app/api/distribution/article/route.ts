import { NextResponse } from "next/server";
import {
  buildFallbackArticle,
  fetchArticleContent,
  validateArticleUrl,
} from "@/lib/infrastructure/server/articleExtractor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url")?.trim();
  const headline = searchParams.get("headline")?.trim() ?? "";
  const detail = searchParams.get("detail")?.trim() ?? "";

  if (!url) {
    return NextResponse.json({ error: "missing_url" }, { status: 400 });
  }

  const validated = validateArticleUrl(url);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.reason }, { status: 400 });
  }

  const fallbackArticle = () =>
    buildFallbackArticle(validated.url, headline, detail || headline);

  try {
    const article = await Promise.race([
      fetchArticleContent(validated.url.toString()),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("article_timeout")), 3_500);
      }),
    ]);
    if (article.partial && (headline || detail)) {
      const wireBody = (detail || headline).trim();
      const fetchedBody = article.paragraphs.join(" ").trim();
      if (wireBody.length > fetchedBody.length + 40) {
        return NextResponse.json({ article: fallbackArticle(), fallback: true });
      }
    }
    return NextResponse.json({ article, fallback: article.partial });
  } catch {
    if (headline || detail) {
      return NextResponse.json({ article: fallbackArticle(), fallback: true });
    }
    return NextResponse.json({ error: "article_fetch_failed" }, { status: 502 });
  }
}
