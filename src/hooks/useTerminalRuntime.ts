"use client";

import { useEffect } from "react";
import { terminalRuntime } from "@/lib/runtime";

/** Bootstraps the terminal runtime singleton once per app shell (Strict Mode safe). */
export function useTerminalRuntime(): void {
  useEffect(() => {
    terminalRuntime.init();
    return () => terminalRuntime.dispose();
  }, []);
}
