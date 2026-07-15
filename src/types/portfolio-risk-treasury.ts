/** Phase 44 — Portfolio, risk & treasury management infrastructure. */

import type { ExchangeId } from "@/types/multi-exchange";

export type PortfolioHoldingCategory =
  | "perp"
  | "spot"
  | "stablecoin"
  | "staking"
  | "treasury"
  | "wallet"
  | "collateral";

export type PortfolioDashboardModeId =
  | "trader_risk"
  | "treasury_ops"
  | "portfolio_overview"
  | "collateral_mgmt"
  | "exposure_monitor";

export type PortfolioRiskAlertKind =
  | "liquidation_risk"
  | "leverage_spike"
  | "collateral_deterioration"
  | "treasury_imbalance"
  | "stablecoin_risk"
  | "concentration_risk"
  | "venue_dependency"
  | "var_breach"
  | "margin_call";

export interface PortfolioHoldingRow {
  asset: string;
  category: PortfolioHoldingCategory;
  venue: string;
  balanceUsd: number;
  notionalUsd: number;
  pctPortfolio: number;
  leverage: number;
  pnlUsd: number;
}

export interface UnifiedPortfolioSummary {
  totalAumUsd: number;
  accountValueUsd: number;
  withdrawableUsd: number;
  netExposureUsd: number;
  netPnlUsd: number;
  positionCount: number;
  venueCount: number;
  holdings: PortfolioHoldingRow[];
}

export interface RiskMetrics {
  leverageRatio: number;
  marginUtilizationPct: number;
  liquidationRiskScore: number;
  collateralHealthScore: number;
  concentrationScore: number;
  stablecoinDependencyPct: number;
  volatilityExposureScore: number;
  directionalBias: "long" | "short" | "neutral";
  correlationStress: number;
  riskTier: "low" | "moderate" | "elevated" | "critical";
}

export interface TreasuryVisibility {
  stablecoinBalanceUsd: number;
  stablecoinPct: number;
  exchangeAllocationPct: number;
  coldHotRatio: number;
  operationalLiquidityUsd: number;
  bridgeExposureUsd: number;
  custodyExposureScore: number;
  flowVelocity: "stable" | "active" | "stressed";
}

export interface PortfolioAnalytics {
  realizedPnlUsd: number;
  unrealizedPnlUsd: number;
  totalPnlUsd: number;
  maxDrawdownPct: number;
  sharpeProxy: number;
  capitalEfficiencyScore: number;
  exposureHeat: number;
  riskAdjustedReturn: number;
}

export interface CollateralLiquidityMetrics {
  availableCollateralUsd: number;
  utilizationPct: number;
  marginHealthScore: number;
  borrowingExposureUsd: number;
  fundingCostBps: number;
  liquidationProximityPct: number;
  crossMarginDependency: number;
}

export interface CrossVenuePositionRow {
  venue: ExchangeId | "Hyperliquid" | "Wallet" | "Treasury";
  asset: string;
  notionalUsd: number;
  pctTotal: number;
  leverage: number;
  riskBand: "low" | "moderate" | "elevated" | "critical";
}

export interface PortfolioRiskAlert {
  id: string;
  kind: PortfolioRiskAlertKind;
  severity: "info" | "watch" | "critical";
  headline: string;
  detail: string;
  timestamp: number;
}

export interface PortfolioDashboardMode {
  id: PortfolioDashboardModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface PortfolioHistoryPoint {
  timestamp: number;
  accountValueUsd: number;
  leverageRatio: number;
  netPnlUsd: number;
  riskScore: number;
}

export interface PortfolioDeskTelemetrySnapshot {
  computeLatencyMs: number;
  historyPoints: number;
  lastAccountSyncAt: number;
  dataQualityScore: number;
}

export interface PortfolioDeskSnapshot {
  asset: string;
  portfolio: UnifiedPortfolioSummary;
  risk: RiskMetrics;
  treasury: TreasuryVisibility;
  analytics: PortfolioAnalytics;
  collateral: CollateralLiquidityMetrics;
  crossVenue: CrossVenuePositionRow[];
  alerts: PortfolioRiskAlert[];
  dashboardModes: PortfolioDashboardMode[];
  activeMode: PortfolioDashboardModeId;
  history: PortfolioHistoryPoint[];
  telemetry: PortfolioDeskTelemetrySnapshot;
  portfolioHealthScore: number;
  updatedAt: number;
}
