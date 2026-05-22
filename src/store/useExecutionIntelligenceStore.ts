import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  CvdSnapshot,
  DomMatrixPacket,
  ExecutionCopilotFlag,
  FootprintBar,
  LiquidityVoidCoordinate,
  MarketParticipantProfile,
  OrderFlowMatrixPacket,
  SlippageMetric,
  VolumeImbalance,
} from "@/types/execution-intelligence";

export type {
  CvdSnapshot,
  DomMatrixPacket,
  ExecutionCopilotFlag,
  FootprintBar,
  LiquidityVoidCoordinate,
  MarketParticipantProfile,
  OrderFlowMatrixPacket,
  SlippageMetric,
  VolumeImbalance,
} from "@/types/execution-intelligence";

function defaultCvd(coin: string): CvdSnapshot {
  return {
    coin,
    buyVolume: 0,
    sellVolume: 0,
    delta: 0,
    sessionCvd: 0,
    windowMs: 60_000,
    updatedAtNs: 0,
  };
}

function defaultImbalance(): VolumeImbalance {
  return {
    bidResting: 0,
    askResting: 0,
    ratio: 1,
    topLevels: 10,
    skew: "neutral",
    updatedAtNs: 0,
  };
}

function defaultSlippage(): SlippageMetric {
  return {
    id: "slip-init",
    expectedPx: 0,
    simulatedPx: 0,
    slippageBps: 0,
    spreadBps: 0,
    velocityTicksPerSec: 0,
    riskTier: "low",
    updatedAtNs: 0,
  };
}

function extractVoids(dom: DomMatrixPacket): LiquidityVoidCoordinate[] {
  const voids: LiquidityVoidCoordinate[] = [];
  for (const level of dom.levels) {
    if (level.voidScore < 0.65) continue;
    voids.push({
      side: level.priceTick >= dom.midTick ? "ask" : "bid",
      priceTick: level.priceTick,
      depthUsd: (level.bidSize + level.askSize) * level.price,
      voidScore: level.voidScore,
    });
  }
  return voids.slice(0, 16);
}

export interface ExecutionIntelligenceState {
  coin: string;
  pipelineActive: boolean;
  matrixVersion: number;
  domVersion: number;
  tapeVersion: number;

  cvd: CvdSnapshot;
  imbalance: VolumeImbalance;
  footprintBars: FootprintBar[];
  participants: MarketParticipantProfile[];
  slippage: SlippageMetric;
  dom: DomMatrixPacket | null;
  liquidityVoids: LiquidityVoidCoordinate[];
  copilotTape: ExecutionCopilotFlag[];
  executionConfidence: number;
  icebergProbability: number;
  spoofingProbability: number;
  lastPacketSeq: number;
  lastComputedAtNs: number;

  applyMatrixPacket: (packet: OrderFlowMatrixPacket) => void;
  mergeCopilotFlags: (flags: ExecutionCopilotFlag[]) => void;
  setPipelineActive: (active: boolean) => void;
  setCoin: (coin: string) => void;
  resetExecutionState: () => void;
}

export const useExecutionIntelligenceStore = create<ExecutionIntelligenceState>()(
  subscribeWithSelector((set, get) => ({
    coin: "BTC",
    pipelineActive: false,
    matrixVersion: 0,
    domVersion: 0,
    tapeVersion: 0,

    cvd: defaultCvd("BTC"),
    imbalance: defaultImbalance(),
    footprintBars: [],
    participants: [],
    slippage: defaultSlippage(),
    dom: null,
    liquidityVoids: [],
    copilotTape: [],
    executionConfidence: 50,
    icebergProbability: 0,
    spoofingProbability: 0,
    lastPacketSeq: 0,
    lastComputedAtNs: 0,

    applyMatrixPacket: (packet) => {
      const voids = extractVoids(packet.dom);
      set({
        coin: packet.coin,
        cvd: packet.cvd,
        imbalance: packet.imbalance,
        footprintBars: packet.footprintBars,
        participants: packet.participants,
        slippage: packet.slippage,
        dom: packet.dom,
        liquidityVoids: voids,
        copilotTape: packet.copilotFlags,
        executionConfidence: packet.executionConfidence,
        icebergProbability: packet.icebergProbability,
        spoofingProbability: packet.spoofingProbability,
        lastPacketSeq: packet.packetSeq,
        lastComputedAtNs: packet.computedAtNs,
        matrixVersion: get().matrixVersion + 1,
        domVersion: get().domVersion + 1,
        tapeVersion: get().tapeVersion + 1,
      });
    },

    mergeCopilotFlags: (flags) => {
      const existing = get().copilotTape;
      const merged = [...flags, ...existing];
      const deduped: ExecutionCopilotFlag[] = [];
      const seen = new Set<string>();
      for (const flag of merged) {
        if (seen.has(flag.code)) continue;
        seen.add(flag.code);
        deduped.push(flag);
      }
      set({
        copilotTape: deduped.slice(0, 24),
        tapeVersion: get().tapeVersion + 1,
      });
    },

    setPipelineActive: (pipelineActive) => set({ pipelineActive }),
    setCoin: (coin) => {
      if (get().coin === coin) return;
      set({
        coin,
        cvd: defaultCvd(coin),
        imbalance: defaultImbalance(),
        footprintBars: [],
        participants: [],
        slippage: defaultSlippage(),
        dom: null,
        liquidityVoids: [],
        copilotTape: [],
        executionConfidence: 50,
        icebergProbability: 0,
        spoofingProbability: 0,
        lastPacketSeq: 0,
        lastComputedAtNs: 0,
      });
    },

    resetExecutionState: () => {
      const coin = get().coin;
      set({
        pipelineActive: false,
        matrixVersion: 0,
        domVersion: 0,
        tapeVersion: 0,
        cvd: defaultCvd(coin),
        imbalance: defaultImbalance(),
        footprintBars: [],
        participants: [],
        slippage: defaultSlippage(),
        dom: null,
        liquidityVoids: [],
        copilotTape: [],
        executionConfidence: 50,
        icebergProbability: 0,
        spoofingProbability: 0,
        lastPacketSeq: 0,
        lastComputedAtNs: 0,
      });
    },
  })),
);
