import { MultiDeskOperationsEngine } from "@/lib/enterprise/MultiDeskOperationsEngine";
import { SharedWorkspaceEngine } from "@/lib/collaboration/SharedWorkspaceEngine";
import type { OrgWorkspaceRow } from "@/types/desk-operations";

export class OrganizationWorkspaceDeskEngine {
  static workspaces(): OrgWorkspaceRow[] {
    const shared = SharedWorkspaceEngine.state();
    const desks = MultiDeskOperationsEngine.desks();

    return desks.map((d) => ({
      id: d.id,
      name: d.name,
      deskType: d.type,
      members: d.memberCount,
      layoutVersion: d.id === shared.deskId ? shared.layoutVersion : 1,
      watchlistCount: d.id === shared.deskId ? shared.sharedWatchlist.length : 0,
      status: d.status === "operational" ? "active" : "syncing",
    }));
  }
}
