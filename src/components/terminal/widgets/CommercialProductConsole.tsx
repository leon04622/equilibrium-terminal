"use client";

import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { AlphaFeatureFlags } from "@/lib/alpha/AlphaFeatureFlags";
import { FeedbackIterationEngine } from "@/lib/alpha/FeedbackIterationEngine";
import { OnboardingEngine } from "@/lib/commercial/OnboardingEngine";
import { useAlphaStore } from "@/store/useAlphaStore";
import { useCommercialStore, type CommercialTab } from "@/store/useCommercialStore";
import type { AlphaFeatureFlag } from "@/types/alpha-launch";

const TABS: { id: CommercialTab; label: string }[] = [
  { id: "packaging", label: "TIERS" },
  { id: "onboarding", label: "ONBOARD" },
  { id: "subscription", label: "BILLING" },
  { id: "support", label: "SUPPORT" },
  { id: "release", label: "RELEASE" },
  { id: "analytics", label: "ANALYTICS" },
  { id: "admin", label: "ADMIN" },
  { id: "alpha", label: "ALPHA" },
  { id: "position", label: "MARKET" },
];

function sevColor(s: string): string {
  if (s === "at_risk" || s === "high" || s === "offline" || s === "fail") return terminalSkin.textDown;
  if (s === "moderate" || s === "medium" || s === "degraded" || s === "watch") return terminalSkin.textWarn;
  if (s === "strong" || s === "operational" || s === "pass" || s === "active") return terminalSkin.textUp;
  return "text-slate-500";
}

