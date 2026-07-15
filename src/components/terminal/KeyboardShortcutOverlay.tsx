"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO, terminalSkin } from "@/lib/theme";

const WEDGE_SHORTCUTS: Array<{ keys: string; action: string }> = [
  { keys: "Ctrl+K", action: "Open OmniBar command palette" },
  { keys: "Ctrl+Shift+W", action: "Open asset workspace for active coin" },
  { keys: "Ctrl+1", action: "Focus chart panel" },
  { keys: "Ctrl+2", action: "Focus HyperBook panel" },
  { keys: "Ctrl+E", action: "Focus trade ticket" },
  { keys: "Ctrl+P", action: "Focus paper blotter" },
  { keys: "Ctrl+N", action: "Focus newswire" },
  { keys: "Ctrl+M", action: "Focus surveillance" },
  { keys: "Ctrl+]", action: "Cycle wedge panels" },
  { keys: "?", action: "Toggle explain / guide mode" },
  { keys: "Ctrl+/", action: "Show this shortcut map" },
];

export function KeyboardShortcutOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== "/") return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      setOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/70 p-4 pt-16 backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-label="Keyboard shortcuts"
    >
      <div
        className={cn(
          "w-full max-w-md border border-slate-700 bg-slate-950 shadow-2xl",
          terminalSkin.canvas,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={cn(
            terminalSkin.panelHeader,
            terminalSkin.borderB,
            "justify-between px-2 py-1",
          )}
        >
          <span>KEYBOARD MAP · EXECUTION DESK</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-slate-500 hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <ul className="max-h-[70vh] overflow-auto p-1">
          {WEDGE_SHORTCUTS.map((row) => (
            <li
              key={row.keys}
              className={cn(
                terminalSkin.row,
                "justify-between gap-2 border-b-[0.5px] border-slate-800/80 px-1 py-0.5",
              )}
            >
              <kbd
                className={cn(
                  TERMINAL_TYPO.micro,
                  "shrink-0 border border-slate-700 bg-slate-900 px-1 text-[#ff9900]",
                )}
              >
                {row.keys}
              </kbd>
              <span className={cn(TERMINAL_TYPO.dataSm, "text-right text-slate-400")}>
                {row.action}
              </span>
            </li>
          ))}
        </ul>
        <p className={cn(TERMINAL_TYPO.micro, "border-t border-slate-800 px-2 py-1 text-slate-600")}>
          OmniBar: /watch BTC · /unwatch ETH · /trade · /intel
        </p>
      </div>
    </div>
  );
}
