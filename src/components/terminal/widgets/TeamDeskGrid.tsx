"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { formatTapeTime, terminalSkin, TERMINAL_TYPO } from "@/lib/theme";
import { crdtWorkspaceCoordinator } from "@/lib/network/CrdtWorkspaceCoordinator";
import { filterSignalsForViewer, visibilityLabel } from "@/lib/network/NetworkSandbox";
import { terminalBus } from "@/store/eventBus";
import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { ReputationTier, SharedSignal, TraderProfile } from "@/types/network";

function subscribeNetwork(cb: () => void) {
  return useNetworkGraphStore.subscribe(
    (s) => s.signalsVersion + s.reputationVersion,
    () => cb(),
  );
}

function getNetworkSnapshot() {
  return useNetworkGraphStore.getState().signalsVersion;
}

function tierColor(tier: ReputationTier): string {
  switch (tier) {
    case "institutional":
      return terminalSkin.textAi;
    case "gold":
      return terminalSkin.textUp;
    case "silver":
      return "text-slate-300";
    case "bronze":
      return terminalSkin.textWarn;
    default:
      return "text-slate-600";
  }
}

function RepBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  return (
    <div className="flex h-[10px] w-12 items-stretch border-[0.5px] border-slate-800 bg-slate-950">
      <div
        className={cn("h-full rounded-none bg-[#00e5ff]")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ProfileRow({ profile }: { profile: TraderProfile }) {
  return (
    <div
      className={cn(
        terminalSkin.row,
        "grid grid-cols-[72px_1fr_48px_40px_36px] gap-1 border-b-[0.5px] border-slate-800 px-1",
      )}
    >
      <span className={cn(TERMINAL_TYPO.dataSm, "truncate text-slate-400")}>
        {profile.displayHandle}
      </span>
      <span className={cn(TERMINAL_TYPO.micro, "truncate text-slate-600")}>
        {profile.assetTags.join(" · ")}
      </span>
      <RepBar score={profile.reputationScore} />
      <span className={cn(TERMINAL_TYPO.micro, tierColor(profile.reputationTier))}>
        {profile.reputationTier.slice(0, 4).toUpperCase()}
      </span>
      <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-500")}>
        {(profile.trust.precision * 100).toFixed(0)}%
      </span>
    </div>
  );
}

function SignalRow({ signal }: { signal: SharedSignal }) {
  const selectAssetByCoin = useTerminalStore((s) => s.selectAssetByCoin);
  const profile = useNetworkGraphStore((s) => s.getProfile(signal.publisherId));

  const loadTrace = useCallback(() => {
    selectAssetByCoin(signal.coin, "team-desk");
    terminalBus.emit("network:signal-trace", {
      signalId: signal.id,
      coin: signal.coin,
    });
    terminalBus.emit("widget:focus", { widgetId: "chart" });
  }, [selectAssetByCoin, signal.coin, signal.id]);

  const stanceColor =
    signal.stance === "bullish"
      ? terminalSkin.textUp
      : signal.stance === "bearish"
        ? terminalSkin.textDown
        : "text-slate-500";

  return (
    <div className="border-b-[0.5px] border-slate-800 px-1 py-0.5 hover:bg-slate-900/80">
      <div className={cn(terminalSkin.row, "gap-1")}>
        <span className={cn(TERMINAL_TYPO.dataSm, "w-14 tabular-nums text-slate-500")}>
          {formatTapeTime(signal.timestamp).slice(0, 8)}
        </span>
        <span className={cn(TERMINAL_TYPO.dataSm, "w-10 font-bold", terminalSkin.textUp)}>
          {signal.coin}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, stanceColor)}>{signal.stance}</span>
        <span className={cn(TERMINAL_TYPO.micro, "text-slate-600")}>
          {visibilityLabel(signal.visibility)}
        </span>
        <span className={cn(TERMINAL_TYPO.micro, "truncate text-slate-500")}>
          {profile?.displayHandle ?? signal.publisherId}
        </span>
        <button
          type="button"
          onClick={loadTrace}
          className={cn(
            TERMINAL_TYPO.micro,
            "ml-auto border-[0.5px] border-slate-700 px-1 text-slate-400 hover:text-[#00e5ff]",
          )}
        >
          TRACE
        </button>
      </div>
      <p className={cn(TERMINAL_TYPO.dataSm, "truncate pl-[4.5rem] text-slate-400")}>
        {signal.thesis}
      </p>
      <p className={cn(TERMINAL_TYPO.micro, "truncate pl-[4.5rem] text-slate-700")}>
        HASH {signal.contentHash.slice(0, 18)}… · {signal.publisherWallet.slice(0, 10)}…
      </p>
    </div>
  );
}

