import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { WEDGE_DEFAULT_MODE } from "@/lib/wedge/WedgeManifest";
import type {
  CognitiveLoadModel,
  FocusMode,
  LayoutOrchestrationResult,
  TerminalMode,
  WorkspaceContextSnapshot,
} from "@/types/adaptive-workspace";

export type PanelEmphasis = "high" | "medium" | "low" | "muted";

export interface AdaptiveWorkspaceState {
  mode: TerminalMode;
  focusMode: FocusMode;
  autoAdapt: boolean;
  userLockedUntil: number;
  context: WorkspaceContextSnapshot | null;
  cognitiveLoad: CognitiveLoadModel | null;
  lastOrchestration: LayoutOrchestrationResult | null;
  panelEmphasis: Record<string, PanelEmphasis>;
  collapsedPanelIds: string[];
  hiddenPanelIds: string[];

  setMode: (mode: TerminalMode) => void;
  setFocusMode: (focus: FocusMode) => void;
  setAutoAdapt: (on: boolean) => void;
  lockUserLayout: (durationMs?: number) => void;
  ingestOrchestration: (
    result: LayoutOrchestrationResult,
    context: WorkspaceContextSnapshot,
    cognitive: CognitiveLoadModel,
    emphasis: Record<string, PanelEmphasis>,
  ) => void;
  clearFocus: () => void;
}

export const useAdaptiveWorkspaceStore = create<AdaptiveWorkspaceState>()(
  subscribeWithSelector((set) => ({
    mode: WEDGE_DEFAULT_MODE,
    focusMode: "none",
    autoAdapt: false,
    userLockedUntil: 0,
    context: null,
    cognitiveLoad: null,
    lastOrchestration: null,
    panelEmphasis: {},
    collapsedPanelIds: [],
    hiddenPanelIds: [],

    setMode: (mode) => set({ mode, focusMode: "none" }),
    setFocusMode: (focusMode) => set({ focusMode }),
    setAutoAdapt: (autoAdapt) => set({ autoAdapt }),
    lockUserLayout: (durationMs = 300_000) =>
      set({ userLockedUntil: Date.now() + durationMs }),
    clearFocus: () => set({ focusMode: "none" }),
    ingestOrchestration: (result, context, cognitive, emphasis) =>
      set({
        lastOrchestration: result,
        context,
        cognitiveLoad: cognitive,
        panelEmphasis: emphasis,
        collapsedPanelIds: result.collapsedPanelIds,
        hiddenPanelIds: result.hiddenPanelIds,
      }),
  })),
);
