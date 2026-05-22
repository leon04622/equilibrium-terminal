import type {
  GraphQueryResult,
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
  SharedSignal,
  TraderProfile,
} from "@/types/network";
import { filterPublicGraphSignals } from "@/lib/network/NetworkSandbox";

type IndexTask = () => void;

export class KnowledgeGraphIndexer {
  private static instance: KnowledgeGraphIndexer | null = null;

  private nodes = new Map<string, KnowledgeGraphNode>();
  private edges: KnowledgeGraphEdge[] = [];
  private queue: IndexTask[] = [];
  private draining = false;
  private cache = new Map<string, GraphQueryResult>();

  static getInstance(): KnowledgeGraphIndexer {
    if (!KnowledgeGraphIndexer.instance) {
      KnowledgeGraphIndexer.instance = new KnowledgeGraphIndexer();
    }
    return KnowledgeGraphIndexer.instance;
  }

  enqueueIndex(task: IndexTask): void {
    this.queue.push(task);
    if (!this.draining) {
      this.draining = true;
      queueMicrotask(() => this.drain());
    }
  }

  private drain(): void {
    const batch = this.queue.splice(0, 8);
    for (const t of batch) {
      try {
        t();
      } catch (err) {
        console.error("[KnowledgeGraphIndexer]", err);
      }
    }
    if (this.queue.length > 0) {
      queueMicrotask(() => this.drain());
    } else {
      this.draining = false;
    }
  }

  indexProfiles(profiles: TraderProfile[]): void {
    this.enqueueIndex(() => {
      for (const p of profiles) {
        this.nodes.set(p.id, {
          id: p.id,
          kind: "trader",
          label: p.displayHandle,
          metadata: {
            wallet: p.walletAddress,
            tier: p.reputationTier,
            score: p.reputationScore,
          },
        });
        for (const tag of p.assetTags) {
          const assetId = `asset-${tag}`;
          if (!this.nodes.has(assetId)) {
            this.nodes.set(assetId, {
              id: assetId,
              kind: "asset",
              label: tag,
              metadata: {},
            });
          }
          this.edges.push({
            from: p.id,
            to: assetId,
            relation: "tracks",
            weight: 1,
          });
        }
      }
    });
  }

  indexSignals(signals: SharedSignal[], publicOnly = true): void {
    this.enqueueIndex(() => {
      const list = publicOnly ? filterPublicGraphSignals(signals) : signals;
      for (const s of list) {
        const sid = `signal-${s.id}`;
        this.nodes.set(sid, {
          id: sid,
          kind: "signal",
          label: `${s.coin} ${s.stance}`,
          metadata: {
            hash: s.contentHash,
            visibility: s.visibility,
          },
        });
        this.edges.push({
          from: `trader-${s.publisherWallet}`,
          to: sid,
          relation: "published",
          weight: 1,
        });
        const aid = `asset-${s.coin}`;
        if (!this.nodes.has(aid)) {
          this.nodes.set(aid, {
            id: aid,
            kind: "asset",
            label: s.coin,
            metadata: {},
          });
        }
        this.edges.push({
          from: sid,
          to: aid,
          relation: "targets",
          weight: 1,
        });
      }
    });
  }

  async query(prompt: string): Promise<GraphQueryResult> {
    const key = prompt.trim().toLowerCase();
    const cached = this.cache.get(key);
    if (cached) {
      return { ...cached, cached: true };
    }

    return new Promise((resolve) => {
      queueMicrotask(() => {
        const t0 = performance.now();
        const lower = key;
        const nodes: KnowledgeGraphNode[] = [];
        const edges: KnowledgeGraphEdge[] = [];

        for (const node of Array.from(this.nodes.values())) {
          if (
            node.label.toLowerCase().includes(lower) ||
            Object.values(node.metadata).some((v) =>
              String(v).toLowerCase().includes(lower),
            )
          ) {
            nodes.push(node);
          }
        }

        const nodeIds = new Set(nodes.map((n) => n.id));
        for (const e of this.edges) {
          if (nodeIds.has(e.from) || nodeIds.has(e.to)) edges.push(e);
        }

        if (lower.includes("funding") || lower.includes("macro")) {
          const traders = Array.from(this.nodes.values()).filter((n) => n.kind === "trader");
          const highRep = traders.filter(
            (n) => Number(n.metadata.score ?? 0) >= 0.65,
          );
          for (const t of highRep.slice(0, 5)) {
            if (!nodes.find((n) => n.id === t.id)) nodes.push(t);
          }
        }

        const result: GraphQueryResult = {
          queryId: `gq-${Date.now()}`,
          query: prompt,
          nodes: nodes.slice(0, 24),
          edges: edges.slice(0, 48),
          elapsedMs: performance.now() - t0,
          cached: false,
        };
        this.cache.set(key, result);
        resolve(result);
      });
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const knowledgeGraphIndexer = KnowledgeGraphIndexer.getInstance();
