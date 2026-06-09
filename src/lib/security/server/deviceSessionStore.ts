import type { DeviceSession } from "@/types/security-trust";

const devices = new Map<string, DeviceSession>();

function deviceKey(sessionId: string, deviceId: string): string {
  return `${sessionId}:${deviceId}`;
}

export function registerDevice(input: Omit<DeviceSession, "createdAt" | "lastSeenAt" | "suspicious"> & { suspicious?: boolean }): DeviceSession {
  const now = Date.now();
  const row: DeviceSession = {
    ...input,
    createdAt: now,
    lastSeenAt: now,
    suspicious: input.suspicious ?? false,
  };
  devices.set(deviceKey(input.sessionId, input.deviceId), row);
  return row;
}

export function touchDevice(sessionId: string, deviceId: string): void {
  const row = devices.get(deviceKey(sessionId, deviceId));
  if (row) row.lastSeenAt = Date.now();
}

export function listDevicesForWallet(walletAddress: string): DeviceSession[] {
  const w = walletAddress.toLowerCase();
  return Array.from(devices.values()).filter((d) => d.walletAddress === w);
}

export function listDevicesForSession(sessionId: string): DeviceSession[] {
  return Array.from(devices.values()).filter((d) => d.sessionId === sessionId);
}

export function markDeviceSuspicious(sessionId: string, deviceId: string): void {
  const row = devices.get(deviceKey(sessionId, deviceId));
  if (row) row.suspicious = true;
}

export function revokeDevicesForSession(sessionId: string): void {
  devices.forEach((row, key) => {
    if (row.sessionId === sessionId) devices.delete(key);
  });
}
