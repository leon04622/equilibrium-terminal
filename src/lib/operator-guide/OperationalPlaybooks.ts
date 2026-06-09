import type { ExplainVisualCue, OperationalPlaybook, ProAction } from "@/types/operator-guide";

function pb(
  panelRole: string,
  lookFirst: string[],
  whatChangesMatter: string,
  bullish: string,
  bearish: string,
  confirms: string,
  invalidates: string,
  dangerZone: string,
  proMonitors: string[],
  proDoesNext: ProAction,
  beginnerMistakes: string[],
  workflowSteps: string[],
  visualCues: ExplainVisualCue[],
  replayScenarioId: string,
  focusPanelsOnReplay: string[],
): OperationalPlaybook {
  return {
    panelRole,
    lookFirst,
    whatChangesMatter,
    bullish,
    bearish,
    confirms,
    invalidates,
    dangerZone,
    proMonitors,
    proDoesNext,
    beginnerMistakes,
    workflowSteps,
    visualCues,
    replayScenarioId,
    focusPanelsOnReplay,
  };
}

const PLAYBOOKS: Record<string, OperationalPlaybook> = {
  hyperbook: pb(
    "Execution · liquidity at the touch",
    [
      "Spread in bps — is it tight (<0.5) or blowing out (>2)?",
      "Top bid vs top ask size — who is heavier within 5 ticks?",
      "Large resting walls within 10–25 bps of mid",
      "Whether the wall is holding or getting pulled",
    ],
    "Spread widening while size disappears = real liquidity stress. Spread compressing with bid reload = safer to work size.",
    "Bid stack thickens, spread tightens, large sells get absorbed without price dropping — buyers are defending.",
    "Ask reloads faster than bids, spread widens, mid drops through thin bids — supply is in control.",
    "Next sweep fails to break the level and spread snaps back tight.",
    "Wall pulls before price arrives, or spread doubles while you are trying to buy.",
    "Spread jumps from ~0.1 bps to 1+ bps while bids vanish — market orders become expensive and fills slip.",
    ["Spread bps", "Depth imbalance", "Wall pull frequency", "Mid after large prints"],
    {
      action: "check_liquidity",
      detail: "Size the ticket from this book — if spread is wide, cut size 50% or use limits at the wall.",
    },
    [
      "Buying into a wide spread because price looks cheap",
      "Ignoring a pulled bid wall (fake support)",
      "Market ordering when impact on slippage radar is red",
    ],
    [
      "Glance spread → compare bid/ask depth",
      "Mark the wall you want to lean on",
      "Check slippage radar → set limit or reduce size",
      "Send order only if wall still there",
    ],
    [
      {
        type: "spread_compress",
        label: "Tight book",
        caption: "Bids stack · spread narrow · safe to work limits",
      },
      {
        type: "spread_widen",
        label: "Thin book",
        caption: "Bids pull · spread blow out · avoid market",
      },
    ],
    "sc-liq-cascade-btc",
    ["hyperbook", "slippageradar", "domladder"],
  ),

  domladder: pb(
    "Execution · tick-level liquidity",
    [
      "Price level where size keeps reloading (real interest)",
      "Levels that flicker in/out (possible spoof)",
      "Aggressor side on sweeps — who is hitting?",
      "Whether your intended entry level still has size",
    ],
    "Reload at a level = someone defending it. Repeated pull = do not trust that price for entry.",
    "Buyers lift offers and bid reloads at the same tick — initiative longs.",
    "Offers stack and bids pull on each uptick — distribution into strength.",
    "Sweep through level then immediate bid reload above — continuation long.",
    "Level clears and no reload within 2–3 ticks — breakout failed or trap.",
    "You scale in at a level that just pulled — you are now the liquidity.",
    ["Reload vs pull", "Sweep size", "Tick clustering", "Aggressor color"],
    {
      action: "use_limit",
      detail: "Place limits at reload levels; do not chase with market if ladder shows pull behavior.",
    },
    [
      "Chasing a green tick without checking reload",
      "Shorting into a bid reload zone",
      "Confusing flicker with real size",
    ],
    [
      "Find reload level on ladder",
      "Wait for sweep + reload (long) or fail (fade)",
      "Cross-check hyperbook spread",
      "Execute at level, not at market",
    ],
    [
      { type: "bid_stack", label: "Bid reload", caption: "Size returns after hit → defend longs" },
      { type: "ask_reload", label: "Ask stack", caption: "Offers refill → supply overhead" },
    ],
    "sc-liq-cascade-btc",
    ["domladder", "hyperbook", "execintel"],
  ),

  chart: pb(
    "Structure · regime · timing",
    [
      "Regime ribbon — trend vs range vs stress",
      "Last swing high/low — are we accepting or rejecting?",
      "Volatility/stress gauge — expansion or compression?",
      "Spread overlay — is execution quality degrading?",
    ],
    "Regime + stress tell you which playbook: trend follow, mean revert, or do nothing.",
    "Higher lows into resistance with low stress — long continuation setup.",
    "Lower highs, stress rising, failed reclaim of VWAP — short bias or stand aside.",
    "Break and hold above range with vol expansion + tight spread on retest.",
    "Breakout on wide spread and no follow-through candle — likely stop run.",
    "Trading breakouts while stress is critical and book is thin.",
    ["Regime label", "Stress index", "Structure levels", "Spread on chart HUD"],
    {
      action: "watch_continuation",
      detail: "Wait for retest hold before adding; if stress spikes, downgrade to scalp size or flat.",
    },
    [
      "Trading every wick as a signal",
      "Ignoring stress gauge during breakouts",
      "Wrong timeframe for hold period (scalping on 4h noise)",
    ],
    [
      "Read regime + stress",
      "Mark structure level",
      "Confirm with book/tape",
      "Execute on retest, not first touch",
    ],
    [
      { type: "breakout", label: "Break + hold", caption: "Close above level · retest holds" },
      { type: "vol_expand", label: "Vol expansion", caption: "Range breaks · size up carefully" },
    ],
    "sc-vol-fomc-eth",
    ["chart", "surveillance", "hyperbook"],
  ),

  intelligence: pb(
    "Situational awareness · abnormal flow",
    [
      "Severity — critical vs watch",
      "Notional on whale prints — $75k+ matters",
      "Whether print is with or against the book",
      "Clustering — 3+ related vectors in 60s",
    ],
    "One whale print means little; clustered critical vectors = interrupt and re-check book.",
    "Large buy into thin ask that does not move price down — absorption.",
    "Cluster of sells, rising stress, funding flipping — cascade risk.",
    "Print + book holds + spread tightens.",
    "Huge print but price reverses immediately — trapped aggressor.",
    "Acting on a single headline vector without book confirmation.",
    ["Severity", "Notional USD", "Vector type", "Time clustering"],
    {
      action: "check_liquidity",
      detail: "Click vector → jump to chart → read hyperbook before any size change.",
    },
    [
      "Fading whale buys because 'it always reverses'",
      "Ignoring funding/OI vectors during trends",
      "Alert fatigue — missing the third cluster sell",
    ],
    [
      "Scan top 3 vectors",
      "If critical → chart + book",
      "Confirm direction",
      "Adjust size or flat",
    ],
    [
      { type: "tape_buy", label: "Whale buy", caption: "Large lift · watch absorption" },
      { type: "tape_sell", label: "Sell cluster", caption: "3+ sells · cascade watch" },
    ],
    "sc-liq-cascade-btc",
    ["intelligence", "hyperbook", "alerts"],
  ),

  alerts: pb(
    "Exception detection · interrupt layer",
    [
      "Rule that fired (OI, funding, whale, liq cluster)",
      "Coin matches your active symbol?",
      "Severity and recency",
      "Whether second rule confirms within 60s",
    ],
    "Alerts are tripwires — not entries. Two rules same direction = worth full attention.",
    "Funding flip positive + OI rising + bid depth — long crowding but trend intact.",
    "Liquidation cluster + widening spread + stress critical — defensive mode.",
    "Alert fires → you look → book agrees.",
    "Alert fires → price already extended 2%+ — late.",
    "Market ordering because alert said whale — without spread check.",
    ["Rule type", "Severity", "Cluster count", "Coin match"],
    {
      action: "stand_aside",
      detail: "Until you confirm on book/chart; if liq cluster + critical stress, cut size or flat.",
    },
    [
      "Treating every alert as a trade signal",
      "Disabling rules then missing cascades",
      "Not clicking through to chart",
    ],
    [
      "Read rule + severity",
      "Focus chart/book",
      "Confirm or dismiss",
      "Only then change position",
    ],
    [
      { type: "liquidation", label: "Liq cluster", caption: "Multiple liq rules · reduce risk" },
      { type: "funding_flip", label: "Funding flip", caption: "Carry regime change" },
    ],
    "sc-liq-cascade-btc",
    ["alerts", "intelligence", "surveillance"],
  ),

  ticket: pb(
    "Risk execution · where PnL is made or lost",
    [
      "Side and size vs your max clip",
      "Limit vs market — slippage radar color",
      "Reduce-only if exiting",
      "Coin matches chart/book",
    ],
    "Market orders in wide spread = paying the most. Limits at walls = best average.",
    "Limit buy at bid reload with tight spread — controlled entry.",
    "Market buy into 1+ bps spread after stress spike — paying the top.",
    "Fill at expected level with spread stable.",
    "Partial fill then spread blows out — abort rest.",
    "Doubling size because 'it has to bounce'.",
    ["Order type", "Size vs depth", "Slippage estimate", "Reduce-only flag"],
    {
      action: "avoid_market",
      detail: "If slippage radar warns, switch to limit or cut size 50%; never chase with market in stress.",
    },
    [
      "Market order by default",
      "Wrong coin vs chart",
      "No reduce-only on exits",
    ],
    [
      "Slippage radar green/yellow/red",
      "Pick limit at level",
      "Submit",
      "Verify fill in positions",
    ],
    [
      { type: "spread_widen", label: "Bad fill zone", caption: "Market into wide spread" },
      { type: "spread_compress", label: "Good fill zone", caption: "Limit at tight book" },
    ],
    "sc-liq-cascade-btc",
    ["ticket", "slippageradar", "positions"],
  ),

  positions: pb(
    "Risk truth · what you actually have",
    [
      "Unrealized PnL vs your daily stop",
      "Size vs liquidity (can you exit in one clip?)",
      "Direction vs current tape",
      "Margin headroom",
    ],
    "Position panel is truth — ticket intent is not. Reconcile after every fill.",
    "Green PnL + trend intact + tight spread — trail or partial take per plan.",
    "Red PnL + widening spread + sell cluster — reduce, do not hope.",
    "Exchange size matches what you think you have.",
    "Local display lag after fast market — verify before adding.",
    "Adding to a loser because alert fired bullish once.",
    ["Unrealized PnL", "Notional", "Margin", "Side"],
    {
      action: "reduce_size",
      detail: "If PnL beyond stop or spread critical, cut 30–50% with reduce-only limits.",
    },
    [
      "Not checking after partial fills",
      "Ignoring spread while holding full size",
      "No pre-defined stop on notional",
    ],
    [
      "Read PnL + size",
      "Compare to tape/book",
      "Decide hold/trim/flat",
      "Execute reduce-only if trimming",
    ],
    [
      { type: "flow_imbalance", label: "Against you", caption: "Position long · tape sells" },
    ],
    "sc-liq-cascade-btc",
    ["positions", "ticket", "surveillance"],
  ),

  slippageradar: pb(
    "Pre-trade gate · execution quality",
    [
      "Impact score / color",
      "Spread input to estimate",
      "Suggested size cap",
      "Whether market is blocked",
    ],
    "If radar is red, you are paying for urgency you may not need.",
    "Green impact + tight spread — market acceptable for small urgent clip.",
    "Red impact + wide spread — limits only or wait.",
    "Radar green → fill near mid.",
    "Radar was green, spread widened mid-send — cancel and reassess.",
    "Ignoring red because 'I need in now'.",
    ["Impact score", "Spread bps", "Est. slippage", "Size cap"],
    {
      action: "wait",
      detail: "Wait for compression or halve size; use limit at hyperbook wall.",
    },
    [
      "Skipping radar when FOMO",
      "Full size when impact red",
      "Not re-checking after 30s",
    ],
    [
      "Open radar before ticket",
      "Adjust size to green/yellow",
      "Choose limit vs market",
      "Send",
    ],
    [
      { type: "spread_widen", label: "High impact", caption: "Wide spread · cut size" },
      { type: "spread_compress", label: "Low impact", caption: "Tight · market ok small" },
    ],
    "sc-vol-fomc-eth",
    ["slippageradar", "hyperbook", "ticket"],
  ),

  surveillance: pb(
    "Regime · stress · stand-aside filter",
    [
      "Regime label (trend/range/stress)",
      "Stress index level",
      "Book imbalance direction",
      "Whether stress is rising or fading",
    ],
    "Stress critical = default smaller size or flat until normalization.",
    "Low stress + trend regime — use trend playbook.",
    "Critical stress + bearish regime — defense only.",
    "Stress peaks then falls + structure holds.",
    "Stress rising 3 readings in a row — playbook invalid.",
    "Max leverage during critical stress.",
    ["Stress index", "Regime", "Imbalance"],
    {
      action: "stand_aside",
      detail: "If stress critical, no new risk until spread and stress improve.",
    },
    [
      "Trading through critical stress",
      "Ignoring regime mismatch (mean revert in trend)",
      "Only watching price, not stress",
    ],
    [
      "Read regime + stress",
      "Pick playbook",
      "Size accordingly",
      "Re-check every 5–15 min in fast markets",
    ],
    [
      { type: "vol_expand", label: "Stress up", caption: "Cut size · widen stops mentally" },
    ],
    "sc-vol-fomc-eth",
    ["surveillance", "chart", "slippageradar"],
  ),

  derivdesk: pb(
    "Positioning · carry · squeeze risk",
    [
      "Funding rate sign and magnitude",
      "OI change direction",
      "Whether funding extreme + OI still rising",
      "Vol vs realized move",
    ],
    "Extreme positive funding + rising OI = crowded longs — fragile on bad news.",
    "Negative funding + aggressive buys = short squeeze setup.",
    "Funding flips negative while longs crowded — unwind accelerates.",
    "Funding normalizes, OI stable, price holds structure.",
    "Funding extreme but price already dumped — late short.",
    "Adding long into 0.08%+ funding and OI ATH.",
    ["Funding %", "OI delta", "Vol surface"],
    {
      action: "monitor_funding",
      detail: "Track funding every 15m in crowded trades; reduce if funding + OI both extreme.",
    },
    [
      "Trading funding alone without price",
      "Ignoring OI flush during squeeze",
      "Shorting only because funding high",
    ],
    [
      "Funding + OI snapshot",
      "Map to chart structure",
      "Size for squeeze vs trend",
      "Set alert on funding flip",
    ],
    [
      { type: "funding_flip", label: "Funding flip", caption: "Carry traders exit together" },
    ],
    "sc-funding-squeeze",
    ["derivdesk", "chart", "alerts"],
  ),

  macro: pb(
    "Session context · risk appetite",
    [
      "DXY direction",
      "Rates (US10Y) move",
      "Equity index futures",
      "Time to high-impact calendar",
    ],
    "Risk-off macro (DXY up, yields up) often pressures crypto beta before price shows it.",
    "Equities strong, DXY soft — risk-on tailwind for beta alts.",
    "DXY ripping, yields up, equities weak — reduce crypto beta longs.",
    "Macro aligns with your crypto direction.",
    "Macro diverges (stocks rip, BTC flat/down) — caution on longs.",
    "Full size into FOMC/CPI without cap.",
    ["DXY", "US10Y", "Index futures", "Calendar"],
    {
      action: "reduce_size",
      detail: "Inside 30m of high-impact macro, halve size or flat until post-release structure.",
    },
    [
      "Trading crypto in vacuum",
      "Levering into FOMC",
      "Ignoring DXY when USD pairs matter",
    ],
    [
      "Scan macro strip",
      "Note event clock",
      "Adjust size cap",
      "Trade structure after release",
    ],
    [
      { type: "vol_expand", label: "Macro vol", caption: "Event window · spreads blow out" },
    ],
    "sc-vol-fomc-eth",
    ["macro", "chart", "surveillance"],
  ),

  execintel: pb(
    "Post-trade · flow quality",
    [
      "Aggressor imbalance",
      "Sweep count vs average",
      "Efficiency score after your fills",
      "Liquidity map hotspots",
    ],
    "After a big fill, check if you were buying into sell aggression — grade the desk.",
    "Buy imbalance + rising CVD — initiative longs supported.",
    "Sell imbalance + widening spread — you are late or wrong side.",
    "Your buy + CVD up + spread tight — good execution.",
    "Your buy + price down + spread wide — poor timing.",
    "Only looking at PnL, not flow quality.",
    ["Aggression", "CVD", "Sweep count", "Efficiency"],
    {
      action: "watch_continuation",
      detail: "If flow supports position, hold plan; if not, trim on next liquidity pop.",
    },
    [
      "Ignoring aggression after fill",
      "Chasing sweeps",
      "No post-trade review",
    ],
    [
      "Pull aggression + sweeps",
      "Compare to your fill",
      "Adjust hold/add",
      "Log for journal",
    ],
    [
      { type: "flow_imbalance", label: "Aggressor map", caption: "Who is hitting · who is passive" },
    ],
    "sc-trend-hype",
    ["execintel", "domladder", "chart"],
  ),

  portfoliodesk: pb(
    "Net risk · correlation · caps",
    [
      "Gross exposure vs cap",
      "Correlated alts same direction",
      "Beta to BTC",
      "Treasury / idle balance",
    ],
    "Three correlated longs = one big long — size accordingly.",
    "Diversified beta, within caps, stress low — room to add per plan.",
    "Everything long alt beta into macro risk-off — hedge or cut gross.",
    "Net within limits after new fill.",
    "Thought you were 1x but three desks sum to 3x beta.",
    "Adding SOL long while ETH+ARB already max long beta.",
    ["Gross", "Beta", "Correlation", "VaR proxy"],
    {
      action: "hedge",
      detail: "If gross over cap or macro risk-off, trim weakest correlated leg first.",
    },
    [
      "Treating each coin independently",
      "No gross cap",
      "Ignoring BTC beta",
    ],
    [
      "Check gross + correlation",
      "Compare to cap",
      "Trim or hedge",
      "Then single-name trades",
    ],
    [
      { type: "flow_imbalance", label: "Concentrated beta", caption: "Many alts · one direction" },
    ],
    "sc-stable-depeg",
    ["portfoliodesk", "positions", "macro"],
  ),
};

