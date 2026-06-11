/**
 * PORTFOLIO RISK SIMULATOR — institutional curriculum.
 *
 * Cloned from LEARNING TEMPLATE V1.
 * Teaches portfolio-level risk, correlation, concentration, and exposure.
 */

export type PRVisual =
  | "whatIsPortfolioRisk"
  | "correlation"
  | "concentrationRisk"
  | "capitalAllocation"
  | "portfolioDrawdowns"
  | "hiddenRisk"
  | "exposureManagement"
  | "recap";

export interface PRScene {
  id: string;
  lesson: number;
  chapter: string;
  title: string;
  voice: string;
  takeaway?: string;
  visual: PRVisual;
  holdMs?: number;
}

export const PORTFOLIO_RISK_SCENES: PRScene[] = [
  {
    id: "what-is-portfolio-risk",
    lesson: 1,
    chapter: "PHASE 1 · WHAT IS PORTFOLIO RISK?",
    title: "One trade vs five trades",
    voice:
      "Trader A has one position. Trader B has five positions. Is Trader B safer? Not necessarily. More trades can mean more exposure, more correlation, and more ways to lose at once. Your account is one portfolio — not a collection of random trades.",
    takeaway: "More positions ≠ less risk.",
    visual: "whatIsPortfolioRisk",
    holdMs: 2800,
  },
  {
    id: "correlation",
    lesson: 2,
    chapter: "PHASE 2 · CORRELATION",
    title: "Moving together",
    voice:
      "Bitcoin, Ethereum, and Solana all move together in a risk-off session. Owning several assets does not automatically reduce risk. When correlations rise, diversification disappears — and losses stack.",
    takeaway: "Correlated assets amplify portfolio pain.",
    visual: "correlation",
    holdMs: 2600,
  },
  {
    id: "concentration",
    lesson: 3,
    chapter: "PHASE 3 · CONCENTRATION RISK",
    title: "100% in one asset",
    voice:
      "Portfolio A is one hundred percent Bitcoin. Portfolio B spreads exposure across assets and sizes. When Bitcoin drops ten percent, Portfolio A bleeds. Portfolio B absorbs the shock. Concentration turns one move into account damage.",
    takeaway: "Concentration magnifies single-asset risk.",
    visual: "concentrationRisk",
    holdMs: 2600,
  },
  {
    id: "capital-allocation",
    lesson: 4,
    chapter: "PHASE 4 · CAPITAL ALLOCATION",
    title: "Not every idea deserves full size",
    voice:
      "Professionals allocate capital deliberately. Small positions for experiments. Medium positions for solid setups. Large positions only for high-conviction, well-liquified ideas. Not every opportunity deserves the same size.",
    takeaway: "Size reflects conviction and conditions.",
    visual: "capitalAllocation",
    holdMs: 2400,
  },
  {
    id: "drawdowns",
    lesson: 5,
    chapter: "PHASE 5 · PORTFOLIO DRAWDOWNS",
    title: "Several losses at once",
    voice:
      "One losing trade is manageable. Several correlated positions losing simultaneously is a portfolio drawdown. That is why portfolio-level risk matters — you are not managing trades in isolation, you are managing total exposure.",
    takeaway: "Portfolio drawdowns hit harder than single trades.",
    visual: "portfolioDrawdowns",
    holdMs: 2600,
  },
  {
    id: "hidden-risk",
    lesson: 6,
    chapter: "PHASE 6 · HIDDEN RISK",
    title: "Fake diversification",
    voice:
      "A trader thinks they are diversified — BTC long, ETH long, SOL long, alt long. Reality: every position depends on crypto moving higher. That is hidden correlation. The portfolio looks spread out but moves as one bet.",
    takeaway: "Hidden correlation = fake diversification.",
    visual: "hiddenRisk",
    holdMs: 2600,
  },
  {
    id: "exposure",
    lesson: 7,
    chapter: "PHASE 7 · EXPOSURE MANAGEMENT",
    title: "Sector, market, direction",
    voice:
      "Operators track sector exposure, overall market exposure, and directional bias. Too much long exposure in a selloff hurts. Too much in one sector concentrates risk. Exposure management is how desks survive stress.",
    takeaway: "Manage total exposure — not just one ticket.",
    visual: "exposureManagement",
    holdMs: 2400,
  },
  {
    id: "recap",
    lesson: 0,
    chapter: "RECAP",
    title: "Think portfolio-by-portfolio",
    voice:
      "Stop thinking trade-by-trade. Start thinking portfolio-by-portfolio. Check concentration, correlation, exposure, and capital allocation before you add size. Next: find these metrics on your live terminal.",
    takeaway: "One portfolio · total exposure · operator mindset.",
    visual: "recap",
    holdMs: 2400,
  },
];
