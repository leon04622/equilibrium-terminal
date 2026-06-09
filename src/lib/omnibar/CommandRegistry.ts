import { wedgeAllowsCommand } from "@/lib/wedge/wedgeAccess";
import type { CommandDefinition, CommandSuggestion } from "@/types/command-system";

const COMMANDS: CommandDefinition[] = [
  {
    id: "nav",
    primary: "/nav",
    aliases: ["go", "open"],
    label: "Navigate asset",
    description: "Select asset and focus chart",
    category: "asset",
    template: "/nav BTC",
  },
  {
    id: "chart",
    primary: "/chart",
    aliases: ["c"],
    label: "Chart",
    description: "Open chart for asset",
    category: "asset",
    template: "/chart BTC",
  },
  {
    id: "depth",
    primary: "/depth",
    aliases: ["book", "l2"],
    label: "Depth",
    description: "Order book / DOM view",
    category: "asset",
    template: "/depth ETH",
  },
  {
    id: "liq",
    primary: "/liq",
    aliases: ["liquidity"],
    label: "Liquidity",
    description: "HyperBook L2 context",
    category: "intelligence",
    template: "/liq SOL",
  },
  {
    id: "trade",
    primary: "/trade",
    aliases: ["/exec"],
    label: "Trade ticket",
    description: "Prefill execution ticket",
    category: "execution",
    template: "/trade buy BTC 0.5",
  },
  {
    id: "exec",
    primary: "/exec",
    aliases: [],
    label: "Execute",
    description: "Alias for trade prefill",
    category: "execution",
    template: "/exec buy BTC 0.5",
  },
  {
    id: "watch",
    primary: "/watch",
    aliases: ["add"],
    label: "Watchlist add",
    description: "Add coin to surveillance watchlist",
    category: "monitor",
    template: "/watch BTC",
  },
  {
    id: "alerts",
    primary: "/alerts",
    aliases: ["/alert"],
    label: "Alerts",
    description: "Open alert panel for asset",
    category: "monitor",
    template: "/alerts BTC",
  },
  {
    id: "monitor",
    primary: "/monitor",
    aliases: ["/mon"],
    label: "Monitor",
    description: "Surveillance / funding monitor",
    category: "monitor",
    template: "/monitor funding",
  },
  {
    id: "intel",
    primary: "/intel",
    aliases: ["/intel market"],
    label: "Intelligence",
    description: "Tape and intelligence wire",
    category: "intelligence",
    template: "/intel",
  },
  {
    id: "summarize",
    primary: "/summarize",
    aliases: ["/sum"],
    label: "Summarize",
    description: "AI context summary — no trade advice",
    category: "intelligence",
    template: "/summarize BTC",
  },
  {
    id: "workspace",
    primary: "/workspace",
    aliases: ["ws"],
    label: "Workspace",
    description: "Open asset workspace mode",
    category: "workspace",
    template: "/workspace BTC execution",
  },
  {
    id: "journal",
    primary: "/journal",
    aliases: ["notes"],
    label: "Journal",
    description: "Trader notes",
    category: "workspace",
    template: "/journal",
    wedgeGated: true,
  },
  {
    id: "coverage",
    primary: "/coverage",
    aliases: ["/markets"],
    label: "Market coverage",
    description: "Venues and cross-market visibility",
    category: "monitor",
    template: "/coverage",
    wedgeGated: true,
  },
  {
    id: "reliability",
    primary: "/reliability",
    aliases: ["/trust"],
    label: "Reliability",
    description: "Runtime and data trust",
    category: "system",
    template: "/reliability",
  },
  {
    id: "desk",
    primary: "/desk",
    aliases: ["focus"],
    label: "Execution desk",
    description: "V1 wedge layout",
    category: "workspace",
    template: "/desk",
  },
  {
    id: "expand",
    primary: "/expand",
    aliases: ["full"],
    label: "Expand platform",
    description: "Full multi-phase workspace",
    category: "workspace",
    template: "/expand",
  },
  {
    id: "help",
    primary: "/help",
    aliases: [],
    label: "Command help",
    description: "List operational commands",
    category: "system",
    template: "/help",
  },
  {
    id: "guide",
    primary: "/guide",
    aliases: ["explain"],
    label: "Operator guide",
    description: "Explain mode & institutional education desk",
    category: "system",
    template: "/guide",
  },
];

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 0);
}

export class CommandRegistry {
  static list(): CommandDefinition[] {
    return COMMANDS.filter((c) => !c.wedgeGated || wedgeAllowsCommand(c.primary));
  }

  static get(id: string): CommandDefinition | undefined {
    return COMMANDS.find((c) => c.id === id);
  }

  /** Fuzzy suggest commands for autocomplete. */
  static suggest(query: string, limit = 12): CommandSuggestion[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return CommandRegistry.list()
        .slice(0, limit)
        .map((command) => ({ command, score: 1, matchedAlias: command.primary }));
    }

    const out: CommandSuggestion[] = [];
    for (const command of CommandRegistry.list()) {
      let score = 0;
      let matchedAlias = command.primary;
      const primary = command.primary.toLowerCase();
      const label = command.label.toLowerCase();

      if (primary === q || primary.startsWith(q)) {
        score = primary === q ? 200 : 120;
      } else if (label.includes(q)) {
        score = 60;
      }

      for (const alias of command.aliases) {
        const a = alias.toLowerCase();
        if (a === q || primary.startsWith(q) || q.startsWith(a)) {
          score = Math.max(score, 80);
          matchedAlias = alias;
        }
      }

      for (const t of tokenize(q)) {
        if (primary.includes(t)) score += 15;
        if (label.includes(t)) score += 8;
        if (command.description.toLowerCase().includes(t)) score += 4;
      }

      if (score > 0) out.push({ command, score, matchedAlias });
    }

    return out.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /** Expand alias to primary command prefix when user types shorthand. */
  static resolveInput(raw: string): string {
    const input = raw.trim();
    const lower = input.toLowerCase();

    if (lower === "?" || lower === "help") return "/help";

    for (const command of COMMANDS) {
      if (lower === command.id || lower === command.primary.slice(1)) {
        return `${command.primary} `;
      }
      for (const alias of command.aliases) {
        if (lower === alias || lower === `/${alias}`) {
          return `${command.primary} `;
        }
      }
    }

    return input;
  }
}
