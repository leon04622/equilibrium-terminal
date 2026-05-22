import { TERMINAL_COLORS } from "@/lib/theme";
import type { DomMatrixPacket } from "@/types/execution-intelligence";

export interface DomCanvasTheme {
  bg: string;
  grid: string;
  bid: string;
  ask: string;
  text: string;
  muted: string;
  warn: string;
  ai: string;
}

const DEFAULT_THEME: DomCanvasTheme = {
  bg: TERMINAL_COLORS.canvas,
  grid: TERMINAL_COLORS.border,
  bid: TERMINAL_COLORS.up,
  ask: TERMINAL_COLORS.down,
  text: "#e2e8f0",
  muted: TERMINAL_COLORS.muted,
  warn: TERMINAL_COLORS.warn,
  ai: TERMINAL_COLORS.ai,
};

export class DomCanvasRenderer {
  private readonly theme: DomCanvasTheme;
  private width = 0;
  private height = 0;
  private dpr = 1;

  constructor(theme: DomCanvasTheme = DEFAULT_THEME) {
    this.theme = theme;
  }

  resize(canvas: HTMLCanvasElement, cssWidth: number, cssHeight: number): void {
    this.dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    this.width = Math.max(1, Math.floor(cssWidth * this.dpr));
    this.height = Math.max(1, Math.floor(cssHeight * this.dpr));
    canvas.width = this.width;
    canvas.height = this.height;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
  }

  render(
    ctx: CanvasRenderingContext2D,
    packet: DomMatrixPacket | null,
    options?: { highlightMid?: boolean },
  ): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(this.dpr, this.dpr);
    const cssW = this.width / this.dpr;
    const cssH = this.height / this.dpr;

    ctx.fillStyle = this.theme.bg;
    ctx.fillRect(0, 0, cssW, cssH);

    if (!packet || packet.levels.length === 0) {
      ctx.fillStyle = this.theme.muted;
      ctx.font = "bold 10px JetBrains Mono, monospace";
      ctx.fillText("AWAITING L2 DOM STREAM", 8, 16);
      return;
    }

    const rowH = Math.max(12, Math.floor(cssH / Math.min(packet.levels.length, 40)));
    const colBid = cssW * 0.22;
    const colPx = cssW * 0.38;
    const colAsk = cssW * 0.22;
    const colDelta = cssW * 0.18;

    ctx.strokeStyle = this.theme.grid;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(cssW, 18);
    ctx.stroke();

    ctx.font = "bold 9px JetBrains Mono, monospace";
    ctx.fillStyle = this.theme.muted;
    ctx.fillText("BID SZ", 4, 12);
    ctx.fillText("PRICE", colBid + 4, 12);
    ctx.fillText("ASK SZ", colBid + colPx + 4, 12);
    ctx.fillText("Δ", colBid + colPx + colAsk + 4, 12);

    const midIdx = packet.levels.findIndex((l) => l.priceTick === packet.midTick);

    for (let i = 0; i < packet.levels.length; i++) {
      const level = packet.levels[i];
      if (!level) continue;
      const y = 20 + i * rowH;
      if (y + rowH > cssH) break;

      const isMid = i === midIdx && options?.highlightMid !== false;
      if (isMid) {
        ctx.fillStyle = "rgba(0, 229, 255, 0.08)";
        ctx.fillRect(0, y, cssW, rowH);
      }

      const bidW = colBid * level.heatIntensity;
      const askW = colAsk * level.heatIntensity;
      if (level.bidSize > 0) {
        ctx.fillStyle = level.passiveBlock ? "rgba(0, 255, 136, 0.35)" : "rgba(0, 255, 136, 0.18)";
        ctx.fillRect(colBid - bidW, y + 1, bidW, rowH - 2);
      }
      if (level.askSize > 0) {
        ctx.fillStyle = level.passiveBlock ? "rgba(255, 51, 102, 0.35)" : "rgba(255, 51, 102, 0.18)";
        ctx.fillRect(colBid + colPx, y + 1, askW, rowH - 2);
      }

      if (level.voidScore > 0.65) {
        ctx.strokeStyle = this.theme.warn;
        ctx.strokeRect(0.5, y + 0.5, cssW - 1, rowH - 1);
      }

      ctx.font = "10px JetBrains Mono, monospace";
      ctx.fillStyle = level.bidSize > 0 ? this.theme.bid : this.theme.muted;
      ctx.fillText(level.bidSize > 0 ? level.bidSize.toFixed(4) : "—", 4, y + rowH - 3);

      ctx.fillStyle = isMid ? this.theme.ai : this.theme.text;
      ctx.fillText(level.price.toFixed(2), colBid + 4, y + rowH - 3);

      ctx.fillStyle = level.askSize > 0 ? this.theme.ask : this.theme.muted;
      ctx.fillText(
        level.askSize > 0 ? level.askSize.toFixed(4) : "—",
        colBid + colPx + 4,
        y + rowH - 3,
      );

      const deltaTone =
        level.deltaAtLevel > 0 ? this.theme.bid : level.deltaAtLevel < 0 ? this.theme.ask : this.theme.muted;
      ctx.fillStyle = deltaTone;
      const deltaPrefix = level.deltaAtLevel > 0 ? "+" : "";
      ctx.fillText(
        `${deltaPrefix}${level.deltaAtLevel.toFixed(3)}`,
        colBid + colPx + colAsk + 4,
        y + rowH - 3,
      );

      if (level.passiveBlock) {
        ctx.fillStyle = this.theme.warn;
        ctx.font = "bold 8px JetBrains Mono, monospace";
        ctx.fillText("BLK", cssW - 28, y + rowH - 3);
      }
    }
  }
}
