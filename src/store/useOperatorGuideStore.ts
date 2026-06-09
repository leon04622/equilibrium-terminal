import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { OperatorGuideTelemetryEngine } from "@/lib/operator-guide/OperatorGuideTelemetry";
import type {
  ActiveReplayState,
  ExplainAudience,
  ExplainLabel,
  OperatorGuideSnapshot,
  WorkflowId,
} from "@/types/operator-guide";

const PREFS_KEY = "eq-operator-guide-prefs-v1";

interface StoredPrefs {
  explainModeActive: boolean;
  selectedAudience: ExplainAudience;
}

function loadPrefs(): StoredPrefs {
  if (typeof window === "undefined") return { explainModeActive: false, selectedAudience: "advanced" };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { explainModeActive: false, selectedAudience: "advanced" };
    return { explainModeActive: false, selectedAudience: "advanced", ...JSON.parse(raw) };
  } catch {
    return { explainModeActive: false, selectedAudience: "advanced" };
  }
}

function savePrefs(prefs: StoredPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export interface OperatorGuideStoreState {
  explainModeActive: boolean;
  selectedAudience: ExplainAudience;
  sidePanelOpen: boolean;
  selectedTargetId: string | null;
  activeWorkflowId: WorkflowId | null;
  activeWorkflowStep: number;
  activeReplay: ActiveReplayState | null;
  snapshot: OperatorGuideSnapshot | null;
  snapshotVersion: number;

  activeLessonPanelId: string | null;
  lessonStepIndex: number;
  highlightPanelId: string | null;

  /** PHASE 1 — Guided Focus Mode: dim everything except the learning target. */
  focusModeActive: boolean;
  /** PHASE 4 — labels drawn on the focused panel for the current step. */
  focusLabels: ExplainLabel[];

  hydrate: () => void;
  toggleExplainMode: () => void;
  setExplainMode: (active: boolean) => void;
  setSelectedAudience: (audience: ExplainAudience) => void;
  setSidePanelOpen: (open: boolean) => void;
  selectTarget: (targetId: string | null) => void;
  startWorkflow: (id: WorkflowId) => void;
  advanceWorkflow: () => void;
  clearWorkflow: () => void;
  setActiveReplay: (replay: ActiveReplayState | null) => void;
  incrementReplays: () => void;
  setSnapshot: (snapshot: OperatorGuideSnapshot) => void;
  bumpSnapshot: () => void;

  startLesson: (panelId: string) => void;
  setLessonStep: (index: number) => void;
  endLesson: () => void;
  setHighlightPanel: (panelId: string | null) => void;
  setFocusMode: (active: boolean) => void;
  toggleFocusMode: () => void;
  setFocusLabels: (labels: ExplainLabel[]) => void;
}

export const useOperatorGuideStore = create<OperatorGuideStoreState>()(
  subscribeWithSelector((set, get) => ({
    ...loadPrefs(),
    sidePanelOpen: false,
    selectedTargetId: null,
    activeWorkflowId: null,
    activeWorkflowStep: 0,
    activeReplay: null,
    snapshot: null,
    snapshotVersion: 0,

    activeLessonPanelId: null,
    lessonStepIndex: 0,
    highlightPanelId: null,
    focusModeActive: false,
    focusLabels: [],

    hydrate: () => set(loadPrefs()),

    toggleExplainMode: () => {
      const next = !get().explainModeActive;
      savePrefs({ explainModeActive: next, selectedAudience: get().selectedAudience });
      set({
        explainModeActive: next,
        sidePanelOpen: next ? get().sidePanelOpen : get().sidePanelOpen,
      });
    },

    setExplainMode: (explainModeActive) => {
      savePrefs({ explainModeActive, selectedAudience: get().selectedAudience });
      set({ explainModeActive });
    },
    setSelectedAudience: (selectedAudience) => {
      savePrefs({ explainModeActive: get().explainModeActive, selectedAudience });
      set({ selectedAudience });
    },

    setSidePanelOpen: (sidePanelOpen) => set({ sidePanelOpen }),

    selectTarget: (selectedTargetId) =>
      set({
        selectedTargetId,
        sidePanelOpen: selectedTargetId != null,
      }),

    startWorkflow: (activeWorkflowId) =>
      set({ activeWorkflowId, activeWorkflowStep: 0, sidePanelOpen: true }),

    advanceWorkflow: () =>
      set((s) => ({ activeWorkflowStep: s.activeWorkflowStep + 1 })),

    clearWorkflow: () =>
      set({ activeWorkflowId: null, activeWorkflowStep: 0 }),

    setActiveReplay: (activeReplay) => set({ activeReplay }),

    incrementReplays: () => {
      OperatorGuideTelemetryEngine.recordReplay();
      set((s) => ({ snapshotVersion: s.snapshotVersion + 1 }));
    },

    setSnapshot: (snapshot) => set({ snapshot }),

    bumpSnapshot: () => set((s) => ({ snapshotVersion: s.snapshotVersion + 1 })),

    startLesson: (panelId) =>
      set({
        activeLessonPanelId: panelId,
        lessonStepIndex: 0,
        explainModeActive: true,
        sidePanelOpen: true,
        selectedTargetId: panelId,
        // A guided lesson is the canonical reason to control attention.
        focusModeActive: true,
      }),

    setLessonStep: (lessonStepIndex) => set({ lessonStepIndex }),

    endLesson: () =>
      set({
        activeLessonPanelId: null,
        lessonStepIndex: 0,
        highlightPanelId: null,
        focusModeActive: false,
        focusLabels: [],
      }),

    setHighlightPanel: (highlightPanelId) => set({ highlightPanelId }),

    setFocusMode: (focusModeActive) =>
      set(focusModeActive ? { focusModeActive } : { focusModeActive, focusLabels: [] }),

    toggleFocusMode: () =>
      set((s) =>
        s.focusModeActive
          ? { focusModeActive: false, focusLabels: [] }
          : { focusModeActive: true },
      ),

    setFocusLabels: (focusLabels) => set({ focusLabels }),
  })),
);
