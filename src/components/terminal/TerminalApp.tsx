"use client";

import { TerminalErrorBoundary } from "@/components/TerminalErrorBoundary";
import { WorkspaceManager } from "@/components/terminal/WorkspaceManager";

/** Client-only terminal shell — avoids SSR/hydration mismatch on the workspace grid. */
export function TerminalApp() {
  return (
    <TerminalErrorBoundary>
      <WorkspaceManager />
    </TerminalErrorBoundary>
  );
}
