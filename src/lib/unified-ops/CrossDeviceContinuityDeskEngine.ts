import { MobileDeskOrchestrator } from "@/lib/mobile-desk/MobileDeskOrchestrator";
import { useTerminalStore } from "@/store/terminalStore";
import type { CrossDeviceRow } from "@/types/unified-operations";

export class CrossDeviceContinuityDeskEngine {
  static channels(): CrossDeviceRow[] {
    const asset = useTerminalStore.getState().selectedCoin ?? "BTC";
    const mobile = MobileDeskOrchestrator.snapshot(asset);

    return [
      { id: "xd-desktop", channel: "desktop", sync: "primary session" },
      { id: "xd-mobile", channel: "mobile_companion", sync: `awareness ${mobile.awarenessScore}` },
      { id: "xd-alerts", channel: "notifications", sync: `${mobile.alerts.length} active` },
      { id: "xd-intel", channel: "shared_intel", sync: "global context bus" },
      { id: "xd-handoff", channel: "ops_handoff", sync: "deskops coordination" },
    ];
  }
}
