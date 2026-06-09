import type { MobilePlatformTarget } from "@/types/mobile-operational";

export class MobileCompanionArchitectureEngine {
  static targets(): MobilePlatformTarget[] {
    return [
      {
        platform: "ios",
        stack: "React Native · Expo SDK 52",
        pushProvider: "APNs (institutional)",
        status: "beta",
        minOs: "iOS 16+",
      },
      {
        platform: "android",
        stack: "React Native · Expo SDK 52",
        pushProvider: "FCM (institutional)",
        status: "beta",
        minOs: "Android 12+",
      },
      {
        platform: "shared",
        stack: "Equilibrium REST + WebSocket gateway",
        pushProvider: "Server-side alert router",
        status: "live",
        minOs: "—",
      },
    ];
  }
}
