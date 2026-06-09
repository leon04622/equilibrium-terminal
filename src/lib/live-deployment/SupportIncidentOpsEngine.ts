import { CustomerSupportOpsEngine } from "@/lib/ops-command/CustomerSupportOpsEngine";
import { IncidentManagementEngine } from "@/lib/ops-command/IncidentManagementEngine";
import { RuntimeControlEngine } from "@/lib/ops-command/RuntimeControlEngine";
import type { SupportOpsRow } from "@/types/live-deployment";

export class SupportIncidentOpsEngine {
  static workflows(): SupportOpsRow[] {
    const incidents = IncidentManagementEngine.incidents().filter((i) => i.status !== "resolved");
    const tickets = CustomerSupportOpsEngine.tickets().slice(0, 3);
    const controls = RuntimeControlEngine.controls().slice(0, 2);

    const rows: SupportOpsRow[] = incidents.map((i) => ({
      id: i.id,
      workflow: i.title.slice(0, 32),
      state: i.status,
    }));

    for (const t of tickets) {
      rows.push({ id: t.id, workflow: `support · ${t.subject.slice(0, 24)}`, state: t.status });
    }

    for (const c of controls) {
      rows.push({ id: c.id, workflow: c.control, state: c.status });
    }

    if (rows.length === 0) {
      rows.push({ id: "sup-clear", workflow: "incident_command", state: "no open incidents" });
    }

    return rows;
  }
}
