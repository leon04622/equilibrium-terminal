import { terminalBus } from "@/store/eventBus";
import { useTerminalStore } from "@/store/terminalStore";

/** Focus chart + book for a wire headline symbol. */
export function focusWireSymbol(coin: string, source: string): void {
  const normalized = coin.trim().toUpperCase();
  if (!normalized || normalized === "—" || normalized === "ALL") return;
  useTerminalStore.getState().selectAssetByCoin(normalized, source);
  terminalBus.emit("widget:focus", { widgetId: "chart" });
  terminalBus.emit("widget:focus", { widgetId: "hyperbook" });
}
