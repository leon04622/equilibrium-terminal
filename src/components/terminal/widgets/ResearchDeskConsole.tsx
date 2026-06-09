"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { terminalSkin, TERMINAL_TYPO, INSTITUTIONAL_INTERACTION } from "@/lib/theme";
import { AnnotationInfrastructureEngine } from "@/lib/research-desk/AnnotationInfrastructureEngine";
import { ResearchDeskOrchestrator } from "@/lib/research-desk/ResearchDeskOrchestrator";
import { useResearchDeskStore, type ResearchDeskTab } from "@/store/useResearchDeskStore";
import { useTraderWorkflowStore } from "@/store/useTraderWorkflowStore";
import type { ResearchDeskModeId } from "@/types/research-operating";

const TABS: { id: ResearchDeskTab; label: string }[] = [
  { id: "workspace", label: "WORKSPACE" },
  { id: "journal", label: "JOURNAL" },
  { id: "annotate", label: "NOTES" },
  { id: "thesis", label: "THESIS" },
  { id: "links", label: "LINKS" },
  { id: "collab", label: "DESK" },
  { id: "memory", label: "MEMORY" },
  { id: "search", label: "SEARCH" },
  { id: "ai", label: "AI" },
  { id: "modes", label: "MODES" },
];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-800/80 py-0.5">
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{label}</span>
      <span className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{value}</span>
    </div>
  );
}

