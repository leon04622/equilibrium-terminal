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

const KINETIC_SYNC_MS = 750;

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

  private cleanupViewport: (() => void) | null = null;

  private state: DrawingPaintState = {
    hidden: false,
    selectedId: null,
    drawings: [],
    skipId: null,
    draft: null,
    liveEditDrawing: null,
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
    if ("draft" in patch || "liveEditDrawing" in patch) {
      this.notifyListeners();
    }
  }

  subscribe(listener: ViewportListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  private repaint(): void {
    this.requestUpdate?.();
    this.notifyListeners();
  }

  updateAllViews(): void {
    this.repaint();
  }

  paneViews(): readonly DrawingPaneView[] {
    return [this.paneView];
  }

  attached(param: SeriesAttachedParameter<Time>): void {
    this.chart = param.chart;
    this.series = param.series as ISeriesApi<"Candlestick">;
    this.requestUpdate = param.requestUpdate;

    let loopRaf = 0;
    let activeUntil = 0;

    const keepSyncing = () => {
      activeUntil = performance.now() + KINETIC_SYNC_MS;
      this.repaint();
      if (loopRaf) return;
      const kineticLoop = () => {
        if (performance.now() >= activeUntil) {
          loopRaf = 0;
          return;
        }
        this.repaint();
        loopRaf = requestAnimationFrame(kineticLoop);
      };
      loopRaf = requestAnimationFrame(kineticLoop);
    };

    const ts = param.chart.timeScale();
    ts.subscribeVisibleLogicalRangeChange(keepSyncing);
    ts.subscribeVisibleTimeRangeChange(keepSyncing);
    ts.subscribeSizeChange(keepSyncing);

    const el = param.chart.chartElement();
    const onWheel = () => keepSyncing();
    const onPointerDown = () => keepSyncing();
    const onPointerUp = () => keepSyncing();
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    this.cleanupViewport = () => {
      cancelAnimationFrame(loopRaf);
      ts.unsubscribeVisibleLogicalRangeChange(keepSyncing);
      ts.unsubscribeVisibleTimeRangeChange(keepSyncing);
      ts.unsubscribeSizeChange(keepSyncing);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };

    this.repaint();
  }

  detached(): void {
    this.cleanupViewport?.();
    this.cleanupViewport = null;
    this.chart = null;
    this.series = null;
    this.requestUpdate = null;
    this.listeners.clear();
    this.state = {
      hidden: false,
      selectedId: null,
      drawings: [],
      skipId: null,
      draft: null,
      liveEditDrawing: null,
    };
  }
}

export { DrawingViewportPrimitive as DrawingCanvasPrimitive };
