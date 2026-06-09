import type { OptionChainRow } from "@/types/derivatives-intelligence";

const chains = new Map<string, OptionChainRow[]>();
let lastIngestAt = 0;

export const derivativesMarketState = {
  setChain(asset: string, rows: OptionChainRow[]): void {
    chains.set(asset.toUpperCase(), rows);
    lastIngestAt = Date.now();
  },

  getChain(asset: string): OptionChainRow[] {
    return chains.get(asset.toUpperCase()) ?? [];
  },

  lastIngestAt(): number {
    return lastIngestAt;
  },
};
