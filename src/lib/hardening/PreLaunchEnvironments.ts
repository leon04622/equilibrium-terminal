import type { PreLaunchEnvironment } from "@/types/launch-hardening";

export const PRE_LAUNCH_ENVIRONMENTS: PreLaunchEnvironment[] = [
  {
    id: "staging",
    label: "Staging cluster",
    purpose: "Pre-production integration validation",
    hlNetwork: "testnet",
    stressReplay: false,
  },
  {
    id: "qa",
    label: "QA workspace",
    purpose: "Regression and workflow continuity tests",
    hlNetwork: "testnet",
    stressReplay: false,
  },
  {
    id: "stress",
    label: "Volatility replay",
    purpose: "High-volatility and liquidation cascade simulation",
    hlNetwork: "mainnet",
    stressReplay: true,
  },
  {
    id: "enterprise_demo",
    label: "Enterprise demo",
    purpose: "Institutional onboarding and entitlement demos",
    hlNetwork: "mainnet",
    stressReplay: false,
  },
];
