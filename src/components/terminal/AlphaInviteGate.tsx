"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { AlphaOrchestrator } from "@/lib/alpha/AlphaOrchestrator";
import { InviteGateEngine } from "@/lib/alpha/InviteGateEngine";
import { useAlphaStore } from "@/store/useAlphaStore";

export function AlphaInviteGate() {
  const open = useAlphaStore((s) => s.inviteGateOpen);
  const setInviteGateOpen = useAlphaStore((s) => s.setInviteGateOpen);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const codes = InviteGateEngine.publicCodes();

  if (!open) return null;

  const submit = () => {
    if (InviteGateEngine.validate(code)) {
      setError(false);
      setInviteGateOpen(false);
      useAlphaStore.getState().setSnapshot(AlphaOrchestrator.snapshot());
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/90 p-4">
      <div className={cn("w-full max-w-md border border-slate-700 bg-slate-950", terminalSkin.border)}>
        <header className={cn(terminalSkin.borderB, "px-3 py-2")}>
          <p className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>ALPHA ACCESS</p>
          <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-500")}>
            Invite gate — not wallet login. Enter a code, then connect your wallet in the header.
          </p>
        </header>
        <div className="space-y-2 px-3 py-3">
          <label className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>INVITE CODE</label>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className={cn(INSTITUTIONAL_INTERACTION.input, "w-full font-mono uppercase")}
            placeholder="EQ-ALPHA-2026"
            autoComplete="off"
            autoFocus
          />
          {error ? (
            <p className={cn(TERMINAL_TYPO.micro, terminalSkin.textDown)}>
              Invalid code — check spelling (hyphens matter).
            </p>
          ) : null}
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
            Valid codes: {codes.join(" · ")}
          </p>
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
            Or open with{" "}
            <span className="text-slate-400">?invite=EQ-ALPHA-2026</span> in the URL (saved in this
            browser).
          </p>
        </div>
        <footer className={cn(terminalSkin.borderT, "flex gap-1 p-2")}>
          <button
            type="button"
            onClick={submit}
            className={cn(INSTITUTIONAL_INTERACTION.tabButton, "flex-1 text-cyan-300")}
          >
            UNLOCK TERMINAL
          </button>
        </footer>
      </div>
    </div>
  );
}
