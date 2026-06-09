"use client";

import { useEffect } from "react";
import { AlphaOrchestrator } from "@/lib/alpha/AlphaOrchestrator";
import { InviteGateEngine } from "@/lib/alpha/InviteGateEngine";
import { useAlphaStore } from "@/store/useAlphaStore";
import { useTraderTelemetryStore } from "@/store/useTraderTelemetryStore";

const POLL_MS = 10_000;

export function useAlphaLaunch(enabled = true): void {
  const setSnapshot = useAlphaStore((s) => s.setSnapshot);
  const setInviteGateOpen = useAlphaStore((s) => s.setInviteGateOpen);

  useEffect(() => {
    if (!enabled) return;

    const tryUrlInvite = () => {
      if (typeof window === "undefined") return;
      const code = new URLSearchParams(window.location.search).get("invite");
      if (code && InviteGateEngine.validate(code)) {
        setInviteGateOpen(false);
      }
    };

    const refresh = () => {
      tryUrlInvite();
      setSnapshot(AlphaOrchestrator.snapshot());
      if (InviteGateEngine.inviteRequired() && !InviteGateEngine.isValidated()) {
        setInviteGateOpen(true);
      } else {
        setInviteGateOpen(false);
      }
    };

    refresh();
    const id = window.setInterval(refresh, POLL_MS);

    const unsubTelemetry = useTraderTelemetryStore.subscribe(
      (s) => s.eventsVersion,
      () => refresh(),
    );

    return () => {
      window.clearInterval(id);
      unsubTelemetry();
    };
  }, [enabled, setSnapshot, setInviteGateOpen]);
}
