import type { ChartDrawTool, MagnetMode } from "@/types/chart-tools";



export type DrawingCategoryId =

  | "cursor"

  | "trendline"

  | "fibonacci"

  | "shapes"

  | "annotation"

  | "patterns"

  | "prediction"

  | "icons";



export interface DrawingToolItem {

  id: string;

  label: string;

  shortcut?: string;

  drawTool?: ChartDrawTool;

  magnetMode?: MagnetMode;

  implemented: boolean;

}



export interface DrawingToolSection {

  title?: string;

  items: DrawingToolItem[];

}



export interface DrawingToolCategory {

  id: DrawingCategoryId;

  label: string;

  sections: DrawingToolSection[];

}



const TOOL = (id: ChartDrawTool, label: string, extra?: Partial<DrawingToolItem>): DrawingToolItem => ({

  id,

  label,

  drawTool: id,

  implemented: true,

  ...extra,

});



export const DRAWING_CATEGORIES: DrawingToolCategory[] = [

  {

    id: "cursor",

    label: "Cursors",

    sections: [

      {

        items: [

          { id: "cursor-cross", label: "Cross", drawTool: "none", implemented: true },

          { id: "cursor-dot", label: "Dot", drawTool: "crosshair", implemented: true },

          { id: "cursor-arrow", label: "Arrow", drawTool: "arrow", implemented: true },

          { id: "cursor-eraser", label: "Eraser", drawTool: "eraser", implemented: true },

        ],

      },

    ],

  },

  {

    id: "trendline",

    label: "Trend line tools",

    sections: [

      {

        title: "LINES",

        items: [

          TOOL("line-trend", "Trend Line", { shortcut: "Alt + T" }),

          TOOL("line-ray", "Ray"),

          TOOL("line-info", "Info Line"),

          TOOL("line-extended", "Extended Line"),

          TOOL("line-angle", "Trend Angle"),

          TOOL("line-hline", "Horizontal Line", { shortcut: "Alt + H" }),

          TOOL("line-hray", "Horizontal Ray", { shortcut: "Alt + J" }),

          TOOL("line-vline", "Vertical Line", { shortcut: "Alt + V" }),

          TOOL("line-cross", "Cross Line", { shortcut: "Alt + C" }),

        ],

      },

      {

        title: "CHANNELS",

        items: [

          TOOL("channel-parallel", "Parallel Channel"),

          TOOL("channel-regression", "Regression Trend"),

          TOOL("channel-flat", "Flat Top/Bottom"),

          TOOL("channel-disjoint", "Disjoint Channel"),

        ],

      },

      {

        title: "PITCHFORKS",

        items: [

          TOOL("pitchfork", "Pitchfork"),

          TOOL("pitchfork-schiff", "Schiff Pitchfork"),

          TOOL("pitchfork-modified", "Modified Schiff Pitchfork"),

          TOOL("pitchfork-inside", "Inside Pitchfork"),

        ],

      },

    ],

  },

  {

    id: "fibonacci",

    label: "Gann and Fibonacci tools",

    sections: [

      {

        title: "FIBONACCI",

        items: [

          TOOL("fib-retracement", "Fib Retracement"),

          TOOL("fib-extension", "Trend-Based Fib Extension"),

          TOOL("fib-channel", "Fib Channel"),

          TOOL("fib-timezone", "Fib Time Zone"),

          TOOL("fib-fan", "Fib Speed Resistance Fan"),

          TOOL("fib-time", "Trend-Based Fib Time"),

          TOOL("fib-circles", "Fib Circles"),

        ],

      },

      {

        title: "GANN",

        items: [TOOL("gann-box", "Gann Box"), TOOL("gann-fan", "Gann Fan"), TOOL("gann-square", "Gann Square")],

      },

    ],

  },

  {

    id: "shapes",

    label: "Geometric shapes",

    sections: [
      {
        items: [
          TOOL("shape-brush", "Brush"),
          TOOL("shape-highlighter", "Highlighter"),
          TOOL("shape-rectangle", "Rectangle"),
          TOOL("shape-circle", "Circle"),
        ],
      },
    ],

  },

  {

    id: "annotation",

    label: "Annotation tools",

    sections: [

      {

        items: [TOOL("anno-text", "Text"), TOOL("anno-note", "Note"), TOOL("anno-callout", "Callout")],

      },

    ],

  },

  {

    id: "patterns",

    label: "Patterns",

    sections: [

      {

        items: [

          TOOL("pat-xabcd", "XABCD Pattern"),

          TOOL("pat-hs", "Head and Shoulders"),

          TOOL("pat-elliott", "Elliott Impulse Wave (12345)"),

        ],

      },

    ],

  },

  {

    id: "prediction",

    label: "Forecasting and measurement",

    sections: [

      {

        items: [

          TOOL("pred-long", "Long Position"),

          TOOL("pred-short", "Short Position"),

          TOOL("pred-measure", "Price Range"),

        ],

      },

    ],

  },

  {

    id: "icons",

    label: "Icons",

    sections: [{ items: [TOOL("icon-star", "Icon")] }],

  },

];



