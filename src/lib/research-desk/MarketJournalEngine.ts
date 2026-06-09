import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { MarketJournalRow } from "@/types/research-operating";

const OBS_KEY = "eq-market-observations-v1";

function loadObservations(): MarketJournalRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OBS_KEY);
    return raw ? (JSON.parse(raw) as MarketJournalRow[]) : [];
  } catch {
    return [];
  }
}

export class MarketJournalEngine {
  static entries(asset: string): MarketJournalRow[] {
    const journal = useTraderWorkflowStore.getState().journal;
    const upper = asset.toUpperCase();
    const fromWorkflow: MarketJournalRow[] = journal.map((j) => ({
      id: j.id,
      kind: j.kind,
      coin: j.coin,
      title: j.title,
      body: j.body,
      tags: j.tags,
      createdAt: j.createdAt,
    }));

    const intel = useTerminalStore.getState().intelligence
      .filter((i) => i.coin.toUpperCase() === upper)
      .slice(0, 3)
      .map((i) => ({
        id: `obs-intel-${i.id}`,
        kind: "liquidity" as const,
        coin: i.coin,
        title: i.title.slice(0, 64),
        body: i.detail,
        tags: ["auto", i.channel],
        createdAt: i.timestamp,
      }));

    return [...fromWorkflow, ...loadObservations(), ...intel]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 48);
  }

  static addObservation(
    kind: MarketJournalRow["kind"],
    coin: string,
    title: string,
    body: string,
  ): void {
    const row: MarketJournalRow = {
      id: `obs-${Date.now()}`,
      kind,
      coin,
      title,
      body,
      tags: [],
      createdAt: Date.now(),
    };
    const list = loadObservations();
    list.unshift(row);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(OBS_KEY, JSON.stringify(list.slice(0, 100)));
      } catch {
        /* ignore */
      }
    }
  }
}
