"use client";

import { useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { JournalEntryKind } from "@/types/trader-workflow";

const KINDS: { id: JournalEntryKind; label: string }[] = [
  { id: "trade_note", label: "TRADE" },
  { id: "thesis", label: "THESIS" },
  { id: "execution", label: "EXEC" },
  { id: "session", label: "SESSION" },
  { id: "review", label: "REVIEW" },
  { id: "psychology", label: "PSYCH" },
  { id: "alert_response", label: "ALERT" },
];

export function TraderJournalPanel() {
  const journal = useTraderWorkflowStore((s) => s.journal);
  const addJournalEntry = useTraderWorkflowStore((s) => s.addJournalEntry);
  const alertWorkflow = useTraderWorkflowStore((s) => s.alertWorkflow);
  const coin = useTerminalStore((s) => s.selectedAsset?.symbol ?? s.selectedCoin);
  const [kind, setKind] = useState<JournalEntryKind>("trade_note");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = () => {
    if (!body.trim()) return;
    addJournalEntry({
      kind,
      coin: coin ?? null,
      title: title.trim() || `${kind} · ${coin ?? "—"}`,
      body: body.trim(),
    });
    setTitle("");
    setBody("");
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex items-center gap-2 px-1 py-0.5")}>
        <BookOpen className="h-3 w-3 text-amber-600" />
        <span className={cn(TERMINAL_TYPO.label, "text-amber-200")}>TRADER JOURNAL</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{journal.length} entries</span>
        {alertWorkflow ? (
          <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-cyan-500")}>
            WF · {alertWorkflow.coin}
          </span>
        ) : null}
      </header>

      <div className={cn(terminalSkin.borderB, "shrink-0 space-y-1 p-1")}>
        <div className="flex flex-wrap gap-0.5">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={cn(
                TERMINAL_TYPO.micro,
                "border border-slate-800 px-1",
                kind === k.id ? "text-amber-300" : "text-slate-600",
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className={cn(
            TERMINAL_TYPO.micro,
            "w-full border border-slate-800 bg-slate-950 px-1 py-0.5 text-slate-300",
          )}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Notes · thesis · execution annotation · session review…"
          rows={3}
          className={cn(
            TERMINAL_TYPO.micro,
            "w-full resize-none border border-slate-800 bg-slate-950 px-1 py-0.5 text-slate-300",
          )}
        />
        <button
          type="button"
          onClick={submit}
          className={cn(TERMINAL_TYPO.micro, "flex items-center gap-1 text-cyan-400")}
        >
          <Plus className="h-3 w-3" /> ADD ENTRY
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {journal.length === 0 ? (
          <p className={cn(TERMINAL_TYPO.micro, "p-2 text-slate-600")}>
            Journal persists across sessions. Human notes only — not trade advice.
          </p>
        ) : (
          journal.map((e) => (
            <div key={e.id} className={cn(terminalSkin.borderB, "px-1 py-1")}>
              <div className="flex justify-between gap-1">
                <span className={cn(TERMINAL_TYPO.micro, terminalSkin.textAi)}>
                  {e.kind.replace(/_/g, " ").toUpperCase()}
                </span>
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{e.coin ?? "—"}</span>
              </div>
              <p className={cn(TERMINAL_TYPO.dataSm, "text-slate-300")}>{e.title}</p>
              <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{e.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
