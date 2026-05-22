import { useMarketAtmosphereStore } from "@/store/useMarketAtmosphereStore";
import type { InstitutionalWatch } from "@/types/market-coverage";

const BASE_WATCHES: InstitutionalWatch[] = [
  {
    id: "iw-btc-etf",
    entity: "BTC SPOT ETF COMPLEX",
    category: "etf",
    note: "Flow context via macro tape — extend with issuer feed",
    updatedAt: Date.now(),
  },
  {
    id: "iw-eth-etf",
    entity: "ETH SPOT ETF COMPLEX",
    category: "etf",
    note: "Session handoff sensitivity on ETH beta",
    updatedAt: Date.now(),
  },
  {
    id: "iw-mm",
    entity: "MARKET MAKER RESERVES",
    category: "market_maker",
    note: "HL book depth as primary live signal",
    updatedAt: Date.now(),
  },
  {
    id: "iw-usdt",
    entity: "TETHER (USDT)",
    category: "stablecoin_issuer",
    note: "Mint/redeem monitoring — staged",
    updatedAt: Date.now(),
  },
  {
    id: "iw-usdc",
    entity: "CIRCLE (USDC)",
    category: "stablecoin_issuer",
    note: "Reserve attestation context — staged",
    updatedAt: Date.now(),
  },
  {
    id: "iw-ex-res",
    entity: "EXCHANGE RESERVES",
    category: "exchange_reserve",
    note: "Cross-venue reserve transparency index — staged",
    updatedAt: Date.now(),
  },
];

export class InstitutionalMonitorEngine {
  static list(): InstitutionalWatch[] {
    const macro = useMarketAtmosphereStore.getState().macro;
    const lead = macro.find((m) => Math.abs(m.changePct) === Math.max(...macro.map((r) => Math.abs(r.changePct))));
    const dynamic: InstitutionalWatch = {
      id: "iw-macro-lead",
      entity: `MACRO LEAD · ${lead?.label ?? "—"}`,
      category: "fund",
      note: `${lead?.changePct?.toFixed(2) ?? "—"}% — institutional macro context`,
      updatedAt: Date.now(),
    };
    return [dynamic, ...BASE_WATCHES];
  }
}
