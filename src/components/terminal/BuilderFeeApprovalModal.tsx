"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import {
  BUILDER_MAX_FEE_RATE,
  BUILDER_ORDER_FEE_RATE,
  EQUILIBRIUM_BUILDER_ADDRESS,
} from "@/lib/hyperliquid/builder";
import { Button } from "@/components/ui/button";

export interface BuilderFeeApprovalModalProps {
  open: boolean;
  approving: boolean;
  authError: string | null;
  context?: "trade" | "close";
  onApprove: () => void;
  onCancel: () => void;
}

export function BuilderFeeApprovalModal({
  open,
  approving,
  authError,
  context = "trade",
  onApprove,
  onCancel,
}: BuilderFeeApprovalModalProps) {
  if (!open) return null;

  const actionLabel = context === "close" ? "close a perp position" : "place a live perp order";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4">
      <div
        className={cn(
          terminalSkin.border,
          "w-full max-w-md space-y-3 border-amber-800/40 bg-slate-950 p-4 shadow-2xl",
        )}
        role="dialog"
        aria-labelledby="builder-fee-title"
      >
        <p id="builder-fee-title" className={cn(TERMINAL_TYPO.label, "uppercase text-amber-300")}>
          Approve trading fee
        </p>
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>
          To {actionLabel} through Equilibrium Terminal, sign a one-time approval with your main wallet
          (Arbitrum). This authorizes a small builder fee on perp fills routed by this desk.
        </p>
        <dl className={cn(terminalSkin.border, "space-y-1.5 border-slate-800 bg-black/30 p-2")}>
          <div className="flex justify-between gap-2">
            <dt className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>Builder</dt>
            <dd className={cn(TERMINAL_TYPO.micro, "truncate text-slate-200")}>
              {EQUILIBRIUM_BUILDER_ADDRESS.slice(0, 10)}…{EQUILIBRIUM_BUILDER_ADDRESS.slice(-6)}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>Fee on fill</dt>
            <dd className={cn(TERMINAL_TYPO.micro, "text-slate-200")}>{BUILDER_ORDER_FEE_RATE}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>Max you approve</dt>
            <dd className={cn(TERMINAL_TYPO.micro, "text-slate-200")}>{BUILDER_MAX_FEE_RATE}</dd>
          </div>
        </dl>
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
          No gas. Signed once per wallet — revoke anytime by setting max fee to 0% on Hyperliquid.
          Does not grant withdrawal or transfer rights.
        </p>
        {authError ? (
          <p className={cn(TERMINAL_TYPO.micro, "text-rose-400")}>{authError}</p>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" className="font-mono text-[10px]" onClick={onCancel} disabled={approving}>
            Not now
          </Button>
          <Button
            variant="terminal"
            size="sm"
            className="font-mono text-[10px]"
            onClick={() => void onApprove()}
            disabled={approving}
          >
            {approving ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Signing…
              </>
            ) : (
              "Approve & continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
