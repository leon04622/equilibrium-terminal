import { ScalabilityReadinessEngine } from "@/lib/integrations/ScalabilityReadinessEngine";
import { EnterpriseReliabilityEngine } from "@/lib/enterprise/EnterpriseReliabilityEngine";
import type { InfrastructureScalingRow } from "@/types/global-infrastructure";

export class InfrastructureScalingEngine {
  static capabilities(): InfrastructureScalingRow[] {
    const scale = ScalabilityReadinessEngine.vitals();
    const reliability = EnterpriseReliabilityEngine.state();

    const uptimeBoost = scale.uptimePct > 99 ? 12 : scale.uptimePct > 95 ? 6 : 0;

    const rows: InfrastructureScalingRow[] = [
      {
        capability: "global_latency",
        label: "Global Low-Latency Delivery",
        status: scale.autoScaleReady ? "staged" : "planned",
        readinessPct: 45 + uptimeBoost,
        region: "US-EAST · EU-WEST (staged)",
      },
      {
        capability: "distributed_ingest",
        label: "Distributed Ingestion",
        status: "operational",
        readinessPct: 72 + uptimeBoost,
      },
      {
        capability: "regional_redundancy",
        label: "Regional Redundancy",
        status: scale.redundancyActive ? "operational" : "staged",
        readinessPct: scale.redundancyActive ? 78 : 52,
      },
      {
        capability: "failover_clusters",
        label: "Failover Clusters",
        status: reliability.failoverReady ? "operational" : "staged",
        readinessPct: reliability.failoverReady ? 82 : 48,
      },
      {
        capability: "stream_partitioning",
        label: "Stream Partitioning",
        status: "staged",
        readinessPct: 58,
      },
      {
        capability: "event_processing",
        label: "Large-Scale Event Processing",
        status: "operational",
        readinessPct: 70,
      },
      {
        capability: "uptime_guarantee",
        label: "Enterprise Uptime Guarantee",
        status: scale.deploymentReady ? "operational" : "planned",
        readinessPct: Math.round(scale.uptimePct),
      },
    ];

    return rows;
  }
}
