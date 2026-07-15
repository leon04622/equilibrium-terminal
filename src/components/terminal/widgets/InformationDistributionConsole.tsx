"use client";

import { BookOpen, ExternalLink, Radio, Send, Zap } from "lucide-react";
import { TerminalSelect } from "@/components/ui/TerminalSelect";
import { type MouseEvent, useState } from "react";
import { useConsoleSnapshot } from "@/lib/runtime/consoleSnapshotFallback";
import { cn } from "@/lib/utils";
import { ensureWireSeeded } from "@/lib/distribution/wireSeed";
import { InformationDistributionOrchestrator } from "@/lib/distribution";
import { NotificationDeliveryEngine } from "@/lib/distribution/NotificationDeliveryEngine";
import { stopPanelWheelBubble } from "@/lib/runtime/panelScroll";
import { openWireArticle } from "@/store/useArticleReaderStore";
import { focusWireSymbol } from "@/lib/workflow/wireSymbolFocus";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import {
  useInformationDistributionStore,
  type DistributionTab,
} from "@/store/useInformationDistributionStore";
import { useExternalNewsStore } from "@/store/useExternalNewsStore";
import { useTerminalStore } from "@/store/terminalStore";
import { WireSourceHealthPanel } from "@/components/terminal/WireSourceHealthPanel";

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

function tierLabel(source: string): string | null {
  const upper = source.toUpperCase();
  if (upper.includes("TREE")) return "SQUAWK";
  if (upper.includes("SEC") || upper.includes("FED")) return "REG";
  if (
    upper.includes("CNBC") ||
    upper.includes("MARKETWATCH") ||
    upper.includes("FRED") ||
    upper.includes("TREASURY") ||
    upper.includes("T-BILL") ||
    upper.includes("T-NOTE") ||
    upper.includes("TIPS")
  ) {
    return "MACRO";
  }
  if (upper.includes("PANIC")) return "AGG";
  if (upper.includes("HYPERLIQUID") || upper.includes("HL ")) return "HL";
  if (upper.includes("BINANCE")) return "EXCH";
  return null;
}

const OPEN_ORIGINAL_BTN = cn(
  TERMINAL_TYPO.micro,
  "inline-flex shrink-0 items-center justify-center gap-0.5 border border-[#ff9900]/45 bg-[#ff9900]/10 px-1.5 py-1 text-[#ff9900] hover:bg-[#ff9900]/20",
);

const READ_BTN = cn(
  TERMINAL_TYPO.micro,
  "inline-flex shrink-0 items-center justify-center gap-0.5 border border-cyan-800/50 bg-cyan-950/40 px-1.5 py-1 text-cyan-300 hover:bg-cyan-950/70",
);

function tapeDetailLine(item: { source: string; detail: string; headline: string }): string | null {
  const detail = item.detail.trim();
  if (!detail) return null;
  if (detail.toLowerCase().includes("confidence") && detail.length < 48) return null;
  if (detail === item.headline.trim()) return null;
  if (detail.startsWith(item.headline.trim().slice(0, 40))) return null;
  return `${item.source} — ${detail.slice(0, 140)}`;
}

function openOriginalUrl(e: MouseEvent, url: string): void {
  e.stopPropagation();
  e.preventDefault();
  window.open(url, "_blank", "noopener,noreferrer");
}

