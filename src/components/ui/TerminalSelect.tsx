"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";

export interface TerminalSelectOption {
  value: string;
  label: string;
}

export interface TerminalSelectGroup {
  label: string;
  options: TerminalSelectOption[];
}

interface TerminalSelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: TerminalSelectOption[];
  groups?: TerminalSelectGroup[];
  className?: string;
  title?: string;
  disabled?: boolean;
}

function flattenOptions(
  options: TerminalSelectOption[] | undefined,
  groups: TerminalSelectGroup[] | undefined,
): TerminalSelectOption[] {
  const flat = [...(options ?? [])];
  if (groups?.length) {
    for (const g of groups) flat.push(...g.options);
  }
  return flat;
}

export function TerminalSelect({
  value,
  onChange,
  options,
  groups,
  className,
  title,
  disabled = false,
}: TerminalSelectProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const allOptions = flattenOptions(options, groups);
  const current = allOptions.find((o) => o.value === value) ?? allOptions[0];

  useEffect(() => {
    if (!open) return;
    const anchor = rootRef.current;
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 2,
        left: rect.left,
        minWidth: Math.max(rect.width, 96),
        zIndex: 5000,
      });
    }
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const renderOption = (opt: TerminalSelectOption) => (
    <button
      key={opt.value}
      type="button"
      role="option"
      aria-selected={opt.value === value}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => pick(opt.value)}
      className={cn(
        "block w-full px-2 py-1.5 text-left font-mono text-[10px] normal-case leading-snug tracking-normal",
        opt.value === value
          ? "bg-cyan-950/60 text-cyan-300"
          : "text-slate-200 hover:bg-slate-900 hover:text-white",
      )}
    >
      {opt.label}
    </button>
  );

  const menu =
    open && typeof document !== "undefined" ? (
      <div
        ref={menuRef}
        id={listId}
        role="listbox"
        className="eq-terminal-select-menu max-h-48 overflow-y-auto overscroll-contain border border-slate-600 bg-slate-950 py-0.5 shadow-2xl"
        style={menuStyle}
      >
        {options?.map(renderOption)}
        {groups?.map((group) => (
          <div key={group.label}>
            <p className="px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-slate-500">
              {group.label}
            </p>
            {group.options.map(renderOption)}
          </div>
        ))}
      </div>
    ) : null;

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        title={title}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          TERMINAL_TYPO.micro,
          "eq-terminal-select inline-flex items-center gap-0.5 border border-slate-800 bg-slate-950 px-1 text-slate-400 outline-none",
          "hover:border-slate-700 hover:text-slate-200 disabled:opacity-40",
          open && "border-cyan-800/60 text-cyan-300",
        )}
      >
        <span className="max-w-[9rem] truncate normal-case tracking-normal text-slate-300">
          {current?.label ?? value}
        </span>
        <ChevronDown className={cn("h-2.5 w-2.5 shrink-0 opacity-70", open && "rotate-180")} />
      </button>

      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
