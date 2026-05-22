import { useAlertStore } from "@/store/useAlertStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import type { PersonalOpsDashboard } from "@/types/daily-operations";

export class PersonalOpsEngine {
  static build(
    pinnedHeadlines: string[],
    checklist: PersonalOpsDashboard["checklist"],
    favoriteCoins: string[],
  ): PersonalOpsDashboard {
    const discovery = useInformationDiscoveryStore.getState();
    const workflow = useTraderWorkflowStore.getState();
    const alerts = useAlertStore.getState();

    return {
      watchlistCount: discovery.watchlist.length,
      activeAlerts: alerts.triggers.length,
      journalEntries: workflow.journal.length,
      savedViews: workflow.savedViews.length,
      pinnedHeadlines,
      favoriteCoins,
      checklist,
      updatedAt: Date.now(),
    };
  }
}
