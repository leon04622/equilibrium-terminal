import type { Address } from "viem";

export interface SiweMessageFields {
  domain: string;
  address: Address;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime: string;
}

export function buildSiweMessage(fields: SiweMessageFields): string {
  const lines = [
    `${fields.domain} wants you to sign in with your Ethereum account:`,
    fields.address,
    "",
    fields.statement,
    "",
    `URI: ${fields.uri}`,
    `Version: ${fields.version}`,
    `Chain ID: ${fields.chainId}`,
    `Nonce: ${fields.nonce}`,
    `Issued At: ${fields.issuedAt}`,
    `Expiration Time: ${fields.expirationTime}`,
  ];
  return lines.join("\n");
}

export function parseSiweMessage(message: string): Partial<SiweMessageFields> & { address?: Address } {
  const lines = message.split("\n");
  const addressLine = lines[1]?.trim();
  const address = addressLine?.startsWith("0x") ? (addressLine as Address) : undefined;

  const readField = (prefix: string): string | undefined => {
    const line = lines.find((l) => l.startsWith(`${prefix}: `));
    return line?.slice(prefix.length + 2).trim();
  };

  const chainIdRaw = readField("Chain ID");
  const chainId = chainIdRaw ? Number.parseInt(chainIdRaw, 10) : undefined;

  return {
    address,
    domain: lines[0]?.split(" wants you to sign")[0],
    statement: lines[3],
    uri: readField("URI"),
    version: readField("Version"),
    chainId: Number.isFinite(chainId) ? chainId : undefined,
    nonce: readField("Nonce"),
    issuedAt: readField("Issued At"),
    expirationTime: readField("Expiration Time"),
  };
}

export function createSiweNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
