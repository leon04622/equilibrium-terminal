"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { MessageSquarePlus, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";
import { DESKS, DESK_ORDER, type DeskId } from "@/lib/desks/DeskRegistry";
import { useDeskStore } from "@/store/useDeskStore";
import { useWedgeStore } from "@/store/useWedgeStore";
import { useFrictionLogStore, type FrictionKind } from "@/store/useFrictionLogStore";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import { isBloombergChrome } from "@/lib/theme/bloomberg";

const KIND_LABEL: Record<FrictionKind, string> = {
  friction: "Friction",
  bug: "Bug",
  idea: "Idea",
  note: "Note",
};

const KINDS: FrictionKind[] = ["friction", "bug", "idea", "note"];

function relTime(ts: number): string {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function DeskSwitcher() {
  const activeDeskId = useDeskStore((s) => s.activeDeskId);
  const setActiveDesk = useDeskStore((s) => s.setActiveDesk);
  const resetDeskLayout = useDeskStore((s) => s.resetDeskLayout);
  const deskFocusMode = useWedgeStore((s) => s.deskFocusMode);
  const setDeskFocusMode = useWedgeStore((s) => s.setDeskFocusMode);
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);
  const bloomberg = isBloombergChrome(beginnerMode);

  const select = (id: DeskId) => {
    // Specialized desks live inside desk-focus (not the full platform dump).
    if (!deskFocusMode) setDeskFocusMode(true);
    setActiveDesk(id);
  };

  return (
    <div
      className={cn(
        "eq-bloomberg-desk-bar flex shrink-0 items-stretch gap-0 border-b-[0.5px] border-slate-800 bg-slate-950/80",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1.5 py-0.5">
      <span className={cn(TERMINAL_TYPO.micro, "shrink-0 pr-1", bloomberg ? "text-[#ff9900]" : "text-slate-600")}>
        {bloomberg ? "FUNC" : "DESKS"}
      </span>

      {DESK_ORDER.map((id) => {
        const desk = DESKS[id];
        const active = activeDeskId === id && deskFocusMode;
        return (
          <button
            key={id}
            type="button"
            onClick={() => select(id)}
            title={desk.tagline}
            className={cn(
              "group flex shrink-0 items-center gap-1 border px-2 py-0.5 font-mono transition-colors",
              active
                ? bloomberg
                  ? "eq-bloomberg-desk-active border-[#ff9900] text-[#ff9900]"
                  : cn("bg-slate-900", desk.accent)
                : bloomberg
                  ? "border-[#333333] text-[#888888] hover:border-[#ff9900]/50 hover:text-[#ff9900]"
                  : "border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300",
            )}
          >
            <span className={cn(TERMINAL_TYPO.micro, "tabular-nums opacity-70")}>{desk.glyph}</span>
            <span className={TERMINAL_TYPO.micro}>{desk.label}</span>
          </button>
        );
      })}

      {activeDeskId && deskFocusMode ? (
        <button
          type="button"
          onClick={() => resetDeskLayout(activeDeskId)}
          title="Reset this desk to its default layout"
          className={cn(
            TERMINAL_TYPO.micro,
            "flex shrink-0 items-center gap-1 border border-slate-800 px-1.5 py-0.5 text-slate-500 hover:text-slate-300",
            bloomberg && "border-[#333333] text-[#666666] hover:text-[#ff9900]",
          )}
        >
          <RotateCcw className="h-2.5 w-2.5" />
          RESET
        </button>
      ) : null}

      </div>

      <div className="flex shrink-0 items-center gap-1 border-l border-slate-800 px-1.5 py-0.5">
        {activeDeskId && deskFocusMode && !bloomberg ? (
          <span className={cn(TERMINAL_TYPO.micro, "hidden text-slate-600 md:inline")}>
            {DESKS[activeDeskId].tagline}
          </span>
        ) : null}
        {!bloomberg && !beginnerMode ? <FrictionCapture deskId={deskFocusMode ? activeDeskId : null} /> : null}
      </div>
    </div>
  );
}

function FrictionCapture({ deskId }: { deskId: DeskId | null }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<FrictionKind>("friction");
  const [note, setNote] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
  const entries = useFrictionLogStore((s) => s.entries);
  const log = useFrictionLogStore((s) => s.log);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const anchor = ref.current;
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 4,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => taRef.current?.focus());
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const submit = () => {
    if (!note.trim()) return;
    log({ deskId, kind, note });
    setNote("");
    setOpen(false);
  };

  const recent = entries.slice(0, 5);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Log friction / idea (daily operator testing)"
        className={cn(
          TERMINAL_TYPO.micro,
          "flex items-center gap-1 border border-amber-700/50 bg-amber-950/30 px-1.5 py-0.5 text-amber-300/90 hover:bg-amber-900/40",
        )}
      >
        <MessageSquarePlus className="h-2.5 w-2.5" />
        FRICTION
        {entries.length > 0 ? (
          <span className="tabular-nums text-amber-500/70">{entries.length}</span>
        ) : null}
      </button>

      {open
        ? createPortal(
            <div
              ref={panelRef}
              className="fixed z-[5000] w-72 border border-slate-700 bg-slate-950 p-2 shadow-xl"
              style={dropdownStyle}
            >
          <div className="mb-1 flex items-center justify-between">
            <span className={cn(TERMINAL_TYPO.micro, "text-slate-300")}>
              LOG WORKFLOW FRICTION
            </span>
            <button type="button" onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300">
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className="mb-1.5 flex gap-1">
            {KINDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  TERMINAL_TYPO.micro,
                  "flex-1 border px-1 py-0.5",
                  kind === k
                    ? "border-amber-600/70 bg-amber-950/40 text-amber-200"
                    : "border-slate-800 text-slate-500 hover:text-slate-300",
                )}
              >
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>

          <textarea
            ref={taRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
            rows={3}
            placeholder={
              deskId
                ? `What slowed you down on the ${DESKS[deskId].label} desk?`
                : "What slowed you down or felt confusing?"
            }
            className={cn(
              TERMINAL_TYPO.micro,
              "w-full resize-none border border-slate-800 bg-slate-900 p-1.5 text-slate-200 placeholder:text-slate-600 focus:border-slate-600 focus:outline-none",
            )}
          />

          <div className="mt-1.5 flex items-center justify-between">
            <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
              {deskId ? DESKS[deskId].label : "PLATFORM"} · ⌘↵ to save
            </span>
            <button
              type="button"
              onClick={submit}
              disabled={!note.trim()}
              className={cn(
                TERMINAL_TYPO.micro,
                "border border-amber-600/70 bg-amber-950/40 px-2 py-0.5 text-amber-200 hover:bg-amber-900/50 disabled:opacity-40",
              )}
            >
              SAVE
            </button>
          </div>

          {recent.length > 0 ? (
            <div className="mt-2 border-t border-slate-800 pt-1.5">
              <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>RECENT</span>
              <ul className="mt-1 space-y-1">
                {recent.map((e) => (
                  <li key={e.id} className={cn(TERMINAL_TYPO.micro, "flex gap-1 text-slate-400")}>
                    <span className="shrink-0 text-slate-600">{relTime(e.ts)}</span>
                    <span className="shrink-0 uppercase text-amber-500/70">{e.kind}</span>
                    <span className="truncate">{e.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
