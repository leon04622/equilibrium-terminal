"use client";

import { useCallback, useEffect, useState, type ReactNode, type RefObject } from "react";
import type { IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import type { ChartPoint } from "@/lib/charting/chartDrawing";
import {
  FIB_LEVELS,
  channelLines,
  formatMeasure,
  lineAngleDeg,
  linePixels,
  offsetPoint,
  toPixel,
} from "@/lib/charting/drawingRender";
import { useChartToolsStore } from "@/store/useChartToolsStore";
import type { ChartDrawTool, ChartDrawing } from "@/types/chart-tools";

const EMPTY_DRAWINGS: ChartDrawing[] = [];
const PREVIEW_COLOR = "#5b9cf6";
const SELECTED_COLOR = "#62eec4";
const HIT_STROKE_PX = 14;

export interface DrawingLiveEdit {
  drawing?: ChartDrawing;
}

export type DrawingEditStart = {
  drawingId: string;
  snapshot: ChartDrawing;
  part: "body" | "endpoint";
  anchor?: ChartPoint;
  endpointIndex?: number;
};

export interface DrawingDraft {
  tool: ChartDrawTool;
  points: ChartPoint[];
  pathPoints?: ChartPoint[];
  cursor?: ChartPoint;
}

function strokeColor(selected: boolean, base: string): string {
  return selected ? SELECTED_COLOR : base;
}

function strokeWidth(selected: boolean): number {
  return selected ? 2 : 1.5;
}

function EndpointHandle({
  x,
  y,
  selected,
  interactive,
  onPointerDown,
}: {
  x: number;
  y: number;
  selected?: boolean;
  interactive?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
}) {
  return (
    <g
      className={interactive ? "pointer-events-auto cursor-grab" : "pointer-events-none"}
      onPointerDown={onPointerDown}
    >
      {interactive ? <circle cx={x} cy={y} r={HIT_STROKE_PX} fill="transparent" /> : null}
      <circle
        cx={x}
        cy={y}
        r={selected ? 5 : 4}
        fill="#131722"
        stroke={selected ? SELECTED_COLOR : "#787b86"}
        strokeWidth={selected ? 2 : 1.5}
        className="pointer-events-none"
      />
    </g>
  );
}

function HitLine({
  x1,
  y1,
  x2,
  y2,
  interactive,
  onPointerDown,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  interactive?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
}) {
  if (!interactive) return null;
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="transparent"
      strokeWidth={HIT_STROKE_PX}
      className="pointer-events-auto cursor-grab"
      onPointerDown={onPointerDown}
    />
  );
}

function renderLineDrawing(
  drawing: Extract<ChartDrawing, { kind: "line" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
  selected: boolean,
  editable: boolean,
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void,
): ReactNode {
  const color = strokeColor(selected, drawing.color);
  const seg = linePixels(chart, series, drawing.p1, drawing.p2, width, height, drawing.extend);
  const c1 = toPixel(chart, series, drawing.p1);
  const c2 = toPixel(chart, series, drawing.p2);
  if (!seg || !c1 || !c2) return null;

  const editEndpoint = (index: number, e: React.PointerEvent) => {
    e.stopPropagation();
    onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "endpoint", endpointIndex: index }, e);
  };
  const editBody = (e: React.PointerEvent) => {
    e.stopPropagation();
    onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "body" }, e);
  };

  return (
    <g key={drawing.id}>
      <HitLine
        x1={seg[0].x}
        y1={seg[0].y}
        x2={seg[1].x}
        y2={seg[1].y}
        interactive={editable}
        onPointerDown={editBody}
      />
      <line
        x1={seg[0].x}
        y1={seg[0].y}
        x2={seg[1].x}
        y2={seg[1].y}
        stroke={color}
        strokeWidth={strokeWidth(selected)}
        strokeLinecap="round"
        className="pointer-events-none"
      />
      {drawing.variant === "angle" ? (
        <text
          x={c2.x + 6}
          y={c2.y - 6}
          fill={color}
          fontSize={10}
          className="pointer-events-none select-none"
        >
          {lineAngleDeg(drawing.p1, drawing.p2).toFixed(1)}°
        </text>
      ) : null}
      {drawing.variant === "info" ? (
        <text
          x={(c1.x + c2.x) / 2}
          y={(c1.y + c2.y) / 2 - 6}
          fill={color}
          fontSize={10}
          textAnchor="middle"
          className="pointer-events-none select-none"
        >
          {formatMeasure(drawing.p1, drawing.p2)}
        </text>
      ) : null}
      <EndpointHandle
        x={c1.x}
        y={c1.y}
        selected={selected}
        interactive={editable}
        onPointerDown={(e) => editEndpoint(0, e)}
      />
      <EndpointHandle
        x={c2.x}
        y={c2.y}
        selected={selected}
        interactive={editable}
        onPointerDown={(e) => editEndpoint(1, e)}
      />
    </g>
  );
}

