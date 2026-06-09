import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useWedgeStore } from "@/store/useWedgeStore";
import type { OmniOperationalContext } from "@/types/command-system";

const RECENT_KEY = "eq-omni-recent-cmds";
const MAX_RECENT = 8;

export class OmniContextEngine {
  static snapshot(): OmniOperationalContext {
    const terminal = useTerminalStore.getState();
    const coin =
      terminal.selectedCoin ?? terminal.selectedAsset?.coin ?? "BTC";
    return {
      selectedCoin: coin,
      selectedSymbol: terminal.selectedAsset?.symbol ?? coin,
      connectionStatus: terminal.connectionStatus,
      terminalMode: useAdaptiveWorkspaceStore.getState().mode,
      deskFocusMode: useWedgeStore.getState().deskFocusMode,
      watchlist: useInformationDiscoveryStore.getState().watchlist.map((w) => w.coin),
      recentCommands: OmniContextEngine.loadRecent(),
    };
  }

  static loadRecent(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
    } catch {
      return [];
    }
  }

  static pushRecent(cmd: string): void {
    if (typeof window === "undefined" || !cmd.trim()) return;
    const trimmed = cmd.trim();
    const next = [trimmed, ...OmniContextEngine.loadRecent().filter((c) => c !== trimmed)].slice(
      0,
      MAX_RECENT,
    );
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  static contextualBoost(entryCoin: string | null, ctx: OmniOperationalContext): number {
    let boost = 1;
    if (entryCoin && entryCoin.toUpperCase() === ctx.selectedCoin.toUpperCase()) {
      boost *= 1.35;
    }
    if (entryCoin && ctx.watchlist.includes(entryCoin.toUpperCase())) {
      boost *= 1.15;
    }
    return boost;
  }
}
