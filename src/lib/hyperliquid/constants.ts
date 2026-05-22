/** Hyperliquid mainnet endpoints (Info + Exchange + WS). */

export const HL_WS_URL = "wss://api.hyperliquid.xyz/ws";
export const HL_INFO_HTTP_URL = "https://api.hyperliquid.xyz/info";
export const HL_EXCHANGE_URL = "https://api.hyperliquid.xyz/exchange";
export const HL_CHAIN = "Mainnet" as const;

/** EIP-712 approveAgent signatures must be signed on Arbitrum One (Hyperliquid mainnet). */
export const HL_SIGNATURE_CHAIN_ID = 42_161;

export const WHALE_NOTIONAL_USD = 75_000;
export const MARKET_SLIPPAGE = 0.008;
export const HEARTBEAT_MS = 30_000;
export const STALE_MS = 60_000;
