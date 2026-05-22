"use client";



import { Maximize2, Minimize2, GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";

import { INSTITUTIONAL_INTERACTION, STATUS_INDICATOR, type PanelStatus } from "@/lib/theme/institutional";

import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";

import { PanelLoadingState } from "@/components/terminal/PanelLoadingState";

import type { PanelEmphasis } from "@/store/useAdaptiveWorkspaceStore";



interface PanelShellProps {

  title: string;

  subtitle?: string;

  telemetry?: string;

  children: React.ReactNode;

  className?: string;

  dragHandleClassName?: string;

  maximized?: boolean;

  emphasis?: PanelEmphasis;

  loading?: boolean;

  status?: PanelStatus;

  onToggleMaximize?: () => void;

  onClone?: () => void;

}



export function PanelShell({

  title,

  subtitle,

  telemetry,

  children,

  className,

  dragHandleClassName,

  maximized,

  emphasis,

  loading,

  status = "idle",

  onToggleMaximize,

  onClone,

}: PanelShellProps) {

  return (

    <div

      className={cn(

        "flex h-full flex-col overflow-hidden rounded-none",

        terminalSkin.border,

        terminalSkin.panel,

        emphasis === "high" && "ring-1 ring-cyan-900/50",

        emphasis === "muted" && "opacity-60 saturate-50",

        className,

      )}

    >

      <header

        className={cn(

          terminalSkin.panelHeader,

          terminalSkin.borderB,

          "justify-between px-1",

          dragHandleClassName,

        )}

      >

        <div className="flex min-w-0 items-center gap-1">

          <GripVertical className="h-3 w-3 shrink-0 cursor-grab text-slate-600 active:cursor-grabbing" />

          <span

            className={cn("h-1.5 w-1.5 shrink-0 rounded-none", STATUS_INDICATOR[status])}

            title={status}

          />

          <div className="min-w-0 leading-none">

            <p className={cn(TERMINAL_TYPO.label, "truncate text-slate-300")}>{title}</p>

            {subtitle ? (

              <p className={cn(TERMINAL_TYPO.micro, "truncate text-slate-500")}>{subtitle}</p>

            ) : null}

          </div>

        </div>

        <div className="flex items-center gap-1">

          {telemetry ? (

            <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>{telemetry}</span>

          ) : null}

          {onClone ? (

            <button

              type="button"

              onClick={onClone}

              className={cn(TERMINAL_TYPO.micro, INSTITUTIONAL_INTERACTION.panelButton)}

              aria-label="Clone panel"

            >

              CPY

            </button>

          ) : null}

          {onToggleMaximize ? (

            <button

              type="button"

              onClick={onToggleMaximize}

              className={cn(TERMINAL_TYPO.micro, INSTITUTIONAL_INTERACTION.panelButton)}

              aria-label={maximized ? "Restore panel" : "Maximize panel"}

            >

              {maximized ? (

                <Minimize2 className="h-3 w-3" />

              ) : (

                <Maximize2 className="h-3 w-3" />

              )}

            </button>

          ) : null}

        </div>

      </header>

      <div className="min-h-0 flex-1 overflow-hidden">

        {loading ? <PanelLoadingState /> : children}

      </div>

    </div>

  );

}

