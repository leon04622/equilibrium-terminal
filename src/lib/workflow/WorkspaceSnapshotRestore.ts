import type { Layout } from "react-grid-layout";
import type { WorkspaceSnapshotPayload } from "@/types/production-platform";
import { AuditLogEngine } from "@/lib/security/AuditLogEngine";
import { terminalBus } from "@/store/eventBus";
import { useAlertStore } from "@/store/useAlertStore";
import { useDeskStore } from "@/store/useDeskStore";
import { useInformationDiscoveryStore } from "@/store/useInformationDiscoveryStore";
import { useTerminalStore } from "@/store/terminalStore";

export interface WorkspaceSnapshotRestoreResult {
  ok: boolean;
  applied: {
    layout: boolean;
    watchlist: number;
    alerts: boolean;
    selectedCoin: boolean;
  };
  warnings: string[];
}

function sanitizeLayout(layout: Layout[]): Layout[] {
  return layout.filter((item) => {
    if (!item?.i || typeof item.x !== "number" || typeof item.y !== "number") return false;
    return item.w > 0 && item.h > 0;
  });
}

export function applyWorkspaceSnapshot(payload: WorkspaceSnapshotPayload): WorkspaceSnapshotRestoreResult {
  const warnings: string[] = [];
  const applied = {
    layout: false,
    watchlist: 0,
    alerts: false,
    selectedCoin: false,
  };

  if (payload.alertRules.length > 0) {
    useAlertStore.getState().setRules(payload.alertRules);
    applied.alerts = true;
  }

  if (payload.watchlist.length > 0) {
    const discovery = useInformationDiscoveryStore.getState();
    const existing = new Set(discovery.watchlist.map((w) => w.coin.toUpperCase()));
    for (const entry of payload.watchlist) {
      const coin = entry.coin?.trim();
      if (!coin) continue;
      const upper = coin.toUpperCase();
      if (existing.has(upper)) continue;
      discovery.addToWatchlist(coin);
      existing.add(upper);
      applied.watchlist += 1;
    }
  }

  if (payload.selectedCoin) {
    const assets = useTerminalStore.getState().assets;
    const coin = payload.selectedCoin;
    const known = assets.some(
      (a) =>
        a.coin.toUpperCase() === coin.toUpperCase() ||
        a.symbol.toUpperCase() === coin.toUpperCase(),
    );
    if (known || assets.length === 0) {
      useTerminalStore.getState().selectAssetByCoin(coin, "snapshot_restore");
      applied.selectedCoin = true;
    } else {
      warnings.push(`Selected coin ${coin} not in asset catalog — skipped`);
    }
  }

  const layout = sanitizeLayout(payload.layout as Layout[]);
  if (layout.length === 0 && payload.layout.length > 0) {
    warnings.push("Snapshot layout had no valid panels — skipped grid restore");
  }

  if (layout.length > 0) {
    const deskId = useDeskStore.getState().activeDeskId;
    if (deskId) {
      useDeskStore.getState().saveDeskLayout(deskId, layout);
    }
    terminalBus.emit("workspace:snapshot-restore", {
      layout,
      selectedCoin: applied.selectedCoin ? payload.selectedCoin : null,
      savedAt: payload.savedAt,
    });
    applied.layout = true;
  }

  AuditLogEngine.logCategory(
    "workspace",
    "snapshot_restore",
    warnings.length > 0 ? "error" : "ok",
    `layout=${applied.layout} watchlist+${applied.watchlist} alerts=${applied.alerts} coin=${applied.selectedCoin}${warnings.length ? ` · ${warnings.join("; ")}` : ""}`,
  );

  return {
    ok: applied.layout || applied.watchlist > 0 || applied.alerts || applied.selectedCoin,
    applied,
    warnings,
  };
}
