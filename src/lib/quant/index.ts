export { backtestEngine, BacktestEngine, type SignalRule } from "@/lib/quant/BacktestEngine";
export {
  FEATURE_SLOT_COUNT,
  FEATURE_SLOT_INDEX,
  FlatFeatureBuffer,
  nowNs,
  SLOT_TO_KIND,
} from "@/lib/quant/FlatFeatureBuffer";
export {
  featurePipeline,
  FeaturePipeline,
  type FeatureFlushHandler,
  type FeaturePipelineInput,
} from "@/lib/quant/FeaturePipeline";
export { regimeClassifier, RegimeClassifier } from "@/lib/quant/RegimeClassifier";
export {
  signalDecayEngine,
  SignalDecayEngine,
  type DecayEvaluation,
} from "@/lib/quant/SignalDecayEngine";
