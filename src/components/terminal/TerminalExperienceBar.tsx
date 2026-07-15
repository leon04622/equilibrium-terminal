"use client";

import { cn } from "@/lib/utils";
import { DENSITY_PRESETS, type TerminalDensity } from "@/lib/theme/institutional";
import { isBloombergChrome } from "@/lib/theme/bloomberg";
import { TERMINAL_TYPO } from "@/lib/theme";
import { useTerminalExperienceStore } from "@/store/useTerminalExperienceStore";
import { useWedgeStore } from "@/store/useWedgeStore";
import { resolveDeploymentEnvironment } from "@/config/environments";
import { terminalBus } from "@/store/eventBus";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";

const DENSITIES: TerminalDensity[] = ["compact", "standard", "comfortable"];
const DEV_CHROME = process.env.NEXT_PUBLIC_EQ_DEV_CHROME === "1";

export function TerminalExperienceBar() {
  const density = useTerminalExperienceStore((s) => s.density);
  const setDensity = useTerminalExperienceStore((s) => s.setDensity);
  const beginnerMode = useTerminalExperienceStore((s) => s.beginnerMode);
  const toggleBeginnerMode = useTerminalExperienceStore((s) => s.toggleBeginnerMode);
  const deskFocusMode = useWedgeStore((s) => s.deskFocusMode);
  const toggleDeskFocusMode = useWedgeStore((s) => s.toggleDeskFocusMode);
  const explainModeActive = useOperatorGuideStore((s) => s.explainModeActive);
  const toggleExplainMode = useOperatorGuideStore((s) => s.toggleExplainMode);
  const bloomberg = isBloombergChrome(beginnerMode);
  const envLabel = resolveDeploymentEnvironment().toUpperCase().slice(0, 4);

  const cycleDensity = () => {
    const idx = DENSITIES.indexOf(density);
    setDensity(DENSITIES[(idx + 1) % DENSITIES.length]!);
  };

  return (
    <div className="flex shrink-0 items-center gap-1 border-l border-slate-800 pl-2">
      {beginnerMode ? (
        <button
          type="button"
          onClick={() => toggleBeginnerMode()}
          className={cn(TERMINAL_TYPO.micro, "px-1 py-0.5 text-emerald-400")}
          title="Switch to institutional PRO mode"
        >
          PLAIN
        </button>
      ) : (
        <button
          type="button"
          onClick={() => toggleBeginnerMode()}
          className={cn(
            TERMINAL_TYPO.micro,
            "px-1 py-0.5",
            bloomberg ? "text-[#ff9900]" : "text-slate-400",
          )}
          title="Institutional mode (Bloomberg-style). Toggle for plain-English hints."
        >
          PRO
        </button>
      )}

      <button
        type="button"
        onClick={() => toggleDeskFocusMode()}
        className={cn(
          TERMINAL_TYPO.micro,
          "px-1 py-0.5",
          deskFocusMode
            ? bloomberg
              ? "text-[#ff9900]"
              : "text-cyan-500"
            : "text-slate-600 hover:text-slate-400",
        )}
        title={deskFocusMode ? "Open full platform workspace" : "Return to execution desk"}
      >
        {deskFocusMode ? "FULL" : "DESK"}
      </button>

      {!bloomberg && !beginnerMode ? (
        <>
          <button
            type="button"
            onClick={() => terminalBus.emit("widget:focus", { widgetId: "chart" })}
            className={cn(TERMINAL_TYPO.micro, "hidden px-1 py-0.5 text-slate-600 hover:text-slate-400 md:inline")}
            title="Scroll to chart"
          >
            CHART
          </button>
          <button
            type="button"
            onClick={() => {
              toggleExplainMode();
              terminalBus.emit("guide:explain-toggle", { active: !explainModeActive });
            }}
            className={cn(
              TERMINAL_TYPO.micro,
              "px-1 py-0.5",
              explainModeActive ? "text-cyan-500" : "text-slate-600 hover:text-slate-400",
            )}
            title="Explain mode — click ? on any panel"
          >
            EXPLAIN
          </button>
        </>
      ) : null}

      <button
        type="button"
        onClick={cycleDensity}
        className={cn(
          TERMINAL_TYPO.micro,
          "border px-1 py-0.5 uppercase",
          bloomberg
            ? "border-[#ff9900]/50 text-[#ff9900]"
            : "border-cyan-700/50 text-cyan-300",
        )}
        title={`Panel density: ${DENSITY_PRESETS[density].label}. Click to cycle.`}
      >
        {DENSITY_PRESETS[density].label.slice(0, 4)}
      </button>

      {DEV_CHROME ? (
        <span className={cn(TERMINAL_TYPO.micro, "hidden px-1 text-slate-600 lg:inline")}>{envLabel}</span>
      ) : null}
    </div>
  );
}
