import type { OrganizationalPlaybook } from "@/types/enterprise-operations";

export class OrganizationalKnowledgeEngine {
  static playbooks(): OrganizationalPlaybook[] {
    const now = Date.now();
    const playbooks: OrganizationalPlaybook[] = [
      {
        id: "kb-playbook-01",
        title: "Liquidation cascade response playbook",
        category: "playbook",
        summary: "Escalation tiers, execution routing, and treasury buffer activation procedures.",
        authorHandle: "OPS DESK",
        tags: ["liquidation", "risk", "execution"],
        archivedAt: now - 604_800_000,
      },
      {
        id: "kb-event-01",
        title: "ETF flow shock — post-mortem analysis",
        category: "event_analysis",
        summary: "Desk reaction timeline, slippage attribution, and hedge effectiveness review.",
        authorHandle: "MACRO COMMAND",
        tags: ["ETF", "macro", "BTC"],
        archivedAt: now - 432_000_000,
      },
      {
        id: "kb-exec-01",
        title: "HYPE funding squeeze — execution review",
        category: "execution_review",
        summary: "Limit routing performance vs market orders during volatility spike.",
        authorHandle: "EXEC DESK A",
        tags: ["HYPE", "execution", "funding"],
        archivedAt: now - 259_200_000,
      },
      {
        id: "kb-react-01",
        title: "Stablecoin depeg scenario — market reaction archive",
        category: "market_reaction",
        summary: "Historical response patterns and treasury rebalancing triggers.",
        authorHandle: "TREASURY OPS",
        tags: ["stablecoin", "treasury", "risk"],
        archivedAt: now - 864_000_000,
      },
    ];

    return playbooks.sort((a, b) => b.archivedAt - a.archivedAt);
  }
}
