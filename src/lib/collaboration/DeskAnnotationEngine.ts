import { crdtWorkspaceCoordinator } from "@/lib/network/CrdtWorkspaceCoordinator";
import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import type { MarketAnnotation } from "@/types/collaboration";
import type { ChartAnnotation } from "@/types/network";

function toMarketAnnotation(
  ann: ChartAnnotation,
  deskId: string,
  authorHandle: string,
): MarketAnnotation {
  return {
    id: ann.id,
    deskId,
    kind: "chart",
    coin: ann.coin,
    price: ann.price,
    label: ann.label,
    body: ann.label,
    authorId: ann.authorId,
    authorHandle,
    visibility: "team",
    tags: ["chart"],
    timestamp: ann.timestamp,
    pinned: false,
  };
}

const SEED_ANNOTATIONS: Omit<MarketAnnotation, "id" | "timestamp" | "deskId">[] = [
  {
    kind: "liquidity",
    coin: "HYPE",
    price: null,
    label: "Bid wall cluster",
    body: "Resting liquidity stacked 2.4% below mid — execution desk flagged for sweep risk.",
    authorId: "trader-02",
    authorHandle: "PERP_DESK_A",
    visibility: "team",
    tags: ["liquidity", "execution"],
    pinned: true,
  },
  {
    kind: "macro",
    coin: "BTC",
    price: null,
    label: "Macro regime shift",
    body: "Desk note — DXY breakdown + stablecoin inflows suggest risk-on continuation window.",
    authorId: "trader-01",
    authorHandle: "MACRO_LEAD",
    visibility: "team",
    tags: ["macro", "regime"],
    pinned: false,
  },
  {
    kind: "thesis",
    coin: "ETH",
    price: null,
    label: "ETH/BTC ratio thesis",
    body: "Relative value setup — funding divergence + OI rotation into ETH perps.",
    authorId: "trader-03",
    authorHandle: "FLOW_SCOUT",
    visibility: "team",
    tags: ["thesis", "relative-value"],
    pinned: false,
  },
];

export class DeskAnnotationEngine {
  static list(): MarketAnnotation[] {
    const net = useNetworkGraphStore.getState();
    const deskId = net.activeDeskId;
    const crdt = crdtWorkspaceCoordinator.getAnnotations(deskId);
    const storeAnns = net.annotations[deskId] ?? [];

    const merged = new Map<string, MarketAnnotation>();
    for (const ann of [...crdt, ...storeAnns]) {
      const profile = net.getProfile(ann.authorId);
      merged.set(ann.id, toMarketAnnotation(ann, deskId, profile?.displayHandle ?? ann.authorId));
    }

    const now = Date.now();
    for (let i = 0; i < SEED_ANNOTATIONS.length; i++) {
      const seed = SEED_ANNOTATIONS[i];
      const id = `ann-seed-${i}`;
      if (!merged.has(id)) {
        merged.set(id, {
          ...seed,
          id,
          deskId,
          timestamp: now - (i + 1) * 3600_000,
        });
      }
    }

    return Array.from(merged.values()).sort((a, b) => b.timestamp - a.timestamp);
  }
}
