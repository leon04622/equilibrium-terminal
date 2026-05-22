/** @deprecated Use useTerminalStore — compatibility shim for Phase 2 modules. */
export {
  useTerminalStore as useHyperliquidStore,
  terminalIngress as hyperliquidActions,
  type TerminalState as HyperliquidState,
} from "@/store/terminalStore";
