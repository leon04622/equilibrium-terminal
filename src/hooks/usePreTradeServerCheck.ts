"use client";

import { useEffect, useMemo, useState } from "react";
import { PreTradeRiskLimitsEngine, type PreTradeOrderInput } from "@/lib/institutional/PreTradeRiskLimitsEngine";
import { buildPreTradeContext, fetchServerPreTradeCheck } from "@/lib/institutional/preTradeClient";
import { useInstitutionalRiskStore } from "@/store/useInstitutionalRiskStore";
import type { PreTradeRiskDecision } from "@/types/institutional-capabilities";

function mergeDecisions(
  client: PreTradeRiskDecision,
  server: PreTradeRiskDecision | null,
): PreTradeRiskDecision & { serverVerified: boolean } {
  if (!server) return { ...client, serverVerified: false };
  const severity =
    client.severity === "block" || server.severity === "block"
      ? "block"
      : client.severity === "warn" || server.severity === "warn"
        ? "warn"
        : "ok";
  return {
    allowed: client.allowed && server.allowed,
    severity,
    reasons: Array.from(new Set([...client.reasons, ...server.reasons])),
    metrics: server.metrics,
    serverVerified: true,
  };
}

export function usePreTradeServerCheck(order: PreTradeOrderInput | null): PreTradeRiskDecision & {
  serverVerified: boolean;
} | null {
  const limits = useInstitutionalRiskStore((s) => s.limits);
  const [serverDecision, setServerDecision] = useState<PreTradeRiskDecision | null>(null);
  const [serverVerified, setServerVerified] = useState(false);

  const clientDecision = useMemo(() => {
    if (!order || !limits.enabled) return null;
    return PreTradeRiskLimitsEngine.evaluate(order, limits);
  }, [order, limits]);

  useEffect(() => {
    if (!order || !limits.enabled) {
      setServerDecision(null);
      setServerVerified(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        const context = buildPreTradeContext(order.coin);
        const server = await fetchServerPreTradeCheck(order, limits, context);
        if (cancelled) return;
        setServerDecision(server);
        setServerVerified(server != null);
      })();
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [order?.coin, order?.side, order?.size, order?.markPx, order?.leverage, order?.isPerp, limits]);

  if (!clientDecision) return null;
  return mergeDecisions(clientDecision, serverDecision);
}
