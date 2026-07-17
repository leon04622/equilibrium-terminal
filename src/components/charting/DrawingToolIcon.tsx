"use client";

import type { ChartDrawTool } from "@/types/chart-tools";

function ToolThumb({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" aria-hidden>
      {children}
    </svg>
  );
}

const PATTERN_ICONS: Partial<Record<ChartDrawTool, React.ReactNode>> = {
  "pat-hs": (
    <ToolThumb>
      <path
        d="M2 6 L5 10 L8 4 L11 10 L14 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <line x1="4" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 1.5" />
    </ToolThumb>
  ),
  "pat-xabcd": (
    <ToolThumb>
      <path
        d="M2 14 L6 6 L10 12 L14 5 L18 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </ToolThumb>
  ),
  "pat-elliott": (
    <ToolThumb>
      <path
        d="M2 12 L6 8 L10 14 L14 6 L18 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <text x="3" y="11" fontSize="4" fill="currentColor">
        1
      </text>
      <text x="14" y="8" fontSize="4" fill="currentColor">
        5
      </text>
    </ToolThumb>
  ),
};

export function DrawingToolIcon({ toolId }: { toolId: string }) {
  const icon = PATTERN_ICONS[toolId as ChartDrawTool];
  if (icon) return <>{icon}</>;
  return null;
}

export function isPatternTool(toolId: string): boolean {
  return toolId.startsWith("pat-");
}
