"use client";

import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import {
  useCollaborationStore,
  type CollaborationTab,
} from "@/store/useCollaborationStore";
import { useTerminalStore } from "@/store/terminalStore";
import { terminalBus } from "@/store/eventBus";

const TABS: { id: CollaborationTab; label: string }[] = [
  { id: "activity", label: "ACTIVITY" },
  { id: "comms", label: "COMMS" },
  { id: "annotate", label: "ANNOTATE" },
  { id: "research", label: "RESEARCH" },
  { id: "alerts", label: "ALERTS" },
  { id: "presence", label: "PRESENCE" },
  { id: "memory", label: "MEMORY" },
];

function sevColor(sev: string): string {
  if (sev === "critical") return terminalSkin.textDown;
  if (sev === "watch") return terminalSkin.textWarn;
  return "text-slate-500";
}

function presenceColor(status: string): string {
  if (status === "focused") return terminalSkin.textUp;
  if (status === "active") return "text-cyan-400";
  if (status === "idle") return terminalSkin.textWarn;
  return "text-slate-600";
}

export function CollaborationConsole() {
  const snapshot = useCollaborationStore((s) => s.snapshot);
  const activeTab = useCollaborationStore((s) => s.activeTab);
  const setActiveTab = useCollaborationStore((s) => s.setActiveTab);
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Initializing collaboration layer…</p>
      </div>
    );
  }

  const { permissions, sharedWorkspace } = snapshot;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <Users className="h-3 w-3 text-violet-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-violet-300")}>TEAM COLLABORATION</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {snapshot.deskName} · EQ {snapshot.collaborationScore}/100
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-500")}>
          {snapshot.presence.filter((p) => p.status !== "offline").length} online · v
          {sharedWorkspace.layoutVersion}
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
        {activeTab === "activity" ? (
          <section>
            {snapshot.activity.length === 0 ? (
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>No desk activity recorded.</p>
            ) : (
              snapshot.activity.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    if (entry.coin) selectAssetByCoin(entry.coin, "collab");
                    terminalBus.emit("widget:focus", { widgetId: "teamdesk" });
                  }}
                  className={cn(
                    terminalSkin.row,
                    "mb-0 w-full border-b-[0.5px] border-slate-800 py-0.5 text-left hover:bg-slate-900/80",
                  )}
                >
                  <div className="flex gap-1">
                    <span className={cn(TERMINAL_TYPO.micro, "w-14 tabular-nums text-slate-600")}>
                      {formatTapeTime(entry.timestamp).slice(0, 8)}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, "w-16 uppercase text-slate-500")}>
                      {entry.category}
                    </span>
                    <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                      {entry.summary}
                    </span>
                    <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                      {entry.actorHandle}
                    </span>
                  </div>
                </button>
              ))
            )}
          </section>
        ) : null}

        {activeTab === "comms" ? (
          <section>
            {snapshot.communications.map((comm) => (
              <div
                key={comm.id}
                className="border-b-[0.5px] border-slate-800 px-1 py-0.5 hover:bg-slate-900/80"
              >
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-16 uppercase text-slate-500")}>
                    {comm.kind.replace("_", " ")}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {comm.headline}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, sevColor(comm.severity))}>
                    {comm.severity.toUpperCase()}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "truncate pl-[4.5rem] text-slate-500")}>
                  {comm.authorHandle} · {comm.body}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "annotate" ? (
          <section>
            {snapshot.annotations.map((ann) => (
              <button
                key={ann.id}
                type="button"
                onClick={() => {
                  selectAssetByCoin(ann.coin, "collab");
                  terminalBus.emit("widget:focus", { widgetId: "chart" });
                }}
                className={cn(
                  terminalSkin.row,
                  "mb-0 w-full border-b-[0.5px] border-slate-800 py-0.5 text-left hover:bg-slate-900/80",
                )}
              >
                <span className={cn(TERMINAL_TYPO.micro, "w-14 text-slate-600")}>{ann.kind}</span>
                <span className={cn(TERMINAL_TYPO.dataSm, "w-10 font-bold text-slate-400")}>
                  {ann.coin}
                </span>
                <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                  {ann.pinned ? "▪ " : ""}
                  {ann.label}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{ann.authorHandle}</span>
              </button>
            ))}
          </section>
        ) : null}

        {activeTab === "research" ? (
          <section>
            {snapshot.research.map((pub) => (
              <div
                key={pub.id}
                className="border-b-[0.5px] border-slate-800 px-1 py-0.5 hover:bg-slate-900/80"
              >
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-20 uppercase text-slate-500")}>
                    {pub.kind.replace("_", " ")}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {pub.title}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>v{pub.version}</span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "truncate pl-[5.5rem] text-slate-500")}>
                  {pub.authorHandle} · {pub.summary}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "alerts" ? (
          <section>
            {snapshot.teamAlerts.map((alert) => (
              <div
                key={alert.id}
                className="border-b-[0.5px] border-slate-800 px-1 py-0.5"
              >
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "w-10 font-bold text-slate-400")}>
                    {alert.coin}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {alert.condition}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, sevColor(alert.severity))}>
                    {alert.scope.toUpperCase()}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "pl-[2.75rem] text-slate-600")}>
                  {alert.subscriberCount} subs · {alert.createdBy}
                  {alert.lastTriggeredAt
                    ? ` · triggered ${formatTapeTime(alert.lastTriggeredAt).slice(0, 8)}`
                    : ""}
                </p>
              </div>
            ))}
          </section>
        ) : null}

        {activeTab === "presence" ? (
          <section>
            {snapshot.presence.map((member) => (
              <div
                key={member.memberId}
                className="border-b-[0.5px] border-slate-800 px-1 py-0.5"
              >
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.dataSm, "w-24 truncate text-slate-300")}>
                    {member.displayHandle}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "w-14 uppercase", presenceColor(member.status))}>
                    {member.status}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                    {member.activeCoin ?? "—"}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "ml-auto tabular-nums text-slate-600")}>
                    {member.rttMs}ms
                  </span>
                </div>
              </div>
            ))}
            <p className={cn(TERMINAL_TYPO.micro, "mt-1 px-1 text-slate-600")}>
              ROLE {permissions.role.toUpperCase()} · WATCHLIST{" "}
              {sharedWorkspace.sharedWatchlist.join(", ") || "—"}
            </p>
          </section>
        ) : null}

        {activeTab === "memory" ? (
          <section>
            {snapshot.memory.map((item) => (
              <div
                key={item.id}
                className="border-b-[0.5px] border-slate-800 px-1 py-0.5 hover:bg-slate-900/80"
              >
                <div className={cn(terminalSkin.row, "gap-1")}>
                  <span className={cn(TERMINAL_TYPO.micro, "w-20 uppercase text-slate-500")}>
                    {item.kind.replace("_", " ")}
                  </span>
                  <span className={cn(TERMINAL_TYPO.dataSm, "min-w-0 flex-1 truncate text-slate-300")}>
                    {item.title}
                  </span>
                  <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
                    {item.coin ?? "—"}
                  </span>
                </div>
                <p className={cn(TERMINAL_TYPO.micro, "truncate pl-[5.5rem] text-slate-500")}>
                  {item.authorHandle} · {item.summary}
                </p>
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}
