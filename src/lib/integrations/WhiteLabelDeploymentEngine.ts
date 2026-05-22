import type { WhiteLabelDeployment } from "@/types/industry-integrations";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";

export class WhiteLabelDeploymentEngine {
  static deployments(): WhiteLabelDeployment[] {
    const tier = useProductionConfigStore.getState().entitlements.tier;
    const session = useProductionConfigStore.getState().session;

    return [
      {
        id: "deploy-eq-saas",
        orgName: "EQUILIBRIUM SAAS",
        mode: "saas",
        brandingEnabled: false,
        dedicatedInfra: false,
        privateIntelEnv: false,
        region: "us-east-1",
        status: "live",
      },
      {
        id: "deploy-inst-01",
        orgName: session?.workspaceId ? `ORG ${session.workspaceId.slice(0, 8).toUpperCase()}` : "INSTITUTIONAL CLIENT",
        mode: tier === "enterprise" ? "dedicated" : "saas",
        brandingEnabled: tier === "enterprise",
        dedicatedInfra: tier === "enterprise",
        privateIntelEnv: tier === "enterprise",
        region: "us-east-1",
        status: tier === "enterprise" ? "connected" : "staged",
      },
      {
        id: "deploy-wl-staged",
        orgName: "WHITE-LABEL PARTNER (STAGED)",
        mode: "white_label",
        brandingEnabled: true,
        dedicatedInfra: true,
        privateIntelEnv: true,
        region: "eu-west-1",
        status: "staged",
      },
    ];
  }
}
