const RELOAD_KEY = "eq-terminal-chunk-reload";

/** True when webpack/Next failed to fetch a stale JS chunk after a new deploy. */
export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("loading chunk") ||
    msg.includes("failed to fetch dynamically imported module") ||
    msg.includes("importing a module script failed") ||
    error.name === "ChunkLoadError"
  );
}

/**
 * Hard-refresh once per tab session so cached HTML picks up current _next/static hashes.
 * Returns true if a reload was triggered (caller should stop rendering).
 */
export function recoverFromChunkLoadError(error: unknown): boolean {
  if (!isChunkLoadError(error)) return false;
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(RELOAD_KEY)) return false;

  sessionStorage.setItem(RELOAD_KEY, "1");
  const url = new URL(window.location.href);
  url.searchParams.set("_cb", String(Date.now()));
  window.location.replace(url.toString());
  return true;
}

export function clearChunkReloadFlag(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(RELOAD_KEY);
}