function renderHline(
  drawing: Extract<ChartDrawing, { kind: "hline" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  selected: boolean,
  editable: boolean,
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void,
): ReactNode {
  const y = series.priceToCoordinate(drawing.price);
  if (y == null) return null;
  const color = strokeColor(selected, drawing.color);
  const x1 = drawing.fromTime != null ? chart.timeScale().timeToCoordinate(drawing.fromTime as UTCTimestamp) ?? 0 : 0;
  const x2 = width;

  return (
    <g
      key={drawing.id}
      className={editable ? "pointer-events-auto cursor-grab" : "pointer-events-none"}
      onPointerDown={
        editable
          ? (e) => {
              e.stopPropagation();
              onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "body" }, e);
            }
          : undefined
      }
    >
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="transparent" strokeWidth={HIT_STROKE_PX} />
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={strokeWidth(selected)} />
    </g>
  );
}

function renderVline(
  drawing: Extract<ChartDrawing, { kind: "vline" }>,
  chart: IChartApi,
  height: number,
  selected: boolean,
  editable: boolean,
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void,
): ReactNode {
  const x = chart.timeScale().timeToCoordinate(drawing.time as UTCTimestamp);
  if (x == null) return null;
  const color = strokeColor(selected, drawing.color);

  return (
    <g
      key={drawing.id}
      className={editable ? "pointer-events-auto cursor-grab" : "pointer-events-none"}
      onPointerDown={
        editable
          ? (e) => {
              e.stopPropagation();
              onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "body" }, e);
            }
          : undefined
      }
    >
      <line x1={x} y1={0} x2={x} y2={height} stroke="transparent" strokeWidth={HIT_STROKE_PX} />
      <line x1={x} y1={0} x2={x} y2={height} stroke={color} strokeWidth={strokeWidth(selected)} />
    </g>
  );
}

function renderCross(
  drawing: Extract<ChartDrawing, { kind: "cross" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
  selected: boolean,
  editable: boolean,
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void,
): ReactNode {
  const px = toPixel(chart, series, { time: drawing.time, price: drawing.price });
  if (!px) return null;
  const color = strokeColor(selected, drawing.color);

  return (
    <g
      key={drawing.id}
      className={editable ? "pointer-events-auto cursor-grab" : "pointer-events-none"}
      onPointerDown={
        editable
          ? (e) => {
              e.stopPropagation();
              onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "body" }, e);
            }
          : undefined
      }
    >
      <line x1={0} y1={px.y} x2={width} y2={px.y} stroke={color} strokeWidth={strokeWidth(selected)} />
      <line x1={px.x} y1={0} x2={px.x} y2={height} stroke={color} strokeWidth={strokeWidth(selected)} />
      <circle cx={px.x} cy={px.y} r={HIT_STROKE_PX} fill="transparent" />
    </g>
  );
}

function renderChannel(
  drawing: Extract<ChartDrawing, { kind: "channel" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
  selected: boolean,
  editable: boolean,
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void,
): ReactNode {
  const [a, b, c, d] = channelLines(drawing);
  const color = strokeColor(selected, drawing.color);
  const pts = [a, b, c, d].map((p) => toPixel(chart, series, p));
  if (pts.some((p) => !p)) return null;

  const seg1 = linePixels(chart, series, a, b, width, height, "both");
  const seg2 = linePixels(chart, series, c, d, width, height, "both");

  return (
    <g key={drawing.id}>
      {seg1 ? (
        <HitLine
          x1={seg1[0].x}
          y1={seg1[0].y}
          x2={seg1[1].x}
          y2={seg1[1].y}
          interactive={editable}
          onPointerDown={(e) => {
            e.stopPropagation();
            onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "body" }, e);
          }}
        />
      ) : null}
      {seg1 ? (
        <line
          x1={seg1[0].x}
          y1={seg1[0].y}
          x2={seg1[1].x}
          y2={seg1[1].y}
          stroke={color}
          strokeWidth={strokeWidth(selected)}
        />
      ) : null}
      {seg2 ? (
        <line
          x1={seg2[0].x}
          y1={seg2[0].y}
          x2={seg2[1].x}
          y2={seg2[1].y}
          stroke={color}
          strokeWidth={strokeWidth(selected)}
        />
      ) : null}
      {pts.map((p, i) =>
        p ? (
          <EndpointHandle
            key={i}
            x={p.x}
            y={p.y}
            selected={selected}
            interactive={editable}
            onPointerDown={(e) => {
              e.stopPropagation();
              onEditStart(
                { drawingId: drawing.id, snapshot: drawing, part: "endpoint", endpointIndex: i },
                e,
              );
            }}
          />
        ) : null,
      )}
    </g>
  );
}