export function TeamDeskGrid() {
  useSyncExternalStore(subscribeNetwork, getNetworkSnapshot, getNetworkSnapshot);

  const desks = useNetworkGraphStore((s) => s.desks);
  const activeDeskId = useNetworkGraphStore((s) => s.activeDeskId);
  const allProfiles = useNetworkGraphStore((s) => s.profiles);
  const signals = useNetworkGraphStore((s) => s.signals);
  const localRole = useNetworkGraphStore((s) => s.localRole);
  const peers = useNetworkGraphStore((s) => s.peers);
  const privateRouting = useNetworkGraphStore((s) => s.privateRoutingEnabled);
  const setPrivateRouting = useNetworkGraphStore((s) => s.setPrivateRouting);
  const publishSignal = useNetworkGraphStore((s) => s.publishSignal);
  const lastQuery = useNetworkGraphStore((s) => s.lastGraphQuery);
  const selectedAsset = useTerminalStore((s) => s.selectedAsset);
  const localTraderId = useNetworkGraphStore((s) => s.localTraderId);

  const desk = useMemo(
    () => desks.find((d) => d.id === activeDeskId),
    [desks, activeDeskId],
  );
  const profiles = useMemo(
    () => allProfiles.filter((p) => p.deskId === activeDeskId),
    [allProfiles, activeDeskId],
  );
  const visible = useMemo(
    () => filterSignalsForViewer(signals, activeDeskId, localRole, localTraderId),
    [signals, activeDeskId, localRole, localTraderId],
  );

  const shareTeamSignal = () => {
    if (!selectedAsset || !desk) return;
    const profile = useNetworkGraphStore.getState().getProfile(localTraderId);
    if (!profile) return;
    publishSignal({
      deskId: desk.id,
      publisherId: profile.id,
      publisherWallet: profile.walletAddress,
      coin: selectedAsset.coin,
      stance: "bullish",
      thesis: `Team desk shared watch — ${selectedAsset.symbol} structure valid.`,
      visibility: privateRouting ? "team" : "public",
      encryptedScopeKey: desk.sandboxKey,
      targetPx: useTerminalStore.getState().book?.mid ?? null,
    });
    crdtWorkspaceCoordinator.publishWatchlistAdd(desk.id, selectedAsset.coin);
  };

  return (
    <div className={cn("flex h-full flex-col overflow-hidden", terminalSkin.canvas)}>
      <div
        className={cn(
          terminalSkin.panelHeader,
          terminalSkin.borderB,
          "justify-between px-1",
        )}
      >
        <span>TEAM NET</span>
        <span className={TERMINAL_TYPO.micro}>
          {desk?.name ?? "—"} · {peers.filter((p) => p.status === "connected").length} PEERS
        </span>
      </div>

      <div className={cn(terminalSkin.borderB, "flex items-center justify-between px-1 py-0.5")}>
        <span className={TERMINAL_TYPO.micro}>PRIVATE ROUTE</span>
        <button
          type="button"
          onClick={() => setPrivateRouting(!privateRouting)}
          className={cn(
            TERMINAL_TYPO.micro,
            "border-[0.5px] px-1",
            privateRouting
              ? "border-[#00e5ff]/50 bg-[#00e5ff]/10 text-[#00e5ff]"
              : "border-slate-700 text-slate-500",
          )}
        >
          {privateRouting ? "ON" : "OFF"}
        </button>
        <button
          type="button"
          onClick={shareTeamSignal}
          className={cn(
            TERMINAL_TYPO.micro,
            "border-[0.5px] border-[#00ff88]/40 px-1 text-[#00ff88]",
          )}
        >
          PUBLISH
        </button>
      </div>

      <div className={cn(terminalSkin.borderB, "shrink-0")}>
        <p className={cn(TERMINAL_TYPO.micro, "px-1 text-slate-600")}>PEER MESH</p>
        {peers.map((p) => (
          <div
            key={p.peerId}
            className={cn(terminalSkin.row, "justify-between px-1")}
          >
            <span className={TERMINAL_TYPO.micro}>{p.peerId}</span>
            <span
              className={cn(
                TERMINAL_TYPO.micro,
                p.status === "connected" ? terminalSkin.textUp : terminalSkin.textWarn,
              )}
            >
              {p.status}
            </span>
            <span className={cn(TERMINAL_TYPO.micro, "tabular-nums text-slate-500")}>
              {p.rttMs}ms
            </span>
          </div>
        ))}
      </div>

      <div className={cn(terminalSkin.borderB, "max-h-[30%] shrink-0 overflow-auto")}>
        <p className={cn(TERMINAL_TYPO.micro, "px-1 text-slate-600")}>DESK PROFILES</p>
        {profiles.map((p) => (
          <ProfileRow key={p.id} profile={p} />
        ))}
      </div>

      {lastQuery ? (
        <p className={cn(TERMINAL_TYPO.micro, "border-b-[0.5px] border-slate-800 px-1 py-0.5 text-slate-500")}>
          GRAPH {lastQuery.elapsedMs.toFixed(1)}ms · {lastQuery.nodes.length}N ·{" "}
          {lastQuery.cached ? "CACHE" : "LIVE"} · {lastQuery.query.slice(0, 48)}
        </p>
      ) : null}

      <div className="min-h-0 flex-1 overflow-auto">
        <p className={cn(TERMINAL_TYPO.micro, "sticky top-0 bg-slate-950 px-1 text-slate-600")}>
          SHARED SIGNALS · SANDBOX {privateRouting ? "TEAM" : "PUB"}
        </p>
        {visible.length === 0 ? (
          <p className={cn(TERMINAL_TYPO.dataSm, "p-1 text-slate-500")}>
            NO VISIBLE SIGNALS · PUBLISH OR SYNC WATCHLIST
          </p>
        ) : (
          visible.map((s) => <SignalRow key={s.id} signal={s} />)
        )}
      </div>
    </div>
  );
}
