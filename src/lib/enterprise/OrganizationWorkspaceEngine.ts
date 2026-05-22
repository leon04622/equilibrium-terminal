import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import type { OrganizationWorkspace, WorkspaceTemplate } from "@/types/enterprise-operations";

export class OrganizationWorkspaceEngine {
  static organization(): OrganizationWorkspace {
    const prod = useProductionConfigStore.getState();
    const session = prod.session;
    const net = useNetworkGraphStore.getState();
    const desk = net.desks[0];

    return {
      id: session?.workspaceId ?? "ws-eq-default",
      name: "EQUILIBRIUM INSTITUTIONAL",
      tenantId: `tenant-${(session?.workspaceId ?? "default").slice(0, 8)}`,
      tier: session?.tier ?? prod.entitlements.tier,
      deskCount: net.desks.length,
      memberCount: net.profiles.length,
      templateId: "tpl-enterprise-v1",
      layoutVersion: desk?.layoutVersion ?? 1,
      isolationLevel: session?.tier === "enterprise" ? "strict" : "standard",
      updatedAt: Date.now(),
    };
  }

  static templates(): WorkspaceTemplate[] {
    return [
      {
        id: "tpl-enterprise-v1",
        name: "INSTITUTIONAL STANDARD",
        description: "Full-stack ops — macro, execution, research, monitoring",
        deskTypes: ["macro", "execution", "research", "monitoring"],
        panelPreset: ["macro", "chart", "ticket", "collab", "enterpriseops"],
        inheritedBy: 4,
      },
      {
        id: "tpl-prop-v1",
        name: "PROP EXECUTION DESK",
        description: "Execution-first layout with slippage and DOM focus",
        deskTypes: ["execution", "monitoring"],
        panelPreset: ["hyperbook", "domladder", "slippageradar", "ticket"],
        inheritedBy: 2,
      },
      {
        id: "tpl-treasury-v1",
        name: "TREASURY & RISK",
        description: "Portfolio exposure, stablecoin, cross-exchange visibility",
        deskTypes: ["treasury", "monitoring"],
        panelPreset: ["macro", "positions", "reliability", "enterpriseops"],
        inheritedBy: 1,
      },
    ];
  }
}
