import type { Address, Hex } from "viem";

const STORAGE_KEY = "eq-terminal-agent-v1";
export const AGENT_NAME = "EQ-TERMINAL-1CT";

export interface AgentSession {
  masterAddress: Address;
  agentPrivateKey: Hex;
  agentAddress: Address;
  agentName: string;
  approvedAt: number;
}

/** In-memory hot session (sub-second signing path). */
let memorySession: AgentSession | null = null;

export function getMemoryAgentSession(): AgentSession | null {
  return memorySession;
}

export function setMemoryAgentSession(session: AgentSession | null): void {
  memorySession = session;
}

export function loadPersistedAgent(masterAddress: Address): AgentSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const sessions = JSON.parse(raw) as AgentSession[];
    return (
      sessions.find(
        (s) => s.masterAddress.toLowerCase() === masterAddress.toLowerCase(),
      ) ?? null
    );
  } catch {
    return null;
  }
}

export function persistAgentSession(session: AgentSession): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(STORAGE_KEY);
  const sessions: AgentSession[] = raw ? JSON.parse(raw) : [];
  const idx = sessions.findIndex(
    (s) => s.masterAddress.toLowerCase() === session.masterAddress.toLowerCase(),
  );
  if (idx >= 0) sessions[idx] = session;
  else sessions.push(session);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  memorySession = session;
}

export function clearPersistedAgent(masterAddress: Address): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const sessions = (JSON.parse(raw) as AgentSession[]).filter(
    (s) => s.masterAddress.toLowerCase() !== masterAddress.toLowerCase(),
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  if (
    memorySession?.masterAddress.toLowerCase() === masterAddress.toLowerCase()
  ) {
    memorySession = null;
  }
}
