import type {
  ReplayAnnotation,
  WorkflowId,
  WorkflowWalkthrough,
} from "@/types/operator-guide";

export class WorkflowWalkthroughEngine {
  static all(): WorkflowWalkthrough[] {
    return [
      {
        id: "monitor_liquidity",
        title: "Monitor liquidity",
        objective: "Read book, DOM, and slippage before any size decision.",
        steps: [
          {
            id: "ml-1",
            order: 1,
            title: "Open HyperBook",
            detail: "Check spread and top-of-book depth on the active symbol.",
            focusPanel: "hyperbook",
            explainTarget: "hyperbook",
          },
          {
            id: "ml-2",
            order: 2,
            title: "Inspect DOM ladder",
            detail: "Look for level reloads, vacuums, and microstructure flicker.",
            focusPanel: "domladder",
            explainTarget: "domladder",
          },
          {
            id: "ml-3",
            order: 3,
            title: "Check slippage radar",
            detail: "Confirm impact estimate matches your intended order size.",
            focusPanel: "slippageradar",
            explainTarget: "slippageradar",
          },
        ],
      },
      {
        id: "read_order_flow",
        title: "Read order flow",
        objective: "Combine tape, alerts, and execution intel for flow context.",
        steps: [
          {
            id: "of-1",
            order: 1,
            title: "Scan tactical wire",
            detail: "Review whale prints and vector severity on active coin.",
            focusPanel: "intelligence",
            explainTarget: "intelligence",
          },
          {
            id: "of-2",
            order: 2,
            title: "Review alert engine",
            detail: "Confirm rule triggers align with tape — click to focus chart.",
            focusPanel: "alerts",
            explainTarget: "alerts",
          },
          {
            id: "of-3",
            order: 3,
            title: "Open execution intel",
            detail: "Grade aggression, sweeps, and imbalance if available.",
            focusPanel: "execintel",
            explainTarget: "execintel",
          },
        ],
      },
      {
        id: "interpret_funding",
        title: "Interpret funding",
        objective: "Map carry, crowding, and squeeze risk via derivatives desk.",
        steps: [
          {
            id: "if-1",
            order: 1,
            title: "Derivatives desk",
            detail: "Read funding rate and OI trend on active perp.",
            focusPanel: "derivdesk",
            explainTarget: "derivdesk",
          },
          {
            id: "if-2",
            order: 2,
            title: "Surveillance regime",
            detail: "Place funding read in current regime and stress context.",
            focusPanel: "surveillance",
            explainTarget: "surveillance",
          },
          {
            id: "if-3",
            order: 3,
            title: "Alert confirmation",
            detail: "Watch for funding flip rules on the alert engine.",
            focusPanel: "alerts",
            explainTarget: "alerts",
          },
        ],
      },
      {
        id: "read_volatility",
        title: "Read volatility",
        objective: "Assess vol expansion, regime, and scenario analogs.",
        steps: [
          {
            id: "rv-1",
            order: 1,
            title: "Chart HUD",
            detail: "Read regime ribbon and stress on the chart surface.",
            focusPanel: "chart",
            explainTarget: "chart",
          },
          {
            id: "rv-2",
            order: 2,
            title: "Surveillance stress",
            detail: "Confirm stress gauge elevation vs session baseline.",
            focusPanel: "surveillance",
            explainTarget: "surveillance",
          },
          {
            id: "rv-3",
            order: 3,
            title: "Market memory",
            detail: "Compare to historical analog if vol is unfamiliar.",
            focusPanel: "memorydesk",
            explainTarget: "memorydesk",
          },
        ],
      },
      {
        id: "execute_with_context",
        title: "Execute with context",
        objective: "Institutional submit path — liquidity → slippage → ticket → positions.",
        steps: [
          {
            id: "ex-1",
            order: 1,
            title: "Liquidity pass",
            detail: "HyperBook + slippage radar green light.",
            focusPanel: "hyperbook",
            explainTarget: "hyperbook",
          },
          {
            id: "ex-2",
            order: 2,
            title: "Ticket entry",
            detail: "Prefill size; verify side and order type.",
            focusPanel: "ticket",
            explainTarget: "ticket",
          },
          {
            id: "ex-3",
            order: 3,
            title: "Position truth",
            detail: "Reconcile fill in positions panel.",
            focusPanel: "positions",
            explainTarget: "positions",
          },
        ],
      },
      {
        id: "alert_response",
        title: "Alert response",
        objective: "Respond to rule triggers without overtrading noise.",
        steps: [
          {
            id: "ar-1",
            order: 1,
            title: "Alert row",
            detail: "Read event type and AI context line.",
            focusPanel: "alerts",
            explainTarget: "alerts",
          },
          {
            id: "ar-2",
            order: 2,
            title: "Chart focus",
            detail: "Click alert — chart jumps to symbol.",
            focusPanel: "chart",
            explainTarget: "chart",
          },
          {
            id: "ar-3",
            order: 3,
            title: "Book confirm",
            detail: "Confirm abnormal flow in HyperBook before action.",
            focusPanel: "hyperbook",
            explainTarget: "hyperbook",
          },
        ],
      },
    ];
  }

