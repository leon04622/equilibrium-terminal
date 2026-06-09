import {
  WEDGE_ADVANCED_COMMANDS,
  WEDGE_V1_COMMANDS,
  isAdvancedWidget,
} from "@/lib/wedge/WedgeManifest";
import { useWedgeStore } from "@/store/useWedgeStore";

export function wedgeAllowsCommand(cmd: string): boolean {
  if (!useWedgeStore.getState().deskFocusMode) return true;
  const base = cmd.split(/\s+/)[0]?.toLowerCase() ?? cmd;
  if (WEDGE_V1_COMMANDS.has(base)) return true;
  if (!WEDGE_ADVANCED_COMMANDS.has(base)) return true;
  return false;
}

export function wedgeResolveWidget(widgetId: string): string {
  if (!useWedgeStore.getState().deskFocusMode) return widgetId;
  if (!isAdvancedWidget(widgetId)) return widgetId;
  return "chart";
}
