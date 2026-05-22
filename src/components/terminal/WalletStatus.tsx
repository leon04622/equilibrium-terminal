"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHyperliquidAuthContext } from "@/contexts/HyperliquidAuthContext";
import { Button } from "@/components/ui/button";

export function WalletStatus() {
  const {
    address,
    isConnected,
    isConnecting,
    isAuthorized,
    connectWallet,
    disconnectWallet,
    approveAgent,
    authStatus,
  } = useHyperliquidAuthContext();

  if (!isConnected) {
    return (
      <Button
        variant="terminal"
        size="sm"
        onClick={connectWallet}
        disabled={isConnecting}
        className="shrink-0 font-mono text-[10px]"
      >
        {isConnecting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Connect"}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden font-mono text-[10px] sm:block">
        <span className="text-terminal-muted">
          {address?.slice(0, 6)}…{address?.slice(-4)}
        </span>
        <span
          className={cn(
            "ml-2 rounded px-1 py-0.5 text-[9px] uppercase",
            isAuthorized
              ? "bg-neon-green/15 text-neon-green"
              : "bg-amber-500/15 text-amber-400",
          )}
        >
          {isAuthorized ? "1CT ON" : "1CT OFF"}
        </span>
      </div>
      {!isAuthorized && authStatus !== "approving" ? (
        <Button
          variant="terminal"
          size="sm"
          className="font-mono text-[10px]"
          onClick={() => void approveAgent()}
        >
          Enable 1CT
        </Button>
      ) : null}
      {authStatus === "approving" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        className="font-mono text-[10px] text-terminal-muted"
        onClick={disconnectWallet}
      >
        Disconnect
      </Button>
    </div>
  );
}
