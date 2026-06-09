import type { ProductMaturitySnapshot } from "@/types/product-maturity";

export class ProductMaturityBriefEngine {
  static brief(
    partial: Pick<ProductMaturitySnapshot, "telemetry" | "ergonomics" | "brandIdentity">,
  ): string {
    const trust = partial.brandIdentity.find((b) => b.id === "brand-trust")?.tone ?? "OPERATIONAL";
    const density = partial.telemetry.density.toUpperCase();

    return [
      `Polish ${partial.telemetry.polishScore} · ${trust} · ${density} density.`,
      partial.telemetry.calmEnabled ? "Calm mode active — reduced visual noise." : "Consider enabling calm mode for long sessions.",
      `Execution ergonomics: ${partial.ergonomics.length} controls mapped.`,
    ].join(" ");
  }
}
