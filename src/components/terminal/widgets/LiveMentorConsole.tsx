"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, GraduationCap, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { useLiveCoachStore } from "@/store/useLiveCoachStore";
import { useOperatorGuideStore } from "@/store/useOperatorGuideStore";
import { LiveContextEngine } from "@/lib/education/LiveContextEngine";
import { terminalBus } from "@/store/eventBus";
import type { EducationalAlert } from "@/types/live-coach";

const SEV_COLOR: Record<EducationalAlert["severity"], string> = {
  info: "text-slate-500",
  watch: terminalSkin.textWarn,
  critical: terminalSkin.textDown,
};

function Field({ label, tone, body }: { label: string; tone: string; body: string }) {
  return (
    <p className={cn(TERMINAL_TYPO.micro, "leading-relaxed text-slate-300")}>
      <span className={cn(tone, "mr-1")}>{label}:</span>
      {body}
    </p>
  );
}

function MentorCard({
  alert,
  beginner,
  pinned,
  onPin,
  onUnpin,
  onDismiss,
}: {
  alert: EducationalAlert;
  beginner: boolean;
  pinned: boolean;
  onPin: () => void;
  onUnpin: () => void;
  onDismiss?: () => void;
}) {
  const headline = LiveContextEngine.headline(alert, beginner ? "beginner" : "advanced");
  return (
    <div className="border-b-[0.5px] border-slate-800 px-1.5 py-1.5">
      <div className="flex items-center gap-1">
        <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-600")}>
          {formatTapeTime(alert.ts).slice(0, 8)}
        </span>
        {alert.coin ? (
          <span className={cn(TERMINAL_TYPO.micro, "font-bold", terminalSkin.textUp)}>{alert.coin}</span>
        ) : null}
        <span className={cn(TERMINAL_TYPO.micro, "uppercase", SEV_COLOR[alert.severity])}>
          {alert.source}
        </span>
        <span className="ml-auto flex items-center gap-1">
          {alert.focusPanel ? (
            <button
              type="button"
              title={`Highlight ${alert.focusPanel}`}
              onClick={() => terminalBus.emit("widget:focus", { widgetId: alert.focusPanel! })}
              className={cn(TERMINAL_TYPO.micro, "text-cyan-600 hover:text-cyan-400")}
            >
              {alert.focusPanel.toUpperCase()}
            </button>
          ) : null}
          {pinned ? (
            <button type="button" title="Remove from memory" onClick={onUnpin} className="text-amber-400 hover:text-amber-300">
              <BookmarkCheck className="h-3 w-3" />
            </button>
          ) : (
            <button type="button" title="Save to market memory" onClick={onPin} className="text-slate-500 hover:text-amber-300">
              <Bookmark className="h-3 w-3" />
            </button>
          )}
          {onDismiss ? (
            <button type="button" title="Dismiss" onClick={onDismiss} className="text-slate-600 hover:text-slate-300">
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </span>
      </div>

      <p className={cn(TERMINAL_TYPO.dataSm, "mt-1 text-slate-100")}>{headline}</p>

      <div className="mt-1 space-y-0.5">
        {beginner ? <Field label="MEANS" tone="text-cyan-500" body={alert.meaning} /> : null}
        <Field label="WHY" tone="text-amber-500" body={alert.whyMatters} />
        <Field label="CHECK" tone="text-cyan-500" body={alert.checkNext} />
        {beginner ? <Field label="AVOID" tone="text-rose-500" body={alert.mistake} /> : null}
      </div>
    </div>
  );
}

export function LiveMentorConsole() {
  const [tab, setTab] = useState<"live" | "memory">("live");
  const feed = useLiveCoachStore((s) => s.feed);
  const archive = useLiveCoachStore((s) => s.archive);
  const muted = useLiveCoachStore((s) => s.muted);
  const voiceEnabled = useLiveCoachStore((s) => s.voiceEnabled);
  const pin = useLiveCoachStore((s) => s.pin);
  const unpin = useLiveCoachStore((s) => s.unpin);
  const dismiss = useLiveCoachStore((s) => s.dismiss);
  const setMuted = useLiveCoachStore((s) => s.setMuted);
  const setVoiceEnabled = useLiveCoachStore((s) => s.setVoiceEnabled);
  const clearFeed = useLiveCoachStore((s) => s.clearFeed);

  const audience = useOperatorGuideStore((s) => s.selectedAudience);
  const beginner = audience === "beginner";

  const pinnedIds = new Set(archive.map((a) => a.id));
  const items = tab === "live" ? feed : archive;

  return (
    <div className={cn("flex h-full flex-col overflow-hidden", terminalSkin.canvas)}>
      <div className={cn(terminalSkin.panelHeader, terminalSkin.borderB, "justify-between px-1")}>
        <div className="flex items-center gap-1">
          <GraduationCap className="h-3 w-3 text-cyan-400" />
          <span>LIVE MENTOR</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTab("live")}
            className={cn(TERMINAL_TYPO.micro, "px-1", tab === "live" ? "text-cyan-400" : "text-slate-600")}
          >
            LIVE {feed.length > 0 ? `· ${feed.length}` : ""}
          </button>
          <button
            type="button"
            onClick={() => setTab("memory")}
            className={cn(TERMINAL_TYPO.micro, "px-1", tab === "memory" ? "text-amber-400" : "text-slate-600")}
          >
            MEMORY {archive.length > 0 ? `· ${archive.length}` : ""}
          </button>
          <button
            type="button"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title={voiceEnabled ? "Leon voice on — click to mute audio" : "Enable Leon voice narration"}
            className={cn(TERMINAL_TYPO.micro, "px-1", voiceEnabled ? "text-cyan-400" : "text-slate-600")}
          >
            <Volume2 className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            title={muted ? "Mentor muted — click to resume" : "Pause mentor surfacing"}
            className={cn(TERMINAL_TYPO.micro, "px-1", muted ? "text-rose-400" : "text-slate-600")}
          >
            <VolumeX className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {items.length === 0 ? (
          <p className={cn(TERMINAL_TYPO.dataSm, "p-2 text-slate-500")}>
            {tab === "live"
              ? "The mentor explains live market events as they happen — what it means, why it matters, and what to check next."
              : "Pin any lesson with the bookmark to build your market-learning memory."}
          </p>
        ) : (
          items.map((a) => (
            <MentorCard
              key={a.id}
              alert={a}
              beginner={beginner}
              pinned={pinnedIds.has(a.id)}
              onPin={() => pin(a.id)}
              onUnpin={() => unpin(a.id)}
              onDismiss={tab === "live" ? () => dismiss(a.id) : undefined}
            />
          ))
        )}
      </div>

      {tab === "live" && feed.length > 0 ? (
        <div className={cn(terminalSkin.borderT, "flex items-center justify-between px-1 py-0.5")}>
          <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
            {beginner ? "BEGINNER — full plain English" : "PRO — condensed"}
          </span>
          <button
            type="button"
            onClick={clearFeed}
            className={cn(TERMINAL_TYPO.micro, "text-slate-500 hover:text-slate-300")}
          >
            CLEAR
          </button>
        </div>
      ) : null}
    </div>
  );
}
