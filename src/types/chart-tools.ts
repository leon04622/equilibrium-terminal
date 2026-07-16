/** Chart studies, drawings, and trade overlays. */

import type { ChartPoint } from "@/lib/charting/chartDrawing";

export type MagnetMode = "off" | "weak" | "strong";

export type ChartDrawTool =
  | "none"
  | "crosshair"
  | "arrow"
  | "eraser"
  | "zoom"
  | "measure"
  | "line-trend"
  | "line-ray"
  | "line-info"
  | "line-extended"
  | "line-angle"
  | "line-hline"
  | "line-hray"
  | "line-vline"
  | "line-cross"
  | "channel-parallel"
  | "channel-regression"
  | "channel-flat"
  | "channel-disjoint"
  | "pitchfork"
  | "pitchfork-schiff"
  | "pitchfork-modified"
  | "pitchfork-inside"
  | "fib-retracement"
  | "fib-extension"
  | "fib-channel"
  | "fib-timezone"
  | "fib-fan"
  | "fib-time"
  | "fib-circles"
  | "gann-box"
  | "gann-fan"
  | "gann-square"
  | "shape-brush"
  | "shape-highlighter"
  | "shape-rectangle"
  | "shape-circle"
  | "anno-text"
  | "anno-note"
  | "anno-callout"
  | "pat-xabcd"
  | "pat-hs"
  | "pat-elliott"
  | "pred-long"
  | "pred-short"
  | "pred-measure"
  | "icon-star";

export type LineExtend = "segment" | "both" | "right" | "left";

export type ChartDrawing =
  | {
      id: string;
      coin: string;
      kind: "line";
      p1: ChartPoint;
      p2: ChartPoint;
      extend: LineExtend;
      variant: "trend" | "ray" | "info" | "extended" | "angle" | "regression";
      color: string;
      createdAt: number;
    }
  | {
      id: string;
      coin: string;
      kind: "hline";
      price: number;
      fromTime?: number;
      color: string;
      createdAt: number;
    }
  | {
      id: string;
      coin: string;
      kind: "vline";
      time: number;
      color: string;
      createdAt: number;
    }
  | {
      id: string;
      coin: string;
      kind: "cross";
      time: number;
      price: number;
      color: string;
      createdAt: number;
    }
  | {
      id: string;
      coin: string;
      kind: "channel";
      p1: ChartPoint;
      p2: ChartPoint;
      p3: ChartPoint;
      variant: "parallel" | "flat" | "disjoint";
      color: string;
      createdAt: number;
    }
  | {
      id: string;
      coin: string;
      kind: "pitchfork";
      p1: ChartPoint;
      p2: ChartPoint;
      p3: ChartPoint;
      variant: "standard" | "schiff" | "modified" | "inside";
      color: string;
      createdAt: number;
    }
  | {
      id: string;
      coin: string;
      kind: "fib";
      p1: ChartPoint;
      p2: ChartPoint;
      variant: "retracement" | "extension" | "channel" | "timezone" | "fan" | "time" | "circles";
      color: string;
      createdAt: number;
    }
  | {
      id: string;
      coin: string;
      kind: "gann";
      p1: ChartPoint;
      p2: ChartPoint;
      variant: "box" | "fan" | "square";
      color: string;
      createdAt: number;
    }
  | {
      id: string;
      coin: string;
      kind: "rect";
      p1: ChartPoint;
      p2: ChartPoint;
      variant: "rectangle" | "circle" | "brush" | "highlighter";
      path?: ChartPoint[];
      color: string;
      createdAt: number;
    }
  | {
      id: string;
      coin: string;
      kind: "text";
      point: ChartPoint;
      text: string;
      variant: "text" | "note" | "callout";
      color: string;
      createdAt: number;
    }
  | {
      id: string;
      coin: string;
      kind: "pattern";
      points: ChartPoint[];
      variant: "xabcd" | "hs" | "elliott";
      color: string;
      createdAt: number;
    }
  | {
      id: string;
      coin: string;
      kind: "position";
      p1: ChartPoint;
      p2: ChartPoint;
      variant: "long" | "short" | "measure";
      color: string;
      createdAt: number;
    }
  | {
      id: string;
      coin: string;
      kind: "icon";
      point: ChartPoint;
      emoji: string;
      color: string;
      createdAt: number;
    };

/** @deprecated legacy horizontal line storage */
export interface ChartHorizontalLine {
  id: string;
  coin: string;
  price: number;
  color: string;
  label: string;
  createdAt: number;
}

/** @deprecated legacy trend line storage */
export interface ChartTrendLine {
  id: string;
  coin: string;
  time1: number;
  price1: number;
  time2: number;
  price2: number;
  color: string;
  createdAt: number;
}

export interface ChartDrawingPrefs {
  magnet?: boolean;
  magnetMode: MagnetMode;
  stayInDrawingMode: boolean;
  lockDrawings: boolean;
  hideDrawings: boolean;
}

export const DEFAULT_DRAWING_PREFS: ChartDrawingPrefs = {
  magnetMode: "off",
  stayInDrawingMode: false,
  lockDrawings: false,
  hideDrawings: false,
};

export interface ChartTicketPreview {
  limit?: number;
  stop?: number;
}

export type ChartIndicatorId = string;
