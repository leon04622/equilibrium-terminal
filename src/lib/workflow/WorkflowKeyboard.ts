/** Keyboard-first workflow bindings (professional terminal speed). */

export interface WorkflowShortcut {
  id: string;
  keys: string;
  label: string;
  action: string;
}

export const WORKFLOW_SHORTCUTS: WorkflowShortcut[] = [
  { id: "palette", keys: "Ctrl+K", label: "Command palette", action: "omni:open" },
  { id: "journal", keys: "Ctrl+J", label: "Trader journal", action: "focus:journal" },
  { id: "research", keys: "Ctrl+R", label: "Research workspace", action: "focus:research" },
  { id: "surveillance", keys: "Ctrl+M", label: "Market surveillance", action: "focus:surveillance" },
  { id: "ticket", keys: "Ctrl+E", label: "Execution ticket", action: "focus:ticket" },
  { id: "chart", keys: "Ctrl+1", label: "Chart focus", action: "focus:chart" },
  { id: "book", keys: "Ctrl+2", label: "Order book", action: "focus:hyperbook" },
  { id: "cycle", keys: "Ctrl+]", label: "Cycle panel", action: "workflow:cycle-panel" },
  { id: "workspace", keys: "Ctrl+Shift+W", label: "Asset workspace", action: "workflow:asset-workspace" },
];
