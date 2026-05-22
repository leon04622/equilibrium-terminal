import type { TeamRole } from "@/types/production-platform";
import type { DeskRole } from "@/types/network";
import type { CollaborationPermissionSet, CollaborationRole } from "@/types/collaboration";

const PERMISSION_MATRIX: Record<CollaborationRole, CollaborationPermissionSet> = {
  viewer: {
    role: "viewer",
    canPublishSignals: false,
    canAnnotate: false,
    canShareLayout: false,
    canPublishResearch: false,
    canManageAlerts: false,
    canManageDesk: false,
    canViewAudit: false,
  },
  analyst: {
    role: "analyst",
    canPublishSignals: true,
    canAnnotate: true,
    canShareLayout: false,
    canPublishResearch: true,
    canManageAlerts: true,
    canManageDesk: false,
    canViewAudit: false,
  },
  trader: {
    role: "trader",
    canPublishSignals: true,
    canAnnotate: true,
    canShareLayout: true,
    canPublishResearch: false,
    canManageAlerts: true,
    canManageDesk: false,
    canViewAudit: false,
  },
  researcher: {
    role: "researcher",
    canPublishSignals: false,
    canAnnotate: true,
    canShareLayout: false,
    canPublishResearch: true,
    canManageAlerts: false,
    canManageDesk: false,
    canViewAudit: false,
  },
  pm: {
    role: "pm",
    canPublishSignals: true,
    canAnnotate: true,
    canShareLayout: true,
    canPublishResearch: true,
    canManageAlerts: true,
    canManageDesk: true,
    canViewAudit: true,
  },
  admin: {
    role: "admin",
    canPublishSignals: true,
    canAnnotate: true,
    canShareLayout: true,
    canPublishResearch: true,
    canManageAlerts: true,
    canManageDesk: true,
    canViewAudit: true,
  },
};

export class CollaborationPermissionEngine {
  static fromPlatformRole(role: TeamRole | null): CollaborationPermissionSet {
    if (!role) return PERMISSION_MATRIX.viewer;
    if (role === "admin") return PERMISSION_MATRIX.admin;
    if (role === "trader") return PERMISSION_MATRIX.trader;
    return PERMISSION_MATRIX.analyst;
  }

  static fromDeskRole(role: DeskRole): CollaborationPermissionSet {
    if (role === "admin") return PERMISSION_MATRIX.admin;
    if (role === "lead") return PERMISSION_MATRIX.pm;
    if (role === "analyst") return PERMISSION_MATRIX.analyst;
    return PERMISSION_MATRIX.viewer;
  }

  static resolve(platformRole: TeamRole | null, deskRole: DeskRole): CollaborationPermissionSet {
    const platform = CollaborationPermissionEngine.fromPlatformRole(platformRole);
    const desk = CollaborationPermissionEngine.fromDeskRole(deskRole);
    return {
      role: platform.role === "admin" || desk.role === "admin" ? "admin" : desk.role,
      canPublishSignals: platform.canPublishSignals || desk.canPublishSignals,
      canAnnotate: platform.canAnnotate || desk.canAnnotate,
      canShareLayout: platform.canShareLayout || desk.canShareLayout,
      canPublishResearch: platform.canPublishResearch || desk.canPublishResearch,
      canManageAlerts: platform.canManageAlerts || desk.canManageAlerts,
      canManageDesk: platform.canManageDesk || desk.canManageDesk,
      canViewAudit: platform.canViewAudit || desk.canViewAudit,
    };
  }
}
