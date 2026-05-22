import { encode } from "@msgpack/msgpack";
import { type Address, type Hex, hexToBytes, keccak256 } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { HL_CHAIN } from "@/lib/hyperliquid/constants";
import type { HlApproveAgentAction, HlL1Action, HlSignature } from "@/types/exchange";

const IS_MAINNET = true;

export function floatToWire(x: number): string {
  const rounded = x.toFixed(8);
  const n = Number(rounded);
  if (Math.abs(n - x) >= 1e-12) {
    throw new Error(`floatToWire rounding error: ${x}`);
  }
  let normalized = rounded;
  if (normalized === "-0") normalized = "0";
  const dec = Number(normalized);
  if (Number.isInteger(dec)) return String(dec);
  return String(parseFloat(normalized));
}

function addressToBytes(address: Address): Uint8Array {
  return hexToBytes(address);
}

export function actionHash(
  action: HlL1Action | Record<string, unknown>,
  vaultAddress: Address | null,
  nonce: number,
  expiresAfter: number | null,
): Hex {
  const data = encode(action);
  const parts: Uint8Array[] = [data];
  const nonceBytes = new Uint8Array(8);
  new DataView(nonceBytes.buffer).setBigUint64(0, BigInt(nonce));
  parts.push(nonceBytes);
  if (vaultAddress === null) {
    parts.push(new Uint8Array([0]));
  } else {
    parts.push(new Uint8Array([1]));
    parts.push(addressToBytes(vaultAddress));
  }
  if (expiresAfter !== null) {
    parts.push(new Uint8Array([0]));
    const expBytes = new Uint8Array(8);
    new DataView(expBytes.buffer).setBigUint64(0, BigInt(expiresAfter));
    parts.push(expBytes);
  }
  const total = parts.reduce((acc, p) => acc + p.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    merged.set(p, offset);
    offset += p.length;
  }
  return keccak256(merged);
}

const APPROVE_AGENT_TYPES = [
  { name: "hyperliquidChain", type: "string" },
  { name: "agentAddress", type: "address" },
  { name: "agentName", type: "string" },
  { name: "nonce", type: "uint64" },
] as const;

function userSignedTypedData(
  primaryType: string,
  payloadTypes: readonly { name: string; type: string }[],
  message: Record<string, unknown>,
  signatureChainId: Hex,
) {
  const chainId = Number.parseInt(signatureChainId, 16);
  return {
    domain: {
      name: "HyperliquidSignTransaction",
      version: "1",
      chainId,
      verifyingContract: "0x0000000000000000000000000000000000000000" as Address,
    },
    types: {
      [primaryType]: [...payloadTypes],
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
    },
    primaryType,
    message,
  };
}

export function buildApproveAgentTypedData(
  agentAddress: Address,
  agentName: string,
  nonce: number,
  signatureChainId: Hex,
) {
  const message: HlApproveAgentAction = {
    type: "approveAgent",
    signatureChainId,
    hyperliquidChain: HL_CHAIN,
    agentAddress: agentAddress.toLowerCase(),
    agentName,
    nonce,
  };
  return userSignedTypedData(
    "HyperliquidTransaction:ApproveAgent",
    APPROVE_AGENT_TYPES,
    message as unknown as Record<string, unknown>,
    signatureChainId,
  );
}

export async function signL1Action(
  privateKey: Hex,
  action: HlL1Action,
  vaultAddress: Address | null,
  nonce: number,
  expiresAfter: number | null = null,
): Promise<HlSignature> {
  const hash = actionHash(action, vaultAddress, nonce, expiresAfter);
  const phantomAgent = {
    source: IS_MAINNET ? "a" : "b",
    connectionId: hash,
  };
  const account = privateKeyToAccount(privateKey);
  const signature = await account.signTypedData({
    domain: {
      chainId: 1337,
      name: "Exchange",
      verifyingContract: "0x0000000000000000000000000000000000000000",
      version: "1",
    },
    types: {
      Agent: [
        { name: "source", type: "string" },
        { name: "connectionId", type: "bytes32" },
      ],
    },
    primaryType: "Agent",
    message: phantomAgent,
  });
  return splitSignature(signature);
}

export function splitSignature(signature: Hex): HlSignature {
  const r = `0x${signature.slice(2, 66)}` as `0x${string}`;
  const s = `0x${signature.slice(66, 130)}` as `0x${string}`;
  let v = Number.parseInt(signature.slice(130, 132), 16);
  if (v < 27) v += 27;
  return { r, s, v };
}

export function normalizeWalletSignature(sig: Hex): HlSignature {
  return splitSignature(sig);
}

export function slippagePrice(
  midPx: number,
  isBuy: boolean,
  slippage: number,
  szDecimals: number,
  isSpot: boolean,
): number {
  let px = midPx * (isBuy ? 1 + slippage : 1 - slippage);
  px = Number(px.toPrecision(5));
  const decimalPlaces = (isSpot ? 8 : 6) - szDecimals;
  return Number(px.toFixed(Math.max(0, decimalPlaces)));
}

export function timestampMs(): number {
  return Date.now();
}

export function toSignatureChainId(chainId: number): Hex {
  return `0x${chainId.toString(16)}` as Hex;
}
