"use client";

import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import { isBloombergChrome } from "@/lib/theme/bloomberg";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";

export function WatchlistStrip() {
  const watchlist = useInformationDiscoveryStore((s) => s.watchlist);
  const selectedCoin = useTerminalStore((s) => s.selectedCoin);
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);
  const bloomberg = isBloombergChrome(beginnerMode);

  if (watchlist.length === 0) return null;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1 overflow-x-auto border-b-[0.5px] border-slate-800 bg-slate-950/90 px-1.5 py-0.5",
        bloomberg && "eq-bloomberg-ops-strip",
      )}
    >
      <span className={cn(TERMINAL_TYPO.micro, bloomberg ? "text-[#888888]" : "text-slate-600")}>
        WATCH
      </span>
      {watchlist.map((entry) => {
        const active = entry.coin === selectedCoin;
        return (
          <button
            key={entry.coin}
            type="button"
            onClick={() => selectAssetByCoin(entry.coin, "watchlist-strip")}
            className={cn(
              "shrink-0 border px-1.5 py-0 font-mono transition-colors",
              TERMINAL_TYPO.micro,
              active
                ? bloomberg
                  ? "border-[#ff9900] text-[#ff9900]"
                  : cn("border-cyan-700/60", terminalSkin.textUp)
                : bloomberg
                  ? "border-[#333333] text-[#888888] hover:border-[#ff9900]/50 hover:text-[#ff9900]"
                  : "border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300",
            )}
          >
            {entry.coin}
          </button>
        );
      })}
    </div>
  );
}
