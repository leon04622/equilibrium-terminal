import { keccak256, stringToHex } from "viem";
import type { SharedSignal } from "@/types/network";

export function hashSharedSignalPayload(input: {
  publisherWallet: `0x${string}`;
  coin: string;
  stance: string;
  thesis: string;
  timestamp: number;
  deskId: string;
}): string {
  const canonical = JSON.stringify({
    w: input.publisherWallet.toLowerCase(),
    c: input.coin.toUpperCase(),
    s: input.stance,
    t: input.thesis,
    ts: input.timestamp,
    d: input.deskId,
  });
  return keccak256(stringToHex(canonical));
}

export function verifySignalIntegrity(signal: SharedSignal): boolean {
  const expected = hashSharedSignalPayload({
    publisherWallet: signal.publisherWallet,
    coin: signal.coin,
    stance: signal.stance,
    thesis: signal.thesis,
    timestamp: signal.timestamp,
    deskId: signal.deskId,
  });
  return expected === signal.contentHash;
}
