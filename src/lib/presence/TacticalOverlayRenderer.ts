import { TERMINAL_COLORS } from "@/lib/theme";
import { EQ_CHART, REGIME_VISUAL } from "@/lib/theme/equilibrium-visual";
import type { MarketRegime } from "@/types/market-atmosphere";
import type {
  ExecutionMarker,
  LiquidationZone,
  LiquidityBand,
  TacticalOverlayFrame,
} from "@/types/market-atmosphere";

export interface OverlayDrawContext {
  regime: MarketRegime;
  stressScore: number;
}

export interface OverlayViewport {
  width: number;
  height: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

function priceToY(
  price: number,
  min: number,
  max: number,
  top: number,
  bottom: number,
): number {
  if (max <= min) return (top + bottom) / 2;
  const t = (price - min) / (max - min);
  return bottom - t * (bottom - top);
}

/**
 * Canvas renderer for tactical chart overlays — liquidity bands, liq zones, executions.
 * No CSS animation; redrawn only when frame.version changes.
 */
export class TacticalOverlayRenderer {
  draw(
    ctx: CanvasRenderingContext2D,
    frame: TacticalOverlayFrame,
    viewport: OverlayViewport,
    context?: OverlayDrawContext,
  ): void {
    const { width, height, paddingTop, paddingBottom, paddingLeft, paddingRight } =
      viewport;
    const plotTop = paddingTop;
    const plotBottom = height - paddingBottom;
    const plotLeft = paddingLeft;
    const plotRight = width - paddingRight;
    const plotW = plotRight - plotLeft;

    ctx.clearRect(0, 0, width, height);

    if (frame.priceMax <= frame.priceMin) return;

    this.drawInstitutionalGrid(ctx, plotLeft, plotRight, plotTop, plotBottom);
    if (context) {
      this.drawVolatilityVeil(
        ctx,
        plotLeft,
        plotRight,
        plotTop,
        plotBottom,
        context.regime,
        context.stressScore,
      );
    }

    this.drawLiquidationZones(
      ctx,
      frame.liquidationZones,
      frame.priceMin,
      frame.priceMax,
      plotLeft,
      plotRight,
      plotTop,
      plotBottom,
    );

    this.drawLiquidityBands(
      ctx,
      frame.liquidityBands,
      frame.priceMin,
      frame.priceMax,
      plotLeft,
      plotW,
      plotTop,
      plotBottom,
    );

    this.drawExecutionMarkers(
      ctx,
      frame.executionMarkers,
      frame.priceMin,
      frame.priceMax,
      plotLeft,
      plotRight,
      plotTop,
      plotBottom,
    );

    if (frame.mid !== null) {
      const y = priceToY(
        frame.mid,
        frame.priceMin,
        frame.priceMax,
        plotTop,
        plotBottom,
      );
      ctx.strokeStyle = EQ_CHART.crosshair;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(plotLeft, y);
      ctx.lineTo(plotRight, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  private drawInstitutionalGrid(
    ctx: CanvasRenderingContext2D,
    left: number,
    right: number,
    top: number,
    bottom: number,
  ): void {
    const w = right - left;
    const h = bottom - top;
    const hStep = Math.max(28, h / 8);
    const vStep = Math.max(48, w / 10);
    ctx.strokeStyle = EQ_CHART.grid;
    ctx.lineWidth = 0.5;
    for (let y = top; y <= bottom; y += hStep) {
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }
    for (let x = left; x <= right; x += vStep) {
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
    }
  }

  private drawVolatilityVeil(
    ctx: CanvasRenderingContext2D,
    left: number,
    right: number,
    top: number,
    bottom: number,
    regime: MarketRegime,
    stressScore: number,
  ): void {
    const base = REGIME_VISUAL[regime].veil;
    ctx.fillStyle = base;
    ctx.fillRect(left, top, right - left, bottom - top);
    if (stressScore > 55) {
      const t = Math.min(0.12, (stressScore - 55) / 400);
      ctx.fillStyle = `rgba(196, 45, 82, ${t})`;
      ctx.fillRect(left, top, right - left, (bottom - top) * 0.35);
    }
  }

  private drawLiquidationZones(
    ctx: CanvasRenderingContext2D,
    zones: LiquidationZone[],
    min: number,
    max: number,
    left: number,
    right: number,
    top: number,
    bottom: number,
  ): void {
    for (const zone of zones) {
      const yHigh = priceToY(zone.priceHigh, min, max, top, bottom);
      const yLow = priceToY(zone.priceLow, min, max, top, bottom);
      const h = Math.max(2, yLow - yHigh);
      const alpha = Math.min(0.45, 0.12 + zone.notionalUsd / 2_000_000);
      ctx.fillStyle =
        zone.side === "long"
          ? `rgba(255, 51, 102, ${alpha})`
          : `rgba(0, 255, 136, ${alpha * 0.85})`;
      ctx.fillRect(left, yHigh, right - left, h);
      ctx.strokeStyle =
        zone.side === "long"
          ? "rgba(255, 51, 102, 0.55)"
          : "rgba(0, 255, 136, 0.45)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(left + 0.5, yHigh + 0.5, right - left - 1, h - 1);
    }
  }

  private drawLiquidityBands(
    ctx: CanvasRenderingContext2D,
    bands: LiquidityBand[],
    min: number,
    max: number,
    left: number,
    plotW: number,
    top: number,
    bottom: number,
  ): void {
    const barW = Math.min(48, plotW * 0.12);
    for (const band of bands) {
      const y = priceToY(band.price, min, max, top, bottom);
      const bidW = barW * band.intensity * (band.bidDepth / (band.bidDepth + band.askDepth + 1e-9));
      const askW = barW * band.intensity * (band.askDepth / (band.bidDepth + band.askDepth + 1e-9));

      ctx.fillStyle = `rgba(0, 255, 136, ${0.15 + band.intensity * 0.35})`;
      ctx.fillRect(left, y - 1, bidW, 2);

      ctx.fillStyle = `rgba(255, 51, 102, ${0.15 + band.intensity * 0.35})`;
      ctx.fillRect(left + barW - askW, y - 1, askW, 2);
    }
  }

  private drawExecutionMarkers(
    ctx: CanvasRenderingContext2D,
    markers: ExecutionMarker[],
    min: number,
    max: number,
    left: number,
    right: number,
    top: number,
    bottom: number,
  ): void {
    const now = Date.now();
    for (const m of markers) {
      const age = now - m.timestamp;
      if (age > 120_000) continue;
      const y = priceToY(m.price, min, max, top, bottom);
      const fade = Math.max(0.25, 1 - age / 120_000);
      const isBuy = m.side === "buy";
      const x = isBuy ? left + 6 : right - 6;
      const size = Math.min(6, 2 + Math.log10(m.notionalUsd + 1));

      ctx.fillStyle = isBuy
        ? `rgba(0, 255, 136, ${fade})`
        : `rgba(255, 51, 102, ${fade})`;
      ctx.beginPath();
      if (isBuy) {
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y + size * 0.6);
        ctx.lineTo(x - size * 0.4, y + size * 0.6);
      } else {
        ctx.moveTo(x, y + size);
        ctx.lineTo(x - size, y - size * 0.6);
        ctx.lineTo(x + size * 0.4, y - size * 0.6);
      }
      ctx.closePath();
      ctx.fill();

      if (m.notionalUsd >= 75_000) {
        ctx.strokeStyle = isBuy ? TERMINAL_COLORS.up : TERMINAL_COLORS.down;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

export const tacticalOverlayRenderer = new TacticalOverlayRenderer();