  static get(id: WorkflowId): WorkflowWalkthrough | null {
    return WorkflowWalkthroughEngine.all().find((w) => w.id === id) ?? null;
  }
}

export class EducationalOverlayEngine {
  static annotationsForScenario(scenarioId: string): ReplayAnnotation[] {
    const base: Record<string, ReplayAnnotation[]> = {
      "sc-liq-cascade-btc": [
        {
          id: "ann-lc-1",
          progressPct: 5,
          headline: "Three large sells in 45s",
          explanation:
            "Watch the tape: $40k+ sells stack. Open hyperbook — if spread is still tight, this may absorb. If spread jumps from 0.1 to 1+ bps while bids pull, do not buy the dip.",
          riskNote: "Do not market buy into the first leg.",
          focusPanel: "alerts",
          visualCue: "tape_sell",
        },
        {
          id: "ann-lc-2",
          progressPct: 35,
          headline: "Spread blows out · bids vanish",
          explanation:
            "Hyperbook: bid depth thins, spread widens 5–10x. Slippage radar turns red — cut size 50% or use limits only. This is when market orders hurt most.",
          riskNote: "Market order here = worst fill of the session.",
          focusPanel: "slippageradar",
          visualCue: "spread_widen",
        },
        {
          id: "ann-lc-3",
          progressPct: 65,
          headline: "Stress critical · stand aside",
          explanation:
            "Surveillance flips to stress. Pros flat or hedge until spread compresses and reload appears. Cascades often need 2–5 min to find a bid.",
          riskNote: "Adding long into stress = catching a falling knife.",
          focusPanel: "surveillance",
          visualCue: "liquidation",
        },
      ],
      "sc-vol-fomc-eth": [
        {
          id: "ann-fomc-1",
          progressPct: 10,
          headline: "Macro headline · spreads lead price",
          explanation:
            "Macro panel: risk-off tone. Chart spread widens before candles extend — pros halve size 30 min before and after release.",
          riskNote: "No full-size market orders in this window.",
          focusPanel: "macro",
          visualCue: "vol_expand",
        },
        {
          id: "ann-fomc-2",
          progressPct: 50,
          headline: "Regime breaks · wait for retest",
          explanation:
            "Chart regime ribbon shifts. Do not chase first spike — wait for retest hold or fail, then align with hyperbook spread.",
          riskNote: "First move after FOMC is often a stop-run.",
          focusPanel: "chart",
          visualCue: "breakout",
        },
      ],
      "sc-funding-squeeze": [
        {
          id: "ann-fs-1",
          progressPct: 20,
          headline: "Funding crowded long",
          explanation:
            "Deriv desk: funding >0.06% with OI rising = longs piled in. Reduce new longs; shorts need a catalyst but have carry tailwind.",
          riskNote: "Do not add size to crowded long carry.",
          focusPanel: "derivdesk",
          visualCue: "funding_flip",
        },
        {
          id: "ann-fs-2",
          progressPct: 60,
          headline: "Funding flip → forced unwind",
          explanation:
            "When funding crosses negative, carry longs exit together. Watch intelligence for buy sweeps + alerts for flip rule.",
          riskNote: "Short squeeze can accelerate faster than you can cover.",
          focusPanel: "alerts",
          visualCue: "tape_buy",
        },
      ],
    };

    return (
      base[scenarioId] ?? [
        {
          id: "ann-default-1",
          progressPct: 15,
          headline: "Scenario begins",
          explanation: "Replay loads synthetic market path illustrating this operational context.",
          riskNote: "Observe — do not treat replay as live signal.",
          focusPanel: "chart",
        },
        {
          id: "ann-default-2",
          progressPct: 55,
          headline: "Mid-scenario",
          explanation: "Watch how book, tape, and surveillance co-move during the event.",
          riskNote: "Note which panels you would check first under time pressure.",
          focusPanel: "surveillance",
        },
        {
          id: "ann-default-3",
          progressPct: 85,
          headline: "Resolution phase",
          explanation: "Liquidity and vol typically normalize — professionals log analog for memory desk.",
          riskNote: "Resume live mode before any real execution.",
          focusPanel: "memorydesk",
        },
      ]
    );
  }

  static activeAnnotation(
    annotations: ReplayAnnotation[],
    progressPct: number,
  ): ReplayAnnotation | null {
    let best: ReplayAnnotation | null = null;
    for (const a of annotations) {
      if (a.progressPct <= progressPct) best = a;
    }
    return best;
  }
}
