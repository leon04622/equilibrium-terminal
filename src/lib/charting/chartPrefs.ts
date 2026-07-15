import { CHART_TIMEFRAMES } from "@/lib/charting/chartTimeframes";
import { ChartSyncCoordinator } from "@/lib/charting/ChartSyncCoordinator";
import { useChartAnalyticsStore } from "@/store/useChartAnalyticsStore";
import type { ChartTimeframe } from "@/types/chart-analytics";

export const CHART_PREFS_STORAGE_KEY = "eq-chart-prefs-v1";

export function loadChartTimeframe(): ChartTimeframe {
  if (typeof window === "undefined") return "1m";
  try {
    const raw = localStorage.getItem(CHART_PREFS_STORAGE_KEY);
    if (!raw) return "1m";
    const parsed = JSON.parse(raw) as { timeframe?: string };
    if (parsed.timeframe && CHART_TIMEFRAMES.includes(parsed.timeframe as ChartTimeframe)) {
      return parsed.timeframe as ChartTimeframe;
    }
  } catch {
    /* ignore */
  }
  return "1m";
}

export function saveChartTimeframe(timeframe: ChartTimeframe): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHART_PREFS_STORAGE_KEY, JSON.stringify({ timeframe }));
  } catch {
    /* ignore */
  }
}

/** Client-only: apply persisted timeframe after SSR (server always seeds 1m). */
export function hydrateChartAnalyticsPrefs(): ChartTimeframe {
  const saved = loadChartTimeframe();
  const current = useChartAnalyticsStore.getState().timeframe;
  if (saved !== current) {
    ChartSyncCoordinator.initTimeframe(saved);
    useChartAnalyticsStore.setState({ timeframe: saved });
  }
  return saved;
}
