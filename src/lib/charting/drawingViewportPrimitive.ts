import type { ISeriesPrimitive, SeriesAttachedParameter, Time } from "lightweight-charts";

type ViewportListener = () => void;

/**
 * Invisible series primitive whose updateAllViews() fires whenever the chart
 * viewport changes (pan, zoom, price autoscale, resize). Used to keep SVG
 * drawing overlays in sync with the canvas.
 */
export class DrawingViewportPrimitive implements ISeriesPrimitive<Time> {
  private listener: ViewportListener | null = null;

  private readonly emptyPaneViews: readonly [] = [];

  setListener(next: ViewportListener | null) {
    this.listener = next;
  }

  updateAllViews() {
    this.listener?.();
  }

  paneViews() {
    return this.emptyPaneViews;
  }

  attached(_param: SeriesAttachedParameter<Time>) {}

  detached() {
    this.listener = null;
  }
}
