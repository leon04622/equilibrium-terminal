import type { WheelEvent } from "react";

/** Keep wheel events inside scrollable panels instead of hijacking workspace scroll. */
export function stopPanelWheelBubble(e: WheelEvent<HTMLElement>): void {
  const el = e.currentTarget;
  const { scrollTop, scrollHeight, clientHeight } = el;
  if (scrollHeight <= clientHeight + 1) return;

  const delta = e.deltaY;
  const atTop = scrollTop <= 0;
  const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
  if ((delta < 0 && !atTop) || (delta > 0 && !atBottom)) {
    e.stopPropagation();
  }
}
