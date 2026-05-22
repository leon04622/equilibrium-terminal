import type {
  GraphEntity,
  GraphLink,
  MarketGraphSnapshot,
} from "@/types/market-knowledge-graph";

const MAX_ENTITIES = 2_000;
const MAX_LINKS = 8_000;

export class MarketKnowledgeGraph {
  private static instance: MarketKnowledgeGraph | null = null;

  private entities = new Map<string, GraphEntity>();
  private links: GraphLink[] = [];
  private linkKeys = new Set<string>();
  private version = 0;

  static getInstance(): MarketKnowledgeGraph {
    if (!MarketKnowledgeGraph.instance) {
      MarketKnowledgeGraph.instance = new MarketKnowledgeGraph();
    }
    return MarketKnowledgeGraph.instance;
  }

  upsertEntity(entity: GraphEntity): void {
    const prev = this.entities.get(entity.id);
    if (prev && prev.timestamp >= entity.timestamp) return;
    this.entities.set(entity.id, entity);
    this.version++;
    this.trimEntities();
  }

  upsertLink(link: GraphLink): void {
    const key = `${link.from}|${link.relation}|${link.to}`;
    if (this.linkKeys.has(key)) return;
    this.linkKeys.add(key);
    this.links.push(link);
    this.version++;
    if (this.links.length > MAX_LINKS) {
      const drop = this.links.splice(0, this.links.length - MAX_LINKS);
      for (const d of drop) {
        this.linkKeys.delete(`${d.from}|${d.relation}|${d.to}`);
      }
    }
  }

  getEntity(id: string): GraphEntity | undefined {
    return this.entities.get(id);
  }

  getNeighbors(entityId: string, depth = 1): { entities: GraphEntity[]; links: GraphLink[] } {
    const seenE = new Set<string>([entityId]);
    const seenL = new Set<string>();
    const outE: GraphEntity[] = [];
    const outL: GraphLink[] = [];
    let frontier = [entityId];

    for (let d = 0; d < depth; d++) {
      const next: string[] = [];
      for (const id of frontier) {
        for (const link of this.links) {
          if (link.from !== id && link.to !== id) continue;
          if (seenL.has(link.id)) continue;
          seenL.add(link.id);
          outL.push(link);
          const other = link.from === id ? link.to : link.from;
          if (seenE.has(other)) continue;
          seenE.add(other);
          const ent = this.entities.get(other);
          if (ent) {
            outE.push(ent);
            next.push(other);
          }
        }
      }
      frontier = next;
    }

    const root = this.entities.get(entityId);
    if (root) outE.unshift(root);
    return { entities: outE, links: outL };
  }

  findByCoin(coin: string): GraphEntity[] {
    const upper = coin.toUpperCase();
    return Array.from(this.entities.values()).filter(
      (e) => e.coin?.toUpperCase() === upper,
    );
  }

  findByKind(kind: GraphEntity["kind"]): GraphEntity[] {
    return Array.from(this.entities.values()).filter((e) => e.kind === kind);
  }

  searchText(q: string, limit = 32): GraphEntity[] {
    const lower = q.toLowerCase();
    const scored: { e: GraphEntity; s: number }[] = [];
    for (const e of Array.from(this.entities.values())) {
      let s = 0;
      if (e.label.toLowerCase().includes(lower)) s += 20;
      if (e.coin?.toLowerCase().includes(lower)) s += 25;
      if (e.snippet.toLowerCase().includes(lower)) s += 10;
      if (e.sector?.toLowerCase().includes(lower)) s += 15;
      for (const v of Object.values(e.metadata)) {
        if (String(v).toLowerCase().includes(lower)) s += 5;
      }
      if (s > 0) scored.push({ e, s });
    }
    return scored
      .sort((a, b) => b.s - a.s)
      .slice(0, limit)
      .map((x) => x.e);
  }

  getAllEntities(): GraphEntity[] {
    return Array.from(this.entities.values());
  }

  getAllLinks(): GraphLink[] {
    return this.links;
  }

  snapshot(): MarketGraphSnapshot {
    return {
      entityCount: this.entities.size,
      linkCount: this.links.length,
      version: this.version,
      updatedAt: Date.now(),
    };
  }

  getVersion(): number {
    return this.version;
  }

  private trimEntities(): void {
    if (this.entities.size <= MAX_ENTITIES) return;
    const sorted = Array.from(this.entities.values()).sort(
      (a, b) => b.timestamp - a.timestamp,
    );
    this.entities.clear();
    for (const e of sorted.slice(0, MAX_ENTITIES)) {
      this.entities.set(e.id, e);
    }
  }
}

export const marketKnowledgeGraph = MarketKnowledgeGraph.getInstance();
