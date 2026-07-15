import { create } from "zustand";

export interface WireArticleContext {
  url: string;
  headline: string;
  detail?: string;
  source?: string;
  timestamp?: number;
  coin?: string | null;
}

interface ArticleReaderState extends WireArticleContext {
  open: boolean;
  openArticle: (ctx: WireArticleContext) => void;
  close: () => void;
}

const EMPTY: WireArticleContext = {
  url: "",
  headline: "",
  detail: "",
  source: "",
  timestamp: 0,
  coin: null,
};

export const useArticleReaderStore = create<ArticleReaderState>()((set) => ({
  ...EMPTY,
  open: false,
  openArticle: (ctx) =>
    set({
      open: true,
      url: ctx.url,
      headline: ctx.headline,
      detail: ctx.detail ?? "",
      source: ctx.source ?? "",
      timestamp: ctx.timestamp ?? Date.now(),
      coin: ctx.coin ?? null,
    }),
  close: () => set({ open: false }),
}));

export function openWireArticle(ctx: WireArticleContext): void {
  useArticleReaderStore.getState().openArticle(ctx);
}
