/**
 * BOOT STORAGE GUARD.
 *
 * Runs once on the client, BEFORE the terminal modules (and their persisted
 * store hydration) execute. Its job is to make sure a bloated or corrupted
 * localStorage entry can never crash the renderer on load.
 *
 * The terminal persists a lot of state (layouts, journals, memory archives,
 * desk presets). If any one of those grows unexpectedly large — or a layout
 * blob gets corrupted with garbage dimensions — parsing and rendering it can
 * spike memory and produce a browser "Aw, Snap" / Out-of-Memory crash that the
 * React error boundary can never catch (the renderer dies first).
 *
 * This guard caps total usage and removes oversized non-essential keys so the
 * app always boots into a recoverable state. It is intentionally conservative:
 * it only acts when something is genuinely oversized, so a normal user's
 * preferences are never touched.
 */

const MAX_TOTAL_BYTES = 3_500_000; // ~3.5 MB across all eq state
const MAX_KEY_BYTES = 700_000; // ~0.7 MB for any single key

/** Keys we never prune — losing them would log the user out / break auth. */
function isEssential(key: string): boolean {
  const k = key.toLowerCase();
  return (
    k.includes("auth") ||
    k.includes("session") ||
    k.includes("siwe") ||
    k.includes("agent") ||
    k.includes("wallet") ||
    k.includes("wagmi")
  );
}

interface KeySize {
  key: string;
  size: number;
}

export function guardBootStorage(): void {
  if (typeof window === "undefined") return;
  let ls: Storage;
  try {
    ls = window.localStorage;
  } catch {
    return; // storage blocked entirely — nothing to guard
  }

  try {
    const sizes: KeySize[] = [];
    let total = 0;
    for (let i = 0; i < ls.length; i += 1) {
      const key = ls.key(i);
      if (!key) continue;
      const value = ls.getItem(key) ?? "";
      // Approx UTF-16 byte size; precise enough for a budget check.
      const size = (key.length + value.length) * 2;
      sizes.push({ key, size });
      total += size;
    }

    const removed: string[] = [];

    // 1. Drop any individual key that is absurdly large (likely corrupt/runaway).
    for (const { key, size } of sizes) {
      if (size > MAX_KEY_BYTES && !isEssential(key)) {
        ls.removeItem(key);
        removed.push(key);
      }
    }

    // 2. If still over the total budget, evict the largest non-essential keys
    //    until we are back under budget.
    if (total > MAX_TOTAL_BYTES) {
      const candidates = sizes
        .filter((s) => !isEssential(s.key) && !removed.includes(s.key))
        .sort((a, b) => b.size - a.size);
      let running = total;
      for (const { key, size } of candidates) {
        if (running <= MAX_TOTAL_BYTES) break;
        ls.removeItem(key);
        removed.push(key);
        running -= size;
      }
    }

    if (removed.length > 0 && typeof console !== "undefined") {
      console.warn(
        `[Equilibrium] Boot storage guard pruned ${removed.length} oversized key(s) to prevent an out-of-memory crash:`,
        removed,
      );
    }
  } catch {
    // As a last resort, never let the guard itself break boot.
  }
}
