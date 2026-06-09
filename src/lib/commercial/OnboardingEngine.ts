import type { OnboardingStep, OnboardingStepId } from "@/types/commercial-product";

const STORAGE_KEY = "eq-onboarding-v1";

const STEP_DEFS: Omit<OnboardingStep, "completed" | "completedAt">[] = [
  {
    id: "welcome",
    title: "Welcome to Equilibrium",
    detail: "Institutional crypto operating environment — human trader remains central.",
    required: true,
  },
  {
    id: "workspace_template",
    title: "Workspace template",
    detail: "Start with HL Execution Desk or expand to full multi-panel workspace.",
    required: true,
  },
  {
    id: "exchange_connect",
    title: "Exchange connection",
    detail: "Connect wallet and approve Hyperliquid agent for execution.",
    required: true,
  },
  {
    id: "keyboard_shortcuts",
    title: "Keyboard workflow",
    detail: "Ctrl+K OmniBar · density controls in experience bar.",
    required: false,
  },
  {
    id: "omnibar",
    title: "OmniBar commands",
    detail: "/chart /depth /exec /desk /expand /help — command-first navigation.",
    required: false,
  },
  {
    id: "intel_feed",
    title: "Intelligence feed",
    detail: "Tape, whale flow, liquidation clusters on selected coin.",
    required: false,
  },
  {
    id: "execution_desk",
    title: "Execution desk",
    detail: "Ticket, DOM ladder, slippage radar — execution-aware workflow.",
    required: true,
  },
  {
    id: "expand_workspace",
    title: "Expand workspace",
    detail: "EXPAND unlocks reliability, enterprise, and research modules.",
    required: false,
  },
  {
    id: "complete",
    title: "Session ready",
    detail: "Operational baseline established. Review PRODUCT panel for packaging.",
    required: true,
  },
];

interface StoredProgress {
  completed: OnboardingStepId[];
  dismissedAt: number | null;
}

function readStored(): StoredProgress {
  if (typeof window === "undefined") return { completed: [], dismissedAt: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [], dismissedAt: null };
    return JSON.parse(raw) as StoredProgress;
  } catch {
    return { completed: [], dismissedAt: null };
  }
}

function writeStored(data: StoredProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export class OnboardingEngine {
  static steps(): OnboardingStep[] {
    const stored = readStored();
    const now = Date.now();
    return STEP_DEFS.map((s) => {
      const done = stored.completed.includes(s.id);
      return {
        ...s,
        completed: done,
        completedAt: done ? now : null,
      };
    });
  }

  static completionPct(): number {
    const steps = OnboardingEngine.steps();
    const required = steps.filter((s) => s.required);
    if (required.length === 0) return 100;
    const done = required.filter((s) => s.completed).length;
    return Math.round((done / required.length) * 100);
  }

  static isDismissed(): boolean {
    return readStored().dismissedAt !== null;
  }

  static dismiss(): void {
    const stored = readStored();
    writeStored({ ...stored, dismissedAt: Date.now() });
  }

  static completeStep(id: OnboardingStepId): void {
    const stored = readStored();
    if (!stored.completed.includes(id)) {
      writeStored({ ...stored, completed: [...stored.completed, id] });
    }
  }

  static shouldShowWalkthrough(): boolean {
    if (OnboardingEngine.isDismissed()) return false;
    return OnboardingEngine.completionPct() < 100;
  }

  static autoProgressHints(opts: {
    walletConnected: boolean;
    deskFocusMode: boolean;
    omniUsed: boolean;
  }): void {
    OnboardingEngine.completeStep("welcome");
    if (opts.deskFocusMode) OnboardingEngine.completeStep("workspace_template");
    if (opts.walletConnected) OnboardingEngine.completeStep("exchange_connect");
    if (opts.omniUsed) OnboardingEngine.completeStep("omnibar");
    if (opts.deskFocusMode) OnboardingEngine.completeStep("execution_desk");
  }
}