function pitchforkLines(drawing: Extract<ChartDrawing, { kind: "pitchfork" }>): [ChartPoint, ChartPoint, ChartPoint, ChartPoint] {
  const mid = {
    time: (drawing.p2.time + drawing.p3.time) / 2,
    price: (drawing.p2.price + drawing.p3.price) / 2,
  };
  const off2 = {
    time: drawing.p2.time - mid.time,
    price: drawing.p2.price - mid.price,
  };
  const off3 = {
    time: drawing.p3.time - mid.time,
    price: drawing.p3.price - mid.price,
  };
  const apex =
    drawing.variant === "schiff"
      ? { time: drawing.p1.time, price: mid.price }
      : drawing.variant === "modified"
        ? { time: mid.time, price: drawing.p1.price }
        : drawing.p1;
  return [
    apex,
    { time: apex.time + off2.time, price: apex.price + off2.price },
    { time: apex.time + off3.time, price: apex.price + off3.price },
    mid,
  ];
}

function renderPitchfork(
  drawing: Extract<ChartDrawing, { kind: "pitchfork" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
  selected: boolean,
  editable: boolean,
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void,
): ReactNode {
  const [apex, left, right] = pitchforkLines(drawing);
  const color = strokeColor(selected, drawing.color);
  const handles = [drawing.p1, drawing.p2, drawing.p3];

  const lines = [
    linePixels(chart, series, apex, left, width, height, "both"),
    linePixels(chart, series, apex, right, width, height, "both"),
    linePixels(chart, series, left, right, width, height, "both"),
  ];

  return (
    <g key={drawing.id}>
      {lines.map(
        (seg, i) =>
          seg ? (
            <line
              key={i}
              x1={seg[0].x}
              y1={seg[0].y}
              x2={seg[1].x}
              y2={seg[1].y}
              stroke={color}
              strokeWidth={strokeWidth(selected)}
            />
          ) : null,
      )}
      {lines[0] ? (
        <HitLine
          x1={lines[0][0].x}
          y1={lines[0][0].y}
          x2={lines[0][1].x}
          y2={lines[0][1].y}
          interactive={editable}
          onPointerDown={(e) => {
            e.stopPropagation();
            onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "body" }, e);
          }}
        />
      ) : null}
      {handles.map((p, i) => {
        const px = toPixel(chart, series, p);
        if (!px) return null;
        return (
          <EndpointHandle
            key={i}
            x={px.x}
            y={px.y}
            selected={selected}
            interactive={editable}
            onPointerDown={(e) => {
              e.stopPropagation();
              onEditStart(
                { drawingId: drawing.id, snapshot: drawing, part: "endpoint", endpointIndex: i },
                e,
              );
            }}
          />
        );
      })}
    </g>
  );
}

