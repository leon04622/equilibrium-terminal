import { create } from "zustand";
import type { AuditLogEntry, SecurityTrustSnapshot, ThreatEvent } from "@/types/security-trust";

interface SecurityStoreState {
  snapshot: SecurityTrustSnapshot | null;
  serverAudit: AuditLogEntry[];
  serverThreats: ThreatEvent[];
  setSnapshot: (snapshot: SecurityTrustSnapshot) => void;
  setServerAudit: (entries: AuditLogEntry[]) => void;
  setServerThreats: (events: ThreatEvent[]) => void;
}

export const useSecurityStore = create<SecurityStoreState>((set) => ({
  snapshot: null,
  serverAudit: [],
  serverThreats: [],
  setSnapshot: (snapshot) => set({ snapshot }),
  setServerAudit: (serverAudit) => set({ serverAudit }),
  setServerThreats: (serverThreats) => set({ serverThreats }),
}));
