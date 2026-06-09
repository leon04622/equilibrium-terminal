import { ProductTierStrategyEngine } from "@/lib/global-strategy/ProductTierStrategyEngine";
import { ScalingArchitectureEngine } from "@/lib/global-strategy/ScalingArchitectureEngine";
import { InfrastructureScalingEngine } from "@/lib/global-strategy/InfrastructureScalingEngine";
import { OperationalExcellenceEngine } from "@/lib/global-strategy/OperationalExcellenceEngine";
import { GoToMarketEngine } from "@/lib/global-strategy/GoToMarketEngine";
import { InstitutionalTrustEngine } from "@/lib/global-strategy/InstitutionalTrustEngine";
import { AdoptionStrategyEngine } from "@/lib/global-strategy/AdoptionStrategyEngine";
import { CompetitivePositioningEngine } from "@/lib/global-strategy/CompetitivePositioningEngine";
import { StrategicMoatEngine } from "@/lib/global-strategy/StrategicMoatEngine";
import { GlobalReadinessEngine } from "@/lib/global-strategy/GlobalReadinessEngine";
import type { GlobalInfrastructureSnapshot } from "@/types/global-infrastructure";

export class GlobalStrategyOrchestrator {
  static snapshot(): GlobalInfrastructureSnapshot {
    const tiers = ProductTierStrategyEngine.tiers();
    const scalingPhases = ScalingArchitectureEngine.phases();
    const infrastructure = InfrastructureScalingEngine.capabilities();
    const operationalExcellence = OperationalExcellenceEngine.systems();
    const gtmTargets = GoToMarketEngine.targets();
    const trustPillars = InstitutionalTrustEngine.pillars();
    const adoptionLevers = AdoptionStrategyEngine.levers();
    const competitivePosition = CompetitivePositioningEngine.positions();
    const strategicMoats = StrategicMoatEngine.moats();
    const globalReadiness = GlobalReadinessEngine.domains();

    const infrastructureTrustScore = Math.round(
      trustPillars.reduce((s, p) => s + p.score, 0) / Math.max(trustPillars.length, 1),
    );

    const globalReadinessScore = Math.round(
      globalReadiness.reduce((s, r) => s + r.readinessPct, 0) / Math.max(globalReadiness.length, 1),
    );

    const moatCompositeScore = Math.round(
      strategicMoats.reduce((s, m) => s + m.score, 0) / Math.max(strategicMoats.length, 1),
    );

    return {
      tiers,
      scalingPhases,
      infrastructure,
      operationalExcellence,
      gtmTargets,
      trustPillars,
      adoptionLevers,
      competitivePosition,
      strategicMoats,
      globalReadiness,
      infrastructureTrustScore,
      globalReadinessScore,
      moatCompositeScore,
      updatedAt: Date.now(),
    };
  }
}
