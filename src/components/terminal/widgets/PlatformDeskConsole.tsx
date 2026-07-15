"use client";

import { Blocks } from "lucide-react";
import { useConsoleSnapshot } from "@/lib/runtime/consoleSnapshotFallback";
import { useTerminalStore } from "@/store/terminalStore";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { ApiAuthorizationEngine } from "@/lib/platform-desk/ApiAuthorizationEngine";
import { PlatformDeskOrchestrator } from "@/lib/platform-desk/PlatformDeskOrchestrator";
import { usePlatformDeskStore, type PlatformDeskTab } from "@/store/usePlatformDeskStore";
import type { PlatformDeskModeId } from "@/types/platform-extensibility";

const TABS: { id: PlatformDeskTab; label: string }[] = [
  { id: "gateway", label: "GATEWAY" },
  { id: "sdk", label: "SDK" },
  { id: "plugins", label: "PLUGINS" },
  { id: "quant", label: "QUANT" },
  { id: "webhooks", label: "WEBHOOKS" },
  { id: "enterprise", label: "ENT" },
  { id: "auth", label: "AUTH" },
  { id: "devx", label: "DEVX" },
  { id: "embed", label: "EMBED" },
  { id: "observe", label: "OBSERVE" },
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

export function PlatformDeskConsole() {
  const storeSnapshot = usePlatformDeskStore((s) => s.snapshot);
  const selectedCoin = useTerminalStore((s) => s.selectedCoin) ?? "BTC";
  const snapshot = useConsoleSnapshot(storeSnapshot, () =>
    PlatformDeskOrchestrator.snapshot(selectedCoin),
  );
  const activeTab = usePlatformDeskStore((s) => s.activeTab);
  const setActiveTab = usePlatformDeskStore((s) => s.setActiveTab);
  const setActiveMode = usePlatformDeskStore((s) => s.setActiveMode);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting platform desk…</p>
      </div>
    );
  }

  const applyMode = (id: PlatformDeskModeId) => {
    PlatformDeskOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Blocks className="h-3 w-3 text-amber-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-amber-300")}>PLATFORM DESK</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {snapshot.asset} · E{snapshot.platformScore}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          {snapshot.telemetry.liveEndpoints}/{snapshot.telemetry.endpointCount} live
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
        {activeTab === "gateway" && (
          <div className="space-y-0">
            {snapshot.gateway.slice(0, 12).map((e) => (
              <Row
                key={e.id}
                label={`${e.kind.toUpperCase()} ${e.path}`}
                value={`${e.status} · ${e.latencyMs}ms`}
                tone={e.status === "live" ? "text-emerald-500/90" : undefined}
              />
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "mt-2 whitespace-pre-wrap text-slate-500")}>
              {snapshot.integrationBrief}
            </p>
          </div>
        )}

        {activeTab === "sdk" && (
          <div className="space-y-0">
            {snapshot.sdks.map((s) => (
              <Row
                key={s.id}
                label={`${s.language} · ${s.packageName}`}
                value={`${s.version} · ${s.status}`}
              />
            ))}
          </div>
        )}

        {activeTab === "plugins" && (
          <div className="space-y-0">
            {snapshot.plugins.map((p) => (
              <Row key={p.id} label={`${p.slot} · ${p.name}`} value={p.status} />
            ))}
          </div>
        )}

        {activeTab === "quant" && (
          <div className="space-y-0">
            {snapshot.quantApis.map((q) => (
              <Row
                key={q.id}
                label={q.category}
                value={q.streaming ? "stream" : "rest"}
                tone="text-cyan-400/90"
              />
            ))}
          </div>
        )}

        {activeTab === "webhooks" && (
          <div className="space-y-0">
            {snapshot.webhooks.map((w) => (
              <Row
                key={w.id}
                label={w.eventType}
                value={`${w.status} · ${w.deliveries24h}/24h`}
              />
            ))}
          </div>
        )}

        {activeTab === "enterprise" && (
          <div className="space-y-0">
            {snapshot.enterprise.map((c) => (
              <Row key={c.id} label={c.system} value={`${c.protocol} · ${c.status}`} />
            ))}
          </div>
        )}

        {activeTab === "auth" && (
          <div className="space-y-0">
            {snapshot.apiKeys.map((k) => (
              <button
                key={k.id}
                type="button"
                className="w-full text-left"
                onClick={() => ApiAuthorizationEngine.rotateUsage(k.id)}
              >
                <Row
                  label={k.label}
                  value={`${k.usageToday}/${k.quotaDaily} · ${k.rateLimitPerMin}/min`}
                />
              </button>
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-600")}>
              Scoped keys · org permissions · signed requests (enterprise)
            </p>
          </div>
        )}

        {activeTab === "devx" && (
          <div className="space-y-0">
            {snapshot.devResources.map((d) => (
              <Row key={d.id} label={d.title} value={d.type} />
            ))}
          </div>
        )}

        {activeTab === "embed" && (
          <div className="space-y-0">
            {snapshot.embeddables.map((e) => (
              <Row key={e.id} label={e.name} value={`${e.format} · ${e.subscribers} subs`} />
            ))}
          </div>
        )}

        {activeTab === "observe" && (
          <div className="space-y-0">
            {snapshot.observability.slice(0, 10).map((o) => (
              <Row
                key={o.route}
                label={o.route}
                value={`p50 ${o.p50Ms}ms · err ${o.errorRatePct.toFixed(1)}%`}
              />
            ))}
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
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-slate-800 hover:border-slate-700",
                )}
              >
                <p className={cn(TERMINAL_TYPO.micro, "text-amber-300")}>{m.label}</p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
