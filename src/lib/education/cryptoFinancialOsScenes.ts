/**
 * CRYPTO FINANCIAL OS v1 — platform-specific academy module.
 * Teaches the integrated operating system that powers the terminal.
 * Prerequisite: Market Memory Archive (v1 freeze).
 */

export type CFOVisual =
  | "whyOs"
  | "layersOverview"
  | "infoFlow"
  | "terminalLayer"
  | "intelligenceLayer"
  | "executionLayer"
  | "organizationalLayer"
  | "infrastructureLayer"
  | "operatorWorkflow"
  | "recap";

export interface CFOScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: CFOVisual;
  holdMs?: number;
}

export const CRYPTO_FINANCIAL_OS_SCENES: CFOScene[] = [
  {
    id: "why-os",
    lesson: 1,
    chapter: "PHASE 1 · WHY CRYPTO FINANCIAL OS EXISTS",
    title: "Tools vs operating system",
    voice:
      "A traditional trader juggles disconnected tools — charts here, risk there, execution somewhere else. A professional operator uses one integrated operating system. Crypto Financial OS exists because information organization matters. Without a framework, panels become noise.",
    takeaway: "This is the operating system that powers the terminal.",
    visual: "whyOs",
    holdMs: 3000,
  },
  {
    id: "layers",
    lesson: 2,
    chapter: "PHASE 2 · UNDERSTANDING THE LAYERS",
    title: "Five layers plus API",
    voice:
      "Crypto Financial OS organizes the terminal into layers: Terminal, Intelligence, Execution, Organizational, and Infrastructure — plus an API layer for extensibility. Each layer answers a different question so you are never overwhelmed by disconnected panels.",
    takeaway: "Layers turn tools into a framework.",
    visual: "layersOverview",
    holdMs: 2800,
  },
  {
    id: "info-flow",
    lesson: 3,
    chapter: "PHASE 3 · HOW INFORMATION FLOWS",
    title: "Market data to review",
    voice:
      "Information flows in one direction: market data feeds intelligence, intelligence informs decisions, decisions become execution, execution feeds review. You do not jump randomly between panels — you move through context, insight, action, and reflection.",
    takeaway: "Data, intelligence, decision, execution, review.",
    visual: "infoFlow",
    holdMs: 2800,
  },
  {
    id: "terminal-layer",
    lesson: 4,
    chapter: "PHASE 4 · TERMINAL LAYER",
    title: "What you touch directly",
    voice:
      "The Terminal Layer is what you interact with directly — workspace, charts, order book, trade ticket, positions. It sits at the top of the workflow because every session starts with reading the tape and the desk layout.",
    takeaway: "Terminal layer — your direct interface.",
    visual: "terminalLayer",
    holdMs: 2600,
  },
  {
    id: "intelligence-layer",
    lesson: 5,
    chapter: "PHASE 5 · INTELLIGENCE LAYER",
    title: "Signals and context",
    voice:
      "The Intelligence Layer turns raw data into insight — intel engine, newswire, proprietary signals, distribution feeds. This is where awareness forms before you size a trade or write a plan.",
    takeaway: "Intelligence layer — context before clicks.",
    visual: "intelligenceLayer",
    holdMs: 2600,
  },
  {
    id: "execution-layer",
    lesson: 6,
    chapter: "PHASE 6 · EXECUTION LAYER",
    title: "Decisions become actions",
    voice:
      "The Execution Layer connects decisions to fills — order book, DOM ladder, slippage radar, live execution pipes. When the intelligence layer says go, the execution layer determines how cleanly you get filled.",
    takeaway: "Execution layer — how decisions become trades.",
    visual: "executionLayer",
    holdMs: 2600,
  },
  {
    id: "organizational-layer",
    lesson: 7,
    chapter: "PHASE 7 · ORGANIZATIONAL LAYER",
    title: "Operations and workflow",
    voice:
      "The Organizational Layer holds how teams work — daily operations, operator journal, collaboration, research desks, enterprise ops. Professional trading is not one click — it is a repeatable workflow.",
    takeaway: "Organizational layer — how operators run the desk.",
    visual: "organizationalLayer",
    holdMs: 2600,
  },
  {
    id: "infrastructure-layer",
    lesson: 8,
    chapter: "PHASE 8 · INFRASTRUCTURE LAYER",
    title: "Behind the scenes",
    voice:
      "The Infrastructure Layer runs behind the scenes — reliability, ingestion, cloud sync, diagnostics. You rarely stare at it, but it keeps streams healthy and data trustworthy. When infra degrades, every layer above suffers.",
    takeaway: "Infrastructure layer — invisible until it breaks.",
    visual: "infrastructureLayer",
    holdMs: 2600,
  },
  {
    id: "operator-workflow",
    lesson: 9,
    chapter: "PHASE 10 · OPERATOR WORKFLOW",
    title: "Context to review",
    voice:
      "Professional workflow: gather context, read intelligence, execute with discipline, then review in journal and ops systems. Crypto Financial OS maps each step to a layer so you stop seeing random panels and start seeing one connected system.",
    takeaway: "Context, intelligence, execution, review.",
    visual: "operatorWorkflow",
    holdMs: 2800,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "One connected OS",
    voice:
      "Crypto Financial OS exists so you stop seeing individual panels and start seeing one operating system. Next: open the real Crypto Financial OS panel and walk through layers, risk, execution, and memory live.",
    takeaway: "The terminal is a framework — not a pile of tools.",
    visual: "recap",
    holdMs: 2400,
  },
];
