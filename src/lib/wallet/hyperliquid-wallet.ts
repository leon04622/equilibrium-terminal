import { getWalletClient, switchChain } from "@wagmi/core";
import type { Address, Hex } from "viem";
import { wagmiConfig } from "@/config/wagmi";
import { AGENT_NAME } from "@/lib/hyperliquid/agent-session";
import { HL_SIGNATURE_CHAIN_ID } from "@/lib/hyperliquid/constants";
import {
  buildApproveAgentTypedData,
  buildApproveBuilderFeeTypedData,
  normalizeWalletSignature,
  toSignatureChainId,
} from "@/lib/hyperliquid/signing";
import type { HlApproveAgentAction, HlApproveBuilderFeeAction, HlSignature } from "@/types/exchange";
import {
  BUILDER_MAX_FEE_RATE,
  EQUILIBRIUM_BUILDER_ADDRESS,
} from "@/lib/hyperliquid/builder";

const SWITCH_POLL_MS = 200;
const SWITCH_MAX_ATTEMPTS = 40;

/** Chain id from the connected wallet (not wagmi's configured default). */
export async function readWalletChainId(): Promise<number | null> {
  const client = await getWalletClient(wagmiConfig);
  if (!client) return null;
  return client.getChainId();
}

export async function ensureWalletOnHyperliquidSigningChain(): Promise<void> {
  let client = await getWalletClient(wagmiConfig);
  if (!client) throw new Error("Connect wallet first");

  let chainId = await client.getChainId();
  if (chainId === HL_SIGNATURE_CHAIN_ID) return;

  try {
    await switchChain(wagmiConfig, { chainId: HL_SIGNATURE_CHAIN_ID });
  } catch {
    throw new Error(
      "Could not switch to Arbitrum One. Open your wallet, select Arbitrum One, then try again.",
    );
  }

  for (let attempt = 0; attempt < SWITCH_MAX_ATTEMPTS; attempt++) {
    client = await getWalletClient(wagmiConfig, { chainId: HL_SIGNATURE_CHAIN_ID });
    if (client) {
      chainId = await client.getChainId();
      if (chainId === HL_SIGNATURE_CHAIN_ID) return;
    }
    await new Promise((resolve) => setTimeout(resolve, SWITCH_POLL_MS));
  }

  throw new Error(
    "Your wallet is still not on Arbitrum One. Switch to Arbitrum One manually, then authorize again.",
  );
}

export async function signApproveAgentWithWallet(
  master: Address,
  agentAddress: Address,
  nonce: number,
): Promise<{ signature: HlSignature; action: HlApproveAgentAction }> {
  await ensureWalletOnHyperliquidSigningChain();

  const client = await getWalletClient(wagmiConfig, { chainId: HL_SIGNATURE_CHAIN_ID });
  if (!client) throw new Error("Connect wallet first");

  const activeChainId = await client.getChainId();
  if (activeChainId !== HL_SIGNATURE_CHAIN_ID) {
    throw new Error("Switch your wallet to Arbitrum One, then authorize again");
  }

  const signatureChainId = toSignatureChainId(HL_SIGNATURE_CHAIN_ID);
  const action: HlApproveAgentAction = {
    type: "approveAgent",
    signatureChainId,
    hyperliquidChain: "Mainnet",
    agentAddress: agentAddress.toLowerCase(),
    agentName: AGENT_NAME,
    nonce,
  };
  const typedData = buildApproveAgentTypedData(
    agentAddress,
    AGENT_NAME,
    nonce,
    signatureChainId,
  );

  const signatureHex = await client.signTypedData({
    account: master,
    domain: typedData.domain,
    types: typedData.types,
    primaryType: "HyperliquidTransaction:ApproveAgent",
    message: {
      ...action,
      nonce: BigInt(nonce),
    },
  });

  return {
    signature: normalizeWalletSignature(signatureHex),
    action,
  };
}

export async function signApproveBuilderFeeWithWallet(
  master: Address,
  nonce: number,
): Promise<{ signature: HlSignature; action: HlApproveBuilderFeeAction }> {
  await ensureWalletOnHyperliquidSigningChain();

  const client = await getWalletClient(wagmiConfig, { chainId: HL_SIGNATURE_CHAIN_ID });
  if (!client) throw new Error("Connect wallet first");

  const activeChainId = await client.getChainId();
  if (activeChainId !== HL_SIGNATURE_CHAIN_ID) {
    throw new Error("Switch your wallet to Arbitrum One, then authorize again");
  }

  const signatureChainId = toSignatureChainId(HL_SIGNATURE_CHAIN_ID);
  const action: HlApproveBuilderFeeAction = {
    type: "approveBuilderFee",
    signatureChainId,
    hyperliquidChain: "Mainnet",
    maxFeeRate: BUILDER_MAX_FEE_RATE,
    builder: EQUILIBRIUM_BUILDER_ADDRESS,
    nonce,
  };
  const typedData = buildApproveBuilderFeeTypedData(
    EQUILIBRIUM_BUILDER_ADDRESS,
    BUILDER_MAX_FEE_RATE,
    nonce,
    signatureChainId,
  );

  const signatureHex = await client.signTypedData({
    account: master,
    domain: typedData.domain,
    types: typedData.types,
    primaryType: "HyperliquidTransaction:ApproveBuilderFee",
    message: {
      ...action,
      nonce: BigInt(nonce),
    },
  });

  return {
    signature: normalizeWalletSignature(signatureHex),
    action,
  };
}

export async function switchWalletToHyperliquidSigningChain(): Promise<boolean> {
  try {
    await ensureWalletOnHyperliquidSigningChain();
    return true;
  } catch {
    return false;
  }
}