export function ResearchDeskConsole() {
  const snapshot = useResearchDeskStore((s) => s.snapshot);
  const activeTab = useResearchDeskStore((s) => s.activeTab);
  const searchQuery = useResearchDeskStore((s) => s.searchQuery);
  const setActiveTab = useResearchDeskStore((s) => s.setActiveTab);
  const setSearchQuery = useResearchDeskStore((s) => s.setSearchQuery);
  const setActiveMode = useResearchDeskStore((s) => s.setActiveMode);
  const addJournal = useTraderWorkflowStore((s) => s.addJournalEntry);
  const upsertThesis = useTraderWorkflowStore((s) => s.upsertThesis);

  const [noteLabel, setNoteLabel] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [thesisText, setThesisText] = useState("");
  const [invalidation, setInvalidation] = useState("");

  if (!snapshot) {
    return (
      <div className="flex h-full items-center justify-center p-2">
        <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Booting research desk…</p>
      </div>
    );
  }

  const applyMode = (id: ResearchDeskModeId) => {
    ResearchDeskOrchestrator.setActiveMode(id);
    setActiveMode(id);
  };

  const saveAnnotation = () => {
    if (!noteBody.trim()) return;
    AnnotationInfrastructureEngine.add(
      "chart",
      snapshot.asset,
      noteLabel.trim() || "Chart note",
      noteBody.trim(),
    );
    setNoteLabel("");
    setNoteBody("");
  };

  const saveThesis = () => {
    if (!thesisText.trim()) return;
    upsertThesis({
      coin: snapshot.asset,
      thesis: thesisText.trim(),
      invalidation: invalidation.trim() || "—",
      status: "active",
      notes: "",
    });
    setThesisText("");
    setInvalidation("");
  };

  const saveJournal = () => {
    if (!noteBody.trim()) return;
    addJournal({
      kind: "trade_note",
      coin: snapshot.asset,
      title: noteLabel.trim() || `Note · ${snapshot.asset}`,
      body: noteBody.trim(),
    });
    setNoteLabel("");
    setNoteBody("");
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className={cn(terminalSkin.borderB, "flex shrink-0 items-center gap-2 px-1 py-0.5")}>
        <FlaskConical className="h-3 w-3 text-violet-400" />
        <span className={cn(TERMINAL_TYPO.label, "text-violet-300")}>RESEARCH DESK</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {snapshot.asset} · J{snapshot.researchScore}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "ml-auto text-slate-600")}>
          {snapshot.telemetry.journalCount}j · {snapshot.telemetry.thesisCount}t
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
        {activeTab === "workspace" && (
          <section>
            {snapshot.notebooks.map((n) => (
              <div key={n.id} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-violet-400")}>{n.name}</span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{n.description}</p>
              </div>
            ))}
            {snapshot.collections.map((c) => (
              <Row key={c.id} label={c.title} value={`${c.entryCount} entries`} />
            ))}
          </section>
        )}

        {activeTab === "journal" && (
          <section>
            <input
              value={noteLabel}
              onChange={(e) => setNoteLabel(e.target.value)}
              placeholder="Title"
              className={cn(TERMINAL_TYPO.micro, "mb-0.5 w-full border border-slate-800 bg-slate-950 px-1 text-slate-400")}
            />
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Journal entry — human judgment"
              rows={2}
              className={cn(TERMINAL_TYPO.micro, "w-full border border-slate-800 bg-slate-950 px-1 text-slate-300")}
            />
            <button type="button" onClick={saveJournal} className={cn(TERMINAL_TYPO.micro, "text-violet-400")}>
              SAVE JOURNAL
            </button>
            {snapshot.journal.slice(0, 12).map((j) => (
              <div key={j.id} className="mt-1 border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {j.kind} · {new Date(j.createdAt).toLocaleTimeString()}
                </span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{j.title}</p>
              </div>
            ))}
          </section>
        )}

        {activeTab === "annotate" && (
          <section>
            <input
              value={noteLabel}
              onChange={(e) => setNoteLabel(e.target.value)}
              placeholder="Annotation label"
              className={cn(TERMINAL_TYPO.micro, "mb-0.5 w-full border border-slate-800 bg-slate-950 px-1")}
            />
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Chart / liquidity / event note"
              rows={2}
              className={cn(TERMINAL_TYPO.micro, "w-full border border-slate-800 bg-slate-950 px-1 text-slate-300")}
            />
            <button type="button" onClick={saveAnnotation} className={cn(TERMINAL_TYPO.micro, "text-violet-400")}>
              SAVE ANNOTATION
            </button>
            {snapshot.annotations.slice(0, 10).map((a) => (
              <div key={a.id} className="mt-1 border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {a.kind} · {a.label}
                </span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{a.body.slice(0, 64)}</p>
              </div>
            ))}
          </section>
        )}

        {activeTab === "thesis" && (
          <section>
            <textarea
              value={thesisText}
              onChange={(e) => setThesisText(e.target.value)}
              placeholder="Thesis"
              rows={2}
              className={cn(TERMINAL_TYPO.micro, "w-full border border-slate-800 bg-slate-950 px-1")}
            />
            <input
              value={invalidation}
              onChange={(e) => setInvalidation(e.target.value)}
              placeholder="Invalidation"
              className={cn(TERMINAL_TYPO.micro, "mt-0.5 w-full border border-slate-800 bg-slate-950 px-1")}
            />
            <button type="button" onClick={saveThesis} className={cn(TERMINAL_TYPO.micro, "text-violet-400")}>
              SAVE THESIS
            </button>
            {snapshot.theses.map((t) => (
              <div key={t.id} className="mt-1 border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-violet-400")}>
                  {t.coin} · {t.hypothesisStatus}
                </span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{t.thesis}</p>
              </div>
            ))}
          </section>
        )}

        {activeTab === "links" &&
          snapshot.links.map((l) => (
            <div key={l.id} className="border-b border-slate-800 py-0.5">
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>{l.sourceKind}</span>
              <span className={cn(TERMINAL_TYPO.micro, "ml-1 text-slate-400")}>{l.targetLabel}</span>
            </div>
          ))}

        {activeTab === "collab" &&
          (snapshot.commentary.length ? (
            snapshot.commentary.map((c) => (
              <div key={c.id} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-cyan-500")}>
                  {c.author} · {c.headline}
                </span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{c.body.slice(0, 80)}</p>
              </div>
            ))
          ) : (
            <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>Enable COLLAB panel for desk commentary</p>
          ))}

        {activeTab === "memory" && (
          <section className="space-y-0.5">
            <Row label="Regime" value={snapshot.memoryContext.regimeLabel} />
            <Row label="Analogs" value={String(snapshot.memoryContext.analogCount)} />
            <Row label="Archive hits" value={String(snapshot.memoryContext.archiveHits)} />
            <Row label="Replay linked" value={snapshot.memoryContext.replayLinked ? "yes" : "no"} />
          </section>
        )}

        {activeTab === "search" && (
          <section>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, theses, annotations…"
              className={cn(TERMINAL_TYPO.micro, "mb-1 w-full border border-slate-800 bg-slate-950 px-1")}
            />
            {snapshot.searchHits.map((h) => (
              <div key={h.id} className="border-b border-slate-800 py-0.5">
                <span className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>
                  {h.category} · {h.score}
                </span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-400")}>{h.title}</p>
              </div>
            ))}
          </section>
        )}

        {activeTab === "ai" && (
          <p className={cn(TERMINAL_TYPO.micro, "text-slate-400 leading-relaxed")}>{snapshot.aiBrief}</p>
        )}

        {activeTab === "modes" && (
          <section className="space-y-1">
            {snapshot.dashboardModes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => applyMode(m.id)}
                className={cn(
                  "block w-full border border-slate-800 px-1 py-0.5 text-left",
                  snapshot.activeMode === m.id ? "border-violet-700/60 bg-violet-950/20" : "",
                )}
              >
                <span className={cn(TERMINAL_TYPO.micro, "text-violet-300")}>{m.label}</span>
                <p className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{m.description}</p>
              </button>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
