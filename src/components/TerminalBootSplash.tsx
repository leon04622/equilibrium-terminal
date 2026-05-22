import { terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function TerminalBootSplash() {
  return (
    <div
      className={cn(
        "flex h-screen flex-col items-center justify-center gap-2",
        terminalSkin.canvas,
      )}
    >
      <p className={cn(TERMINAL_TYPO.label, terminalSkin.textUp)}>EQUILIBRIUM</p>
      <p className={cn(TERMINAL_TYPO.micro, "text-slate-500")}>LOADING TERMINAL MODULES…</p>
    </div>
  );
}
