"use client";

import { useSyncExternalStore } from "react";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { cn } from "@/lib/utils";

function subscribeClientReady(_onStoreChange: () => void): () => void {
  return () => {};
}

function getClientReady(): boolean {
  return true;
}

function getServerReady(): boolean {
  return false;
}

/**
 * Avoids SSR/hydration deadlock: server renders splash; client hydrates straight to children
 * without waiting for useEffect (fixes stuck "INITIALIZING TERMINAL" when JS is slow).
 */
export function ClientGate({ children }: { children: React.ReactNode }) {
  const clientReady = useSyncExternalStore(
    subscribeClientReady,
    getClientReady,
    getServerReady,
  );

  if (!clientReady) {
    return (
      <div
        className={cn(
          "flex h-screen flex-col items-center justify-center gap-2",
          terminalSkin.canvas,
        )}
        suppressHydrationWarning
      >
        <p className={cn(TERMINAL_TYPO.label, terminalSkin.textUp)}>EQUILIBRIUM</p>
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>INITIALIZING TERMINAL…</p>
      </div>
    );
  }

  return <>{children}</>;
}
