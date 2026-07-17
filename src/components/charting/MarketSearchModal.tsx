"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";
import {
  filterMarketRows,
  formatPriceHl,
  formatUsd,
} from "@/lib/market/hlMarketContexts";
import { useHlMarketContexts } from "@/hooks/useHlMarketContexts";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { MarketContextRow, MarketSearchTab } from "@/types/market-search";

type SortKey = "market" | "lastPrice" | "change24h" | "funding" | "volume" | "openInterest";

const TABS: { id: MarketSearchTab; label: string }[] = [
  { id: "favorites", label: "Favorites" },
  { id: "all", label: "All" },
  { id: "perps", label: "Perps" },
  { id: "spot", label: "Spot" },
  { id: "crypto", label: "Crypto" },
  { id: "tradfi", label: "Tradfi" },
  { id: "hip3", label: "HIP-3" },
  { id: "trending", label: "Trending" },
  { id: "prelaunch", label: "Pre-launch" },
];

function sortRows(rows: MarketContextRow[], key: SortKey, desc: boolean): MarketContextRow[] {
  const mul = desc ? -1 : 1;
  return [...rows].sort((a, b) => {
    switch (key) {
      case "market":
        return mul * a.displayName.localeCompare(b.displayName);
      case "lastPrice":
        return mul * ((a.lastPrice ?? 0) - (b.lastPrice ?? 0));
      case "change24h":
        return mul * ((a.change24hPct ?? 0) - (b.change24hPct ?? 0));
      case "funding":
        return mul * ((a.funding8hPct ?? 0) - (b.funding8hPct ?? 0));
      case "volume":
        return mul * ((a.volume24hUsd ?? 0) - (b.volume24hUsd ?? 0));
      case "openInterest":
        return mul * ((a.openInterestUsd ?? 0) - (b.openInterestUsd ?? 0));
      default:
        return 0;
    }
  });
}

function ChangeCell({ row }: { row: MarketContextRow }) {
  if (row.change24hAbs == null || row.change24hPct == null) {
    return <span className="text-slate-500">—</span>;
  }
  const up = row.change24hAbs >= 0;
  const absStr =
    Math.abs(row.change24hAbs) >= 1
      ? row.change24hAbs.toLocaleString("en-US", { maximumFractionDigits: 0 })
      : row.change24hAbs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  const sign = row.change24hAbs >= 0 ? "+" : "-";
  return (
    <span className={cn("tabular-nums", up ? terminalSkin.textUp : terminalSkin.textDown)}>
      {sign}
      {absStr.replace(/^-/, "")} / {sign}
      {Math.abs(row.change24hPct).toFixed(2)}%
    </span>
  );
}

function MarketBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-[#26a69a]/25 px-1 py-px text-[10px] font-medium text-[#26a69a]">
      {children}
    </span>
  );
}

