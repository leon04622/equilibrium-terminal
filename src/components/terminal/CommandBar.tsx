"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { filterAssets } from "@/lib/assets";
import { useHyperliquidStore } from "@/store/hyperliquidStore";
import { cn } from "@/lib/utils";

export function CommandBar() {
  const [open, setOpen] = useState(false);
  const assets = useHyperliquidStore((s) => s.assets);
  const selectedAsset = useHyperliquidStore((s) => s.selectedAsset);
  const setSelectedAsset = useHyperliquidStore((s) => s.setSelectedAsset);
  const connectionStatus = useHyperliquidStore((s) => s.connectionStatus);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !open &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onSelect = useCallback(
    (coin: string) => {
      const asset = assets.find((a) => a.coin === coin);
      if (asset) setSelectedAsset(asset);
      setOpen(false);
    },
    [assets, setSelectedAsset],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group flex h-9 min-w-[280px] max-w-xl flex-1 items-center gap-2 rounded-lg border border-terminal-border/80",
          "bg-terminal-panel/50 px-3 text-left font-mono text-xs text-terminal-muted backdrop-blur-glass",
          "transition hover:border-neon-green/30 hover:bg-white/5 hover:text-white",
        )}
      >
        <Search className="h-3.5 w-3.5 text-neon-green/70" />
        <span className="flex-1 truncate">
          {selectedAsset ? `${selectedAsset.symbol} · ${selectedAsset.market}` : "Search assets"}
        </span>
        <kbd className="rounded border border-terminal-border px-1.5 py-0.5 text-[10px] text-terminal-muted group-hover:text-white/80">
          /
        </kbd>
        <Activity
          className={cn(
            "h-3.5 w-3.5",
            connectionStatus === "connected" && "text-neon-green",
            connectionStatus === "reconnecting" && "text-amber-400 animate-pulse",
            connectionStatus === "disconnected" && "text-neon-ruby",
          )}
        />
      </button>

      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        assets={assets}
        onSelect={onSelect}
      />
    </>
  );
}

function CommandPalette({
  open,
  onOpenChange,
  assets,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: ReturnType<typeof useHyperliquidStore.getState>["assets"];
  onSelect: (coin: string) => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => filterAssets(assets, query), [assets, query]);
  const perps = filtered.filter((a) => a.market === "perp");
  const spots = filtered.filter((a) => a.market === "spot");

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <CommandInput
        placeholder="Search Hyperliquid perps & spot…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No matching Hyperliquid assets.</CommandEmpty>
        {perps.length > 0 ? (
          <CommandGroup heading="Perpetuals">
            {perps.map((asset) => (
              <CommandItem
                key={asset.id}
                value={`${asset.symbol} ${asset.label} ${asset.coin}`}
                onSelect={() => onSelect(asset.coin)}
              >
                <span className="text-neon-green">{asset.symbol}</span>
                <span className="text-terminal-muted">perp</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
        {spots.length > 0 ? (
          <CommandGroup heading="Spot">
            {spots.map((asset) => (
              <CommandItem
                key={asset.id}
                value={`${asset.symbol} ${asset.label} ${asset.coin}`}
                onSelect={() => onSelect(asset.coin)}
              >
                <span className="text-neon-ruby">{asset.symbol}</span>
                <span className="text-terminal-muted">spot</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
