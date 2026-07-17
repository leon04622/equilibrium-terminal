"use client";

import { useMemo } from "react";
import { VolumeProfileEngine } from "@/lib/charting/VolumeProfileEngine";
import { useChartAnalyticsStore } from "@/store/useChartAnalyticsStore";

export function VolumeProfileOverlay({
  visible,
}: {
  visible: boolean;
}) {
  const candles = useChartAnalyticsStore((s) => s.displayCandles);
  const profile = useMemo(() => {
    if (!visible || candles.length < 2) return [];
    return VolumeProfileEngine.profileFromCandles(candles, 28);
  }, [candles, visible]);

  if (!visible || profile.length === 0) return null;

  const maxVol = Math.max(...profile.map((r) => r.totalVolume), 1);

  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-12 z-[5] flex w-16 flex-col justify-stretch py-6"
      aria-hidden
    >
      {profile.map((row, i) => {
        const pct = (row.totalVolume / maxVol) * 100;
        const bidPct = row.totalVolume > 0 ? (row.bidVolume / row.totalVolume) * 100 : 50;
        return (
          <div key={i} className="relative flex-1">
            <div
              className="absolute right-0 top-1/2 h-2 max-w-full -translate-y-1/2 rounded-l-sm opacity-70"
              style={{
                width: `${Math.max(4, pct)}%`,
                background: `linear-gradient(90deg, rgba(38,166,154,${bidPct / 100}) 0%, rgba(239,83,80,${(100 - bidPct) / 100}) 100%)`,
              }}
              title={`${row.price.toFixed(2)} · vol ${row.totalVolume.toFixed(0)}`}
            />
          </div>
        );
      })}
    </div>
  );
}
