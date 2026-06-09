import type { AlphaCohort } from "@/types/alpha-launch";

const STORAGE_KEY = "eq-alpha-invite-v1";

/** Invite codes for controlled alpha — override via NEXT_PUBLIC_EQ_ALPHA_CODES (comma-separated). */
const DEFAULT_CODES = ["EQ-ALPHA-2026", "EQ-HL-DESK", "EQ-EXEC"];

interface StoredInvite {
  codeHash: string;
  cohort: AlphaCohort;
  validatedAt: number;
}

function codes(): string[] {
  const env = process.env.NEXT_PUBLIC_EQ_ALPHA_CODES;
  if (env) return env.split(",").map((c) => c.trim()).filter(Boolean);
  return DEFAULT_CODES;
}

function hashCode(code: string): string {
  let h = 0;
  const normalized = code.trim().toUpperCase();
  for (let i = 0; i < normalized.length; i++) {
    h = (h << 5) - h + normalized.charCodeAt(i);
    h |= 0;
  }
  return `inv_${Math.abs(h)}`;
}

function cohortForCode(code: string): AlphaCohort {
  const u = code.toUpperCase();
  if (u.includes("DESK")) return "small_desk";
  if (u.includes("EXEC")) return "execution_heavy";
  if (u.includes("HL")) return "hl_power_user";
  return "professional_scalper";
}

function readStored(): StoredInvite | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredInvite;
  } catch {
    return null;
  }
}

function writeStored(data: StoredInvite): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export class InviteGateEngine {
  /** Shown on invite gate — same as default env codes. */
  static publicCodes(): string[] {
    return codes();
  }

  static inviteRequired(): boolean {
    if (process.env.NODE_ENV === "development") return false;
    if (process.env.NEXT_PUBLIC_EQ_OPERATOR_ACCESS === "true") return false;
    return process.env.NEXT_PUBLIC_EQ_ALPHA_INVITE_REQUIRED !== "false";
  }

  static isValidated(): boolean {
    if (!InviteGateEngine.inviteRequired()) return true;
    return readStored() !== null;
  }

  static cohort(): AlphaCohort | null {
    return readStored()?.cohort ?? null;
  }

  static validate(code: string): boolean {
    const match = codes().some((c) => c.toUpperCase() === code.trim().toUpperCase());
    if (!match) return false;
    writeStored({
      codeHash: hashCode(code),
      cohort: cohortForCode(code),
      validatedAt: Date.now(),
    });
    return true;
  }

  static revoke(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  }
}
