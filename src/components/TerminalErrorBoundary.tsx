"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import {
  clearChunkReloadFlag,
  isChunkLoadError,
  recoverFromChunkLoadError,
} from "@/lib/chunkLoadRecovery";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  chunkStale: boolean;
}

export class TerminalErrorBoundary extends Component<Props, State> {
  state: State = { error: null, chunkStale: false };

  static getDerivedStateFromError(error: Error): State {
    return {
      error,
      chunkStale: isChunkLoadError(error),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[Equilibrium Terminal]", error, info.componentStack);
    if (recoverFromChunkLoadError(error)) return;
  }

  componentDidMount(): void {
    clearChunkReloadFlag();
  }

  private handleRetry = (): void => {
    const { error, chunkStale } = this.state;
    if (error && (chunkStale || isChunkLoadError(error))) {
      sessionStorage.removeItem("eq-terminal-chunk-reload");
      const url = new URL(window.location.href);
      url.searchParams.set("_cb", String(Date.now()));
      window.location.replace(url.pathname + url.search);
      return;
    }
    this.setState({ error: null, chunkStale: false });
  };

  render() {
    if (this.state.error) {
      const { error, chunkStale } = this.state;
      return (
        <div
          className={cn(
            "flex h-screen flex-col items-center justify-center gap-3 p-4",
            terminalSkin.canvas,
          )}
        >
          <p className={cn(TERMINAL_TYPO.label, terminalSkin.textDown)}>TERMINAL HALT</p>
          <p className={cn(TERMINAL_TYPO.dataSm, "max-w-lg text-center text-slate-400")}>
            {error.message}
          </p>
          {chunkStale ? (
            <p className={cn(TERMINAL_TYPO.micro, "max-w-md text-center text-slate-500")}>
              Stale build cache — the server was rebuilt but your browser still has old
              JavaScript paths. Click RETRY for a hard refresh, or run{" "}
              <span className="text-slate-400">npm run restart</span> if the problem persists.
            </p>
          ) : null}
          <button
            type="button"
            className={cn(
              TERMINAL_TYPO.micro,
              "border-[0.5px] border-slate-700 px-2 py-1 text-slate-300 hover:bg-slate-900",
            )}
            onClick={this.handleRetry}
          >
            RETRY
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
