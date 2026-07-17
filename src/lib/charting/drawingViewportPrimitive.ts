import type { CanvasRenderingTarget2D } from "fancy-canvas";
import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  ISeriesPrimitivePaneRenderer,
  ISeriesPrimitivePaneView,
  SeriesAttachedParameter,
  Time,
} from "lightweight-charts";
import { paintDrawingsOnTarget, type DrawingPaintState } from "@/lib/charting/drawingCanvasPaint";
import type { ChartDrawing } from "@/types/chart-tools";

export type ViewportListener = () => void;

class DrawingPaneRenderer implements ISeriesPrimitivePaneRenderer {
  constructor(private readonly source: DrawingViewportPrimitive) {}

  draw(target: CanvasRenderingTarget2D): void {
    const chart = this.source.getChart();
    const series = this.source.getSeries();
    if (!chart || !series) return;
    paintDrawingsOnTarget(target, chart, series, this.source.getPaintState());
  }
}

class DrawingPaneView implements ISeriesPrimitivePaneView {
  private readonly rendererObj: DrawingPaneRenderer;

  constructor(source: DrawingViewportPrimitive) {
    this.rendererObj = new DrawingPaneRenderer(source);
  }

  renderer(): ISeriesPrimitivePaneRenderer {
    return this.rendererObj;
  }
}

/**
 * Series primitive that paints drawings on the chart canvas (zero React cost during pan)
 * and notifies lightweight SVG interaction layers when the viewport moves.
 */
export class DrawingViewportPrimitive implements ISeriesPrimitive<Time> {
  private readonly listeners = new Set<ViewportListener>();

  private readonly paneView: DrawingPaneView;

  private chart: IChartApi | null = null;

  private series: ISeriesApi<"Candlestick"> | null = null;

  private requestUpdate: (() => void) | null = null;

  private state: DrawingPaintState = {
    hidden: false,
    selectedId: null,
    drawings: [],
    skipId: null,
  };

  constructor() {
    this.paneView = new DrawingPaneView(this);
  }

  getChart(): IChartApi | null {
    return this.chart;
  }

  getSeries(): ISeriesApi<"Candlestick"> | null {
    return this.series;
  }

  getPaintState(): DrawingPaintState {
    return this.state;
  }

  sync(patch: Partial<DrawingPaintState>): void {
    this.state = { ...this.state, ...patch };
    this.requestUpdate?.();
  }

  subscribe(listener: ViewportListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  updateAllViews(): void {
    this.listeners.forEach((listener) => listener());
  }

  paneViews(): readonly DrawingPaneView[] {
    return [this.paneView];
  }

  attached(param: SeriesAttachedParameter<Time>): void {
    this.chart = param.chart;
    this.series = param.series as ISeriesApi<"Candlestick">;
    this.requestUpdate = param.requestUpdate;
    this.requestUpdate();
  }

  detached(): void {
    this.chart = null;
    this.series = null;
    this.requestUpdate = null;
    this.listeners.clear();
    this.state = {
      hidden: false,
      selectedId: null,
      drawings: [],
      skipId: null,
    };
  }
}

export { DrawingViewportPrimitive as DrawingCanvasPrimitive };
