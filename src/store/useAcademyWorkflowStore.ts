import { create } from "zustand";
import {
  DAY_ONE_OPERATOR_WORKFLOW,
  GRADUATION_DAILY_WORKFLOW,
  type AcademyWorkflow,
} from "@/lib/education/academyWorkflowPaths";

export interface WorkflowProgress {
  completed: boolean;
  lastStep: number;
  completedAt: number | null;
}

function loadProgress(key: string): WorkflowProgress {
  if (typeof window === "undefined") {
    return { completed: false, lastStep: 0, completedAt: null };
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { completed: false, lastStep: 0, completedAt: null };
    const p = JSON.parse(raw) as Partial<WorkflowProgress>;
    return {
      completed: Boolean(p.completed),
      lastStep: Number.isFinite(p.lastStep) ? Number(p.lastStep!) : 0,
      completedAt: typeof p.completedAt === "number" ? p.completedAt : null,
    };
  } catch {
    return { completed: false, lastStep: 0, completedAt: null };
  }
}

function saveProgress(key: string, p: WorkflowProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export interface AcademyWorkflowState {
  active: boolean;
  workflow: AcademyWorkflow | null;
  stepIndex: number;
  dayOne: WorkflowProgress;
  graduation: WorkflowProgress;

  start: (workflow: AcademyWorkflow, fromStep?: number) => void;
  close: () => void;
  setStep: (index: number) => void;
  markStep: (index: number) => void;
  markCompleted: () => void;
}

export const useAcademyWorkflowStore = create<AcademyWorkflowState>((set, get) => ({
  active: false,
  workflow: null,
  stepIndex: 0,
  dayOne: loadProgress(DAY_ONE_OPERATOR_WORKFLOW.storageKey),
  graduation: loadProgress(GRADUATION_DAILY_WORKFLOW.storageKey),

  start: (workflow, fromStep = 0) =>
    set({
      active: true,
      workflow,
      stepIndex: fromStep,
    }),

  close: () => set({ active: false, workflow: null }),

  setStep: (index) => set({ stepIndex: index }),

  markStep: (index) => {
    const { workflow } = get();
    if (!workflow) return;
    const slice =
      workflow.id === DAY_ONE_OPERATOR_WORKFLOW.id ? "dayOne" : "graduation";
    const prev = get()[slice];
    const next = { ...prev, lastStep: Math.max(prev.lastStep, index) };
    saveProgress(workflow.storageKey, next);
    set({ [slice]: next } as Pick<AcademyWorkflowState, "dayOne" | "graduation">);
  },

  markCompleted: () => {
    const { workflow, stepIndex } = get();
    if (!workflow) return;
    const slice =
      workflow.id === DAY_ONE_OPERATOR_WORKFLOW.id ? "dayOne" : "graduation";
    const next: WorkflowProgress = {
      completed: true,
      lastStep: Math.max(stepIndex, workflow.steps.length - 1),
      completedAt: Date.now(),
    };
    saveProgress(workflow.storageKey, next);
    set({ [slice]: next } as Pick<AcademyWorkflowState, "dayOne" | "graduation">);
  },
}));
