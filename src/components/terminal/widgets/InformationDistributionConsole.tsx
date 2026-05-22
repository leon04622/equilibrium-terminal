"use client";

import { Radio, Send, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import {
  useInformationDistributionStore,
  type DistributionTab,
} from "@/store/useInformationDistributionStore";
import { useTerminalStore } from "@/store/terminalStore";

const TABS: { id: DistributionTab; label: string }[] = [
  { id: "tape", label: "TAPE" },
  { id: "incidents", label: "INCIDENTS" },
  { id: "briefings", label: "BRIEFINGS" },
  { id: "personal", label: "PERSONAL" },
  { id: "delivery", label: "DELIVERY" },
  { id: "syndication", label: "SYNDICATE" },
];

function sevColor(sev: string): string {
  if (sev === "critical") return terminalSkin.textDown;
  if (sev === "watch") return terminalSkin.textWarn;
  return "text-slate-500";
}

export function InformationDistributionConsole() {
  const snapshot = useInformationDistributionStore((s) => s.snapshot);
  const activeTab = useInformationDistributionStore((s) => s.activeTab);
  const setActiveTab = useInformationDistributionStore((s) => s.setActiveTab);
  const channelPrefs = useInformationDistributionStore((s) => s.channelPrefs);
  const setChannelPrefs = useInformationDistributionStore((s) => s.setChannelPrefs);
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Initializing distribution network…</p>
      </div>
    );
  }

  const { quality, distributionScore, syndication } = snapshot;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Radio className="h-3 w-3 text-cyan-500" />
        <span className={cn(TERMINAL_TYPO.label, "text-cyan-300")}>MARKET NEWSWIRE</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          EQ {distributionScore}/100 · conf {quality.overallConfidence}%
        </span>
        {quality.duplicatesSuppressed > 0 ? (
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
            · {quality.duplicatesSuppressed} dup suppressed
          </span>
        ) : null}
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-500")}>
          {snapshot.newswire.length} events
        </span>
      </header>

      <nav className={cn(terminalSkin.borderB, "flex shrink-0 flex-wrap gap-0.5 p-0.5")}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={cn(
              TERMINAL_TYPO.micro,
              "border border-slate-800 px-1",
              activeTab === t.id ? "text-cyan-300" : "text-slate-600",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {activeTab === "tape" ? (
          <section>
            {snapshot.newswire.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Tape quiet — monitoring feeds.</p>
            ) : (
              snapshot.newswire.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => item.coin && selectAssetByCoin(item.coin, "newswire")}
                  className={cn(
                    terminalSkin.row,
                    "mb-0 w-full border-b-[0.5px] border-slate-800 px-0.5 py-0.5 text-left",
                    "hover:bg-slate-900/80",
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span className={cn(TERMINAL_TYPO.micro, "w-14 tabular-nums text-slate-600")}>
                      {formatTapeTime(item.timestamp).slice(0, 8)}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, "w-16 uppercase text-slate-500")}>
                      {item.category}
                    </span>
                    {item.coin ? (
                      <span className={cn(TERMINAL_TYPO.dataSm, "w-10 font-bold", terminalSkin.textUp)}>
                        {item.coin}
                      </span>
                    ) : (
                      <span className={cn(TERMINAL_TYPO.micro, "w-10 text-slate-600")}>—</span>
                    )}
                    <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                      {item.headline}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, sevColor(item.severity))}>
                      {item.severity.toUpperCase()}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-600")}>
                      {item.compositeScore}
                    </span>
                    {item.verified ? (
                      <ShieldCheck className="h-2.5 w-2.5 shrink-0 text-cyan-600" />
                    ) : null}
                  </div>
                  <p className={cn(TERMINAL_TYPO.micro, "pl-[4.5rem] text-slate-600")}>
                    {item.source} · {item.detail.slice(0, 120)}
                  </p>
                </button>
              ))
            )}
          </section>
        ) : null}

        {activeTab === "incidents" ? (
          <section>
            {snapshot.incidents.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No active incidents.</p>
            ) : (
              snapshot.incidents.map((inc) => (
                <div
                  key={inc.id}
                  className={cn(terminalSkin.borderB, "py-0.5")}
                >
                  <div className="flex items-center gap-1">
                    <Zap className={cn("h-2.5 w-2.5", sevColor(inc.severity))} />
                    <span className={cn(TERMINAL_TYPO.micro, "uppercase text-slate-500")}>
                      {inc.kind.replace(/_/g, " ")}
                    </span>
                    <span className={cn(TERMINAL_TYPO.dataSm, "flex-1 text-slate-300")}>{inc.headline}</span>
                    <span className={cn(TERMINAL_TYPO.micro, sevColor(inc.severity))}>
                      {inc.status.toUpperCase()}
                    </span>
                  </div>
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{inc.detail}</p>
                </div>
              ))
            )}
          </section>
        ) : null}

        {activeTab === "briefings" ? (
          <section>
            {snapshot.briefings.map((b) => (
              <div key={b.id} className={cn(terminalSkin.borderB, "py-0.5")}>
                <div className="flex items-center gap-1">
                  <span className={cn(TERMINAL_TYPO.micro, "uppercase text-slate-500")}>
                    {b.kind.replace(/_/g, " ")}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "flex-1 text-slate-300")}>{b.headline}</span>
                  <span className={cn(TERMINAL_TYPO.micro, sevColor(b.severity))}>
                    {b.severity.toUpperCase()}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{b.summary}</p>
                <ul className="mt-0.5 space-y-0">
                  {b.bullets.map((line) => (
                    <li key={line} className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                      · {line}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "personal" ? (
          <section>
            {snapshot.personalized.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                Add assets to watchlist for personalized delivery.
              </p>
            ) : (
              snapshot.personalized.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectAssetByCoin(p.coin, "newswire-personal")}
                  className={cn(
                    terminalSkin.row,
                    "w-full border-b-[0.5px] border-slate-800 py-0.5 text-left hover:bg-slate-900/80",
                  )}
                >
                  <div className="flex gap-1">
                    <span className={cn(TERMINAL_TYPO.dataSm, "w-10 font-bold", terminalSkin.textUp)}>
                      {p.coin}
                    </span>
                    <span className={cn(TERMINAL_TYPO.dataSm, "flex-1 text-slate-300")}>{p.headline}</span>
                    <span className={cn(TERMINAL_TYPO.micro, sevColor(p.severity))}>
                      {p.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{p.reason}</p>
                </button>
              ))
            )}
          </section>
        ) : null}

        {activeTab === "delivery" ? (
          <section className="space-y-1">
            {snapshot.deliveryChannels.map((ch) => (
              <div key={ch.channel} className={cn(terminalSkin.borderB, "flex items-center gap-1 py-0.5")}>
                <Send className="h-2.5 w-2.5 text-slate-600" />
                <span className={cn(TERMINAL_TYPO.micro, "w-24 text-slate-400")}>{ch.label}</span>
                <span
                  className={cn(
                    TERMINAL_TYPO.micro,
                    ch.status === "ready"
                      ? terminalSkin.textUp
                      : ch.status === "configured"
                        ? terminalSkin.textWarn
                        : "text-slate-600",
                  )}
                >
                  {ch.status.toUpperCase()}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
                  pending {ch.pendingCount}
                </span>
              </div>
            ))}
            <div className={cn(terminalSkin.borderB, "space-y-1 py-1")}>
              <label className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 text-slate-500")}>
                <input
                  type="checkbox"
                  checked={channelPrefs.desktop}
                  onChange={(e) => setChannelPrefs({ desktop: e.target.checked })}
                  className="h-2.5 w-2.5"
                />
                Desktop notifications (critical/watch)
              </label>
              <label className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 text-slate-500")}>
                <input
                  type="checkbox"
                  checked={channelPrefs.webhook}
                  onChange={(e) => setChannelPrefs({ webhook: e.target.checked })}
                  className="h-2.5 w-2.5"
                />
                Webhook delivery
              </label>
              <input
                type="url"
                placeholder="https://hooks.example.com/..."
                value={channelPrefs.webhookUrl}
                onChange={(e) => setChannelPrefs({ webhookUrl: e.target.value })}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "w-full border border-slate-800 bg-slate-950 px-1 py-0.5 text-slate-400",
                )}
              />
              <select
                value={channelPrefs.minSeverity}
                onChange={(e) =>
                  setChannelPrefs({
                    minSeverity: e.target.value as "info" | "watch" | "critical",
                  })
                }
                className={cn(
                  TERMINAL_TYPO.micro,
                  "border border-slate-800 bg-slate-950 px-1 text-slate-400",
                )}
              >
                <option value="critical">Critical only</option>
                <option value="watch">Watch and above</option>
                <option value="info">All operational</option>
              </select>
            </div>
          </section>
        ) : null}

        {activeTab === "syndication" ? (
          <section>
            <div className={cn(terminalSkin.borderB, "py-0.5")}>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>Feed ID</p>
              <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>{syndication.feedId}</p>
            </div>
            <div className={cn(terminalSkin.borderB, "py-0.5")}>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>Institutional API</p>
              <p className={cn(TERMINAL_TYPO.micro, "break-all text-cyan-500")}>
                GET /api/distribution/feed?limit=32
              </p>
            </div>
            <div className={cn(terminalSkin.borderB, "py-0.5")}>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>Throughput</p>
              <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>
                {syndication.eventsPerMinute} evt/min · format {syndication.format.toUpperCase()}
              </p>
            </div>
            <p className={cn(TERMINAL_TYPO.micro, "mt-1 text-slate-600")}>
              Terminal syncs ranked tape to server feed for embeddable institutional distribution.
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
