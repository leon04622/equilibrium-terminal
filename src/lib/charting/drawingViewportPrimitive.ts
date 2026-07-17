import type { ISeriesPrimitive, SeriesAttachedParameter, Time } from "lightweight-charts";

export type ViewportListener = () => void;

/**
 * Invisible series primitive whose updateAllViews() fires whenever the chart
 * viewport changes (pan, zoom, price autoscale, resize). Used to keep SVG
 * drawing overlays in sync with the canvas.
 */
export class DrawingViewportPrimitive implements ISeriesPrimitive<Time> {
  private readonly listeners = new Set<ViewportListener>();

  private readonly emptyPaneViews: readonly [] = [];

  subscribe(listener: ViewportListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  updateAllViews() {
    this.listeners.forEach((listener) => listener());
  }

  paneViews() {
    return this.emptyPaneViews;
  }

  attached(_param: SeriesAttachedParameter<Time>) {}

  detached() {
    this.listeners.clear();
  }
}
