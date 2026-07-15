/** Equilibrium Terminal Hyperliquid builder code configuration. */

export const EQUILIBRIUM_BUILDER_ADDRESS = (
  process.env.NEXT_PUBLIC_EQUILIBRIUM_BUILDER_ADDRESS ??
  "0xad9be64fd7a35d99a138b87cb212baefbcdcf045"
).toLowerCase();

/** Max fee rate the user approves via ApproveBuilderFee (main wallet signature). */
export const BUILDER_MAX_FEE_RATE = "0.0100%";

/** Per-order builder fee in tenths of basis points (10 = 1 bp = 0.01%). */
export const BUILDER_FEE_TENTHS_BPS = 10;

/** Human-readable per-fill fee when builder is attached. */
export const BUILDER_ORDER_FEE_RATE = "0.01%";

export function isBuilderFeeSufficient(maxFeeTenthsBps: number): boolean {
  return maxFeeTenthsBps >= BUILDER_FEE_TENTHS_BPS;
}

export function builderFeeLabel(): string {
  return BUILDER_ORDER_FEE_RATE;
}

export function builderMaxFeeLabel(): string {
  return BUILDER_MAX_FEE_RATE;
}

export function requiresBuilderFeeForLivePerp(
  executionMode: "paper" | "live",
  isPerp: boolean,
): boolean {
  return executionMode === "live" && isPerp;
}