function renderFib(
  drawing: Extract<ChartDrawing, { kind: "fib" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
  selected: boolean,
  editable: boolean,
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void,
): ReactNode {
  const c1 = toPixel(chart, series, drawing.p1);
  const c2 = toPixel(chart, series, drawing.p2);
  if (!c1 || !c2) return null;
  const color = strokeColor(selected, drawing.color);
  const minX = Math.min(c1.x, c2.x);
  const maxX = Math.max(c1.x, c2.x);

  const elements: ReactNode[] = [];

  if (drawing.variant === "timezone" || drawing.variant === "time") {
    for (const level of FIB_LEVELS) {
      const t = drawing.p1.time + (drawing.p2.time - drawing.p1.time) * level;
      const x = chart.timeScale().timeToCoordinate(t as UTCTimestamp);
      if (x == null) continue;
      elements.push(
        <line key={level} x1={x} y1={0} x2={x} y2={height} stroke={color} strokeWidth={1} opacity={0.7} />,
      );
    }
  } else if (drawing.variant === "fan") {
    for (const level of FIB_LEVELS) {
      const pt = {
        time: drawing.p1.time + (drawing.p2.time - drawing.p1.time) * level,
        price: drawing.p1.price + (drawing.p2.price - drawing.p1.price) * level,
      };
      const seg = linePixels(chart, series, drawing.p1, pt, width, height, "right");
      if (!seg) continue;
      elements.push(
        <line
          key={level}
          x1={seg[0].x}
          y1={seg[0].y}
          x2={seg[1].x}
          y2={seg[1].y}
          stroke={color}
          strokeWidth={1}
          opacity={0.8}
        />,
      );
    }
  } else if (drawing.variant === "circles") {
    const cx = (c1.x + c2.x) / 2;
    const cy = (c1.y + c2.y) / 2;
    const rx = Math.abs(c2.x - c1.x) / 2;
    const ry = Math.abs(c2.y - c1.y) / 2;
    for (const level of FIB_LEVELS) {
      elements.push(
        <ellipse
          key={level}
          cx={cx}
          cy={cy}
          rx={rx * level || 1}
          ry={ry * level || 1}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.75}
        />,
      );
    }
  } else {
    for (const level of FIB_LEVELS) {
      const price = drawing.p2.price + (drawing.p1.price - drawing.p2.price) * level;
      const y = series.priceToCoordinate(price);
      if (y == null) continue;
      elements.push(
        <g key={level}>
          <line x1={minX} y1={y} x2={maxX} y2={y} stroke={color} strokeWidth={1} opacity={0.85} />
          <text x={maxX + 4} y={y + 3} fill={color} fontSize={9} className="select-none">
            {(level * 100).toFixed(1)}%
          </text>
        </g>,
      );
    }
    if (drawing.variant === "channel") {
      const off = (drawing.p2.price - drawing.p1.price) * 0.382;
      const p3 = offsetPoint(drawing.p1, drawing.p1, drawing.p2, off);
      const p4 = offsetPoint(drawing.p2, drawing.p1, drawing.p2, off);
      const chSeg1 = linePixels(chart, series, drawing.p1, drawing.p2, width, height, "segment");
      const chSeg2 = linePixels(chart, series, p3, p4, width, height, "segment");
      if (chSeg1) {
        elements.push(
          <line
            x1={chSeg1[0].x}
            y1={chSeg1[0].y}
            x2={chSeg1[1].x}
            y2={chSeg1[1].y}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="4 3"
          />,
        );
      }
      if (chSeg2) {
        elements.push(
          <line
            x1={chSeg2[0].x}
            y1={chSeg2[0].y}
            x2={chSeg2[1].x}
            y2={chSeg2[1].y}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="4 3"
          />,
        );
      }
    }
  }

  const baseSeg = linePixels(chart, series, drawing.p1, drawing.p2, width, height, "segment");

  return (
    <g key={drawing.id}>
      {baseSeg ? (
        <HitLine
          x1={baseSeg[0].x}
          y1={baseSeg[0].y}
          x2={baseSeg[1].x}
          y2={baseSeg[1].y}
          interactive={editable}
          onPointerDown={(e) => {
            e.stopPropagation();
            onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "body" }, e);
          }}
        />
      ) : null}
      {baseSeg ? (
        <line
          x1={baseSeg[0].x}
          y1={baseSeg[0].y}
          x2={baseSeg[1].x}
          y2={baseSeg[1].y}
          stroke={color}
          strokeWidth={strokeWidth(selected)}
        />
      ) : null}
      {elements}
      {[drawing.p1, drawing.p2].map((p, i) => {
        const px = toPixel(chart, series, p);
        if (!px) return null;
        return (
          <EndpointHandle
            key={i}
            x={px.x}
            y={px.y}
            selected={selected}
            interactive={editable}
            onPointerDown={(e) => {
              e.stopPropagation();
              onEditStart(
                { drawingId: drawing.id, snapshot: drawing, part: "endpoint", endpointIndex: i },
                e,
              );
            }}
          />
        );
      })}
    </g>
  );
}

function renderGann(
  drawing: Extract<ChartDrawing, { kind: "gann" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
  selected: boolean,
  editable: boolean,
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void,
): ReactNode {
  const c1 = toPixel(chart, series, drawing.p1);
  const c2 = toPixel(chart, series, drawing.p2);
  if (!c1 || !c2) return null;
  const color = strokeColor(selected, drawing.color);
  const x1 = Math.min(c1.x, c2.x);
  const x2 = Math.max(c1.x, c2.x);
  const y1 = Math.min(c1.y, c2.y);
  const y2 = Math.max(c1.y, c2.y);
  const elements: ReactNode[] = [];

  if (drawing.variant === "box" || drawing.variant === "square") {
    elements.push(
      <rect
        key="box"
        x={x1}
        y={y1}
        width={x2 - x1}
        height={y2 - y1}
        fill={drawing.variant === "box" ? `${color}18` : "none"}
        stroke={color}
        strokeWidth={strokeWidth(selected)}
      />,
    );
    const steps = 4;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      elements.push(
        <line key={`h${i}`} x1={x1} y1={y1 + (y2 - y1) * t} x2={x2} y2={y1 + (y2 - y1) * t} stroke={color} opacity={0.35} />,
      );
      elements.push(
        <line key={`v${i}`} x1={x1 + (x2 - x1) * t} y1={y1} x2={x1 + (x2 - x1) * t} y2={y2} stroke={color} opacity={0.35} />,
      );
    }
  }

  if (drawing.variant === "fan") {
    const angles = [1 / 8, 1 / 4, 1 / 3, 1 / 2, 1];
    for (const ratio of angles) {
      const pt = {
        time: drawing.p1.time + (drawing.p2.time - drawing.p1.time) * ratio,
        price: drawing.p1.price + (drawing.p2.price - drawing.p1.price) * ratio,
      };
      const seg = linePixels(chart, series, drawing.p1, pt, width, height, "right");
      if (!seg) continue;
      elements.push(
        <line
          key={ratio}
          x1={seg[0].x}
          y1={seg[0].y}
          x2={seg[1].x}
          y2={seg[1].y}
          stroke={color}
          strokeWidth={1}
          opacity={0.85}
        />,
      );
    }
  }

  return (
    <g key={drawing.id}>
      <rect
        x={Math.min(x1, x2)}
        y={Math.min(y1, y2)}
        width={Math.abs(x2 - x1)}
        height={Math.abs(y2 - y1)}
        fill="transparent"
        className={editable ? "pointer-events-auto cursor-grab" : "pointer-events-none"}
        onPointerDown={
          editable
            ? (e) => {
                e.stopPropagation();
                onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "body" }, e);
              }
            : undefined
        }
      />
      {elements}
      {[c1, c2].map((p, i) => (
        <EndpointHandle
          key={i}
          x={p.x}
          y={p.y}
          selected={selected}
          interactive={editable}
          onPointerDown={(e) => {
            e.stopPropagation();
            onEditStart(
              { drawingId: drawing.id, snapshot: drawing, part: "endpoint", endpointIndex: i },
              e,
            );
          }}
        />
      ))}
    </g>
  );
}

