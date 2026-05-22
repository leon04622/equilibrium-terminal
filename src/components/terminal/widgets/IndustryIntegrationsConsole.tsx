"use client";

import { Plug } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import {
  useIndustryIntegrationsStore,
  type IntegrationsTab,
} from "@/store/useIndustryIntegrationsStore";

const TABS: { id: IntegrationsTab; label: string }[] = [
  { id: "venues", label: "VENUES" },
  { id: "partners", label: "PARTNERS" },
  { id: "routing", label: "ROUTING" },
  { id: "api", label: "API" },
  { id: "embed", label: "EMBED" },
  { id: "reports", label: "REPORTS" },
  { id: "deploy", label: "DEPLOY" },
  { id: "public", label: "PUBLIC" },
  { id: "scale", label: "SCALE" },
];

function statusColor(status: string): string {
  if (status === "live") return terminalSkin.textUp;
  if (status === "connected") return "text-cyan-400";
  if (status === "staged") return terminalSkin.textWarn;
  if (status === "degraded") return terminalSkin.textWarn;
  return "text-slate-600";
}

function sevColor(sev: string): string {
  if (sev === "critical") return terminalSkin.textDown;
  if (sev === "watch") return terminalSkin.textWarn;
  return "text-slate-500";
}

export function IndustryIntegrationsConsole() {
  const snapshot = useIndustryIntegrationsStore((s) => s.snapshot);
  const activeTab = useIndustryIntegrationsStore((s) => s.activeTab);
  const setActiveTab = useIndustryIntegrationsStore((s) => s.setActiveTab);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          Initializing industry integration layer…
        </p>
      </div>
    );
  }

  const { trust, scalability } = snapshot;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Plug className="h-3 w-3 text-emerald-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-emerald-300")}>INDUSTRY INTEGRATIONS</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          EQ {snapshot.integrationScore}/100 · CRED {trust.institutionalCredibilityScore}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-500")}>
          {snapshot.exchanges.filter((e) => e.status === "live").length} live · {trust.embedDeployments} embeds
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
        {activeTab === "venues" ? (
          <section>
            {snapshot.exchanges.map((ex) => (
              <div
                key={ex.id}
                className="border-b-[0.5px] border-slate-800 px-1 py-0.5 hover:bg-slate-900/80"
              >
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-16 uppercase text-slate-500")}>
                    {ex.category.replace("_", " ")}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {ex.name}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, statusColor(ex.status))}>
                    {ex.status.toUpperCase()}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "pl-[4.5rem] text-slate-600")}>
                  {ex.executionEnabled ? "EXEC" : "—"} · {ex.dataFeedEnabled ? "DATA" : "—"}
                  {ex.latencyMs != null ? ` · ${ex.latencyMs}ms` : ""}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "partners" ? (
          <section>
            {snapshot.dataPartnerships.map((p) => (
              <div key={p.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {p.partner}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{p.tier.toUpperCase()}</span>
                  <span className={cn(TERMINAL_TYPO.micro, statusColor(p.status))}>
                    {p.contractStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "routing" ? (
          <section>
            {snapshot.executionRoutes.map((r) => (
              <div key={r.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "w-10 font-bold text-slate-400")}>{r.asset}</span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {r.venue}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{r.routeType.toUpperCase()}</span>
                  <span className={cn(TERMINAL_TYPO.micro, r.active ? terminalSkin.textUp : "text-slate-600")}>
                    {r.active ? `${r.fillRatePct}%` : "OFF"}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "pl-[2.75rem] text-slate-600")}>
                  Slip {r.avgSlippageBps.toFixed(1)}bps · LQ {r.liquidityScore}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "api" ? (
          <section>
            {snapshot.apiEndpoints.map((api) => (
              <div key={api.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-14 text-slate-600")}>{api.kind}</span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate font-mono text-slate-300")}>
                    {api.path}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, statusColor(api.status))}>
                    {api.status.toUpperCase()}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "truncate pl-[4.5rem] text-slate-600")}>
                  {api.description} · {api.requestsPerMin}/min · {api.authMethod}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "embed" ? (
          <section>
            {snapshot.embeddables.map((w) => (
              <div key={w.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {w.name}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{w.format.toUpperCase()}</span>
                  <span className={cn(TERMINAL_TYPO.micro, statusColor(w.status))}>
                    {w.subscribers} subs
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "truncate font-mono text-slate-600")}>{w.endpoint}</p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "reports" ? (
          <section>
            {snapshot.reports.map((r) => (
              <div key={r.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-20 uppercase text-slate-500")}>
                    {r.kind.replace("_", " ")}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {r.title}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{r.status.toUpperCase()}</span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "truncate pl-[5.5rem] text-slate-500")}>{r.summary}</p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "deploy" ? (
          <section>
            {snapshot.deployments.map((d) => (
              <div key={d.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {d.orgName}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{d.mode.toUpperCase()}</span>
                  <span className={cn(TERMINAL_TYPO.micro, statusColor(d.status))}>{d.region}</span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  BRAND {d.brandingEnabled ? "Y" : "N"} · DEDICATED {d.dedicatedInfra ? "Y" : "N"} · PRIVATE INTEL{" "}
                  {d.privateIntelEnv ? "Y" : "N"}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "public" ? (
          <section>
            {snapshot.publicBriefs.map((b) => (
              <div key={b.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-16 uppercase text-slate-500")}>{b.category}</span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {b.headline}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, sevColor(b.severity))}>{b.severity.toUpperCase()}</span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "pl-[4.5rem] text-slate-600")}>
                  {formatTapeTime(b.publishedAt).slice(0, 8)} · reach ~{b.reachEstimate}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "scale" ? (
          <section>
            <div className="border-b-[0.5px] border-slate-800 px-1 py-1">
              <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>
                UPTIME {scalability.uptimePct.toFixed(2)}% · HEADROOM {scalability.capacityHeadroomPct}%
              </p>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                GRADE {trust.infrastructureGrade.replace("_", " ").toUpperCase()} · SUPPORT{" "}
                {scalability.supportTier.replace("_", " ").toUpperCase()}
              </p>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                REDUNDANCY {scalability.redundancyActive ? "ACTIVE" : "OFF"} · AUTOSCALE{" "}
                {scalability.autoScaleReady ? "READY" : "—"} · DEPLOY{" "}
                {scalability.deploymentReady ? "READY" : "STAGED"}
              </p>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                API UPTIME {trust.apiUptimePct.toFixed(2)}% · PARTNERS {trust.partnerCount} · STRESS{" "}
                {trust.stressTestPassed ? "PASS" : "—"}
              </p>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
