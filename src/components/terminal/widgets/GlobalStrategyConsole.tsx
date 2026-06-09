"use client";

import { useMemo } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { GlobalStrategyOrchestrator } from "@/lib/global-strategy";
import { useGlobalStrategyStore, type GlobalStrategyTab } from "@/store/useGlobalStrategyStore";

const TABS: { id: GlobalStrategyTab; label: string }[] = [
  { id: "tiers", label: "TIERS" },
  { id: "scale", label: "SCALE" },
  { id: "infra", label: "INFRA" },
  { id: "ops", label: "OPS" },
  { id: "gtm", label: "GTM" },
  { id: "trust", label: "TRUST" },
  { id: "adopt", label: "ADOPT" },
  { id: "position", label: "POSITION" },
  { id: "moat", label: "MOAT" },
  { id: "ready", label: "READY" },
];

function sevColor(s: string): string {
  if (s === "critical" || s === "fail" || s === "gap") return terminalSkin.textDown;
  if (s === "watch" || s === "degraded" || s === "preparing" || s === "staged") return terminalSkin.textWarn;
  if (s === "pass" || s === "operational" || s === "ready" || s === "up") return terminalSkin.textUp;
  return "text-slate-500";
}

export function GlobalStrategyConsole() {
  const storeSnapshot = useGlobalStrategyStore((s) => s.snapshot);
  const activeTab = useGlobalStrategyStore((s) => s.activeTab);
  const setActiveTab = useGlobalStrategyStore((s) => s.setActiveTab);

  // Demo-safe fallback: compute directly if the background hook hasn't populated yet.
  const fallback = useMemo(() => {
    if (storeSnapshot) return null;
    try {
      return GlobalStrategyOrchestrator.snapshot();
    } catch {
      return null;
    }
  }, [storeSnapshot]);
  const snapshot = storeSnapshot ?? fallback;

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          Global strategy data unavailable in this context.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Globe className="h-3 w-3 text-amber-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-amber-300")}>GLOBAL INFRA STRATEGY</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          TRUST {snapshot.infrastructureTrustScore} · READY {snapshot.globalReadinessScore} · MOAT{" "}
          {snapshot.moatCompositeScore}
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
              activeTab === t.id ? "text-amber-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "tiers" &&
          snapshot.tiers.map((t) => (
            <div key={t.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.dataSm, "w-32 truncate text-slate-300")}>{t.label}</span>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>WF {t.workflowDepth}</span>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>OPS {t.operationalCapability}</span>
              </div>
              <p className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>{t.headline}</p>
            </div>
          ))}

        {activeTab === "scale" &&
          snapshot.scalingPhases.map((s) => (
            <div key={s.segment} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {s.label}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>P{s.phase}</span>
                <span className={cn(TERMINAL_TYPO.micro, sevColor(s.priority))}>{s.priority}</span>
                <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-500")}>{s.readinessPct}%</span>
              </div>
            </div>
          ))}

        {activeTab === "infra" &&
          snapshot.infrastructure.map((i) => (
            <div key={i.capability} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {i.label}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, sevColor(i.status))}>{i.status}</span>
                <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-500")}>{i.readinessPct}%</span>
              </div>
              {i.region && (
                <p className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>{i.region}</p>
              )}
            </div>
          ))}

        {activeTab === "ops" &&
          snapshot.operationalExcellence.map((o) => (
            <div key={o.kind} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {o.label}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, sevColor(o.status))}>{o.status}</span>
                <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-500")}>{o.coveragePct}%</span>
              </div>
            </div>
          ))}

        {activeTab === "gtm" &&
          snapshot.gtmTargets.map((g) => (
            <div key={g.segment} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {g.label}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-amber-400")}>{g.fitScore}</span>
              </div>
              <p className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>{g.channel}</p>
            </div>
          ))}

        {activeTab === "trust" &&
          snapshot.trustPillars.map((t) => (
            <div key={t.pillar} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {t.pillar}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, sevColor(t.trend))}>{t.trend}</span>
                <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-400")}>{t.score}</span>
              </div>
            </div>
          ))}

        {activeTab === "adopt" &&
          snapshot.adoptionLevers.map((a) => (
            <div key={a.lever} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {a.lever}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, a.embedded ? terminalSkin.textUp : "text-slate-600")}>
                  {a.embedded ? "EMBED" : "—"}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-500")}>{a.strength}</span>
              </div>
            </div>
          ))}

        {activeTab === "position" &&
          snapshot.competitivePosition.map((p) => (
            <div key={p.id} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>{p.positioning}</p>
              <span className={cn(TERMINAL_TYPO.micro, "text-amber-400")}>strength {p.strength}</span>
            </div>
          ))}

        {activeTab === "moat" &&
          snapshot.strategicMoats.map((m) => (
            <div key={m.pillar} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {m.label}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, m.compounding ? "text-cyan-500" : "text-slate-600")}>
                  {m.compounding ? "COMPOUND" : "—"}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-400")}>{m.score}</span>
              </div>
            </div>
          ))}

        {activeTab === "ready" &&
          snapshot.globalReadiness.map((r) => (
            <div key={r.domain} className="border-b-[0.5px] border-slate-800 px-1 py-0.5">
              <div className={cn(terminalSkin.row, "gap-1")}>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {r.domain}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, sevColor(r.status))}>{r.status}</span>
                <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-500")}>{r.readinessPct}%</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
