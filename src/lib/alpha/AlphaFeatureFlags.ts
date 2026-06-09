import type { AlphaFeatureFlag, AlphaFeatureFlagState } from "@/types/alpha-launch";

const STORAGE_KEY = "eq-alpha-flags-v1";

const DEFAULT_FLAGS: AlphaFeatureFlagState[] = [
  { id: "execution", label: "Execution", enabled: true, killSwitch: false },
  { id: "intelligence_feed", label: "Intelligence feed", enabled: true, killSwitch: false },
  { id: "alerts", label: "Alerts", enabled: true, killSwitch: false },
  { id: "advanced_panels", label: "Advanced panels", enabled: true, killSwitch: false },
  { id: "stress_replay", label: "Stress replay", enabled: false, killSwitch: false },
  { id: "collaboration", label: "Collaboration", enabled: true, killSwitch: false },
];

function readStored(): AlphaFeatureFlagState[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AlphaFeatureFlagState[];
  } catch {
    return null;
  }
}

function writeStored(flags: AlphaFeatureFlagState[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
}

export class AlphaFeatureFlags {
  static all(): AlphaFeatureFlagState[] {
    return readStored() ?? DEFAULT_FLAGS.map((f) => ({ ...f }));
  }

  static isEnabled(id: AlphaFeatureFlag): boolean {
    const flag = AlphaFeatureFlags.all().find((f) => f.id === id);
    if (!flag) return true;
    return flag.enabled && !flag.killSwitch;
  }

  static anyKillSwitchActive(): boolean {
    return AlphaFeatureFlags.all().some((f) => f.killSwitch);
  }

  static setEnabled(id: AlphaFeatureFlag, enabled: boolean): void {
    const flags = AlphaFeatureFlags.all().map((f) =>
      f.id === id ? { ...f, enabled } : f,
    );
    writeStored(flags);
  }

  static activateKillSwitch(id: AlphaFeatureFlag): void {
    const flags = AlphaFeatureFlags.all().map((f) =>
      f.id === id ? { ...f, killSwitch: true, enabled: false } : f,
    );
    writeStored(flags);
  }

  static resetKillSwitches(): void {
    writeStored(
      AlphaFeatureFlags.all().map((f) => ({ ...f, killSwitch: false })),
    );
  }
}
