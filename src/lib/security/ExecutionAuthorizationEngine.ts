import { evaluateExecutionGuards } from "@/lib/wedge/executionGuards";
import { RbacEngine } from "@/lib/security/RbacEngine";
import { builderFeeLabel, requiresBuilderFeeForLivePerp } from "@/lib/hyperliquid/builder";
import type { ExecutionAuthDecision, ExecutionAuthInput } from "@/types/security-trust";

/**
 * Execution-scoped authorization — isolated from workspace/config JWT paths.
 * Hyperliquid agent keys remain client-side ephemeral; this layer gates *when* signing may occur.
 */
export class ExecutionAuthorizationEngine {
  static authorize(input: ExecutionAuthInput): ExecutionAuthDecision {
    const paper = input.executionMode === "paper";
    if (paper && (input.operation === "place_order" || input.operation === "close_position")) {
      if (input.markPx == null || input.markPx <= 0) {
        return {
          allowed: false,
          reason: "Live price unavailable — wait for market data",
          auditAction: input.operation,
        };
      }
      return { allowed: true, reason: "ok", auditAction: input.operation };
    }

    const guard = evaluateExecutionGuards({
      connectionStatus: input.connectionStatus as import("@/types/terminal-schema").ConnectionStatus,
      lastMessageAt: input.lastMessageAt,
      markPx: input.markPx,
    });
    if (guard.blocked) {
      return {
        allowed: false,
        reason: guard.reason ?? "execution_blocked",
        auditAction: input.operation,
      };
    }

    if (!input.walletAddress) {
      return {
        allowed: false,
        reason: "Wallet not connected",
        auditAction: input.operation,
      };
    }

    if (input.operation === "approve_agent") {
      return { allowed: true, reason: "ok", auditAction: "approve_agent" };
    }

    if (!input.oneClickEnabled) {
      return {
        allowed: false,
        reason: "1-Click execution not authorized — approve agent first",
        auditAction: input.operation,
      };
    }

    const needsBuilder =
      requiresBuilderFeeForLivePerp(input.executionMode ?? "live", Boolean(input.isPerp)) &&
      (input.operation === "place_order" || input.operation === "close_position");
    if (needsBuilder && !input.builderFeeApproved) {
      return {
        allowed: false,
        reason: `Approve trading fee (${builderFeeLabel()} on perp fills) to continue`,
        auditAction: input.operation,
      };
    }

    const perm =
      input.operation === "close_position"
        ? "execution.close"
        : input.operation === "update_leverage"
          ? "execution.approve_agent"
          : "execution.place";

    const rbac = RbacEngine.authorize(input.claims, perm);
    if (!rbac.allowed) {
      return {
        allowed: false,
        reason: `Role denied: ${rbac.reason}`,
        auditAction: input.operation,
      };
    }

    if (
      input.claims &&
      input.claims.wallet.toLowerCase() !== input.walletAddress.toLowerCase()
    ) {
      return {
        allowed: false,
        reason: "Session wallet mismatch — re-authenticate",
        auditAction: input.operation,
      };
    }

    return { allowed: true, reason: "ok", auditAction: input.operation };
  }
}

export const executionAuthorizationEngine = ExecutionAuthorizationEngine;
