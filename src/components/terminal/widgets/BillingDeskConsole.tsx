"use client";

import { CreditCard } from "lucide-react";
import { useConsoleSnapshot } from "@/lib/runtime/consoleSnapshotFallback";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { BillingDeskOrchestrator } from "@/lib/billing-desk/BillingDeskOrchestrator";
import { useBillingDeskStore, type BillingDeskTab } from "@/store/useBillingDeskStore";
import type { BillingDeskModeId } from "@/types/billing-commercial";

const TABS: { id: BillingDeskTab; label: string }[] = [
  { id: "plans", label: "PLANS" },
  { id: "entitlements", label: "ENTITLE" },
  { id: "orgs", label: "ORGS" },
  { id: "usage", label: "USAGE" },
  { id: "invoices", label: "INVOICE" },
  { id: "payments", label: "PAY" },
  { id: "licenses", label: "LICENSE" },
  { id: "audit", label: "AUDIT" },
  { id: "analytics", label: "ANALYTICS" },
  { id: "reliability", label: "RELIABLE" },
  { id: "modes", label: "MODES" },
];

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between border-b border-slate-800/80 py-0.5">
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.micro, tone ?? "text-slate-400")}>{value}</span>
    </div>
  );
}

export function BillingDeskConsole() {
  const storeSnapshot = useBillingDeskStore((s) => s.snapshot);
  const snapshot = useConsoleSnapshot(storeSnapshot, () => BillingDeskOrchestrator.snapshot());
  const activeTab = useBillingDeskStore((s) => s.activeTab);
  const setActiveTab = useBillingDeskStore((s) => s.setActiveTab);
  const setActiveMode = useBillingDeskStore((s) => s.setActiveMode);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting billing desk…</p>
      </div>
    );
  }

  const applyMode = (id: BillingDeskModeId) => {
    BillingDeskOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  const statusTone = (s: string) =>
    s === "active" || s === "paid" || s === "ok" || s === "live" || s === "strong"
      ? "text-emerald-500/90"
      : s === "past_due" || s === "failed" || s === "critical" || s === "at_risk"
        ? "text-rose-400/90"
        : "text-amber-400/90";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <CreditCard className="h-3 w-3 text-emerald-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-emerald-300")}>BILLING DESK</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>B{snapshot.commercialScore}</span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          API {snapshot.telemetry.apiUtilizationPct}% · seats {snapshot.telemetry.seatUtilizationPct}%
        </span>
      </header>

      <nav className={cn(terminalSkin.borderB, "flex shrink-0 flex-wrap gap-0.5 p-0.5")}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={cn(
              INSTITUTIONAL_INTERACTION.tabButton,
              activeTab === t.id ? "text-emerald-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "plans" && (
          <div className="space-y-0">
            {snapshot.plans.map((p) => (
              <Row
                key={p.id}
                label={p.label}
                value={
                  p.monthlyUsd != null
                    ? `$${p.monthlyUsd}/mo · ${p.seats} seats`
                    : `contract · ${p.seats} seats`
                }
                tone={statusTone(p.status)}
              />
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "mt-2 whitespace-pre-wrap text-slate-500")}>
              {snapshot.commercialBrief}
            </p>
          </div>
        )}

        {activeTab === "entitlements" &&
          snapshot.entitlements.map((e) => (
            <Row
              key={e.id}
              label={`${e.scope} · ${e.module}`}
              value={e.enabled ? "on" : "off"}
              tone={e.enabled ? "text-emerald-500/90" : undefined}
            />
          ))}

        {activeTab === "orgs" &&
          snapshot.orgSeats.map((o) => (
            <Row
              key={o.orgId}
              label={o.orgName}
              value={`${o.seatsUsed}/${o.seatsLicensed} · ${o.status}`}
              tone={statusTone(o.status)}
            />
          ))}

        {activeTab === "usage" &&
          snapshot.apiMeters.map((m) => (
            <Row
              key={m.metric}
              label={m.metric}
              value={`${m.used}/${m.limit} ${m.unit}`}
              tone={statusTone(m.overageRisk === "critical" ? "critical" : m.overageRisk)}
            />
          ))}

        {activeTab === "invoices" &&
          snapshot.invoices.map((i) => (
            <Row
              key={i.id}
              label={i.orgName}
              value={`$${i.amountUsd} · ${i.status}`}
              tone={statusTone(i.status)}
            />
          ))}

        {activeTab === "payments" &&
          snapshot.paymentProviders.map((p) => (
            <Row key={p.id} label={p.provider} value={`${p.status} · ${p.capability}`} />
          ))}

        {activeTab === "licenses" &&
          snapshot.licenses.map((l) => (
            <Row
              key={l.id}
              label={l.orgName}
              value={`${l.contractType}${l.dedicatedInfra ? " · dedicated" : ""}`}
            />
          ))}

        {activeTab === "audit" &&
          snapshot.auditLog.map((a) => (
            <Row key={a.id} label={a.action} value={a.actor} />
          ))}

        {activeTab === "analytics" &&
          snapshot.commercialMetrics.map((m) => (
            <Row key={m.metric} label={m.metric} value={m.value} tone={statusTone(m.signal)} />
          ))}

        {activeTab === "reliability" &&
          snapshot.reliability.map((r) => (
            <Row key={r.label} label={r.label} value={r.value} tone={statusTone(r.status)} />
          ))}

        {activeTab === "modes" && (
          <div className="space-y-1">
            {snapshot.dashboardModes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => applyMode(m.id)}
                className={cn(
                  "w-full rounded border px-1 py-1 text-left",
                  snapshot.activeMode === m.id
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-slate-800 hover:border-slate-700",
                )}
              >
                <p className={cn(TERMINAL_TYPO.micro, "text-emerald-300")}>{m.label}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
