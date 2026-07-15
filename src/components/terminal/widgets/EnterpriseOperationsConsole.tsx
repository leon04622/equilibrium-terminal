"use client";

import { Building2 } from "lucide-react";
import { useConsoleSnapshot } from "@/lib/runtime/consoleSnapshotFallback";
import { EnterpriseOrchestrator } from "@/lib/enterprise";
import { cn } from "@/lib/utils";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { useEnterpriseOpsStore, type EnterpriseOpsTab } from "@/store/useEnterpriseOpsStore";
import { useProductionConfigStore } from "@/store/useProductionConfigStore";
import { useTerminalStore } from "@/store/terminalStore";

const TABS: { id: EnterpriseOpsTab; label: string }[] = [
  { id: "org", label: "ORG" },
  { id: "desks", label: "DESKS" },
  { id: "portfolio", label: "PORTFOLIO" },
  { id: "alerts", label: "ALERTS" },
  { id: "audit", label: "AUDIT" },
  { id: "comms", label: "COMMS" },
  { id: "knowledge", label: "KNOWLEDGE" },
  { id: "tenant", label: "TENANT" },
  { id: "reliability", label: "RELIABILITY" },
];

function sevColor(sev: string): string {
  if (sev === "critical") return terminalSkin.textDown;
  if (sev === "watch") return terminalSkin.textWarn;
  return "text-slate-500";
}

function riskColor(band: string): string {
  if (band === "critical") return terminalSkin.textDown;
  if (band === "elevated") return terminalSkin.textWarn;
  return "text-slate-500";
}