export const MAGNET_MENU: DrawingToolItem[] = [

  { id: "magnet-off", label: "Magnet mode", magnetMode: "off", implemented: true },

  { id: "magnet-weak", label: "Weak magnet", magnetMode: "weak", implemented: true },

  { id: "magnet-strong", label: "Strong magnet", magnetMode: "strong", implemented: true },

];



const CURSOR_TOOLS = new Set<ChartDrawTool>(["none", "crosshair", "arrow", "eraser", "zoom", "measure"]);

const TRENDLINE_TOOLS = new Set<ChartDrawTool>([

  "line-trend",

  "line-ray",

  "line-info",

  "line-extended",

  "line-angle",

  "line-hline",

  "line-hray",

  "line-vline",

  "line-cross",

  "channel-parallel",

  "channel-regression",

  "channel-flat",

  "channel-disjoint",

  "pitchfork",

  "pitchfork-schiff",

  "pitchfork-modified",

  "pitchfork-inside",

]);

const FIB_TOOLS = new Set<ChartDrawTool>([

  "fib-retracement",

  "fib-extension",

  "fib-channel",

  "fib-timezone",

  "fib-fan",

  "fib-time",

  "fib-circles",

  "gann-box",

  "gann-fan",

  "gann-square",

]);

const SHAPE_TOOLS = new Set<ChartDrawTool>(["shape-brush", "shape-highlighter", "shape-rectangle", "shape-circle"]);

const ANNO_TOOLS = new Set<ChartDrawTool>(["anno-text", "anno-note", "anno-callout"]);

const PATTERN_TOOLS = new Set<ChartDrawTool>(["pat-xabcd", "pat-hs", "pat-elliott"]);

const PRED_TOOLS = new Set<ChartDrawTool>(["pred-long", "pred-short", "pred-measure", "measure"]);

const ICON_TOOLS = new Set<ChartDrawTool>(["icon-star"]);



export function findDrawingToolItem(id: string): DrawingToolItem | undefined {

  for (const cat of DRAWING_CATEGORIES) {

    for (const section of cat.sections) {

      const hit = section.items.find((item) => item.id === id);

      if (hit) return hit;

    }

  }

  return MAGNET_MENU.find((item) => item.id === id);

}



export function categoryForDrawTool(tool: ChartDrawTool): DrawingCategoryId | null {

  if (CURSOR_TOOLS.has(tool)) return "cursor";

  if (TRENDLINE_TOOLS.has(tool)) return "trendline";

  if (FIB_TOOLS.has(tool)) return "fibonacci";

  if (SHAPE_TOOLS.has(tool)) return "shapes";

  if (ANNO_TOOLS.has(tool)) return "annotation";

  if (PATTERN_TOOLS.has(tool)) return "patterns";

  if (PRED_TOOLS.has(tool)) return "prediction";

  if (ICON_TOOLS.has(tool)) return "icons";

  return null;

}



export function itemIdForDrawTool(tool: ChartDrawTool): string | null {

  if (tool === "none") return "cursor-cross";

  if (tool === "crosshair") return "cursor-dot";

  if (tool === "arrow") return "cursor-arrow";

  if (tool === "eraser") return "cursor-eraser";

  if (tool === "measure") return "pred-measure";

  if (tool === "zoom") return null;

  for (const cat of DRAWING_CATEGORIES) {

    for (const section of cat.sections) {

      const hit = section.items.find((item) => item.drawTool === tool || item.id === tool);

      if (hit) return hit.id;

    }

  }

  return null;

}


