/** Canonical Hyperliquid coin id for API / WS (preserves dex:SYMBOL casing). */
export function normalizeHlCoin(coin: string): string {
  const trimmed = coin.trim();
  if (!trimmed) return "BTC";
  if (trimmed.includes(":")) {
    const colon = trimmed.indexOf(":");
    const dex = trimmed.slice(0, colon).toLowerCase();
    const sym = trimmed.slice(colon + 1).toUpperCase();
    return `${dex}:${sym}`;
  }
  const withoutSuffix = trimmed.replace(/-(PERP|SPOT)$/i, "");
  if (withoutSuffix.includes("/")) return withoutSuffix;
  return withoutSuffix.toUpperCase();
}

export function coinsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  return normalizeHlCoin(a) === normalizeHlCoin(b);
}

export function perpDisplaySymbol(coin: string): string {
  if (coin.includes(":")) return coin.split(":")[1] ?? coin;
  return coin;
}

export function perpDisplayPair(coin: string): string {
  return `${perpDisplaySymbol(coin)}-USDC`;
}

export function spotDisplayPair(
  pairName: string,
  tokens: [number, number],
  tokenMeta: Array<{ name: string } | undefined>,
): string {
  if (!pairName.startsWith("@")) return pairName;
  const base = tokenMeta[tokens[0]]?.name;
  const quote = tokenMeta[tokens[1]]?.name;
  if (base && quote) return `${base}/${quote}`;
  return pairName;
}