type DeskFamily =
  | "execution"
  | "tape"
  | "volatility"
  | "portfolio"
  | "macro"
  | "platform";

function familyFor(panelId: string): DeskFamily {
  if (["hyperbook", "domladder", "ticket", "slippageradar", "liveexec"].includes(panelId)) {
    return "execution";
  }
  if (["intelligence", "alerts", "intelengine", "newswire", "proactive"].includes(panelId)) {
    return "tape";
  }
  if (["surveillance", "chart", "derivdesk", "memorydesk", "alphalab"].includes(panelId)) {
    return "volatility";
  }
  if (["positions", "portfoliodesk", "billingdesk"].includes(panelId)) {
    return "portfolio";
  }
  if (["macro", "globaldesk", "globalstrategy", "decision"].includes(panelId)) {
    return "macro";
  }
  return "platform";
}

const FAMILY_DEFAULTS: Record<DeskFamily, OperationalPlaybook> = {
  execution: pb(
    "Execution desk",
    ["Spread", "Depth at your price", "Slippage radar", "Order type"],
    "Liquidity and spread drive fill quality more than chart patterns.",
    "Tight spread + reload at your level.",
    "Wide spread + pulled liquidity.",
    "Fill near mid after limit at wall.",
    "Market into widening spread.",
    "Spread doubles while you enter.",
    ["Spread", "Depth", "Impact"],
    { action: "check_liquidity", detail: "Confirm book before any market order." },
    ["Market orders in stress", "Skipping slippage radar"],
    ["Book → radar → ticket → positions verify"],
    [{ type: "spread_compress", label: "Tight", caption: "Work limits" }],
    "sc-liq-cascade-btc",
    ["hyperbook", "slippageradar"],
  ),
  tape: pb(
    "Flow · situational awareness",
    ["Top vector severity", "Notional", "Clustering", "Coin match"],
    "Flow matters when clustered and confirmed on book.",
    "Buy clusters + hold price.",
    "Sell clusters + stress up.",
    "Tape + book agree.",
    "Tape alone, price reverses.",
    "Trading one headline.",
    ["Severity", "Notional", "Count"],
    { action: "check_liquidity", detail: "Confirm on hyperbook before sizing." },
    ["Single print = signal"],
    ["Tape → chart → book → act"],
    [{ type: "tape_buy", label: "Flow", caption: "Confirm on book" }],
    "sc-liq-cascade-btc",
    ["intelligence", "hyperbook"],
  ),
  volatility: pb(
    "Vol · regime · risk filter",
    ["Stress", "Regime", "Structure", "Spread"],
    "When vol expands without liquidity, edge drops — size down.",
    "Trend + low stress.",
    "Stress critical + against position.",
    "Structure hold after vol spike.",
    "Stress keeps rising.",
    "Full size in critical stress.",
    ["Stress", "Regime"],
    { action: "stand_aside", detail: "Wait for stress fade or trade smaller." },
    ["Ignoring stress gauge"],
    ["Stress → regime → chart → size"],
    [{ type: "vol_expand", label: "Vol", caption: "Reduce size" }],
    "sc-vol-fomc-eth",
    ["surveillance", "chart"],
  ),
  portfolio: pb(
    "Risk · exposure",
    ["Gross", "PnL", "Margin", "Correlation"],
    "Net exposure kills accounts faster than bad entries.",
    "Within caps, stress low.",
    "Over cap or correlated pile-on.",
    "Risk within limits.",
    "Hidden correlation.",
    "Adding without checking gross.",
    ["Gross", "PnL"],
    { action: "reduce_size", detail: "Trim weakest leg if over cap." },
    ["No gross limit"],
    ["Gross → correlation → single trade"],
    [{ type: "flow_imbalance", label: "Exposure", caption: "Net beta" }],
    "sc-stable-depeg",
    ["portfoliodesk", "positions"],
  ),
  macro: pb(
    "Macro · session context",
    ["DXY", "Yields", "Indices", "Calendar"],
    "Macro sets whether you should be aggressive or defensive today.",
    "Risk-on macro + crypto strength.",
    "Risk-off + crypto lagging.",
    "Aligned macro and crypto.",
    "Macro headwind, long alts.",
    "Size into CPI/FOMC.",
    ["DXY", "Yields"],
    { action: "reduce_size", detail: "Halve size around major releases." },
    ["Ignoring calendar"],
    ["Macro → cap size → trade structure"],
    [{ type: "vol_expand", label: "Event", caption: "Widen spreads" }],
    "sc-vol-fomc-eth",
    ["macro", "chart"],
  ),
  platform: pb(
    "Operations · desk infrastructure",
    ["Subsystem vitals", "Incidents", "Sync status", "Score trends"],
    "Use when running the desk, not for entry timing.",
    "All vitals green — execution stack trusted.",
    "Degraded vitals — verify data before trading.",
    "Vitals stable through session.",
    "Feed lag during fast market.",
    "Trading through known feed issues.",
    ["Vitals", "Incidents"],
    { action: "wait", detail: "Fix data/ops issues before size." },
    ["Trading on stale vitals"],
    ["Vitals → trust → trade"],
    [{ type: "flow_imbalance", label: "Ops", caption: "Check vitals first" }],
    "sc-cex-divergence",
    ["diagnostics", "reliability"],
  ),
};

export class OperationalPlaybooks {
  static get(panelId: string): OperationalPlaybook {
    return PLAYBOOKS[panelId] ?? FAMILY_DEFAULTS[familyFor(panelId)];
  }

  static replayFor(panelId: string): string {
    return OperationalPlaybooks.get(panelId).replayScenarioId;
  }
}
