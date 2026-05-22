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
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useOmniCommand } from "@/hooks/useOmniCommand";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useTerminalStore } from "@/store/terminalStore";
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
};

export function OmniBar() {
  const omniOpen = useTerminalStore((s) => s.omniOpen);
  const setOmniOpen = useTerminalStore((s) => s.setOmniOpen);
  const assets = useTerminalStore((s) => s.assets);
  const selectedAsset = useTerminalStore((s) => s.selectedAsset);
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);
  const connectionStatus = useTerminalStore((s) => s.connectionStatus);
  const index = useInformationDiscoveryStore((s) => s.index);
  const { submit, selectIndexEntry } = useOmniCommand();

  const [query, setQuery] = useState("");
  const [lastParseMs, setLastParseMs] = useState<number | null>(null);

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

  const discoveryResults = useMemo(
    () => InformationDiscoveryEngine.search(index, query, 20),
    [index, query],
  );

  const groupedDiscovery = useMemo(() => {
    const map = new Map<IndexCategory, typeof discoveryResults>();
    for (const r of discoveryResults) {
      const cat = r.entry.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(r);
    }
    return map;
  }, [discoveryResults]);

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
          {selectedAsset ? `${selectedAsset.symbol} · CMD` : "OMNI · SEARCH & CMD"}
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
        <CommandInput
          placeholder="/coverage · /reliability · /workspace BTC · /journal · Ctrl+L reliability"
          value={query}
          onValueChange={setQuery}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              e.preventDefault();
              const res = submit(query);
              setLastParseMs(res.elapsedMs);
            }
          }}
        />
        <CommandList>
          <CommandEmpty className={TERMINAL_TYPO.dataSm}>
            ENTER to run · indexed discovery · human-in-the-loop
          </CommandEmpty>

          {Array.from(groupedDiscovery.entries()).map(([cat, rows]) => (
            <CommandGroup key={cat} heading={CAT_LABEL[cat]}>
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

          <CommandGroup heading="CMD">
            <CommandItem value="cmd-nav" onSelect={() => submit("/nav BTC")}>
              /nav [asset]
            </CommandItem>
            <CommandItem value="cmd-watch" onSelect={() => submit("/watch ETH")}>
              /watch [asset] — surveillance list
            </CommandItem>
            <CommandItem value="cmd-intel" onSelect={() => submit("/intel")}>
              /intel — intelligence wire
            </CommandItem>
            <CommandItem value="cmd-liq" onSelect={() => submit("/liq")}>
              /liq — liquidity & book
            </CommandItem>
            <CommandItem value="cmd-summarize" onSelect={() => submit("/summarize")}>
              /summarize — AI context summary (no trade advice)
            </CommandItem>
            <CommandItem
              value="cmd-graph"
              onSelect={() => submit("/graph ETH correlated narratives")}
            >
              /graph — knowledge graph query
            </CommandItem>
            <CommandItem value="cmd-trade" onSelect={() => submit("/trade buy BTC 100")}>
              /trade [buy|sell] [asset] [size]
            </CommandItem>
            <CommandItem value="cmd-journal" onSelect={() => submit("/journal")}>
              /journal — trader notes
            </CommandItem>
            <CommandItem value="cmd-research" onSelect={() => submit("/research")}>
              /research — thesis & saved views
            </CommandItem>
            <CommandItem value="cmd-workspace" onSelect={() => submit("/workspace BTC standard")}>
              /workspace [asset] [mode]
            </CommandItem>
            <CommandItem value="cmd-briefing" onSelect={() => submit("/briefing")}>
              /briefing — daily market prep
            </CommandItem>
            <CommandItem value="cmd-coverage" onSelect={() => submit("/coverage")}>
              /coverage — venues, EQ metrics, on-chain
            </CommandItem>
            <CommandItem value="cmd-reliability" onSelect={() => submit("/reliability")}>
              /reliability — runtime + data trust ops
            </CommandItem>
            <CommandItem
              value="cmd-routine"
              onSelect={() => submit("/routine morning_briefing")}
            >
              /routine [id] — operational routine
            </CommandItem>
          </CommandGroup>

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
