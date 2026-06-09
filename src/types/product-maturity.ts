/** Phase 59 — Institutional experience refinement & product maturity. */

export type ProductMaturityModeId =
  | "design_system"
  | "ergonomic_ops"
  | "execution_polish"
  | "calm_operations"
  | "immersion";

export interface MaturityTokenRow {
  id: string;
  domain: string;
  token: string;
  value: string;
}

export interface ErgonomicsRow {
  id: string;
  control: string;
  state: string;
  recommendation: string;
}

export interface ExecutionPolishRow {
  id: string;
  flow: string;
  status: string;
  latency: string;
}

export interface CalmnessRow {
  id: string;
  signal: string;
  level: string;
  action: string;
}

export interface ImmersionRow {
  id: string;
  layer: string;
  state: string;
}

export interface MicroInteractionRow {
  id: string;
  surface: string;
  behavior: string;
}

export interface BrandIdentityRow {
  id: string;
  element: string;
  tone: string;
}

export interface AccessibilityRow {
  id: string;
  control: string;
  status: string;
  comfort: string;
}

export interface ProductMaturityDashboardMode {
  id: ProductMaturityModeId;
  label: string;
  description: string;
  panels: string[];
}

export interface ProductMaturityTelemetrySnapshot {
  calmEnabled: boolean;
  reducedMotion: boolean;
  density: string;
  polishScore: number;
  computeLatencyMs: number;
}

export interface ProductMaturitySnapshot {
  asset: string;
  designTokens: MaturityTokenRow[];
  ergonomics: ErgonomicsRow[];
  executionPolish: ExecutionPolishRow[];
  calmness: CalmnessRow[];
  immersion: ImmersionRow[];
  microInteractions: MicroInteractionRow[];
  brandIdentity: BrandIdentityRow[];
  accessibility: AccessibilityRow[];
  maturityBrief: string;
  dashboardModes: ProductMaturityDashboardMode[];
  activeMode: ProductMaturityModeId;
  telemetry: ProductMaturityTelemetrySnapshot;
  polishScore: number;
  updatedAt: number;
}
