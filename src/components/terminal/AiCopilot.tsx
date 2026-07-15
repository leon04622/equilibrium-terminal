"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { terminalBus } from "@/store/eventBus";
import { useDecisionEngineStore } from "@/store/useDecisionEngineStore";
import { useTerminalStore } from "@/store/terminalStore";
import { cn } from "@/lib/utils";
import { TERMINAL_TYPO } from "@/lib/theme";

export function AiCopilot() {
  const ai = useTerminalStore((s) => s.ai);
  const submitAiPrompt = useTerminalStore((s) => s.submitAiPrompt);
  const selectedAsset = useTerminalStore((s) => s.selectedAsset);
  const briefing = useDecisionEngineStore((s) => s.snapshot?.briefing);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return terminalBus.on("ai:prompt", () => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [ai.messages.length, ai.isThinking]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-black/25">
      <div className="flex shrink-0 items-center gap-2 border-b border-terminal-border/50 px-2 py-1.5">
        <Sparkles className="h-3.5 w-3.5 text-neon-green" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-terminal-muted">
          Rules-based Co-pilot
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "border border-violet-500/30 px-1 text-violet-400")}>
          NO LLM
        </span>
        <span className="ml-auto font-mono text-[10px] text-white/60">
          {selectedAsset?.symbol ?? "—"}
        </span>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-auto p-2">
        {ai.messages.length === 0 ? (
          <div className="space-y-2">
            {briefing ? (
              <div className="rounded-lg border border-violet-500/30 bg-violet-950/20 px-2 py-1.5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-violet-400">
                  Strategic briefing
                </p>
                <p className="mt-1 font-mono text-[11px] leading-relaxed text-white/85">
                  {briefing.primaryThesis}
                </p>
                {briefing.challengeNote ? (
                  <p className="mt-1 font-mono text-[10px] text-amber-400/90">
                    {briefing.challengeNote}
                  </p>
                ) : null}
              </div>
            ) : null}
            <p className="font-mono text-[11px] leading-relaxed text-terminal-muted">
              Rules-based desk assistant — composes summaries from live HL surfaces. Use Omni (⌘K) with{" "}
              <span className="text-neon-green">/ai</span> prefix.
            </p>
          </div>
        ) : (
          ai.messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "rounded-lg border px-2 py-1.5 font-mono text-[11px] leading-relaxed",
                m.role === "user"
                  ? "border-terminal-border/60 bg-white/5 text-white/90"
                  : "border-neon-green/25 bg-neon-green/5 text-white",
              )}
            >
              <span className="text-[9px] uppercase text-terminal-muted">{m.role}</span>
              <p className="mt-0.5 whitespace-pre-wrap">{m.content}</p>
            </div>
          ))
        )}
        {ai.isThinking ? (
          <div className="flex items-center gap-2 font-mono text-[11px] text-amber-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Composing desk summary…
          </div>
        ) : null}
      </div>

      <form
        className="flex shrink-0 gap-1 border-t border-terminal-border/50 p-2"
        onSubmit={(e) => {
          e.preventDefault();
          const q = input.trim();
          if (!q) return;
          submitAiPrompt(q, "copilot");
          setInput("");
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="/ai query or prompt…"
          className="min-w-0 flex-1 rounded border border-terminal-border/60 bg-black/40 px-2 py-1.5 font-mono text-[11px] text-white outline-none focus:border-neon-green/40"
        />
        <button
          type="submit"
          className="flex h-8 w-8 items-center justify-center rounded border border-neon-green/40 bg-neon-green/15 text-neon-green"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}