export function CommercialProductConsole() {
  const snapshot = useCommercialStore((s) => s.snapshot);
  const activeTab = useCommercialStore((s) => s.activeTab);
  const setActiveTab = useCommercialStore((s) => s.setActiveTab);
  const setWalkthroughOpen = useCommercialStore((s) => s.setWalkthroughOpen);
  const alpha = useAlphaStore((s) => s.snapshot);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Loading commercial product systems…</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Package className="h-3 w-3 text-violet-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-violet-300")}>PRODUCT · COMMERCIAL</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          READY {snapshot.marketReadinessScore} · TRUST {snapshot.trustScore} ·{" "}
          {snapshot.subscription.tier.toUpperCase().replace("_", " ")}
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
              activeTab === t.id ? "text-violet-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "packaging" &&
          snapshot.tiers.map((t) => (
            <div
              key={t.id}
              className={cn(
                "border-b-[0.5px] border-slate-800 px-1 py-0.5",
                t.id === snapshot.productTier && "bg-violet-950/20",
              )}
            >
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.dataSm, "w-28 truncate text-slate-300")}>{t.label}</span>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  {t.monthlyUsd ? `$${t.monthlyUsd}/mo` : "CONTRACT"}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{t.seatIncluded} seats</span>
              </div>
              <p className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>{t.headline}</p>
            </div>
          ))}

        {activeTab === "onboarding" && (
          <>
            <button
              type="button"
              onClick={() => setWalkthroughOpen(true)}
              className={cn(INSTITUTIONAL_INTERACTION.tabButton, "mb-1 w-full text-cyan-400")}
            >
              RESUME WALKTHROUGH · {snapshot.analytics.onboardingCompletionPct}%
            </button>
            {snapshot.onboarding.map((s) => (
              <div key={s.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {s.title}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, s.completed ? terminalSkin.textUp : "text-slate-600")}>
                    {s.completed ? "DONE" : s.required ? "REQ" : "OPT"}
                  </span>
                </div>
              </div>
            ))}
            {snapshot.templates.map((tpl) => (
              <div key={tpl.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <span className={cn(TERMINAL_TYPO.dataSm, "text-slate-400")}>{tpl.label}</span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{tpl.description}</p>
              </div>
            ))}
          </>
        )}

        {activeTab === "subscription" && (
          <>
            <div className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <span className={cn(TERMINAL_TYPO.micro, sevColor(snapshot.subscription.status))}>
                {snapshot.subscription.status.toUpperCase()}
              </span>
              <span className={cn(TERMINAL_TYPO.micro, "ml-2 text-slate-600")}>
                {snapshot.subscription.seatsUsed}/{snapshot.subscription.seatsLicensed} seats
              </span>
            </div>
            {snapshot.usageMeters.map((m) => (
              <div key={m.metric} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>{m.metric}</span>
                  <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-500")}>
                    {m.used}/{m.limit} {m.unit}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === "support" &&
          (snapshot.supportTickets.length === 0 ? (
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No open support tickets.</p>
          ) : (
            snapshot.supportTickets.map((t) => (
              <div key={t.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {t.subject}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, sevColor(t.severity))}>{t.severity}</span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{t.status}</span>
                </div>
              </div>
            ))
          ))}

        {activeTab === "release" && (
          <div className="space-y-px px-1">
            <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>
              {snapshot.release.channel.toUpperCase()} · v{snapshot.release.version}
            </p>
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
              Build {snapshot.release.buildId} · rollout {snapshot.release.rolloutPct}%
            </p>
            {snapshot.release.canaryEnabled ? (
              <p className={cn(TERMINAL_TYPO.micro, terminalSkin.textWarn)}>Canary active</p>
            ) : null}
          </div>
        )}

        {activeTab === "analytics" && (
          <>
            <div className="grid grid-cols-2 gap-px bg-slate-800 p-px">
              {(
                [
                  ["Onboarding", `${snapshot.analytics.onboardingCompletionPct}%`],
                  ["Workspace", `${snapshot.analytics.workspaceDepthScore}`],
                  ["Adoption", `${snapshot.analytics.featureAdoptionScore}`],
                  ["Retention", snapshot.analytics.retentionSignal],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="bg-slate-950 px-1 py-0.5">
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{k}</span>
                  <span className={cn(TERMINAL_TYPO.dataSm, sevColor(String(v)))}>{v}</span>
                </div>
              ))}
            </div>
            <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-600")}>
              {snapshot.analytics.sessions7d} sessions · {snapshot.analytics.panelsEngaged} panels engaged (7d)
            </p>
          </>
        )}

        {activeTab === "admin" &&
          snapshot.adminRows.map((r) => (
            <div key={r.domain} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {r.domain}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, sevColor(r.status))}>{r.status}</span>
              </div>
              <p className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>{r.detail}</p>
            </div>
          ))}

        {activeTab === "alpha" && alpha ? (
          <>
            <div className="grid grid-cols-2 gap-px bg-slate-800 p-px">
              <div className="bg-slate-950 px-1 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>OPS</span>
                <span className={cn(TERMINAL_TYPO.dataSm, "text-violet-300")}>{alpha.operationalScore}</span>
              </div>
              <div className="bg-slate-950 px-1 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>ROLLOUT</span>
                <span className={cn(TERMINAL_TYPO.dataSm)}>{alpha.rolloutPct}%</span>
              </div>
            </div>
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
              COHORT {alpha.cohort?.replace(/_/g, " ").toUpperCase() ?? "—"} · INVITE{" "}
              {alpha.inviteValidated ? "OK" : "REQUIRED"}
            </p>
            <p className={cn(TERMINAL_TYPO.micro, "pt-1 text-slate-600")}>RETENTION</p>
            {(
              [
                ["Dependency", alpha.retention.dependencySignal],
                ["Workflow depth", `${alpha.retention.workflowDepthScore}`],
                ["Daily return", `${alpha.retention.dailyReturnLikelihood}%`],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{k}</span>
                <span className={cn(TERMINAL_TYPO.micro, sevColor(String(v)))}>{v}</span>
              </div>
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "pt-1 text-slate-600")}>SUCCESS CONDITIONS</p>
            {alpha.successIndicators.map((s) => (
              <div key={s.label} className="flex justify-between border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{s.label}</span>
                <span className={cn(TERMINAL_TYPO.micro, s.met ? terminalSkin.textUp : "text-slate-600")}>
                  {s.met ? "MET" : "—"} · {s.detail}
                </span>
              </div>
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "pt-1 text-slate-600")}>WORKFLOW OBSERVATIONS</p>
            {alpha.workflowObservations.slice(0, 5).map((w) => (
              <div key={w.signal} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{w.signal}</span>
                <span className={cn(TERMINAL_TYPO.micro, "ml-1 text-slate-400")}>{w.value}</span>
              </div>
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "pt-1 text-slate-600")}>FEATURE FLAGS</p>
            {alpha.featureFlags.map((f) => (
              <div key={f.id} className="flex items-center justify-between border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{f.label}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (f.killSwitch) AlphaFeatureFlags.resetKillSwitches();
                    else AlphaFeatureFlags.setEnabled(f.id as AlphaFeatureFlag, !f.enabled);
                  }}
                  className={cn(
                    TERMINAL_TYPO.micro,
                    f.killSwitch ? terminalSkin.textDown : f.enabled ? terminalSkin.textUp : "text-slate-600",
                  )}
                >
                  {f.killSwitch ? "KILL" : f.enabled ? "ON" : "OFF"}
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                FeedbackIterationEngine.logPainPoint("friction", "Manual alpha feedback from console", "p2")
              }
              className={cn(INSTITUTIONAL_INTERACTION.tabButton, "mt-1 w-full text-slate-500")}
            >
              LOG SAMPLE FRICTION
            </button>
            <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-amber-500/80")}>
              {alpha.iterationFocus[0]}
            </p>
          </>
        ) : null}

        {activeTab === "position" && (
          <div className="space-y-2 px-1">
            <p className={cn(TERMINAL_TYPO.dataSm, "text-violet-200")}>
              Bloomberg for crypto — institutional market infrastructure.
            </p>
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
              Operational crypto intelligence platform. Execution-aware market operating system. Human trader
              remains central — AI assists organization only.
            </p>
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
              Not retail hype. Not autonomous trading. Institutional reliability and operational clarity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