function renderRect(
  drawing: Extract<ChartDrawing, { kind: "rect" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  selected: boolean,
  editable: boolean,
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void,
): ReactNode {
  const c1 = toPixel(chart, series, drawing.p1);
  const c2 = toPixel(chart, series, drawing.p2);
  if (!c1 || !c2) return null;
  const color = strokeColor(selected, drawing.color);
  const x1 = Math.min(c1.x, c2.x);
  const y1 = Math.min(c1.y, c2.y);
  const w = Math.abs(c2.x - c1.x);
  const h = Math.abs(c2.y - c1.y);

  if (drawing.variant === "brush" || drawing.variant === "highlighter") {
    const path = drawing.path ?? [drawing.p1, drawing.p2];
    const d = path
      .map((pt, i) => {
        const px = toPixel(chart, series, pt);
        return px ? `${i === 0 ? "M" : "L"} ${px.x} ${px.y}` : "";
      })
      .join(" ");
    return (
      <g key={drawing.id}>
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={drawing.variant === "highlighter" ? 8 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={drawing.variant === "highlighter" ? 0.35 : 1}
          className={editable ? "pointer-events-auto cursor-grab" : "pointer-events-none"}
          onPointerDown={
            editable
              ? (e) => {
                  e.stopPropagation();
                  onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "body" }, e);
                }
              : undefined
          }
        />
      </g>
    );
  }

  if (drawing.variant === "circle") {
    const cx = (c1.x + c2.x) / 2;
    const cy = (c1.y + c2.y) / 2;
    const rx = w / 2;
    const ry = h / 2;
    return (
      <g key={drawing.id}>
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={`${color}15`}
          stroke={color}
          strokeWidth={strokeWidth(selected)}
          className={editable ? "pointer-events-auto cursor-grab" : "pointer-events-none"}
          onPointerDown={
            editable
              ? (e) => {
                  e.stopPropagation();
                  onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "body" }, e);
                }
              : undefined
          }
        />
        <EndpointHandle
          x={c1.x}
          y={c1.y}
          selected={selected}
          interactive={editable}
          onPointerDown={(e) => {
            e.stopPropagation();
            onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "endpoint", endpointIndex: 0 }, e);
          }}
        />
        <EndpointHandle
          x={c2.x}
          y={c2.y}
          selected={selected}
          interactive={editable}
          onPointerDown={(e) => {
            e.stopPropagation();
            onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "endpoint", endpointIndex: 1 }, e);
          }}
        />
      </g>
    );
  }

  return (
    <g key={drawing.id}>
      <rect
        x={x1}
        y={y1}
        width={w}
        height={h}
        fill={`${color}15`}
        stroke={color}
        strokeWidth={strokeWidth(selected)}
        className={editable ? "pointer-events-auto cursor-grab" : "pointer-events-none"}
        onPointerDown={
          editable
            ? (e) => {
                e.stopPropagation();
                onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "body" }, e);
              }
            : undefined
        }
      />
      <EndpointHandle
        x={c1.x}
        y={c1.y}
        selected={selected}
        interactive={editable}
        onPointerDown={(e) => {
          e.stopPropagation();
          onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "endpoint", endpointIndex: 0 }, e);
        }}
      />
      <EndpointHandle
        x={c2.x}
        y={c2.y}
        selected={selected}
        interactive={editable}
        onPointerDown={(e) => {
          e.stopPropagation();
          onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "endpoint", endpointIndex: 1 }, e);
        }}
      />
    </g>
  );
}