function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function EnterpriseOperationsConsole() {
  const storeSnapshot = useEnterpriseOpsStore((s) => s.snapshot);
  const activeTab = useEnterpriseOpsStore((s) => s.activeTab);
  const setActiveTab = useEnterpriseOpsStore((s) => s.setActiveTab);
  const entitled = useProductionConfigStore((s) => s.isEntitled("enterpriseOpsEnabled"));
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);
  const snapshot = useConsoleSnapshot(storeSnapshot, () => EnterpriseOrchestrator.snapshot());

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          Initializing enterprise operations layer…
        </p>
      </div>
    );
  }

  const { organization, permissions, treasury, reliability } = snapshot;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Building2 className="h-3 w-3 text-amber-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-amber-300")}>ENTERPRISE OPS</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {organization.name} · EQ {snapshot.operationalScore}/100
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-500")}>
          {organization.tier.toUpperCase()} · {organization.deskCount} desks · {reliability.uptimePct.toFixed(2)}% uptime
        </span>
      </header>

      {!entitled ? (
        <p className={cn(terminalSkin.borderB, TERMINAL_TYPO.micro, "shrink-0 bg-amber-950/30 px-2 py-1 text-amber-400/90")}>
          Preview mode — local orchestrator demo. Enterprise tier unlocks live tenant sync.
        </p>
      ) : null}

      <nav className={cn(terminalSkin.borderB, "flex shrink-0 flex-wrap gap-0.5 p-0.5")}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={cn(
              INSTITUTIONAL_INTERACTION.tabButton,
              activeTab === t.id ? "text-amber-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "org" ? (
          <section>
            <p className={cn(TERMINAL_TYPO.micro, "mb-1 text-slate-600")}>
              ROLE {permissions.role.toUpperCase()} · TENANT {organization.tenantId}
            </p>
            {snapshot.templates.map((tpl) => (
              <div
                key={tpl.id}
                className="border-b-[0.5px] border-slate-800 px-1 py-0.5 hover:bg-slate-900/80"
              >
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {tpl.name}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                    {tpl.inheritedBy} desks
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "truncate text-slate-500")}>{tpl.description}</p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "desks" ? (
          <section>
            {snapshot.desks.map((desk) => (
              <div
                key={desk.id}
                className="border-b-[0.5px] border-slate-800 px-1 py-0.5 hover:bg-slate-900/80"
              >
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-16 uppercase text-slate-500")}>
                    {desk.type}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {desk.name}
                  </span>
                  <span
                    className={cn(
                      TERMINAL_TYPO.micro,
                      desk.status === "operational" ? terminalSkin.textUp : terminalSkin.textWarn,
                    )}
                  >
                    {desk.status.toUpperCase()}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "pl-[4.5rem] text-slate-600")}>
                  {desk.memberCount} members · {desk.activeAlerts} alerts · {desk.primaryAssets.join(", ")}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "portfolio" ? (
          <section>
            <p className={cn(TERMINAL_TYPO.micro, "mb-1 border-b-[0.5px] border-slate-800 px-1 py-0.5 text-slate-500")}>
              AUM {fmtUsd(treasury.totalAumUsd)} · STABLE {treasury.stablecoinPct}% · LEV {treasury.leverageRatio}x · NET Δ {fmtUsd(treasury.netDeltaUsd)}
            </p>
            {snapshot.portfolio.map((row) => (
              <button
                key={row.asset}
                type="button"
                onClick={() => selectAssetByCoin(row.asset, "enterpriseops")}
                className={cn(
                  terminalSkin.row,
                  "mb-0 w-full border-b-[0.5px] border-slate-800 py-0.5 text-left hover:bg-slate-900/80",
                )}
              >
                <span className={cn(TERMINAL_TYPO.dataSm, "w-12 font-bold text-slate-400")}>
                  {row.asset}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "w-16 text-slate-600")}>{row.category}</span>
                <span className={cn(TERMINAL_TYPO.dataSm, "w-20 tabular-nums text-slate-300")}>
                  {fmtUsd(row.notionalUsd)}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "w-10 tabular-nums text-slate-500")}>
                  {row.pctPortfolio.toFixed(1)}%
                </span>
                <span className={cn(TERMINAL_TYPO.micro, riskColor(row.riskBand))}>
                  {row.riskBand.toUpperCase()}
                </span>
              </button>
            ))}
          </section>
        ) : null}

        {activeTab === "alerts" ? (
          <section>
            {snapshot.alertGovernance.map((rule) => (
              <div
                key={rule.id}
                className="border-b-[0.5px] border-slate-800 px-1 py-0.5"
              >
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-8 text-slate-600")}>
                    {rule.scope.toUpperCase()}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {rule.name}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, sevColor(rule.severity))}>
                    {rule.escalation.toUpperCase()}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "truncate pl-[2.5rem] text-slate-600")}>
                  {rule.condition} · {rule.subscriberCount} subs · {rule.owner}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "audit" ? (
          <section>
            {!permissions.canViewAudit ? (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                Audit access restricted — compliance or admin role required.
              </p>
            ) : (
              snapshot.auditTrail.map((entry) => (
                <div
                  key={entry.id}
                  className="border-b-[0.5px] border-slate-800 px-1 py-0.5"
                >
                  <div className={cn(terminalSkin.row, "gap-1")}>
                    <span className={cn(TERMINAL_TYPO.micro, "w-14 tabular-nums text-slate-600")}>
                      {formatTapeTime(entry.timestamp).slice(0, 8)}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, "w-16 uppercase text-slate-500")}>
                      {entry.category}
                    </span>
                    <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                      {entry.action}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, entry.allowed ? terminalSkin.textUp : terminalSkin.textDown)}>
                      {entry.allowed ? "OK" : "DENY"}
                    </span>
                  </div>
                  <p className={cn(TERMINAL_TYPO.micro, "truncate pl-[4.5rem] text-slate-600")}>
                    {entry.actorHandle} · {entry.resource}
                  </p>
                </div>
              ))
            )}
          </section>
        ) : null}

        {activeTab === "comms" ? (
          <section>
            {snapshot.notices.map((notice) => (
              <div
                key={notice.id}
                className="border-b-[0.5px] border-slate-800 px-1 py-0.5 hover:bg-slate-900/80"
              >
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-20 uppercase text-slate-500")}>
                    {notice.kind.replace("_", " ")}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {notice.headline}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, sevColor(notice.severity))}>
                    {notice.severity.toUpperCase()}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "truncate pl-[5.5rem] text-slate-500")}>
                  {notice.authorHandle} · {notice.body}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "knowledge" ? (
          <section>
            {snapshot.knowledge.map((item) => (
              <div
                key={item.id}
                className="border-b-[0.5px] border-slate-800 px-1 py-0.5 hover:bg-slate-900/80"
              >
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-20 uppercase text-slate-500")}>
                    {item.category.replace("_", " ")}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {item.title}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "truncate pl-[5.5rem] text-slate-500")}>
                  {item.authorHandle} · {item.summary}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "tenant" ? (
          <section>
            {snapshot.tenants.map((tenant) => (
              <div
                key={tenant.tenantId}
                className="border-b-[0.5px] border-slate-800 px-1 py-0.5"
              >
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {tenant.orgName}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                    {tenant.isolationLevel.toUpperCase()}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  {tenant.tenantId} · {tenant.deskCount} desks · {tenant.dataBoundary} · {tenant.syncRegion}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "reliability" ? (
          <section>
            <div className="border-b-[0.5px] border-slate-800 px-1 py-1">
              <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>
                UPTIME {reliability.uptimePct.toFixed(2)}% · {reliability.redundancyMode.replace("-", " ").toUpperCase()}
              </p>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                FAILOVER {reliability.failoverReady ? "READY" : "STANDBY"} · DR RPO {reliability.drRpoMinutes}m · RTO {reliability.drRtoMinutes}m
              </p>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                DETERMINISTIC {reliability.deterministicOps ? "YES" : "NO"} · MONITORING {reliability.monitoringActive ? "ACTIVE" : "OFF"}
              </p>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
