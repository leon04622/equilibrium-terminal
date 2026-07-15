"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BookmarkPlus, Filter, Plus, Trash2 } from "lucide-react";
import { TerminalSelect } from "@/components/ui/TerminalSelect";
import { cn, formatPrice } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin, formatTapeTime } from "@/lib/theme";
import { stopPanelWheelBubble } from "@/lib/runtime/panelScroll";
import { useMarketScreenerStore } from "@/store/useMarketScreenerStore";
import { useMarketScreenerAlertStore } from "@/store/useMarketScreenerAlertStore";
import { useTerminalStore } from "@/store/terminalStore";
import { terminalBus } from "@/store/eventBus";
import { BUILTIN_SCREENER_PRESETS } from "@/types/institutional-capabilities";

export function InstitutionalScreenerConsole() {
  const snapshot = useMarketScreenerStore((s) => s.snapshot);
  const filter = useMarketScreenerStore((s) => s.filter);
  const activePresetId = useMarketScreenerStore((s) => s.activePresetId);
  const savedPresets = useMarketScreenerStore((s) => s.savedPresets);
  const setFilter = useMarketScreenerStore((s) => s.setFilter);
  const applyPreset = useMarketScreenerStore((s) => s.applyPreset);
  const saveCurrentAsPreset = useMarketScreenerStore((s) => s.saveCurrentAsPreset);
  const deletePreset = useMarketScreenerStore((s) => s.deletePreset);
  const hydratePresets = useMarketScreenerStore((s) => s.hydratePresets);
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);
  const armed = useMarketScreenerAlertStore((s) => s.armed);
  const alertRules = useMarketScreenerAlertStore((s) => s.rules);
  const recentHits = useMarketScreenerAlertStore((s) => s.recentHits);
  const setArmed = useMarketScreenerAlertStore((s) => s.setArmed);
  const toggleAlertRule = useMarketScreenerAlertStore((s) => s.toggleRule);
  const addRuleFromPreset = useMarketScreenerAlertStore((s) => s.addRuleFromPreset);
  const removeAlertRule = useMarketScreenerAlertStore((s) => s.removeRule);
  const hydrateAlerts = useMarketScreenerAlertStore((s) => s.hydrate);
  const [saveOpen, setSaveOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");

  useEffect(() => {
    hydratePresets();
    hydrateAlerts();
  }, [hydratePresets, hydrateAlerts]);

  const allPresets = [...BUILTIN_SCREENER_PRESETS, ...savedPresets];
  const activeUserPreset = savedPresets.find((p) => p.id === activePresetId);

  return (
    <div className="flex h-full flex-col overflow-hidden" data-screener-panel="screener">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 flex-wrap items-center gap-2 px-1 py-0.5")}>
        <Filter className="h-3 w-3 text-violet-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-violet-300")}>MARKET SCREENER</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          FactSet/Eikon-style movers · {snapshot?.rows.length ?? 0}/{snapshot?.universeSize ?? 0}
        </span>
        <TerminalSelect
          value={activePresetId}
          onChange={applyPreset}
          className="ml-auto"
          title="Screener preset"
          options={[
            ...BUILTIN_SCREENER_PRESETS.map((p) => ({ value: p.id, label: p.label })),
            ...(activePresetId === "custom" ? [{ value: "custom", label: "Custom" }] : []),
          ]}
          groups={
            savedPresets.length > 0
              ? [
                  {
                    label: "Saved",
                    options: savedPresets.map((p) => ({ value: p.id, label: p.label })),
                  },
                ]
              : undefined
          }
        />
        <button
          type="button"
          onClick={() => setArmed(!armed)}
          className={cn(
            TERMINAL_TYPO.micro,
            "flex items-center gap-0.5",
            armed ? "text-violet-300" : "text-slate-600 hover:text-slate-400",
          )}
          title={armed ? "Screener alerts armed" : "Screener alerts muted"}
        >
          {armed ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
        </button>
        <button
          type="button"
          onClick={() => setAlertsOpen((v) => !v)}
          className={cn(TERMINAL_TYPO.micro, "text-slate-600 hover:text-violet-300")}
          title="Alert rules"
        >
          RULES ({alertRules.filter((r) => r.enabled).length})
        </button>
        <button
          type="button"
          onClick={() => setSaveOpen((v) => !v)}
          className={cn(TERMINAL_TYPO.micro, "flex items-center gap-0.5 text-slate-500 hover:text-cyan-300")}
          title="Save current filters"
        >
          <BookmarkPlus className="h-3 w-3" />
        </button>
        {activeUserPreset ? (
          <button
            type="button"
            onClick={() => deletePreset(activeUserPreset.id)}
            className={cn(TERMINAL_TYPO.micro, "text-slate-600 hover:text-red-400")}
            title="Delete saved preset"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        ) : null}
        <TerminalSelect
          value={filter.market}
          onChange={(v) => setFilter({ market: v as "all" | "perp" | "spot" })}
          title="Market filter"
          options={[
            { value: "all", label: "All markets" },
            { value: "perp", label: "Perps only" },
            { value: "spot", label: "Spot only" },
          ]}
        />
      </header>

      {saveOpen ? (
        <div className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-1 px-1 py-0.5")}>
          <input
            value={saveLabel}
            onChange={(e) => setSaveLabel(e.target.value)}
            placeholder="Preset name"
            className={cn(
              TERMINAL_TYPO.micro,
              "min-w-0 flex-1 border border-slate-800 bg-slate-950 px-1 text-slate-300",
            )}
          />
          <button
            type="button"
            onClick={() => {
              saveCurrentAsPreset(saveLabel || `Preset ${allPresets.length + 1}`);
              setSaveLabel("");
              setSaveOpen(false);
            }}
            className={cn(TERMINAL_TYPO.micro, "text-cyan-400 hover:text-cyan-200")}
          >
            SAVE
          </button>
        </div>
      ) : null}

      {alertsOpen ? (
        <div className={cn(terminalSkin.borderB, "shrink-0 space-y-1 px-1 py-1")}>
          <div className="flex items-center justify-between">
            <span className={cn(TERMINAL_TYPO.micro, "text-violet-300")}>ALERT RULES</span>
            <button
              type="button"
              onClick={() =>
                addRuleFromPreset(
                  activePresetId === "custom" ? "builtin_all_movers" : activePresetId,
                  `Alert · ${allPresets.find((p) => p.id === activePresetId)?.label ?? "Custom"}`,
                  filter.minChangePct,
                  filter.minComposite,
                )
              }
              className={cn(TERMINAL_TYPO.micro, "flex items-center gap-0.5 text-cyan-400 hover:text-cyan-200")}
            >
              <Plus className="h-3 w-3" /> ADD
            </button>
          </div>
          {alertRules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-1 border border-slate-800/80 px-1 py-0.5">
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={(e) => toggleAlertRule(rule.id, e.target.checked)}
                className="accent-violet-500"
              />
              <span className={cn(TERMINAL_TYPO.micro, "min-w-0 flex-1 truncate text-slate-300")}>
                {rule.label}
              </span>
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                Δ≥{rule.minChangePct}% · sc≥{rule.minComposite}
              </span>
              {rule.id.startsWith("user_alert_") ? (
                <button
                  type="button"
                  onClick={() => removeAlertRule(rule.id)}
                  className="text-slate-600 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          ))}
          {recentHits.length > 0 ? (
            <div className="border-t border-slate-800 pt-1">
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>RECENT HITS</span>
              {recentHits.slice(0, 4).map((h) => (
                <p key={`${h.at}-${h.coin}`} className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {formatTapeTime(h.at)} · {h.symbol} · {h.ruleLabel}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className="eq-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-1"
        onWheel={stopPanelWheelBubble}
      >
        <table className={cn(TERMINAL_TYPO.micro, "w-full text-left")}>
          <thead>
            <tr className="text-slate-600">
              <th>#</th>
              <th>COIN</th>
              <th>Δ%</th>
              <th>MID</th>
              <th>SCORE</th>
              <th>TAGS</th>
            </tr>
          </thead>
          <tbody>
            {(snapshot?.rows ?? []).map((row) => (
              <tr
                key={row.coin}
                className="cursor-pointer border-t border-slate-900 hover:bg-slate-900/50"
                onClick={() => {
                  selectAssetByCoin(row.coin, "screener");
                  terminalBus.emit("widget:focus", { widgetId: "chart" });
                }}
              >
                <td className="text-slate-500">{row.rank}</td>
                <td className="font-semibold text-slate-200">{row.symbol}</td>
                <td
                  className={cn(
                    "tabular-nums",
                    row.changePct >= 0 ? terminalSkin.textUp : terminalSkin.textDown,
                  )}
                >
                  {row.changePct >= 0 ? "+" : ""}
                  {row.changePct.toFixed(2)}%
                </td>
                <td className="tabular-nums text-slate-400">{formatPrice(row.mid)}</td>
                <td className="tabular-nums text-violet-300">{row.compositeScore}</td>
                <td className="text-slate-500">{row.tags.join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!snapshot?.rows.length ? (
          <p className={cn(TERMINAL_TYPO.micro, "mt-2 text-slate-600")}>
            Waiting for market data — screener refreshes every few seconds.
          </p>
        ) : null}
      </div>
    </div>
  );
}
