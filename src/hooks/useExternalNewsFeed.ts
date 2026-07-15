"use client";

import { useEffect, useRef } from "react";
import { resolveClientNewsFallback } from "@/lib/infrastructure/client/clientNewsFallback";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import {
  useExternalNewsStore,
  type ExternalNewsHeadline,
} from "@/store/useExternalNewsStore";
import type { InstitutionalNewsStatus } from "@/types/institutional-news";

const POLL_MS = 45_000;
const WIRE_LIMIT = 32;

function severityFromHeadline(headline: string, tier: ExternalNewsHeadline["tier"]): "info" | "watch" | "critical" {
  const lower = headline.toLowerCase();
  if (
    lower.includes("hack") ||
    lower.includes("exploit") ||
    lower.includes("bankrupt") ||
    lower.includes("sec ") ||
    lower.includes("lawsuit") ||
    lower.includes("halt") ||
    lower.includes("delist")
  ) {
    return "critical";
  }
  if (
    tier === "regulatory" ||
    tier === "exchange" ||
    tier === "squawk" ||
    lower.includes("etf") ||
    lower.includes("fed") ||
    lower.includes("rate") ||
    lower.includes("liquidat") ||
    lower.includes("listing")
  ) {
    return "watch";
  }
  return "info";
}

function pushToTacticalWire(items: ExternalNewsHeadline[], seen: Set<string>): void {
  const store = useMarketAtmosphereStore.getState();
  const existing = new Set(store.wire.map((w) => w.id));
  const batch: Parameters<typeof store.ingestIntelligenceWireBatch>[0] = [];
  for (const item of items.slice(0, WIRE_LIMIT)) {
    if (seen.has(item.id) || existing.has(item.id)) continue;
    seen.add(item.id);
    batch.push({
      id: item.id,
      coin: item.coin ?? "BTC",
      headline: item.headline.slice(0, 120),
      channel:
        item.tier === "exchange" || item.tier === "squawk"
          ? "market"
          : item.tier === "regulatory" || item.tier === "macro"
            ? "macro"
            : "market",
      severity: severityFromHeadline(item.headline, item.tier),
      timestamp: item.timestamp,
      articleUrl: item.url,
    });
  }
  if (batch.length > 0) {
    store.ingestIntelligenceWireBatch(batch);
  }
}

export function useExternalNewsFeed(enabled = true): void {
  const seenWireRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const refresh = async () => {
      let headlines: ExternalNewsHeadline[] = [];
      let status: InstitutionalNewsStatus | null = null;

      try {
        const res = await fetch("/api/distribution/news?limit=64");
        if (res.ok) {
          const body = (await res.json()) as {
            headlines?: ExternalNewsHeadline[];
            status?: InstitutionalNewsStatus;
          };
          headlines = body.headlines ?? [];
          status = body.status ?? null;
        }
      } catch {
        /* fall through to client fallback */
      }

      if (headlines.length < 8) {
        const fallback = await resolveClientNewsFallback(headlines);
        headlines = fallback.headlines;
        status = status ?? fallback.status;
        if ((status.macroFredLiveCount ?? 0) === 0 && fallback.headlines.some((h) => h.tier === "macro")) {
          status = {
            ...status,
            macroFredEnabled: true,
            macroFredLiveCount: fallback.headlines.filter((h) => h.tier === "macro").length,
          };
        }
      } else if ((status?.macroFredLiveCount ?? 0) === 0) {
        const { fetchClientFredMacroHeadlines } = await import(
          "@/lib/infrastructure/client/fredClientMacro"
        );
        const clientFred = await fetchClientFredMacroHeadlines();
        if (clientFred.length > 0) {
          const ids = new Set(headlines.map((h) => h.id));
          headlines = [
            ...clientFred.filter((h) => !ids.has(h.id)),
            ...headlines,
          ].sort((a, b) => b.priority - a.priority || b.timestamp - a.timestamp);
          status = status
            ? { ...status, macroFredLiveCount: clientFred.length, macroFredEnabled: true }
            : null;
        }
      }

      useExternalNewsStore.getState().setHeadlines(headlines, status);
      if (headlines.length > 0) {
        pushToTacticalWire(headlines, seenWireRef.current);
      }
    };

    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled]);
}
