import type { Address } from "viem";
import {
  fetchClearinghouseState,
  fetchSpotClearinghouseState,
} from "@/lib/hyperliquid/api";
import type { HlClearinghouseState, HlSpotClearinghouseState } from "@/types/account";

const FILL_SYNC_DELAYS_MS = [0, 450, 1_200] as const;

export async function refreshAccountAfterFill(
  user: Address,
  applyClearinghouse: (state: HlClearinghouseState, user: string | null) => Promise<void>,
  applySpotClearinghouse?: (state: HlSpotClearinghouseState) => void,
): Promise<void> {
  for (const delay of FILL_SYNC_DELAYS_MS) {
    if (delay > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, delay));
    }
    try {
      const [perp, spot] = await Promise.all([
        fetchClearinghouseState(user),
        fetchSpotClearinghouseState(user),
      ]);
      await applyClearinghouse(perp, user);
      applySpotClearinghouse?.(spot);
    } catch {
      /* best-effort — WS may also deliver clearinghouse updates */
    }
  }
}
