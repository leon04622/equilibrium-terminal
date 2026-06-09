import type { ProductMaturityDashboardMode } from "@/types/product-maturity";

export const PRODUCT_MATURITY_DASHBOARD_MODES: ProductMaturityDashboardMode[] = [
  {
    id: "design_system",
    label: "Design system",
    description: "Typography · spacing · interaction tokens",
    panels: ["maturitydesk", "unifiedops", "platformdesk"],
  },
  {
    id: "ergonomic_ops",
    label: "Ergonomic ops",
    description: "Density · keyboard · long-session comfort",
    panels: ["maturitydesk", "liveexec", "hyperbook", "chart"],
  },
  {
    id: "execution_polish",
    label: "Execution polish",
    description: "Ticket · DOM · slippage · hotkeys",
    panels: ["maturitydesk", "ticket", "domladder", "slippageradar", "liveexec"],
  },
  {
    id: "calm_operations",
    label: "Calm operations",
    description: "Reduced motion · alert calm · hierarchy",
    panels: ["maturitydesk", "alerts", "marketcmd", "surveillance"],
  },
  {
    id: "immersion",
    label: "Immersion",
    description: "Workspace continuity · command-center rhythm",
    panels: ["maturitydesk", "unifiedops", "marketcmd", "globaldesk"],
  },
];