function renderText(
  drawing: Extract<ChartDrawing, { kind: "text" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  selected: boolean,
  editable: boolean,
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void,
): ReactNode {
  const px = toPixel(chart, series, drawing.point);
  if (!px) return null;
  const color = strokeColor(selected, drawing.color);
  const isCallout = drawing.variant === "callout";
  const isNote = drawing.variant === "note";

  return (
    <g
      key={drawing.id}
      className={editable ? "pointer-events-auto cursor-grab" : "pointer-events-none"}
      onPointerDown={
        editable
          ? (e) => {
              e.stopPropagation();
              onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "body" }, e);
            }
          : undefined
      }
    >
      {isCallout ? (
        <polygon
          points={`${px.x},${px.y} ${px.x + 8},${px.y + 14} ${px.x + 16},${px.y + 8}`}
          fill={`${color}33`}
          stroke={color}
        />
      ) : null}
      <rect
        x={px.x + (isCallout ? 12 : 0)}
        y={px.y - (isNote ? 18 : 10)}
        width={Math.max(40, drawing.text.length * 6.5)}
        height={isNote ? 36 : 20}
        rx={3}
        fill={isNote ? "#f5c84c22" : "#131722cc"}
        stroke={color}
        strokeWidth={1}
      />
      <text
        x={px.x + (isCallout ? 16 : 4)}
        y={px.y + (isNote ? 2 : 4)}
        fill={color}
        fontSize={11}
        className="select-none"
      >
        {drawing.text}
      </text>
      <circle cx={px.x} cy={px.y} r={HIT_STROKE_PX} fill="transparent" />
    </g>
  );
}

