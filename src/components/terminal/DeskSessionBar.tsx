"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { isBloombergChrome } from "@/lib/theme/bloomberg";
import { terminalBus } from "@/store/eventBus";
import { useHyperliquidAuthContext } from "@/contexts/HyperliquidAuthContext";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useDeskExecutionStore, type DeskExecutionMode } from "@/store/useDeskExecutionStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";

interface DeskSessionBarProps {
  onSignIn?: () => void;
}

export function DeskSessionBar({ onSignIn }: DeskSessionBarProps = {}) {
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);
  const bloomberg = isBloombergChrome(beginnerMode);
  const { isConnected, oneClickEnabled } = useHyperliquidAuthContext();
  const claims = useProductionConfigStore((s) => s.claims);
  const siwePending = useProductionConfigStore((s) => s.siwePending);
  const siweLastError = useProductionConfigStore((s) => s.siweLastError);
  const mode = useDeskExecutionStore((s) => s.mode);
  const setMode = useDeskExecutionStore((s) => s.setMode);
  const paperFills = useDeskExecutionStore((s) => s.paperFills.length);

  const trySetMode = (next: DeskExecutionMode) => {
    if (next === "live") {
      if (!isConnected) return;
      if (!claims) {
        (onSignIn ?? (() => terminalBus.emit("platform:sign-in", {})))();
        return;
      }
      if (!oneClickEnabled) return;
    }
    setMode(next);
  };

  return (
    <div
      data-desk-panel="session"
      className={cn(
        "flex shrink-0 items-center gap-1 border px-1 py-0.5",
        bloomberg ? "border-[#ff9900]/35 bg-black" : "border-slate-800 bg-slate-950/80",
        TERMINAL_TYPO.micro,
      )}
      title="Desk execution mode and platform session"
    >
      <span className={cn("shrink-0 uppercase", bloomberg ? "text-[#888888]" : "text-slate-600")}>
        DESK
      </span>
      <button
        type="button"
        data-desk-region="desk-paper"
        onClick={() => trySetMode("paper")}
        className={cn(
          "border px-1 py-px font-semibold uppercase",
          mode === "paper"
            ? bloomberg
              ? "border-cyan-700/60 bg-cyan-950/40 text-cyan-300"
              : "border-cyan-800/50 bg-cyan-950/40 text-cyan-300"
            : "border-transparent text-slate-600 hover:text-slate-400",
        )}
        title="Simulated fills at live prices — no exchange submission"
      >
        PAPER
      </button>
      <button
        type="button"
        data-desk-region="desk-live"
        onClick={() => trySetMode("live")}
        className={cn(
          "border px-1 py-px font-semibold uppercase",
          mode === "live"
            ? "border-rose-800/50 bg-rose-950/30 text-rose-300"
            : "border-transparent text-slate-600 hover:text-slate-400",
        )}
        title={
          !claims
            ? "Sign desk session + enable 1CT for live Hyperliquid orders"
            : !oneClickEnabled
              ? "Approve 1-Click Trading agent for live orders"
              : "Live mainnet execution on Hyperliquid"
        }
      >
        LIVE
      </button>
      {mode === "paper" && paperFills > 0 ? (
        <span className={cn("text-slate-600", TERMINAL_TYPO.micro)}>{paperFills} sim</span>
      ) : null}
      <span className="mx-0.5 h-3 w-px bg-slate-800" />
      {siwePending ? (
        <span className="inline-flex items-center gap-0.5 text-slate-500">
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
          AUTH
        </span>
      ) : claims ? (
        <span className={cn("inline-flex items-center gap-0.5", terminalSkin.textUp)}>
          <ShieldCheck className="h-2.5 w-2.5" />
          SIGNED IN
        </span>
      ) : isConnected ? (
        <button
          type="button"
          onClick={() => (onSignIn ?? (() => terminalBus.emit("platform:sign-in", {})))()}
          className={cn(
            "border px-1 py-px uppercase",
            bloomberg
              ? "border-[#ff9900]/40 text-[#ff9900] hover:bg-[#ff9900]/10"
              : "border-amber-800/50 text-amber-400 hover:bg-amber-950/30",
          )}
        >
          SIGN IN
        </button>
      ) : (
        <span className="text-slate-600">NO WALLET</span>
      )}
      {siweLastError ? (
        <span className={cn("max-w-[10rem] truncate text-rose-400", TERMINAL_TYPO.micro)} title={siweLastError}>
          {siweLastError}
        </span>
      ) : null}
    </div>
  );
}
