import type { CrossVenueQuote, ExchangeId } from "@/types/multi-exchange";

const quotes = new Map<string, CrossVenueQuote>();

function key(exchange: ExchangeId, asset: string): string {
  return `${exchange}:${asset.toUpperCase()}`;
}

export const multiExchangeMarketState = {
  upsert(quote: CrossVenueQuote): void {
    quotes.set(key(quote.exchange, quote.asset), quote);
  },

  get(exchange: ExchangeId, asset: string): CrossVenueQuote | undefined {
    return quotes.get(key(exchange, asset));
  },

  forAsset(asset: string): CrossVenueQuote[] {
    const upper = asset.toUpperCase();
    return Array.from(quotes.values()).filter((q) => q.asset.toUpperCase() === upper);
  },

  clearAsset(asset: string): void {
    const upper = asset.toUpperCase();
    for (const k of Array.from(quotes.keys())) {
      if (k.endsWith(`:${upper}`)) quotes.delete(k);
    }
  },
};