function renderPattern(
  drawing: Extract<ChartDrawing, { kind: "pattern" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  selected: boolean,
  editable: boolean,
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void,
): ReactNode {
  const coords = drawing.points.map((p) => toPixel(chart, series, p));
  if (coords.some((c) => !c)) return null;
  const color = strokeColor(selected, drawing.color);
  const d = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c!.x} ${c!.y}`).join(" ");

  return (
    <g key={drawing.id}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth(selected)}
        className={editable ? "pointer-events-auto cursor-grab" : "pointer-events-none"}
        onPointerDown={
          editable
            ? (e) => {
                e.stopPropagation();
                onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "body" }, e);
              }
            : undefined
        }
      />
      {coords.map((c, i) =>
        c ? (
          <EndpointHandle
            key={i}
            x={c.x}
            y={c.y}
            selected={selected}
            interactive={editable}
            onPointerDown={(e) => {
              e.stopPropagation();
              onEditStart(
                { drawingId: drawing.id, snapshot: drawing, part: "endpoint", endpointIndex: i },
                e,
              );
            }}
          />
        ) : null,
      )}
    </g>
  );
}

function renderPosition(
  drawing: Extract<ChartDrawing, { kind: "position" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  selected: boolean,
  editable: boolean,
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void,
): ReactNode {
  const c1 = toPixel(chart, series, drawing.p1);
  const c2 = toPixel(chart, series, drawing.p2);
  if (!c1 || !c2) return null;

  const isLong = drawing.variant === "long";
  const isShort = drawing.variant === "short";
  const isMeasure = drawing.variant === "measure";
  const fill =
    isLong ? "#26a69a33" : isShort ? "#ef535033" : "#787b8622";
  const stroke =
    isLong ? "#26a69a" : isShort ? "#ef5350" : strokeColor(selected, drawing.color);
  const x1 = Math.min(c1.x, c2.x);
  const y1 = Math.min(c1.y, c2.y);
  const w = Math.abs(c2.x - c1.x);
  const h = Math.abs(c2.y - c1.y);

  return (
    <g key={drawing.id}>
      <rect
        x={x1}
        y={y1}
        width={w}
        height={h}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth(selected)}
        strokeDasharray={isMeasure ? "5 4" : undefined}
        className={editable ? "pointer-events-auto cursor-grab" : "pointer-events-none"}
        onPointerDown={
          editable
            ? (e) => {
                e.stopPropagation();
                onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "body" }, e);
              }
            : undefined
        }
      />
      {isMeasure ? (
        <text x={x1 + w / 2} y={y1 - 4} fill={stroke} fontSize={10} textAnchor="middle" className="select-none">
          {formatMeasure(drawing.p1, drawing.p2)}
        </text>
      ) : (
        <text x={x1 + 4} y={y1 + 12} fill={stroke} fontSize={10} className="select-none">
          {isLong ? "LONG" : "SHORT"}
        </text>
      )}
      <EndpointHandle
        x={c1.x}
        y={c1.y}
        selected={selected}
        interactive={editable}
        onPointerDown={(e) => {
          e.stopPropagation();
          onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "endpoint", endpointIndex: 0 }, e);
        }}
      />
      <EndpointHandle
        x={c2.x}
        y={c2.y}
        selected={selected}
        interactive={editable}
        onPointerDown={(e) => {
          e.stopPropagation();
          onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "endpoint", endpointIndex: 1 }, e);
        }}
      />
    </g>
  );
}

function renderIcon(
  drawing: Extract<ChartDrawing, { kind: "icon" }>,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  selected: boolean,
  editable: boolean,
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void,
): ReactNode {
  const px = toPixel(chart, series, drawing.point);
  if (!px) return null;
  const color = strokeColor(selected, drawing.color);

  return (
    <g
      key={drawing.id}
      className={editable ? "pointer-events-auto cursor-grab" : "pointer-events-none"}
      onPointerDown={
        editable
          ? (e) => {
              e.stopPropagation();
              onEditStart({ drawingId: drawing.id, snapshot: drawing, part: "body" }, e);
            }
          : undefined
      }
    >
      <text x={px.x} y={px.y} fill={color} fontSize={18} textAnchor="middle" dominantBaseline="middle">
        {drawing.emoji}
      </text>
      <circle cx={px.x} cy={px.y} r={HIT_STROKE_PX} fill="transparent" />
    </g>
  );
}

function renderDrawing(
  drawing: ChartDrawing,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
  selected: boolean,
  editable: boolean,
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void,
): ReactNode {
  switch (drawing.kind) {
    case "line":
      return renderLineDrawing(drawing, chart, series, width, height, selected, editable, onEditStart);
    case "hline":
      return renderHline(drawing, chart, series, width, selected, editable, onEditStart);
    case "vline":
      return renderVline(drawing, chart, height, selected, editable, onEditStart);
    case "cross":
      return renderCross(drawing, chart, series, width, height, selected, editable, onEditStart);
    case "channel":
      return renderChannel(drawing, chart, series, width, height, selected, editable, onEditStart);
    case "pitchfork":
      return renderPitchfork(drawing, chart, series, width, height, selected, editable, onEditStart);
    case "fib":
      return renderFib(drawing, chart, series, width, height, selected, editable, onEditStart);
    case "gann":
      return renderGann(drawing, chart, series, width, height, selected, editable, onEditStart);
    case "rect":
      return renderRect(drawing, chart, series, selected, editable, onEditStart);
    case "text":
      return renderText(drawing, chart, series, selected, editable, onEditStart);
    case "pattern":
      return renderPattern(drawing, chart, series, selected, editable, onEditStart);
    case "position":
      return renderPosition(drawing, chart, series, selected, editable, onEditStart);
    case "icon":
      return renderIcon(drawing, chart, series, selected, editable, onEditStart);
    default:
      return null;
  }
}

function renderDraftPreview(
  draft: DrawingDraft,
  chart: IChartApi,
  series: ISeriesApi<"Candlestick">,
  width: number,
  height: number,
): ReactNode {
  const points = [...draft.points];
  if (draft.cursor && draft.tool !== "shape-brush" && draft.tool !== "shape-highlighter") {
    points.push(draft.cursor);
  }
  const pathPoints = draft.pathPoints ?? (draft.cursor ? [...(draft.pathPoints ?? []), draft.cursor] : draft.pathPoints);

  if (pathPoints && pathPoints.length >= 2) {
    const d = pathPoints
      .map((pt, i) => {
        const px = toPixel(chart, series, pt);
        return px ? `${i === 0 ? "M" : "L"} ${px.x} ${px.y}` : "";
      })
      .join(" ");
    return (
      <path
        d={d}
        fill="none"
        stroke={PREVIEW_COLOR}
        strokeWidth={draft.tool === "shape-highlighter" ? 8 : 2}
        strokeDasharray="5 4"
        opacity={draft.tool === "shape-highlighter" ? 0.35 : 1}
      />
    );
  }

  if (points.length === 0) return null;

  const previewDrawing = {
    id: "draft",
    coin: "",
    color: PREVIEW_COLOR,
    createdAt: 0,
  } as ChartDrawing;

  if (points.length === 1) {
    const px = toPixel(chart, series, points[0]!);
    if (!px) return null;
    if (draft.tool === "line-vline") {
      return <line x1={px.x} y1={0} x2={px.x} y2={height} stroke={PREVIEW_COLOR} strokeDasharray="5 4" />;
    }
    if (draft.tool === "line-hline" || draft.tool === "line-hray") {
      const y = series.priceToCoordinate(points[0]!.price);
      return y != null ? (
        <line x1={0} y1={y} x2={width} y2={y} stroke={PREVIEW_COLOR} strokeDasharray="5 4" />
      ) : null;
    }
    return <circle cx={px.x} cy={px.y} r={4} fill={PREVIEW_COLOR} />;
  }

  const temp = {
    ...previewDrawing,
    p1: points[0]!,
    p2: points[points.length - 1]!,
  };

  if (draft.tool.startsWith("line-") || draft.tool === "channel-regression") {
    return renderLineDrawing(
      {
        ...temp,
        kind: "line",
        extend: draft.tool === "line-ray" ? "right" : draft.tool === "line-extended" ? "both" : "segment",
        variant: "trend",
      },
      chart,
      series,
      width,
      height,
      false,
      false,
      () => {},
    );
  }

  if (points.length >= 3 && draft.tool.startsWith("channel-")) {
    return renderChannel(
      { ...temp, kind: "channel", p3: points[2]!, variant: "parallel" },
      chart,
      series,
      width,
      height,
      false,
      false,
      () => {},
    );
  }

  if (points.length >= 3 && draft.tool.startsWith("pitchfork")) {
    return renderPitchfork(
      { ...temp, kind: "pitchfork", p3: points[2]!, variant: "standard" },
      chart,
      series,
      width,
      height,
      false,
      false,
      () => {},
    );
  }

  if (draft.tool.startsWith("fib-") || draft.tool.startsWith("gann-")) {
    return renderFib(
      { ...temp, kind: "fib", variant: "retracement" },
      chart,
      series,
      width,
      height,
      false,
      false,
      () => {},
    );
  }

  if (draft.tool.startsWith("shape-")) {
    return renderRect(
      { ...temp, kind: "rect", variant: draft.tool === "shape-circle" ? "circle" : "rectangle" },
      chart,
      series,
      false,
      false,
      () => {},
    );
  }

  if (draft.tool.startsWith("pred-") || draft.tool === "measure") {
    return renderPosition(
      {
        ...temp,
        kind: "position",
        variant: draft.tool === "pred-short" ? "short" : draft.tool === "pred-long" ? "long" : "measure",
      },
      chart,
      series,
      false,
      false,
      () => {},
    );
  }

  if (points.length >= 2) {
    const coords = points.map((p) => toPixel(chart, series, p)).filter(Boolean);
    const d = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c!.x} ${c!.y}`).join(" ");
    return (
      <g>
        <path d={d} fill="none" stroke={PREVIEW_COLOR} strokeDasharray="5 4" />
        {coords.map((c, i) => (
          <circle key={i} cx={c!.x} cy={c!.y} r={4} fill={PREVIEW_COLOR} />
        ))}
      </g>
    );
  }

  return null;
}

