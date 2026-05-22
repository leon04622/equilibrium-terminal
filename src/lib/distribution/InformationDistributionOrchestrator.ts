import { BriefingDispatchEngine } from "@/lib/distribution/BriefingDispatchEngine";
import { ExternalDistributionEngine } from "@/lib/distribution/ExternalDistributionEngine";
import { IncidentMonitorEngine } from "@/lib/distribution/IncidentMonitorEngine";
import { InformationQualityGovernor } from "@/lib/distribution/InformationQualityGovernor";
import { NewswireIngestPipeline } from "@/lib/distribution/NewswireIngestPipeline";
import { NotificationDeliveryEngine } from "@/lib/distribution/NotificationDeliveryEngine";
import { PersonalizedDeliveryEngine } from "@/lib/distribution/PersonalizedDeliveryEngine";
import type { InformationDistributionSnapshot } from "@/types/information-distribution";

export class InformationDistributionOrchestrator {
  static snapshot(): InformationDistributionSnapshot {
    const raw = NewswireIngestPipeline.ingest();
    const { quality, filtered } = InformationQualityGovernor.audit(raw);
    const incidents = IncidentMonitorEngine.scan();
    const briefings = BriefingDispatchEngine.build();
    const personalized = PersonalizedDeliveryEngine.filter(filtered);

    const criticalPending = filtered.filter((i) => i.severity === "critical").length;
    const deliveryChannels = NotificationDeliveryEngine.channelStatus(criticalPending);

    const syndication = ExternalDistributionEngine.meta(filtered);
    const distributionScore = Math.round(
      quality.overallConfidence * 0.35 +
        Math.min(100, filtered.length * 2) * 0.2 +
        (incidents.filter((i) => i.severity === "critical").length > 0 ? 70 : 85) * 0.15 +
        (personalized.length > 0 ? 75 : 55) * 0.15 +
        (deliveryChannels.filter((c) => c.enabled).length * 8),
    );

    return {
      newswire: filtered,
      incidents,
      briefings,
      personalized,
      deliveryChannels,
      quality,
      syndication,
      distributionScore: Math.min(100, distributionScore),
      updatedAt: Date.now(),
    };
  }
}
