import {
  WEDGE_ADVANCED_COMMANDS,
  WEDGE_V1_COMMANDS,
} from "@/lib/wedge/WedgeManifest";
import { useWedgeStore } from "@/store/useWedgeStore";

export function wedgeAllowsCommand(cmd: string): boolean {
  if (!useWedgeStore.getState().deskFocusMode) return true;
  const base = cmd.split(/\s+/)[0]?.toLowerCase() ?? cmd;
  if (WEDGE_V1_COMMANDS.has(base)) return true;
  if (!WEDGE_ADVANCED_COMMANDS.has(base)) return true;
  return false;
}

/** Returns the blocked advanced command token, if any. */
export function wedgeBlockedCommand(input: string): string | null {
  if (!useWedgeStore.getState().deskFocusMode) return null;
  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) return null;
  const cmd = trimmed.split(/\s+/)[0]?.toLowerCase() ?? "";
  if (!WEDGE_ADVANCED_COMMANDS.has(cmd)) return null;
  if (wedgeAllowsCommand(cmd)) return null;
  return cmd;
}

export function wedgeBlockedMessage(cmd: string): string {
  return `Command ${cmd} is locked on the execution desk. Run /expand to open the full platform.`;
}

/** Focus targets pin into the grid when missing — no silent remap to chart. */
export function wedgeResolveWidget(widgetId: string): string {
  return widgetId;
}
