/** OmniBar — institutional command layer (human trader in control). */

export type OmniIntent =
  | { type: "NAV_ASSET"; coin: string; raw: string; path: "fast" }
  | {
      type: "TRADE_PREFILL";
      side: "buy" | "sell";
      coin: string;
      size: number;
      raw: string;
      path: "fast";
    }
  | { type: "TICKER_SELECT"; query: string; raw: string; path: "fast" }
  | { type: "AI_SEMANTIC_QUERY"; prompt: string; raw: string; path: "semantic" }
  | { type: "NETWORK_GRAPH_QUERY"; prompt: string; raw: string; path: "semantic" }
  | { type: "WATCHLIST_ADD"; coin: string; raw: string; path: "fast" }
  | { type: "WATCHLIST_REMOVE"; coin: string; raw: string; path: "fast" }
  | { type: "FOCUS_WIDGET"; widgetId: string; coin?: string; raw: string; path: "fast" }
  | { type: "INDEX_SELECT"; entryId: string; raw: string; path: "fast" }
  | { type: "SUMMARIZE_CONTEXT"; coin: string; raw: string; path: "semantic" }
  | { type: "GRAPH_QUERY"; prompt: string; raw: string; path: "semantic" }
  | {
      type: "WORKFLOW_OPEN_ASSET";
      coin: string;
      mode?: string;
      raw: string;
      path: "fast";
    }
  | { type: "LAUNCH_ROUTINE"; routineId: string; raw: string; path: "fast" }
  | { type: "WEDGE_LAYOUT"; deskFocus: boolean; raw: string; path: "fast" }
  | {
      type: "SET_TERMINAL_MODE";
      mode: string;
      raw: string;
      path: "fast";
    }
  | { type: "COMMAND_HELP"; raw: string; path: "fast" }
  | {
      type: "EXEC_SHORTCUT";
      side: "buy" | "sell";
      coin: string;
      size?: number;
      raw: string;
      path: "fast";
    }
  | {
      type: "EXPLAIN_MODE";
      toggle?: boolean;
      active?: boolean;
      raw: string;
      path: "fast";
    }
  | { type: "WEDGE_BLOCKED"; command: string; message: string; raw: string; path: "fast" }
  | {
      type: "OMNI_GUIDANCE";
      message: string;
      widgetId?: string;
      raw: string;
      path: "fast";
    };
