/** Phase 35 — OmniBar command system & global information retrieval. */

export type CommandCategory =
  | "asset"
  | "execution"
  | "intelligence"
  | "workspace"
  | "monitor"
  | "system";

export interface CommandDefinition {
  id: string;
  primary: string;
  aliases: string[];
  label: string;
  description: string;
  category: CommandCategory;
  /** Canonical command with placeholders for display */
  template: string;
  wedgeGated?: boolean;
}

export interface CommandSuggestion {
  command: CommandDefinition;
  score: number;
  matchedAlias: string;
}

export interface OmniOperationalContext {
  selectedCoin: string;
  selectedSymbol: string;
  connectionStatus: string;
  terminalMode: string;
  deskFocusMode: boolean;
  watchlist: string[];
  recentCommands: string[];
}
