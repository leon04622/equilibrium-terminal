"use client";



import { useEffect, useRef, useState } from "react";



export function bridgeRecognizeRegion<T extends { mode?: string; recognize?: { accept: string[] }; region?: string | null }>(
  step: T | undefined,
): string | null {
  if (!step) return null;
  if (step.mode === "recognize" && step.recognize?.accept.length) {
    return step.recognize.accept[0] ?? step.region ?? null;
  }
  return step.region ?? null;
}

export interface AcademySpotlightRect {

  top: number;

  left: number;

  width: number;

  height: number;

}



export interface AcademyBridgeScrollOptions {

  smooth?: boolean;

}



/** Vertical anchor for spotlight targets — below top coach bar, above workspace bottom. */

export function getAcademyBridgeTargetY(): number {

  if (typeof window === "undefined") return 280;

  const chrome = document.querySelector<HTMLElement>("[data-academy-bridge-chrome]");

  const topInset = chrome ? chrome.getBoundingClientRect().bottom + 28 : 112;

  const bottomInset = Math.min(window.innerHeight * 0.1, 80);

  return topInset + (window.innerHeight - topInset - bottomInset) * 0.38;

}



function findScrollParent(el: HTMLElement): HTMLElement | null {

  let node: HTMLElement | null = el.parentElement;

  while (node) {

    const style = window.getComputedStyle(node);

    const overflowY = style.overflowY;

    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) {

      return node;

    }

    node = node.parentElement;

  }

  return null;

}



function findPanelScrollRoot(el: HTMLElement): HTMLElement | null {

  const panel = el.closest<HTMLElement>("[data-panel-id]");

  if (!panel) return findScrollParent(el);

  if (panel.scrollHeight > panel.clientHeight + 2) return panel;

  return findScrollParent(el) ?? panel;

}



function findWorkspaceScrollRoot(el: HTMLElement): HTMLElement | null {

  return (

    el.closest<HTMLElement>("[data-workspace-scroll]") ??

    document.querySelector<HTMLElement>("[data-workspace-scroll]")

  );

}



function scrollByDelta(

  root: HTMLElement,

  delta: number,

  smooth: boolean,

): void {

  if (Math.abs(delta) < 8) return;

  root.scrollBy({ top: delta, behavior: smooth ? "smooth" : "auto" });

}



/** Scroll bridge target into the visible safe band without fighting workspace scroll. */

export function scrollAcademyBridgeTarget(

  el: HTMLElement | null,

  { smooth = false }: AcademyBridgeScrollOptions = {},

): void {

  if (!el || typeof window === "undefined") return;



  const targetY = getAcademyBridgeTargetY();

  const panel = el.closest<HTMLElement>("[data-panel-id]");

  const workspace = findWorkspaceScrollRoot(el);



  if (workspace && panel) {

    const wsRect = workspace.getBoundingClientRect();

    const panelRect = panel.getBoundingClientRect();

    if (panelRect.bottom < wsRect.top + 56 || panelRect.top > wsRect.bottom - 56) {

      scrollByDelta(workspace, panelRect.top - (wsRect.top + 80), smooth);

    }

  }



  const scrollRoot = findPanelScrollRoot(el);

  if (scrollRoot) {

    const elRect = el.getBoundingClientRect();

    const elCenterY = elRect.top + elRect.height / 2;

    scrollByDelta(scrollRoot, elCenterY - targetY, smooth);

    return;

  }



  const r = el.getBoundingClientRect();

  const elCenterY = r.top + r.height / 2;

  const delta = elCenterY - targetY;

  if (Math.abs(delta) > 10 && (r.top < 48 || r.bottom > window.innerHeight - 48)) {

    window.scrollBy({ top: delta, behavior: smooth ? "smooth" : "auto" });

  }

}



export function useAcademyBridgeSpotlight<TStep extends { mode?: string }>({

  active,

  index,

  step,

  getTargetEl,

  spotlightRegion,

  regionEl,

  panelEl,

}: {

  active: boolean;

  index: number;

  step: TStep | undefined;

  getTargetEl?: (step: TStep | undefined) => HTMLElement | null;

  spotlightRegion?: (step: TStep | undefined) => string | null;

  regionEl?: (region: string | null) => HTMLElement | null;

  panelEl?: () => HTMLElement | null;

}): AcademySpotlightRect | null {

  const [rect, setRect] = useState<AcademySpotlightRect | null>(null);

  const getTargetElRef = useRef(getTargetEl);

  const spotlightRegionRef = useRef(spotlightRegion);

  const regionElRef = useRef(regionEl);

  const panelElRef = useRef(panelEl);

  getTargetElRef.current = getTargetEl;

  spotlightRegionRef.current = spotlightRegion;

  regionElRef.current = regionEl;

  panelElRef.current = panelEl;



  useEffect(() => {

    if (!active) {

      setRect(null);

      return;

    }



    const resolveEl = (): HTMLElement | null => {

      if (getTargetElRef.current) return getTargetElRef.current(step);

      const target = spotlightRegionRef.current?.(step) ?? null;

      return regionElRef.current?.(target) ?? panelElRef.current?.() ?? null;

    };



    const isRecognize = step?.mode === "recognize";

    let raf = 0;

    let settleTimer = 0;

    let smoothTimer = 0;

    const scrollRoots = new Set<HTMLElement>();



    let lastRectKey = "";

    const measure = () => {

      const el = resolveEl();

      if (el) {

        const r = el.getBoundingClientRect();

        if (r.width > 4 && r.height > 4) {

          const key = `${Math.round(r.top)}|${Math.round(r.left)}|${Math.round(r.width)}|${Math.round(r.height)}`;

          if (key === lastRectKey) return;

          lastRectKey = key;

          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });

        } else if (lastRectKey !== "") {

          lastRectKey = "";

          setRect(null);

        }

      } else if (lastRectKey !== "") {

        lastRectKey = "";

        setRect(null);

      }

    };



    const scheduleMeasure = () => {

      cancelAnimationFrame(raf);

      raf = requestAnimationFrame(measure);

    };



    const scrollToTarget = () => {
      const panel = panelElRef.current?.() ?? null;
      if (panel) {
        scrollAcademyBridgeTarget(panel, { smooth: false });
      }
      const target = resolveEl();
      scrollAcademyBridgeTarget(target, { smooth: isRecognize });
      scheduleMeasure();
    };

    scrollToTarget();

    settleTimer = window.setTimeout(scrollToTarget, isRecognize ? 420 : 380);

    if (isRecognize) {
      smoothTimer = window.setTimeout(scrollToTarget, 680);
    }



    const scrollEl = resolveEl();
    const panelRoot = panelElRef.current?.() ?? null;

    if (scrollEl) {
      const panelScroll = findPanelScrollRoot(scrollEl);
      if (panelScroll) scrollRoots.add(panelScroll);
      const workspace = findWorkspaceScrollRoot(scrollEl);
      if (workspace) scrollRoots.add(workspace);
    }
    if (panelRoot) {
      const workspace = findWorkspaceScrollRoot(panelRoot);
      if (workspace) scrollRoots.add(workspace);
    }

    scrollRoots.forEach((root) => root.addEventListener("scroll", scheduleMeasure, { passive: true }));

    window.addEventListener("resize", scheduleMeasure);



    return () => {

      cancelAnimationFrame(raf);

      window.clearTimeout(settleTimer);

      window.clearTimeout(smoothTimer);

      scrollRoots.forEach((root) => root.removeEventListener("scroll", scheduleMeasure));

      window.removeEventListener("resize", scheduleMeasure);

    };

  }, [active, index, step]);



  return rect;

}


