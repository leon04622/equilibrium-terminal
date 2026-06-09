"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import type { TerminalDensity } from "@/lib/theme/institutional";
import { ProductMaturityOrchestrator } from "@/lib/product-maturity/ProductMaturityOrchestrator";
import { terminalBus } from "@/store/eventBus";
import { useProductMaturityStore, type ProductMaturityTab } from "@/store/useProductMaturityStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import type { ProductMaturityModeId } from "@/types/product-maturity";

const TABS: { id: ProductMaturityTab; label: string }[] = [
  { id: "design", label: "DS" },
  { id: "ergo", label: "ERG" },
  { id: "exec", label: "EXE" },
  { id: "calm", label: "CALM" },
  { id: "immerse", label: "IMM" },
  { id: "micro", label: "µ" },
  { id: "brand", label: "ID" },
  { id: "a11y", label: "A11Y" },
  { id: "prefs", label: "PREFS" },
  { id: "modes", label: "MODES" },
];

const DENSITIES: TerminalDensity[] = ["compact", "standard", "comfortable"];

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between border-b border-slate-800/80 py-0.5">
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.micro, tone ?? "text-slate-400")}>{value}</span>
    </div>
  );
}

export function ProductMaturityConsole() {
  const snapshot = useProductMaturityStore((s) => s.snapshot);
  const activeTab = useProductMaturityStore((s) => s.activeTab);
  const setActiveTab = useProductMaturityStore((s) => s.setActiveTab);
  const setActiveMode = useProductMaturityStore((s) => s.setActiveMode);
  const setDensity = useTerminalExperienceStore((s) => s.setDensity);
  const setCalmMode = useTerminalExperienceStore((s) => s.setCalmMode);
  const setReducedMotion = useTerminalExperienceStore((s) => s.setReducedMotion);
  const density = useTerminalExperienceStore((s) => s.density);
  const calmMode = useTerminalExperienceStore((s) => s.calmMode);
  const reducedMotion = useTerminalExperienceStore((s) => s.reducedMotion);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Loading institutional polish…</p>
      </div>
    );
  }

  const applyMode = (id: ProductMaturityModeId) => {
    ProductMaturityOrchestrator.setActiveMode(id);
    setActiveMode(id);
    useProductMaturityStore.getState().setSnapshot(ProductMaturityOrchestrator.snapshot());
  };

  const refresh = () => {
    useProductMaturityStore.getState().setSnapshot(ProductMaturityOrchestrator.snapshot());
  };

  const focusPanel = (panelId: string) => {
    terminalBus.emit("widget:focus", { widgetId: panelId });
  };

  const sev = (s: string) =>
    s === "critical" || s === "elevated"
      ? "text-amber-400/90"
      : s === "active" || s === "trusted" || s === "ok"
        ? "text-emerald-500/90"
        : "text-slate-400";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Sparkles className="h-3 w-3 text-slate-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-slate-300")}>TERMINAL POLISH</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>T{snapshot.polishScore}</span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          {snapshot.telemetry.density} · calm {snapshot.telemetry.calmEnabled ? "on" : "off"}
        </span>
      </header>

      <p className={cn(TERMINAL_TYPO.micro, "shrink-0 border-b border-slate-800/80 px-1 py-0.5 text-slate-500")}>
        {snapshot.maturityBrief}
      </p>

      <nav className={cn(terminalSkin.borderB, "flex shrink-0 flex-wrap gap-0.5 p-0.5")}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={cn(
              INSTITUTIONAL_INTERACTION.tabButton,
              activeTab === t.id ? "text-slate-200" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "design" &&
          snapshot.designTokens.map((t) => (
            <Row key={t.id} label={`${t.domain}/${t.token}`} value={t.value} />
          ))}

        {activeTab === "ergo" &&
          snapshot.ergonomics.map((e) => (
            <div key={e.id} className="mb-1 border-b border-slate-800/80 pb-0.5">
              <Row label={e.control} value={e.state} tone={sev(e.state)} />
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{e.recommendation}</p>
            </div>
          ))}

        {activeTab === "exec" &&
          snapshot.executionPolish.map((e) => (
            <Row key={e.id} label={e.flow} value={`${e.status} · ${e.latency}`} tone={sev(e.status)} />
          ))}

        {activeTab === "calm" &&
          snapshot.calmness.map((c) => (
            <div key={c.id} className="mb-1 border-b border-slate-800/80 pb-0.5">
              <Row label={c.signal} value={c.level} tone={sev(c.level)} />
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{c.action}</p>
            </div>
          ))}

        {activeTab === "immerse" &&
          snapshot.immersion.map((i) => <Row key={i.id} label={i.layer} value={i.state} />)}

        {activeTab === "micro" &&
          snapshot.microInteractions.map((m) => (
            <Row key={m.id} label={m.surface} value={m.behavior.slice(0, 36)} />
          ))}

        {activeTab === "brand" &&
          snapshot.brandIdentity.map((b) => <Row key={b.id} label={b.element} value={b.tone} />)}

        {activeTab === "a11y" &&
          snapshot.accessibility.map((a) => (
            <div key={a.id} className="mb-1 border-b border-slate-800/80 pb-0.5">
              <Row label={a.control} value={a.status} />
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{a.comfort}</p>
            </div>
          ))}

        {activeTab === "prefs" && (
          <div className="space-y-1">
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Density</p>
            <div className="flex flex-wrap gap-0.5">
              {DENSITIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDensity(d);
                    refresh();
                  }}
                  className={cn(
                    INSTITUTIONAL_INTERACTION.tabButton,
                    density === d ? "text-slate-200" : "text-slate-600",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setCalmMode(!calmMode);
                refresh();
              }}
              className={cn(INSTITUTIONAL_INTERACTION.tabButton, "w-full", calmMode && "text-emerald-500/90")}
            >
              Calm mode {calmMode ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={() => {
                setReducedMotion(!reducedMotion);
                refresh();
              }}
              className={cn(
                INSTITUTIONAL_INTERACTION.tabButton,
                "w-full",
                reducedMotion && "text-cyan-500/90",
              )}
            >
              Reduced motion {reducedMotion ? "ON" : "OFF"}
            </button>
          </div>
        )}

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
                    ? "border-slate-600 bg-slate-900/50"
                    : "border-slate-800 hover:border-slate-700",
                )}
              >
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>{m.label}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
                <div className="mt-0.5 flex flex-wrap gap-0.5">
                  {m.panels.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        focusPanel(p);
                      }}
                      className={cn(
                        TERMINAL_TYPO.micro,
                        "rounded bg-slate-900 px-0.5 text-slate-500 hover:text-slate-300",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
