"use client";

import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import type { InstitutionalNewsStatus } from "@/types/institutional-news";

function StatusPill({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean;
  detail: string;
}) {
  return (
    <div className={cn(terminalSkin.border, "border-slate-800 bg-black/25 px-1.5 py-1")}>
      <p className={cn(TERMINAL_TYPO.micro, ok ? terminalSkin.textUp : "text-slate-600")}>{label}</p>
      <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{detail}</p>
    </div>
  );
}

export function WireSourceHealthPanel({ status }: { status: InstitutionalNewsStatus | null }) {
  if (!status) {
    return (
      <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
        Wire status pending — polling /api/distribution/news…
      </p>
    );
  }

  const rssOk = status.rssLiveCount > 0;
  const squawkOk = status.squawkConnected && status.squawkBuffered > 0;
  const panicKey = status.cryptoPanicEnabled;
  const panicOk = status.cryptoPanicLive;
  const macroOk = status.macroFredLiveCount > 0 || status.macroTreasuryLive;
  const hlOk = (status.hlWireLiveCount ?? 0) > 0;

  return (
    <div className="space-y-2" data-wire-source-health>
      <p className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>WIRE SOURCE HEALTH</p>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
        <StatusPill
          label="RSS DESK"
          ok={rssOk}
          detail={`${status.rssLiveCount}/${status.rssSourceCount} feeds live`}
        />
        <StatusPill
          label="HL DERIVS"
          ok={hlOk}
          detail={hlOk ? `${status.hlWireLiveCount} snapshots` : "Polling HL meta"}
        />
        <StatusPill
          label="MACRO"
          ok={macroOk}
          detail={
            macroOk
              ? `FRED ${status.macroFredLiveCount}${status.macroTreasuryLive ? " · TREAS" : ""}`
              : "FRED CSV + Treasury"
          }
        />
        <StatusPill
          label="TREE SQUAWK"
          ok={squawkOk}
          detail={
            status.squawkAuthenticated
              ? `Live · ${status.squawkBuffered} buffered`
              : status.squawkConnected
                ? "Connected · add TREE key"
                : "Standby · EQUILIBRIUM_TREE_NEWS_API_KEY"
          }
        />
        <StatusPill
          label="CRYPTOPANIC"
          ok={panicOk}
          detail={
            panicKey
              ? panicOk
                ? `${status.cryptoPanicCount} headlines`
                : "Key set · awaiting feed"
              : "Optional · EQUILIBRIUM_CRYPTOPANIC_AUTH_TOKEN"
          }
        />
        <StatusPill
          label="FEED ID"
          ok={rssOk || squawkOk || macroOk || hlOk}
          detail={status.feedId}
        />
      </div>
      <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
        Free tier runs RSS + HL derivatives + public FRED/Treasury. Add Vercel env keys for squawk-grade
        Tree of Alpha and CryptoPanic aggregation when ready.
      </p>
    </div>
  );
}
