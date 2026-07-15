const STORAGE_KEY = "eq-workspace-ui-v1";

const RESTORABLE_PANELS = new Set([
  "chart",
  "hyperbook",
  "intelligence",
  "copilot",
  "proactive",
  "macro",
  "ticket",
  "positions",
  "alerts",
]);

interface WorkspaceUiPrefs {
  maximizedPanelId: string | null;
}

function load(): WorkspaceUiPrefs {
  if (typeof window === "undefined") return { maximizedPanelId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { maximizedPanelId: null };
    const parsed = JSON.parse(raw) as Partial<WorkspaceUiPrefs>;
    const id = parsed.maximizedPanelId;
    if (typeof id === "string" && RESTORABLE_PANELS.has(id)) {
      return { maximizedPanelId: id };
    }
  } catch {
    /* ignore */
  }
  return { maximizedPanelId: null };
}

export function loadMaximizedPanelId(): string | null {
  return load().maximizedPanelId;
}

export function saveMaximizedPanelId(panelId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ maximizedPanelId: panelId }),
    );
  } catch {
    /* ignore */
  }
}

export function isRestorablePanelId(panelId: string): boolean {
  return RESTORABLE_PANELS.has(panelId);
}
