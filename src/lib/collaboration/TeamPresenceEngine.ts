import { useNetworkGraphStore } from "@/store/useNetworkGraphStore";
import { useTerminalStore } from "@/store/terminalStore";
import type { TeamPresenceMember, PresenceStatus } from "@/types/collaboration";
import type { DeskRole } from "@/types/network";

function mapDeskRole(role: DeskRole): TeamPresenceMember["role"] {
  if (role === "admin") return "admin";
  if (role === "lead") return "pm";
  if (role === "analyst") return "analyst";
  return "viewer";
}

function peerStatus(lastSeenAt: number, rttMs: number): PresenceStatus {
  const age = Date.now() - lastSeenAt;
  if (age > 120_000) return "offline";
  if (rttMs > 80 || age > 45_000) return "idle";
  if (age < 8_000) return "focused";
  return "active";
}

export class TeamPresenceEngine {
  static members(): TeamPresenceMember[] {
    const net = useNetworkGraphStore.getState();
    const selectedCoin =
      useTerminalStore.getState().selectedCoin ??
      useTerminalStore.getState().selectedAsset?.coin ??
      null;

    const localProfile = net.getProfile(net.localTraderId);
    const local: TeamPresenceMember = {
      memberId: net.localTraderId,
      displayHandle: localProfile?.displayHandle ?? "LOCAL",
      role: mapDeskRole(net.localRole),
      status: "focused",
      focusedPanel: "chart",
      activeCoin: selectedCoin,
      lastSeenAt: Date.now(),
      rttMs: 6,
    };

    const remote = net.profiles
      .filter((p) => p.deskId === net.activeDeskId && p.id !== net.localTraderId)
      .map((profile) => {
        const peer = net.peers.find((p) => p.walletAddress === profile.walletAddress);
        const lastSeen = peer?.lastSeenAt ?? profile.lastActiveAt;
        const rtt = peer?.rttMs ?? 24;
        return {
          memberId: profile.id,
          displayHandle: profile.displayHandle,
          role: mapDeskRole(profile.role),
          status: peerStatus(lastSeen, rtt),
          focusedPanel: peer?.status === "connected" ? "teamdesk" : null,
          activeCoin: profile.assetTags[0] ?? null,
          lastSeenAt: lastSeen,
          rttMs: rtt,
        };
      });

    return [local, ...remote];
  }
}
