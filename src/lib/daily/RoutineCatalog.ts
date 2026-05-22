import { terminalBus } from "@/store/eventBus";
import type { OperationalRoutine, RoutineId } from "@/types/daily-operations";

export const OPERATIONAL_ROUTINES: OperationalRoutine[] = [
  {
    id: "morning_briefing",
    label: "MORNING BRIEFING",
    description: "Session context → surveillance → macro → journal",
    panelSequence: ["dailyops", "surveillance", "macro", "traderjournal"],
    checklist: ["Read overnight brief", "Check macro calendar", "Review watchlist intel"],
  },
  {
    id: "volatility_scan",
    label: "VOLATILITY SCAN",
    description: "Surveillance stress → chart → context",
    panelSequence: ["surveillance", "chart", "decision"],
    checklist: ["Regime check", "Movers review", "Stress gauge"],
  },
  {
    id: "liquidity_check",
    label: "LIQUIDITY CHECK",
    description: "Book → DOM → slippage radar",
    panelSequence: ["hyperbook", "domladder", "slippageradar"],
    checklist: ["Spread", "Depth imbalance", "Slippage tier"],
  },
  {
    id: "funding_scan",
    label: "FUNDING SCAN",
    description: "Intel wire → surveillance → knowledge graph",
    panelSequence: ["intelligence", "surveillance", "knowledgegraph"],
    checklist: ["Funding flips", "OI context", "Cross-asset links"],
  },
  {
    id: "narrative_scan",
    label: "NARRATIVE SCAN",
    description: "Intel → proactive → research",
    panelSequence: ["intelligence", "proactive", "research"],
    checklist: ["Headlines", "Agent fusion", "Thesis board"],
  },
  {
    id: "execution_prep",
    label: "EXECUTION PREP",
    description: "Ticket → DOM → positions",
    panelSequence: ["ticket", "domladder", "positions"],
    checklist: ["Size plan", "Liquidity check", "Risk limits"],
  },
  {
    id: "post_session_review",
    label: "POST-SESSION REVIEW",
    description: "Journal → alerts → memory",
    panelSequence: ["traderjournal", "alerts", "dailyops"],
    checklist: ["Log trades", "Review alerts", "Archive session note"],
  },
];

export class RoutineCatalog {
  static get(id: RoutineId): OperationalRoutine | undefined {
    return OPERATIONAL_ROUTINES.find((r) => r.id === id);
  }

  static launch(id: RoutineId): void {
    const routine = RoutineCatalog.get(id);
    if (!routine) return;
    routine.panelSequence.forEach((widgetId, i) => {
      window.setTimeout(() => {
        terminalBus.emit("widget:focus", { widgetId });
      }, i * 150);
    });
    terminalBus.emit("widget:focus", { widgetId: routine.panelSequence[0] });
  }
}
