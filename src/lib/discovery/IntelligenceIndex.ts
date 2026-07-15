import { wedgeAllowsCommand } from "@/lib/wedge/wedgeAccess";
import { useAgentOperationsStore } from "@/store/useAgentOperationsStore";
import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { IntelligenceIndexEntry, IndexCategory } from "@/types/information-discovery";

function entry(
  partial: Omit<IntelligenceIndexEntry, "keywords"> & { keywords?: string[] },
): IntelligenceIndexEntry {
  const text = `${partial.title} ${partial.snippet}`.toLowerCase();
  const keywords =
    partial.keywords ??
    text
      .split(/\W+/)
      .filter((w) => w.length > 2)
      .slice(0, 12);
  return { ...partial, keywords };
}

/** Unified cross-terminal intelligence index for OmniBar discovery. */
export class IntelligenceIndex {
  static rebuild(): IntelligenceIndexEntry[] {
    const terminal = useTerminalStore.getState();
    const atmosphere = useMarketAtmosphereStore.getState();
    const agentic = useAgentOperationsStore.getState();
    const items: IntelligenceIndexEntry[] = [];
    const now = Date.now();

    for (const asset of terminal.assets) {
      items.push(
        entry({
          id: `asset-${asset.coin}`,
          category: "asset",
          coin: asset.coin,
          title: asset.symbol,
          snippet: `${asset.market} · ${asset.label}`,
          timestamp: now,
          relevanceBoost: asset.coin === terminal.selectedCoin ? 2 : 1,
          routeWidget: "chart",
          routeCoin: asset.coin,
        }),
      );
    }

    for (const intel of terminal.intelligence) {
      items.push(
        entry({
          id: `intel-${intel.id}`,
          category: "intelligence",
          coin: intel.coin,
          title: intel.title,
          snippet: intel.detail,
          timestamp: intel.timestamp,
          relevanceBoost: intel.severity === "critical" ? 1.8 : 1,
          routeWidget: "intelligence",
          routeCoin: intel.coin,
        }),
      );
    }

    for (const wire of atmosphere.wire) {
      const cat: IndexCategory =
        wire.channel === "macro" ? "macro" : wire.channel === "on-chain" ? "whale" : "narrative";
      items.push(
        entry({
          id: `wire-${wire.id}`,
          category: cat,
          coin: wire.coin,
          title: wire.headline,
          snippet: `${wire.channel} · ${wire.direction} · conf ${wire.confidenceIndex}`,
          timestamp: wire.timestamp,
          relevanceBoost: wire.severity === "critical" ? 2 : wire.isNew ? 1.5 : 1,
          routeWidget: "intelligence",
          routeCoin: wire.coin,
        }),
      );
    }

    for (const macro of atmosphere.macro) {
      items.push(
        entry({
          id: `macro-${macro.symbol}`,
          category: "macro",
          coin: null,
          title: macro.label,
          snippet: `${macro.last} · ${macro.changePct >= 0 ? "+" : ""}${macro.changePct.toFixed(2)}%`,
          timestamp: macro.updatedAt,
          relevanceBoost: 1.2,
          routeWidget: "macro",
          routeCoin: null,
        }),
      );
    }

    for (const sig of agentic.signals.slice(0, 40)) {
      const cat: IndexCategory =
        sig.agentId === "whale"
          ? "whale"
          : sig.agentId === "narrative"
            ? "narrative"
            : "agent";
      items.push(
        entry({
          id: `agent-${sig.id}`,
          category: cat,
          coin: sig.coin,
          title: `${sig.agentId.toUpperCase()} · ${sig.stance}`,
          snippet: sig.thesis,
          timestamp: sig.timestamp,
          relevanceBoost: sig.confidence,
          routeWidget: "proactive",
          routeCoin: sig.coin,
        }),
      );
    }

    const cmds: Array<{ cmd: string; desc: string; widget: string }> = [
      { cmd: "/nav", desc: "Jump to asset", widget: "chart" },
      { cmd: "/watch", desc: "Add to surveillance watchlist", widget: "surveillance" },
      { cmd: "/intel", desc: "Search intelligence index", widget: "intelligence" },
      { cmd: "/liq", desc: "Liquidity & book context", widget: "hyperbook" },
      { cmd: "/macro", desc: "Macro matrix", widget: "macro" },
      { cmd: "/vol", desc: "Volatility & stress", widget: "surveillance" },
      { cmd: "/summarize", desc: "AI event summary (no trade advice)", widget: "copilot" },
      { cmd: "/graph", desc: "Query market knowledge graph", widget: "knowledgegraph" },
      { cmd: "/journal", desc: "Operator journal & session notes", widget: "operatorjournal" },
      { cmd: "/research", desc: "Research workspace & theses", widget: "research" },
      { cmd: "/workspace", desc: "Open unified asset workspace", widget: "chart" },
      { cmd: "/briefing", desc: "Daily market briefing", widget: "dailyops" },
      { cmd: "/coverage", desc: "Market coverage & proprietary data", widget: "marketcoverage" },
      { cmd: "/reliability", desc: "Runtime + data trust operations", widget: "reliability" },
      { cmd: "/newswire", desc: "Live market newswire & distribution", widget: "newswire" },
      { cmd: "/ingest", desc: "Data ingestion & normalization", widget: "ingestion" },
      { cmd: "/intelengine", desc: "Real-time market intelligence engine", widget: "intelengine" },
      { cmd: "/collab", desc: "Team collaboration & shared workflows", widget: "collab" },
      { cmd: "/team", desc: "Team net desk & peer mesh", widget: "teamdesk" },
      { cmd: "/enterprise", desc: "Enterprise operations & institutional management", widget: "enterpriseops" },
      { cmd: "/integrations", desc: "Industry integrations & embeddable infrastructure", widget: "integrations" },
      { cmd: "/propintel", desc: "Proprietary market intelligence & EQ metrics", widget: "propintel" },
      { cmd: "/ecosystem", desc: "Crypto financial operating ecosystem", widget: "ecosystem" },
      {
        cmd: "/globalstrategy",
        desc: "Global infrastructure execution strategy",
        widget: "globalstrategy",
      },
      { cmd: "/incidents", desc: "Market incident monitor", widget: "newswire" },
      { cmd: "/routine", desc: "Launch operational routine", widget: "dailyops" },
      { cmd: "/trade", desc: "Prefill execution ticket", widget: "ticket" },
    ];
    for (const c of cmds) {
      if (!wedgeAllowsCommand(c.cmd)) continue;
      items.push(
        entry({
          id: `cmd-${c.cmd}`,
          category: "command",
          coin: null,
          title: c.cmd,
          snippet: c.desc,
          timestamp: now,
          relevanceBoost: 0.8,
          routeWidget: c.widget,
          routeCoin: null,
          keywords: c.cmd.split(/\s+/),
        }),
      );
    }

    return items;
  }
}
