"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { filterAssets } from "@/lib/assets";
import { InformationDiscoveryEngine } from "@/lib/discovery/InformationDiscoveryEngine";
import { CommandRegistry } from "@/lib/omnibar/CommandRegistry";
import { OmniContextEngine } from "@/lib/omnibar/OmniContextEngine";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useOmniCommand } from "@/hooks/useOmniCommand";
import { useAdaptiveWorkspaceStore } from "@/store/useAdaptiveWorkspaceStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useTerminalStore } from "@/store/terminalStore";
import { useWedgeStore } from "@/store/useWedgeStore";
import type { IndexCategory } from "@/types/information-discovery";
import { Search, Zap } from "lucide-react";

const CAT_LABEL: Record<IndexCategory, string> = {
  asset: "SYM",
  intelligence: "INTEL",
  narrative: "NARR",
  macro: "MACRO",
  whale: "WHALE",
  liquidity: "LIQ",
  volatility: "VOL",
  command: "CMD",
  wire: "WIRE",
  agent: "AGENT",
  watchlist: "WATCH",
  workspace: "WS",
  alert: "ALERT",
};

export function OmniBar() {
  const omniOpen = useTerminalStore((s) => s.omniOpen);
  const setOmniOpen = useTerminalStore((s) => s.setOmniOpen);
  const assets = useTerminalStore((s) => s.assets);
  const selectedAsset = useTerminalStore((s) => s.selectedAsset);
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);
  const connectionStatus = useTerminalStore((s) => s.connectionStatus);
  const index = useInformationDiscoveryStore((s) => s.index);
  const terminalMode = useAdaptiveWorkspaceStore((s) => s.mode);
  const deskFocusMode = useWedgeStore((s) => s.deskFocusMode);
  const { submit, selectIndexEntry } = useOmniCommand();

  const [query, setQuery] = useState("");
  const [lastParseMs, setLastParseMs] = useState<number | null>(null);

  const ctx = OmniContextEngine.snapshot();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOmniOpen(true);
      }
      if (e.key === "/" && !omniOpen && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setOmniOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [omniOpen, setOmniOpen]);

  useEffect(() => {
    if (!omniOpen) setQuery("");
  }, [omniOpen]);

  const filtered = useMemo(() => filterAssets(assets, query), [assets, query]);

  const commandSuggestions = useMemo(
    () => CommandRegistry.suggest(query, 14),
    [query],
  );

  const discoveryResults = useMemo(() => {
    const base = InformationDiscoveryEngine.search(index, query, 24);
    return base
      .map((r) => ({
        ...r,
        score:
          r.score *
          OmniContextEngine.contextualBoost(r.entry.coin, OmniContextEngine.snapshot()),
      }))
      .sort((a, b) => b.score - a.score);
  }, [index, query, selectedAsset, terminalMode, deskFocusMode, connectionStatus]);

  const groupedDiscovery = useMemo(() => {
    const map = new Map<IndexCategory, typeof discoveryResults>();
    for (const r of discoveryResults) {
      const cat = r.entry.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(r);
    }
    return map;
  }, [discoveryResults]);

  const showHelp = query.trim().toLowerCase() === "/help" || query.trim() === "?";
  const contextLabel = `${ctx.selectedCoin} · ${ctx.terminalMode.toUpperCase()} · ${
    ctx.deskFocusMode ? "DESK" : "FULL"
  }`;

  const runCommand = (cmd: string) => {
    const res = submit(cmd);
    setLastParseMs(res.elapsedMs);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOmniOpen(true)}
        className={cn(
          "flex h-6 min-w-[220px] flex-1 items-center gap-1 border-[0.5px] border-slate-800 bg-slate-950 px-1",
          TERMINAL_TYPO.dataSm,
          "text-slate-500 hover:border-slate-600 hover:text-slate-300",
        )}
      >
        <Search className="h-3 w-3 shrink-0 text-[#00ff88]" />
        <span className="flex-1 truncate text-left uppercase">
          {selectedAsset ? `${selectedAsset.symbol} · CMD` : "OMNI · CMD & SEARCH"}
        </span>
        <kbd className={cn(TERMINAL_TYPO.micro, "border-[0.5px] border-slate-700 px-0.5")}>
          ⌘K
        </kbd>
        {lastParseMs !== null && lastParseMs < 5 ? (
          <Zap className="h-3 w-3 text-[#00ff88]" aria-hidden />
        ) : null}
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-none",
            connectionStatus === "connected" ? "bg-[#00ff88]" : "bg-[#ffaa00]",
          )}
        />
      </button>

      <CommandDialog open={omniOpen} onOpenChange={setOmniOpen} shouldFilter={false}>
        <div
          className={cn(
            "border-b border-slate-800 px-2 py-0.5",
            TERMINAL_TYPO.micro,
            "text-slate-500",
          )}
        >
          CTX · {contextLabel} · / · ENTER
        </div>
        <CommandInput
          placeholder="BTC · /chart ETH · /depth · /exec buy BTC · /monitor funding · /desk"
          value={query}
          onValueChange={setQuery}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              e.preventDefault();
              runCommand(query);
            }
          }}
        />
        <CommandList>
          <CommandEmpty className={TERMINAL_TYPO.dataSm}>
            ENTER to execute · fuzzy CMD · indexed retrieval
          </CommandEmpty>

          {showHelp ? (
            <CommandGroup heading="OPS">
              {CommandRegistry.list().map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  value={`help-${cmd.id}`}
                  onSelect={() => runCommand(cmd.template.trim())}
                >
                  <span className="text-[#00ff88]">{cmd.primary}</span>
                  <span className="text-slate-400">{cmd.label}</span>
                  <span className="truncate text-slate-600">{cmd.description}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {commandSuggestions.length > 0 && (query.startsWith("/") || !query.trim()) ? (
            <CommandGroup heading="CMD">
              {commandSuggestions.map(({ command }) => (
                <CommandItem
                  key={command.id}
                  value={`reg-${command.id}`}
                  onSelect={() => runCommand(command.template.trim())}
                >
                  <span className="text-[#00ff88]">{command.primary}</span>
                  <span className="text-slate-400">{command.label}</span>
                  <span className="truncate text-slate-600">{command.template}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {ctx.recentCommands.length > 0 && !query.trim() ? (
            <CommandGroup heading="RECENT">
              {ctx.recentCommands.map((cmd) => (
                <CommandItem key={cmd} value={`recent-${cmd}`} onSelect={() => runCommand(cmd)}>
                  <span className="text-slate-300">{cmd}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {Array.from(groupedDiscovery.entries()).map(([cat, rows]) => (
            <CommandGroup key={cat} heading={CAT_LABEL[cat] ?? cat.toUpperCase()}>
              {rows.map(({ entry }) => (
                <CommandItem
                  key={entry.id}
                  value={entry.id}
                  onSelect={() => selectIndexEntry(entry.id)}
                >
                  <span className="text-slate-300">{entry.title}</span>
                  <span className="truncate text-slate-600">{entry.snippet}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          {filtered.length > 0 ? (
            <CommandGroup heading="SYM">
              {filtered.slice(0, 12).map((asset) => (
                <CommandItem
                  key={asset.id}
                  value={`sym-${asset.symbol}`}
                  onSelect={() => {
                    selectAssetByCoin(asset.coin, "omnibar");
                    setOmniOpen(false);
                  }}
                >
                  <span
                    className={
                      asset.market === "perp" ? terminalSkin.textUp : terminalSkin.textDown
                    }
                  >
                    {asset.symbol}
                  </span>
                  <span className="text-slate-500">{asset.market}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}
