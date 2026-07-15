"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Loader2, Maximize2, Minimize2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { stopPanelWheelBubble } from "@/lib/runtime/panelScroll";
import { focusWireSymbol } from "@/lib/workflow/wireSymbolFocus";
import { useArticleReaderStore } from "@/store/useArticleReaderStore";

interface LoadedArticle {
  title: string;
  excerpt: string;
  paragraphs: string[];
  sourceHost: string;
  partial: boolean;
}

const ENRICH_FETCH_MS = 4_000;

const OPEN_ORIGINAL_CLASS = cn(
  TERMINAL_TYPO.micro,
  "inline-flex shrink-0 items-center gap-1 border border-[#ff9900]/50 bg-[#ff9900]/10 px-2 py-1 text-[#ff9900] hover:bg-[#ff9900]/20",
);

function wireArticleFromContext(
  headline: string,
  detail: string | undefined,
  source: string | undefined,
  url: string,
): LoadedArticle {
  const body = (detail ?? "").trim() || headline.trim();
  let host = source ?? "WIRE";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    /* keep source label */
  }
  return {
    title: headline.trim() || host,
    excerpt: body.slice(0, 480),
    paragraphs: body ? [body] : ["Open the original source for the full release."],
    sourceHost: host,
    partial: true,
  };
}

export function ArticleReaderOverlay() {
  const open = useArticleReaderStore((s) => s.open);
  const url = useArticleReaderStore((s) => s.url);
  const headline = useArticleReaderStore((s) => s.headline);
  const detail = useArticleReaderStore((s) => s.detail);
  const source = useArticleReaderStore((s) => s.source);
  const timestamp = useArticleReaderStore((s) => s.timestamp);
  const coin = useArticleReaderStore((s) => s.coin);
  const close = useArticleReaderStore((s) => s.close);

  const [expanded, setExpanded] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [usedFallback, setUsedFallback] = useState(true);
  const [article, setArticle] = useState<LoadedArticle | null>(null);
  const [backdropReady, setBackdropReady] = useState(false);
  const fetchGenRef = useRef(0);

  const openExternal = useCallback(() => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [url]);

  const viewChart = useCallback(() => {
    if (!coin) return;
    focusWireSymbol(coin, "article-reader");
  }, [coin]);

  useEffect(() => {
    if (!open || !url) {
      setArticle(null);
      setUsedFallback(true);
      setEnriching(false);
      setExpanded(false);
      return;
    }

    const instant = wireArticleFromContext(headline, detail, source, url);
    setArticle(instant);
    setUsedFallback(true);
    setEnriching(true);

    const gen = ++fetchGenRef.current;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), ENRICH_FETCH_MS);

    const params = new URLSearchParams({ url });
    if (headline) params.set("headline", headline);
    if (detail) params.set("detail", detail);

    void (async () => {
      try {
        const res = await fetch(`/api/distribution/article?${params.toString()}`, {
          signal: controller.signal,
        });
        const body = (await res.json().catch(() => ({}))) as {
          article?: LoadedArticle;
          fallback?: boolean;
        };
        if (gen !== fetchGenRef.current || controller.signal.aborted) return;
        if (body.article?.paragraphs?.length && !body.fallback && !body.article.partial) {
          setArticle(body.article);
          setUsedFallback(false);
          return;
        }
        if (body.article?.paragraphs?.length && body.article.paragraphs.join(" ").length > instant.paragraphs.join(" ").length) {
          setArticle(body.article);
        }
        setUsedFallback(Boolean(body.fallback ?? body.article?.partial ?? true));
      } catch {
        if (gen === fetchGenRef.current) setUsedFallback(true);
      } finally {
        window.clearTimeout(timeout);
        if (gen === fetchGenRef.current) setEnriching(false);
      }
    })();

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [open, url, headline, detail, source]);

  useEffect(() => {
    if (!open) {
      setBackdropReady(false);
      return;
    }
    const id = window.requestAnimationFrame(() => setBackdropReady(true));
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, open]);

  if (!open || !url) return null;

  const displayTitle = article?.title || headline;
  const displaySource = article?.sourceHost || source || "WIRE";
  const paragraphs =
    article?.paragraphs?.length
      ? article.paragraphs
      : ["Open the original source for the full release."];

  const overlay = (
    <div
      className="fixed inset-0 z-[280] flex items-stretch justify-end bg-slate-950/75 p-2 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Article reader"
      onClick={backdropReady ? close : undefined}
    >
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl",
          expanded ? "w-full max-w-none" : "w-full max-w-2xl",
          terminalSkin.canvas,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={cn(terminalSkin.borderB, "flex shrink-0 flex-wrap items-start gap-2 px-2 py-1.5")}>
          <div className="min-w-0 flex-1">
            <p className={cn(TERMINAL_TYPO.micro, "text-[#ff9900]")}>ARTICLE READER</p>
            <h2 className={cn(TERMINAL_TYPO.dataSm, "text-slate-100")}>{displayTitle}</h2>
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
              {displaySource}
              {timestamp ? ` · ${formatTapeTime(timestamp).slice(0, 8)}` : ""}
              {coin ? ` · ${coin}` : ""}
              {enriching ? (
                <span className="ml-1 inline-flex items-center gap-0.5 text-slate-600">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  enriching
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label={expanded ? "Restore reader width" : "Expand reader"}
              onClick={() => setExpanded((v) => !v)}
              className={cn(
                TERMINAL_TYPO.micro,
                "border border-slate-700 px-2 py-1 text-slate-400 hover:bg-slate-900",
              )}
            >
              {expanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </button>
            <button type="button" onClick={openExternal} className={OPEN_ORIGINAL_CLASS}>
              <ExternalLink className="h-3 w-3" />
              OPEN ORIGINAL
            </button>
            {coin ? (
              <button
                type="button"
                onClick={viewChart}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "border border-cyan-700/50 px-2 py-1 text-cyan-300 hover:bg-cyan-950/40",
                )}
              >
                VIEW CHART
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Close reader"
              onClick={close}
              className={cn(
                TERMINAL_TYPO.micro,
                "border border-slate-700 px-2 py-1 text-slate-400 hover:bg-slate-900",
              )}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </header>

        <div
          className="eq-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-2"
          onWheel={stopPanelWheelBubble}
        >
          {usedFallback ? (
            <p className={cn(TERMINAL_TYPO.micro, "mb-2 text-amber-400/90")}>
              Wire summary shown — use OPEN ORIGINAL for the full publisher release.
            </p>
          ) : null}

          {paragraphs.map((para, i) => (
            <p
              key={`${i}-${para.slice(0, 24)}`}
              className={cn(TERMINAL_TYPO.dataSm, "mb-2 leading-relaxed text-slate-300 last:mb-0")}
            >
              {para}
            </p>
          ))}
        </div>

        <footer className={cn(terminalSkin.borderT, "flex shrink-0 items-center gap-2 px-2 py-1.5")}>
          <button
            type="button"
            onClick={close}
            className={cn(TERMINAL_TYPO.micro, "border border-slate-700 px-2 py-1 text-slate-400")}
          >
            BACK TO WIRE
          </button>
          <button type="button" onClick={openExternal} className={cn(OPEN_ORIGINAL_CLASS, "ml-auto")}>
            <ExternalLink className="h-3 w-3" />
            OPEN ORIGINAL
          </button>
        </footer>
      </div>
    </div>
  );

  if (typeof document === "undefined") return overlay;
  return createPortal(overlay, document.body);
}
