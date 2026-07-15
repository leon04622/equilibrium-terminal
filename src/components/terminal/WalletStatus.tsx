"use client";

import { Loader2, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { isBloombergChrome } from "@/lib/theme/bloomberg";
import { useHyperliquidAuthContext } from "@/contexts/HyperliquidAuthContext";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import { Button } from "@/components/ui/button";

/** Wallet + 1CT only — desk mode and sign-in live in DeskSessionBar. */
export function WalletStatus() {
  const {
    address,
    isConnected,
    isConnecting,
    isAuthorized,
    oneClickEnabled,
    connectWallet,
    disconnectWallet,
    approveAgent,
    authStatus,
  } = useHyperliquidAuthContext();

  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);
  const bloomberg = isBloombergChrome(beginnerMode);
  const claims = useProductionConfigStore((s) => s.claims);
  const siwePending = useProductionConfigStore((s) => s.siwePending);
  const siweLastError = useProductionConfigStore((s) => s.siweLastError);

  if (!isConnected) {
    return (
      <Button
        variant="terminal"
        size="sm"
        onClick={connectWallet}
        disabled={isConnecting}
        className={cn(
          "shrink-0 font-mono text-[10px]",
          bloomberg && "border-[#ff9900]/50 text-[#ff9900] hover:bg-[#ff9900]/10",
        )}
      >
        {isConnecting ? <Loader2 className="h-3 w-3 animate-spin" /> : "CONNECT"}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="hidden font-mono text-[10px] sm:block">
        <span className={bloomberg ? "text-[#888888]" : "text-terminal-muted"}>
          {address?.slice(0, 6)}…{address?.slice(-4)}
        </span>
      </div>

      {siwePending ? (
        <span className="inline-flex items-center gap-0.5 text-slate-500">
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
          <span className={TERMINAL_TYPO.micro}>AUTH</span>
        </span>
      ) : claims ? (
        <span
          className={cn(
            TERMINAL_TYPO.micro,
            "inline-flex items-center gap-0.5",
            bloomberg ? "text-[#00ff88]" : "text-neon-green",
          )}
        >
          <ShieldCheck className="h-2.5 w-2.5" />
          SESSION
        </span>
      ) : null}

      <span
        className={cn(
          TERMINAL_TYPO.micro,
          "rounded px-1 py-0.5 uppercase",
          isAuthorized && oneClickEnabled
            ? bloomberg
              ? "bg-[#00ff88]/15 text-[#00ff88]"
              : "bg-neon-green/15 text-neon-green"
            : "bg-amber-500/15 text-amber-400",
        )}
        title={isAuthorized && oneClickEnabled ? "1-Click Trading enabled" : "Approve agent for live orders"}
      >
        {isAuthorized && oneClickEnabled ? "1CT" : "NO 1CT"}
      </span>

      {!oneClickEnabled && authStatus !== "approving" ? (
        <Button
          variant="terminal"
          size="sm"
          className="font-mono text-[10px]"
          onClick={() => void approveAgent()}
        >
          <Zap className="mr-0.5 h-2.5 w-2.5" />
          Enable 1CT
        </Button>
      ) : null}
      {authStatus === "approving" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
      ) : null}
      {siweLastError ? (
        <span className={cn(TERMINAL_TYPO.micro, "max-w-[8rem] truncate text-rose-400")} title={siweLastError}>
          {siweLastError}
        </span>
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        className={cn("font-mono text-[10px]", bloomberg ? "text-[#888888]" : "text-terminal-muted")}
        onClick={disconnectWallet}
      >
        Disconnect
      </Button>
    </div>
  );
}
