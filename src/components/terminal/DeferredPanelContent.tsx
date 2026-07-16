"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PanelLoadingState } from "@/components/terminal/PanelLoadingState";
import { NEVER_HIDE_PANEL_IDS } from "@/lib/adaptive/PanelPriorityEngine";

/** Above-the-fold trading panels — mount immediately to avoid blank first paint. */
const EAGER_PANEL_IDS = new Set<string>([
  "operatormode",
  "newswire",
  ...Array.from(NEVER_HIDE_PANEL_IDS),
]);

const VISIBILITY_MARGIN_PX = 800;

interface DeferredPanelContentProps {
  panelId: string;
  forceMount?: boolean;
  /** Execution desk — mount every panel immediately (small grid). */
  deskFocusMode?: boolean;
  children: ReactNode;
}

function getWorkspaceScrollRoot(el: HTMLElement): HTMLElement | null {
  return el.closest<HTMLElement>("[data-workspace-scroll]");
}

function isNearVisible(el: HTMLElement, root: HTMLElement | null, margin = VISIBILITY_MARGIN_PX): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 && rect.height <= 0) return false;
  const bounds = root?.getBoundingClientRect() ?? {
    top: 0,
    bottom: window.innerHeight,
  };
  return rect.bottom >= bounds.top - margin && rect.top <= bounds.bottom + margin;
}

/** Mount off-screen panels in small idle batches when the workspace is otherwise idle. */
const idleQueue: Array<() => void> = [];
let idleScheduled = false;

function scheduleIdleMount(fn: () => void): void {
  idleQueue.push(fn);
  if (idleScheduled) return;
  idleScheduled = true;

  const drain = (deadline?: IdleDeadline) => {
    let budget = deadline?.timeRemaining() ?? 12;
    while (idleQueue.length > 0 && budget > 2) {
      idleQueue.shift()?.();
      budget -= 4;
    }
    if (idleQueue.length > 0) {
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(drain, { timeout: 800 });
      } else {
        window.setTimeout(() => drain(), 50);
      }
      return;
    }
    idleScheduled = false;
  };

  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(drain, { timeout: 1_200 });
  } else {
    window.setTimeout(() => drain(), 80);
  }
}

function shouldMountImmediately(panelId: string, forceMount?: boolean, deskFocusMode?: boolean): boolean {
  return Boolean(forceMount) || Boolean(deskFocusMode) || EAGER_PANEL_IDS.has(panelId);
}

function DeferredPanelMount({
  panelId,
  forceMount,
  children,
}: {
  panelId: string;
  forceMount?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (forceMount) {
      setMounted(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    const mount = () => {
      if (!cancelled) setMounted(true);
    };

    const scrollRoot = getWorkspaceScrollRoot(el);

    const checkVisible = () => {
      if (cancelled || !ref.current) return false;
      if (isNearVisible(ref.current, scrollRoot)) {
        mount();
        return true;
      }
      return false;
    };

    if (checkVisible()) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) mount();
      },
      {
        root: scrollRoot,
        rootMargin: `${VISIBILITY_MARGIN_PX}px 0px`,
        threshold: 0,
      },
    );
    io.observe(el);

    const onScroll = () => {
      if (checkVisible()) io.disconnect();
    };
    scrollRoot?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (checkVisible()) io.disconnect();
      });
    });

    const recheckTimer = window.setInterval(() => {
      if (checkVisible()) window.clearInterval(recheckTimer);
    }, 150);
    const stopRecheck = window.setTimeout(() => window.clearInterval(recheckTimer), 3_000);

    scheduleIdleMount(() => {
      if (!cancelled && ref.current && isNearVisible(ref.current, scrollRoot, VISIBILITY_MARGIN_PX)) {
        mount();
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearInterval(recheckTimer);
      window.clearTimeout(stopRecheck);
      io.disconnect();
      scrollRoot?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [forceMount, panelId]);

  return (
    <div ref={ref} className="h-full min-h-0">
      {mounted ? children : <PanelLoadingState label="STANDBY" />}
    </div>
  );
}

/**
 * Defers heavy widget trees until a panel scrolls near the workspace viewport.
 * Execution desk bypasses deferral entirely — panels render on first paint.
 */
export function DeferredPanelContent({
  panelId,
  forceMount,
  deskFocusMode,
  children,
}: DeferredPanelContentProps) {
  if (shouldMountImmediately(panelId, forceMount, deskFocusMode)) {
    return <div className="h-full min-h-0">{children}</div>;
  }

  return (
    <DeferredPanelMount panelId={panelId} forceMount={forceMount}>
      {children}
    </DeferredPanelMount>
  );
}
