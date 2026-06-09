import { CustomerOperationsEngine } from "@/lib/commercial/CustomerOperationsEngine";
import type { SupportTicketRow } from "@/types/ops-command";

export class CustomerSupportOpsEngine {
  static tickets(): SupportTicketRow[] {
    return CustomerOperationsEngine.listTickets().map((t) => ({
      id: t.id,
      subject: t.subject,
      severity: t.severity,
      status: t.status,
    }));
  }
}
