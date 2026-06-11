import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { MarketContextStampEngine } from "@/lib/operator-journal/MarketContextStampEngine";
import type {
  BehavioralFlagKind,
  DecisionEntry,
  DecisionKind,
  EmotionalState,
  OperatorJournalSnapshot,
  OperatorSession,
} from "@/types/operator-journal";

export interface ActiveReplay {
  decision: DecisionEntry;
  flagKind: BehavioralFlagKind | null;
}

const SESSION_KEY = "eq-operator-session-v1";
const HISTORY_KEY = "eq-operator-history-v1";
const DECISIONS_KEY = "eq-operator-decisions-v1";

const SESSION_GAP_MS = 4 * 60 * 60_000; // new session if idle > 4h

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

function newSession(): OperatorSession {
  return {
    id: uid("session"),
    startedAt: Date.now(),
    endedAt: null,
    durationMs: 0,
    decisionsCount: 0,
    regimesParticipated: [],
    volatilityExposure: [],
    liquidityConditions: [],
    macroParticipation: false,
    peakStressLabel: "normal",
  };
}

export type OperatorJournalTab = "session" | "log" | "exec" | "behavior" | "review" | "patterns";

export interface OperatorJournalState {
  session: OperatorSession;
  history: OperatorSession[];
  decisions: DecisionEntry[];
  snapshot: OperatorJournalSnapshot | null;
  activeReplay: ActiveReplay | null;
  activeTab: OperatorJournalTab;

  hydrate: () => void;
  setActiveTab: (tab: OperatorJournalTab) => void;
  ensureSession: () => void;
  logDecision: (input: {
    coin: string;
    kind: DecisionKind;
    thesis: string;
    confidence: number;
    emotion: EmotionalState;
    riskNote: string;
  }) => void;
  observeContext: () => void;
  endSession: () => void;
  setSnapshot: (snapshot: OperatorJournalSnapshot) => void;
  openReplay: (decision: DecisionEntry, flagKind?: BehavioralFlagKind | null) => void;
  closeReplay: () => void;
  addReflection: (decisionId: string, reflection: string) => void;
}

export const useOperatorJournalStore = create<OperatorJournalState>()(
  subscribeWithSelector((set, get) => ({
    session: newSession(),
    history: [],
    decisions: [],
    snapshot: null,
    activeReplay: null,
    activeTab: "session",

    setActiveTab: (activeTab) => set({ activeTab }),

    hydrate: () => {
      const history = read<OperatorSession[]>(HISTORY_KEY, []);
      const storedSession = read<OperatorSession | null>(SESSION_KEY, null);
      const storedDecisions = read<DecisionEntry[]>(DECISIONS_KEY, []);

      if (storedSession && Date.now() - storedSession.startedAt < SESSION_GAP_MS) {
        set({ session: storedSession, history, decisions: storedDecisions });
      } else {
        // Roll prior session into history if it existed.
        const nextHistory = storedSession
          ? [{ ...storedSession, endedAt: storedSession.endedAt ?? Date.now() }, ...history].slice(0, 60)
          : history;
        const s = newSession();
        write(SESSION_KEY, s);
        write(HISTORY_KEY, nextHistory);
        write(DECISIONS_KEY, []);
        set({ session: s, history: nextHistory, decisions: [] });
      }
    },

    ensureSession: () => {
      const s = get().session;
      if (Date.now() - s.startedAt >= SESSION_GAP_MS) {
        get().endSession();
      }
    },

    logDecision: (input) => {
      const context = MarketContextStampEngine.stamp();
      const decision: DecisionEntry = {
        id: uid("dec"),
        at: Date.now(),
        coin: input.coin.toUpperCase(),
        kind: input.kind,
        thesis: input.thesis,
        confidence: Math.max(1, Math.min(5, input.confidence)),
        emotion: input.emotion,
        riskNote: input.riskNote,
        context,
      };
      set((st) => {
        const decisions = [decision, ...st.decisions].slice(0, 200);
        const session: OperatorSession = {
          ...st.session,
          decisionsCount: st.session.decisionsCount + 1,
          regimesParticipated: Array.from(
            new Set([...st.session.regimesParticipated, context.regime]),
          ),
          volatilityExposure: Array.from(
            new Set([...st.session.volatilityExposure, context.volatilityState]),
          ),
          liquidityConditions: Array.from(
            new Set([...st.session.liquidityConditions, context.liquidityState]),
          ),
        };
        write(DECISIONS_KEY, decisions);
        write(SESSION_KEY, session);
        return { decisions, session };
      });
    },

    observeContext: () => {
      const context = MarketContextStampEngine.stamp();
      set((st) => {
        const session: OperatorSession = {
          ...st.session,
          durationMs: Date.now() - st.session.startedAt,
          regimesParticipated: Array.from(
            new Set([...st.session.regimesParticipated, context.regime]),
          ),
          volatilityExposure: Array.from(
            new Set([...st.session.volatilityExposure, context.volatilityState]),
          ),
          liquidityConditions: Array.from(
            new Set([...st.session.liquidityConditions, context.liquidityState]),
          ),
          macroParticipation:
            st.session.macroParticipation || context.label.includes("STRESS"),
          peakStressLabel:
            context.volatilityState === "extreme" ? "extreme" : st.session.peakStressLabel,
        };
        write(SESSION_KEY, session);
        return { session };
      });
    },

    endSession: () => {
      set((st) => {
        const ended: OperatorSession = {
          ...st.session,
          endedAt: Date.now(),
          durationMs: Date.now() - st.session.startedAt,
        };
        const history = [ended, ...st.history].slice(0, 60);
        const fresh = newSession();
        write(HISTORY_KEY, history);
        write(SESSION_KEY, fresh);
        write(DECISIONS_KEY, []);
        return { history, session: fresh, decisions: [] };
      });
    },

    setSnapshot: (snapshot) => set({ snapshot }),

    openReplay: (decision, flagKind = null) => set({ activeReplay: { decision, flagKind } }),

    closeReplay: () => set({ activeReplay: null }),

    addReflection: (decisionId, reflection) => {
      set((st) => {
        const decisions = st.decisions.map((d) =>
          d.id === decisionId ? { ...d, reflection } : d,
        );
        write(DECISIONS_KEY, decisions);
        const activeReplay =
          st.activeReplay && st.activeReplay.decision.id === decisionId
            ? { ...st.activeReplay, decision: { ...st.activeReplay.decision, reflection } }
            : st.activeReplay;
        return { decisions, activeReplay };
      });
    },
  })),
);
