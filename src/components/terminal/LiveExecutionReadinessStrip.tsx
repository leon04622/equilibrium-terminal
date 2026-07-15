"use client";

import { useHyperliquidAuthContext } from "@/contexts/HyperliquidAuthContext";
import { useDeskExecutionStore } from "@/store/useDeskExecutionStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useTerminalStore } from "@/store/terminalStore";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { cn } from "@/lib/utils";

type ReadinessItem = { id: string; label: string; ok: boolean; hint?: string };

/** Live execution preflight — surfaces blockers before submit (no trade advice). */
export function LiveExecutionReadinessStrip() {
  const deskMode = useDeskExecutionStore((s) => s.mode);
  const connectionStatus = useTerminalStore((s) => s.connectionStatus);
  const lastMessageAt = useTerminalStore((s) => s.lastMessageAt);
  const claims = useProductionConfigStore((s) => s.claims);
  const {
    isConnected,
    isAuthorized,
    oneClickEnabled,
    builderFeeApproved,
  } = useHyperliquidAuthContext();

  if (deskMode !== "live") return null;

  const streamOk =
    connectionStatus === "connected" &&
    lastMessageAt !== null &&
    Date.now() - lastMessageAt < 45_000;

  const items: ReadinessItem[] = [
    { id: "wallet", label: "Wallet", ok: isConnected },
    { id: "stream", label: "HL stream", ok: streamOk },
    { id: "session", label: "Desk session", ok: Boolean(claims) },
    { id: "1ct", label: "1-Click", ok: isAuthorized && oneClickEnabled },
    { id: "builder", label: "Builder fee", ok: builderFeeApproved },
  ];

  const ready = items.every((i) => i.ok);
  const blocked = items.filter((i) => !i.ok);

  return (
    <div
      data-trade-region="live-readiness"
      className={cn(
        terminalSkin.border,
        "px-1 py-0.5",
        ready ? "border-emerald-900/40 bg-emerald-950/20" : "border-amber-900/50 bg-amber-950/25",
      )}
    >
      <div className="flex flex-wrap items-center gap-1">
        <span className={cn(TERMINAL_TYPO.micro, ready ? "text-emerald-400" : "text-amber-400")}>
          LIVE PREFLIGHT {ready ? "· READY" : `· ${blocked.length} BLOCKED`}
        </span>
        {items.map((item) => (
          <span
            key={item.id}
            className={cn(
              TERMINAL_TYPO.micro,
              "border px-0.5",
              item.ok
                ? "border-emerald-800/50 text-emerald-400/90"
                : "border-amber-800/50 text-amber-400/90",
            )}
            title={item.hint}
          >
            {item.label}
            {item.ok ? " ✓" : " —"}
          </span>
        ))}
      </div>
      {!ready ? (
        <p className={cn(TERMINAL_TYPO.micro, "mt-0.5 text-amber-400/80")}>
          {blocked.map((b) => b.label.toLowerCase()).join(" · ")} — resolve before live submit.
        </p>
      ) : null}
    </div>
  );
}