export function ChartDrawingsOverlay({
  coin,
  chartRef,
  seriesRef,
  containerRef,
  draft,
  liveEdit,
  selectedDrawingId,
  editable,
  onEditStart,
}: {
  coin: string;
  chartRef: RefObject<IChartApi | null>;
  seriesRef: RefObject<ISeriesApi<"Candlestick"> | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  draft: DrawingDraft | null;
  liveEdit: DrawingLiveEdit | null;
  selectedDrawingId: string | null;
  editable: boolean;
  onEditStart: (start: DrawingEditStart, e: React.PointerEvent) => void;
}) {
  const drawings = useChartToolsStore((s) => s.drawingsByCoin[coin] ?? EMPTY_DRAWINGS);
  const hideDrawings = useChartToolsStore((s) => s.drawingPrefs.hideDrawings);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [chartTick, setChartTick] = useState(0);

  const requestRedraw = useCallback(() => setChartTick((n) => n + 1), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const applySize = () => {
      setSize({ width: el.clientWidth, height: el.clientHeight });
    };
    const ro = new ResizeObserver(applySize);
    ro.observe(el);
    applySize();
    return () => ro.disconnect();
  }, [containerRef]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const onRange = () => requestRedraw();
    chart.timeScale().subscribeVisibleLogicalRangeChange(onRange);
    return () => chart.timeScale().unsubscribeVisibleLogicalRangeChange(onRange);
  }, [chartRef, requestRedraw]);

  if (hideDrawings || size.width === 0) return null;

  const chart = chartRef.current;
  const series = seriesRef.current;
  if (!chart || !series) return null;

  const resolvedDrawings = drawings.map((drawing) =>
    liveEdit?.drawing?.id === drawing.id ? liveEdit.drawing : drawing,
  );

  return (
    <svg
      key={chartTick}
      className="absolute inset-0 z-[8] pointer-events-none"
      width={size.width}
      height={size.height}
      aria-hidden
    >
      {resolvedDrawings.map((drawing) =>
        renderDrawing(
          drawing,
          chart,
          series,
          size.width,
          size.height,
          selectedDrawingId === drawing.id,
          editable,
          onEditStart,
        ),
      )}
      {draft ? (
        <g className="pointer-events-none">{renderDraftPreview(draft, chart, series, size.width, size.height)}</g>
      ) : null}
    </svg>
  );
}
