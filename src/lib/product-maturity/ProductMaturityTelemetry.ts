import type { ProductMaturityTelemetrySnapshot } from "@/types/product-maturity";

let t0 = 0;

export class ProductMaturityTelemetry {
  static begin(): void {
    t0 = performance.now();
  }

  static snapshot(input: {
    calmEnabled: boolean;
    reducedMotion: boolean;
    density: string;
    executionTrusted: boolean;
    calmSignals: number;
  }): ProductMaturityTelemetrySnapshot {
    const computeLatencyMs = Math.round(performance.now() - t0);
    const polishScore = Math.min(
      100,
      Math.round(
        (input.calmEnabled ? 22 : 10) +
          (input.reducedMotion ? 8 : 12) +
          (input.executionTrusted ? 25 : 12) +
          (input.calmSignals <= 1 ? 25 : 10) +
          (input.density === "standard" ? 18 : 14) +
          (computeLatencyMs < 40 ? 10 : 5),
      ),
    );

    return {
      calmEnabled: input.calmEnabled,
      reducedMotion: input.reducedMotion,
      density: input.density,
      polishScore,
      computeLatencyMs,
    };
  }
}