export function InformationDistributionConsole() {
  const storeSnapshot = useInformationDistributionStore((s) => s.snapshot);
  const activeTab = useInformationDistributionStore((s) => s.activeTab);
  const setActiveTab = useInformationDistributionStore((s) => s.setActiveTab);
  const channelPrefs = useInformationDistributionStore((s) => s.channelPrefs);
  const setChannelPrefs = useInformationDistributionStore((s) => s.setChannelPrefs);
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);
  const connectionStatus = useTerminalStore((s) => s.connectionStatus);
  const wireStatus = useExternalNewsStore((s) => s.status);
  const [webhookTestMsg, setWebhookTestMsg] = useState<string | null>(
    () => NotificationDeliveryEngine.getWebhookStatus()?.message ?? null,
  );
  const [webhookTesting, setWebhookTesting] = useState(false);

  const snapshot = useConsoleSnapshot(storeSnapshot, () => {
    ensureWireSeeded();
    return InformationDistributionOrchestrator.snapshot();
  });

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
          {snapshot.newswire.length} events ·{" "}
          {wireStatus ? (
            <span className="text-slate-600">
              {wireStatus.rssLiveCount}/{wireStatus.rssSourceCount} RSS
              {wireStatus.squawkConnected ? " · SQUAWK LIVE" : " · SQUAWK STANDBY"}
              {wireStatus.cryptoPanicEnabled
                ? wireStatus.cryptoPanicLive
                  ? ` · PANIC LIVE ${wireStatus.cryptoPanicCount}`
                  : " · PANIC KEY SET"
                : ""}
              {wireStatus.macroTreasuryLive || wireStatus.macroFredLiveCount > 0
                ? ` · MACRO${wireStatus.macroFredLiveCount > 0 ? ` FRED ${wireStatus.macroFredLiveCount}` : ""}${wireStatus.macroTreasuryLive ? " · TREAS" : ""}`
                : ""}
              {(wireStatus.hlWireLiveCount ?? 0) > 0
                ? ` · HL ${wireStatus.hlWireLiveCount}`
                : ""}
              {" · "}
            </span>
          ) : null}
          <span
            className={
              connectionStatus === "connected"
                ? terminalSkin.textUp
                : connectionStatus === "reconnecting"
                  ? terminalSkin.textWarn
                  : terminalSkin.textDown
            }
          >
            {connectionStatus.toUpperCase()}
          </span>
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

      <div
        className="eq-panel-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-1"
        onWheel={stopPanelWheelBubble}
      >
        {activeTab === "tape" ? (
          <section>
            {snapshot.newswire.length === 0 ? (
              <div className="space-y-1">
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  Tape quiet — syncing institutional wire (SEC, Fed, Treasury macro, CNBC, The
                  Block, Tree of Alpha squawk, HL derivatives).
                </p>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                  Also check <span className="text-[#ff9900]">TACTICAL WIRE</span> (scroll down
                  to INTELLIGENCE panel) or press{" "}
                  <span className="text-[#ff9900]">Ctrl+N</span> to focus this panel.
                </p>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    TERMINAL_TYPO.micro,
                    "sticky top-0 z-[1] flex items-center gap-1 border-b border-slate-800 bg-slate-950/95 py-0.5 text-slate-600",
                  )}
                >
                  <span className="w-14">TIME</span>
                  <span className="w-12">TYPE</span>
                  <span className="w-9">SYM</span>
                  <span className="min-w-0 flex-1">HEADLINE</span>
                  <span className="w-16 text-right">ACTION</span>
                </div>
                {snapshot.newswire.map((item) => {
                  const detailLine = tapeDetailLine(item);
                  return (
                    <div
                      key={item.id}
                      className="border-b border-slate-800/80 py-1.5 hover:bg-slate-900/50"
                    >
                      <div className="flex items-start gap-1">
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-start gap-1">
                            <span
                              className={cn(
                                TERMINAL_TYPO.micro,
                                "w-14 shrink-0 pt-0.5 tabular-nums text-slate-500",
                              )}
                            >
                              {formatTapeTime(item.timestamp).slice(0, 8)}
                            </span>
                            <span
                              className={cn(
                                TERMINAL_TYPO.micro,
                                "w-12 shrink-0 pt-0.5 uppercase text-slate-500",
                              )}
                            >
                              {tierLabel(item.source) ?? item.category.slice(0, 6)}
                            </span>
                            <span
                              className={cn(
                                TERMINAL_TYPO.dataSm,
                                "w-9 shrink-0 pt-0.5 font-bold",
                                item.coin ? terminalSkin.textUp : "text-slate-600",
                              )}
                            >
                              {item.coin ?? "—"}
                            </span>
                            <p
                              className={cn(
                                TERMINAL_TYPO.dataSm,
                                "min-w-0 flex-1 leading-snug text-slate-200",
                                item.articleUrl ? "cursor-pointer hover:text-white" : undefined,
                              )}
                              onClick={
                                item.articleUrl
                                  ? (e) => {
                                      e.stopPropagation();
                                      openWireArticle({
                                        url: item.articleUrl!,
                                        headline: item.headline,
                                        detail: item.detail,
                                        source: item.source,
                                        timestamp: item.timestamp,
                                        coin: item.coin,
                                      });
                                    }
                                  : undefined
                              }
                            >
                              {item.headline}
                            </p>
                          </div>
                          {detailLine ? (
                            <p className={cn(TERMINAL_TYPO.micro, "pl-[5.75rem] leading-snug text-slate-600")}>
                              {detailLine}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex w-16 shrink-0 flex-col gap-0.5">
                          {item.articleUrl ? (
                            <>
                              <button
                                type="button"
                                title="Read in terminal"
                                className={READ_BTN}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openWireArticle({
                                    url: item.articleUrl!,
                                    headline: item.headline,
                                    detail: item.detail,
                                    source: item.source,
                                    timestamp: item.timestamp,
                                    coin: item.coin,
                                  });
                                  if (item.coin) focusWireSymbol(item.coin, "newswire");
                                }}
                              >
                                <BookOpen className="h-2.5 w-2.5" />
                                READ
                              </button>
                              {item.coin ? (
                                <button
                                  type="button"
                                  title={`Chart ${item.coin}`}
                                  className={cn(READ_BTN, "text-cyan-400")}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    focusWireSymbol(item.coin!, "newswire");
                                  }}
                                >
                                  CHART
                                </button>
                              ) : null}
                              <button
                                type="button"
                                title="Open original in browser"
                                className={OPEN_ORIGINAL_BTN}
                                onClick={(e) => openOriginalUrl(e, item.articleUrl!)}
                              >
                                <ExternalLink className="h-2.5 w-2.5" />
                                WEB
                              </button>
                            </>
                          ) : item.coin ? (
                            <button
                              type="button"
                              className={cn(READ_BTN, "text-slate-400")}
                              onClick={() => {
                                selectAssetByCoin(item.coin!, "newswire");
                                focusWireSymbol(item.coin!, "newswire");
                              }}
                            >
                              FOCUS
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
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
              <TerminalSelect
                value={channelPrefs.minSeverity}
                onChange={(v) =>
                  setChannelPrefs({
                    minSeverity: v as "info" | "watch" | "critical",
                  })
                }
                title="Minimum alert severity"
                options={[
                  { value: "critical", label: "Critical only" },
                  { value: "watch", label: "Watch and above" },
                  { value: "info", label: "All operational" },
                ]}
              />
              <button
                type="button"
                disabled={webhookTesting || !channelPrefs.webhookUrl.startsWith("http")}
                onClick={async () => {
                  setWebhookTesting(true);
                  const result = await NotificationDeliveryEngine.sendTestWebhook();
                  setWebhookTestMsg(result.message);
                  setWebhookTesting(false);
                  const { InformationDistributionOrchestrator } = await import("@/lib/distribution");
                  useInformationDistributionStore
                    .getState()
                    .setSnapshot(InformationDistributionOrchestrator.snapshot());
                }}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "border border-cyan-800/50 bg-cyan-950/30 px-2 py-0.5 text-cyan-300 disabled:opacity-40",
                )}
              >
                {webhookTesting ? "SENDING…" : "TEST WEBHOOK"}
              </button>
              {webhookTestMsg ? (
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>Last test: {webhookTestMsg}</p>
              ) : null}
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                Book alerts, newswire, and incidents POST via /api/distribution/webhook when enabled.
              </p>
            </div>
          </section>
        ) : null}

        {activeTab === "syndication" ? (
          <section className="space-y-2">
            <WireSourceHealthPanel status={wireStatus} />
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
