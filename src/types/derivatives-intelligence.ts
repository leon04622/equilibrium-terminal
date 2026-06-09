/** Phase 45 — Options, derivatives & volatility intelligence. */

import type { ExchangeId } from "@/types/multi-exchange";

export type OptionsVenueId = "deribit" | "binance_options" | "okx_options" | "cme";

export type VolatilityRegime = "compression" | "neutral" | "expansion" | "stress";

export type DerivativesMarketRegime =
  | "low_leverage"
  | "funding_stress"
  | "gamma_pin"
  | "vol_expansion"
  | "liquidation_risk"
  | "fragile";

export type DerivativesAlertKind =
  | "iv_expansion"
  | "funding_spike"
  | "oi_explosion"
  | "gamma_squeeze"
  | "positioning_dislocation"
  | "vol_regime_shift"
  | "liquidation_pressure";

export type DerivativesDashboardModeId =
  | "vol_trader"
  | "options_chain"
  | "funding_monitor"
  | "gamma_desk"
  | "cross_market";

export interface OptionChainRow {
  venue: OptionsVenueId;
  instrument: string;
  strike: number;
  expiry: string;
  side: "call" | "put";
  markIv: number;
  delta: number;
  gamma: number;
  openInterest: number;
  volume24h: number;
}

export interface VolatilityMetrics {
  impliedVolAtm: number;
  realizedVol: number;
  volSpread: number;
  regime: VolatilityRegime;
  termStructureSlope: number;
  skew25d: number;
  smileCurvature: number;
  compressionScore: number;
}

export interface OptionsAnalytics {
  putCallRatio: number;
  maxPainStrike: number;
  oiConcentrationScore: number;
  ivSurfacePoints: number;
  strikeLadder: Array<{ strike: number; callOi: number; putOi: number }>;
}

export interface GammaPositioning {
  netGammaExposure: number;
  dealerGammaBias: "long_gamma" | "short_gamma" | "neutral";
  squeezeRiskScore: number;
  expiryPressureScore: number;
  pinStrike: number | null;
  supportResistance: Array<{ price: number; strength: number }>;
}

export interface PerpFundingAnalytics {
  hlFundingBps: number;
  crossVenueFundingBps: number;
  fundingDivergenceBps: number;
  oiGrowthPct: number;
  leverageConcentration: number;
  crowdingBias: "long" | "short" | "neutral";
  liquidationPressureScore: number;
}

export interface DerivativesMarketState {
  regime: DerivativesMarketRegime;
  leverageSaturation: number;
  volatilityRegime: VolatilityRegime;
  optionsPressure: number;
  dealerPositioning: string;
  fundingStress: number;
  fragilityScore: number;
}

export interface CrossMarketDerivatives {
  spotPerpBasisBps: number;
  volPriceCorrelation: number;
  leverageLiquidityGap: number;
  optionsSpotSkew: number;
  crossVenueFragmentation: number;
}

export interface DerivativesAlert {
  id: string;
  kind: DerivativesAlertKind;
  severity: "info" | "watch" | "critical";
  headline: string;
  detail: string;
  timestamp: number;
}

export interface DerivativesDashboardMode {
  id: DerivativesDashboardModeId;
  label: string;
  description: string;
  panels: string[];
  chartOverlays: string[];
}

export interface DerivativesTelemetrySnapshot {
  optionsRows: number;
  lastIngestAt: number;
  computeLatencyMs: number;
  feedQualityScore: number;
}

export interface DerivativesIntelligenceSnapshot {
  asset: string;
  volatility: VolatilityMetrics;
  options: OptionsAnalytics;
  gamma: GammaPositioning;
  funding: PerpFundingAnalytics;
  marketState: DerivativesMarketState;
  crossMarket: CrossMarketDerivatives;
  chain: OptionChainRow[];
  alerts: DerivativesAlert[];
  dashboardModes: DerivativesDashboardMode[];
  activeMode: DerivativesDashboardModeId;
  telemetry: DerivativesTelemetrySnapshot;
  derivativesScore: number;
  updatedAt: number;
}
