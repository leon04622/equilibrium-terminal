import type { PlatformPlugin } from "@/types/platform-extensibility";

export class PluginExtensibilityEngine {
  static registry(): PlatformPlugin[] {
    return [
      {
        id: "plugin-custom-panel",
        name: "Custom Panel Host",
        slot: "panel",
        version: "1.0.0",
        status: "active",
        author: "Equilibrium Core",
      },
      {
        id: "plugin-omnibar-ext",
        name: "OmniBar Command Extensions",
        slot: "omnibar",
        version: "1.0.0",
        status: "active",
        author: "Equilibrium Core",
      },
      {
        id: "plugin-analytics-overlay",
        name: "Chart Analytics Overlay",
        slot: "analytics",
        version: "0.9.2",
        status: "active",
        author: "Execution Intel",
      },
      {
        id: "plugin-workspace-automation",
        name: "Workspace Layout Automation",
        slot: "workspace",
        version: "0.9.0",
        status: "active",
        author: "Desk Systems",
      },
      {
        id: "plugin-dashboard-builder",
        name: "Institutional Dashboard Builder",
        slot: "dashboard",
        version: "0.8.0",
        status: "staged",
        author: "Platform",
      },
      {
        id: "plugin-quant-panel",
        name: "Quant Research Panel SDK",
        slot: "panel",
        version: "0.7.0",
        status: "staged",
        author: "Research Desk",
      },
    ];
  }
}
