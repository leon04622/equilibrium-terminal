import { DevOpsOperationsOrchestrator } from "@/lib/devops/DevOpsOperationsOrchestrator";
import type { CustomerSupportTicket } from "@/types/commercial-product";

let ticketSeq = 0;

export class CustomerOperationsEngine {
  static listTickets(): CustomerSupportTicket[] {
    const ops = DevOpsOperationsOrchestrator.snapshot();
    const tickets: CustomerSupportTicket[] = [];

    for (const inc of ops.incidents.slice(0, 3)) {
      tickets.push({
        id: `tkt_${inc.id}`,
        subject: inc.title,
        severity: inc.severity === "sev1" ? "high" : inc.severity === "sev2" ? "medium" : "low",
        status: "investigating",
        createdAt: inc.openedAt,
      });
    }

    if (tickets.length === 0 && ops.operationalScore < 85) {
      tickets.push({
        id: `tkt_diag_${++ticketSeq}`,
        subject: "Operational score below SLO threshold",
        severity: "medium",
        status: "open",
        createdAt: Date.now() - 3600_000,
      });
    }

    return tickets;
  }

  static reportIssue(subject: string, severity: CustomerSupportTicket["severity"]): CustomerSupportTicket {
    return {
      id: `tkt_${Date.now()}_${++ticketSeq}`,
      subject,
      severity,
      status: "open",
      createdAt: Date.now(),
    };
  }
}