export function MarketSearchModal() {
  const open = useTerminalStore((s) => s.marketSearchOpen);
  const setOpen = useTerminalStore((s) => s.setMarketSearchOpen);
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);
  const selectedCoin = useTerminalStore((s) => s.selectedCoin);

  const watchlist = useInformationDiscoveryStore((s) => s.watchlist);
  const addToWatchlist = useInformationDiscoveryStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useInformationDiscoveryStore((s) => s.removeFromWatchlist);

  const { rows, loading } = useHlMarketContexts(open);

  const [query, setQuery] = useState("");
  const [strict, setStrict] = useState(false);
  const [tab, setTab] = useState<MarketSearchTab>("all");
  const [sortKey, setSortKey] = useState<SortKey>("volume");
  const [sortDesc, setSortDesc] = useState(true);
  const [highlightIdx, setHighlightIdx] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const favoriteCoins = useMemo(() => new Set(watchlist.map((w) => w.coin)), [watchlist]);

  const filtered = useMemo(() => {
    const base = filterMarketRows(rows, tab, favoriteCoins, query, strict);
    if (tab === "trending") return base;
    return sortRows(base, sortKey, sortDesc);
  }, [rows, tab, favoriteCoins, query, strict, sortKey, sortDesc]);

  const selectRow = useCallback(
    (row: MarketContextRow) => {
      selectAssetByCoin(row.coin, "market-search");
      setOpen(false);
    },
    [selectAssetByCoin, setOpen],
  );

  const toggleFavorite = useCallback(
    (coin: string) => {
      if (favoriteCoins.has(coin)) removeFromWatchlist(coin);
      else addToWatchlist(coin);
    },
    [addToWatchlist, favoriteCoins, removeFromWatchlist],
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc((d) => !d);
    else {
      setSortKey(key);
      setSortDesc(key === "market" ? false : true);
    }
  };

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setHighlightIdx(0);
    queueMicrotask(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    setHighlightIdx(0);
  }, [query, tab, strict, sortKey, sortDesc]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s" && filtered[highlightIdx]) {
        e.preventDefault();
        toggleFavorite(filtered[highlightIdx].coin);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && filtered[highlightIdx]) {
        e.preventDefault();
        selectRow(filtered[highlightIdx]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen, filtered, highlightIdx, selectRow, toggleFavorite]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-row-idx="${highlightIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightIdx]);

  if (!open) return null;

  const SortArrow = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      <span className="ml-0.5 text-[#26a69a]">{sortDesc ? "↓" : "↑"}</span>
    ) : null;

  return (
    <div
      className="absolute inset-0 z-40 flex items-start justify-center bg-black/60 pt-4"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        className="flex max-h-[min(82vh,640px)] w-[min(96vw,920px)] flex-col overflow-hidden rounded-lg border border-[#363a45] bg-[#0b0e11] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#2a2e39] px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-[#363a45] bg-[#131722] px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-[14px] text-slate-100 outline-none placeholder:text-slate-600"
            />
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-md border border-[#363a45] p-0.5">
            <button
              type="button"
              onClick={() => setStrict(true)}
              className={cn(
                "rounded px-3 py-1.5 text-[12px] font-medium",
                strict ? "bg-[#26a69a] text-[#0b0e11]" : "text-slate-400 hover:text-slate-200",
              )}
            >
              Strict
            </button>
            <button
              type="button"
              onClick={() => setStrict(false)}
              className={cn(
                "rounded px-3 py-1.5 text-[12px] font-medium",
                !strict ? "bg-[#26a69a] text-[#0b0e11]" : "text-slate-400 hover:text-slate-200",
              )}
            >
              All
            </button>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded p-1.5 text-slate-500 hover:bg-[#2a2e39] hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-4 overflow-x-auto border-b border-[#2a2e39] px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 border-b-2 py-2.5 text-[13px] font-medium transition-colors",
                tab === t.id
                  ? "border-[#26a69a] text-slate-100"
                  : "border-transparent text-slate-500 hover:text-slate-300",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          ref={listRef}
          className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]"
        >
          <table className="w-full border-collapse text-left text-[13px]">
            <thead className="sticky top-0 z-10 bg-[#0b0e11]">
              <tr className="border-b border-[#2a2e39] text-[11px] uppercase tracking-wide text-slate-500">
                <th className="w-8 px-3 py-2" />
                <th className="px-2 py-2">
                  <button type="button" onClick={() => toggleSort("market")} className="hover:text-slate-300">
                    Market
                    <SortArrow col="market" />
                  </button>
                </th>
                <th className="px-2 py-2 text-right">
                  <button type="button" onClick={() => toggleSort("lastPrice")} className="hover:text-slate-300">
                    Last Price
                    <SortArrow col="lastPrice" />
                  </button>
                </th>
                <th className="px-2 py-2 text-right">
                  <button type="button" onClick={() => toggleSort("change24h")} className="hover:text-slate-300">
                    24h Change
                    <SortArrow col="change24h" />
                  </button>
                </th>
                <th className="px-2 py-2 text-right">
                  <button type="button" onClick={() => toggleSort("funding")} className="hover:text-slate-300">
                    8h Funding
                    <SortArrow col="funding" />
                  </button>
                </th>
                <th className="px-2 py-2 text-right">
                  <button type="button" onClick={() => toggleSort("volume")} className="hover:text-slate-300">
                    Volume
                    <SortArrow col="volume" />
                  </button>
                </th>
                <th className="px-2 py-2 text-right">
                  <button type="button" onClick={() => toggleSort("openInterest")} className="hover:text-slate-300">
                    Open Interest
                    <SortArrow col="openInterest" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Loading markets…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    No markets match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => {
                  const isFav = favoriteCoins.has(row.coin);
                  const isActive = row.coin === selectedCoin;
                  const isHighlight = idx === highlightIdx;
                  return (
                    <tr
                      key={`${row.market}-${row.coin}`}
                      data-row-idx={idx}
                      onMouseEnter={() => setHighlightIdx(idx)}
                      onClick={() => selectRow(row)}
                      className={cn(
                        "cursor-pointer border-b border-[#2a2e39]/60 transition-colors",
                        isHighlight ? "bg-[#2a2e39]/80" : "hover:bg-[#2a2e39]/50",
                        isActive && "bg-[#26a69a]/10",
                      )}
                    >
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(row.coin);
                          }}
                          className="rounded p-0.5 text-slate-500 hover:text-[#fbbf24]"
                          aria-label={isFav ? "Remove favorite" : "Add favorite"}
                        >
                          <Star
                            className={cn("h-3.5 w-3.5", isFav ? "fill-[#fbbf24] text-[#fbbf24]" : "")}
                          />
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-100">{row.displayName}</span>
                          {row.isHip3 ? <MarketBadge>xyz</MarketBadge> : null}
                          {row.maxLeverage != null ? (
                            <MarketBadge>{row.maxLeverage}x</MarketBadge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-slate-100">
                        {formatPriceHl(row.lastPrice)}
                      </td>
                      <td className="px-2 py-2 text-right text-[12px]">
                        <ChangeCell row={row} />
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-[#26a69a]">
                        {row.funding8hPct != null ? `${row.funding8hPct.toFixed(4)}%` : "—"}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-slate-200">
                        {formatUsd(row.volume24hUsd, 0)}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-slate-200">
                        {formatUsd(row.openInterestUsd, 0)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-center gap-4 border-t border-[#2a2e39] px-4 py-2.5 text-[11px] text-slate-500">
          <span>
            <kbd className="rounded border border-[#363a45] bg-[#131722] px-1.5 py-0.5 text-[10px] text-slate-400">
              ⇧⌘K
            </kbd>{" "}
            Open
          </span>
          <span>
            <kbd className="rounded border border-[#363a45] bg-[#131722] px-1.5 py-0.5 text-[10px] text-slate-400">
              ↑↓
            </kbd>{" "}
            Navigate
          </span>
          <span>
            <kbd className="rounded border border-[#363a45] bg-[#131722] px-1.5 py-0.5 text-[10px] text-slate-400">
              Enter
            </kbd>{" "}
            Select
          </span>
          <span>
            <kbd className="rounded border border-[#363a45] bg-[#131722] px-1.5 py-0.5 text-[10px] text-slate-400">
              ⌘S
            </kbd>{" "}
            Favorite
          </span>
          <span>
            <kbd className="rounded border border-[#363a45] bg-[#131722] px-1.5 py-0.5 text-[10px] text-slate-400">
              Esc
            </kbd>{" "}
            Close
          </span>
        </div>
      </div>
    </div>
  );
}

export function MarketSearchTrigger({
  displayName,
  isHip3,
  maxLeverage,
}: {
  displayName: string;
  isHip3?: boolean;
  maxLeverage?: number | null;
}) {
  const setOpen = useTerminalStore((s) => s.setMarketSearchOpen);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="group flex shrink-0 items-center gap-1.5 rounded px-1 py-0.5 hover:bg-[#2a2e39]/60"
    >
      <span className="text-[13px] font-semibold text-slate-100">{displayName}</span>
      <ChevronDown className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300" />
      {isHip3 ? <MarketBadge>xyz</MarketBadge> : null}
      {maxLeverage != null ? <MarketBadge>{maxLeverage}x</MarketBadge> : null}
    </button>
  );
}
