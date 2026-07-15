/**

 * Main workspace scroll performance — freeze live panel repaints while scrolling.

 * Bloomberg-style desks keep the canvas static; data catches up when scroll stops.

 * Server-safe: no React imports (used by StreamProcessingEngine on API routes).

 */



const SCROLL_END_MS = 200;



let scrolling = false;
let lastScrollAt = 0;

let endTimer: ReturnType<typeof setTimeout> | null = null;

const endListeners = new Set<() => void>();

const startListeners = new Set<() => void>();



function notifyStart(): void {

  if (scrolling) return;

  scrolling = true;

  startListeners.forEach((fn) => fn());

}



function notifyEnd(): void {

  scrolling = false;

  endListeners.forEach((fn) => fn());

}



export function isWorkspaceScrolling(): boolean {

  return scrolling;

}



export function lastWorkspaceScrollWithin(ms: number): boolean {

  return Date.now() - lastScrollAt < ms;

}



export function noteWorkspaceScroll(): void {

  notifyStart();

  lastScrollAt = Date.now();

  if (endTimer) clearTimeout(endTimer);

  endTimer = setTimeout(() => {

    endTimer = null;

    notifyEnd();

  }, SCROLL_END_MS);

}



export function onWorkspaceScrollStart(fn: () => void): () => void {

  startListeners.add(fn);

  return () => {

    startListeners.delete(fn);

  };

}



export function onWorkspaceScrollEnd(fn: () => void): () => void {

  endListeners.add(fn);

  return () => {

    endListeners.delete(fn);

  };

}



/** Passive scroll listener + data-eq-scrolling on the scroll root. */

export function attachWorkspaceScrollRoot(el: HTMLElement): () => void {

  const onScroll = () => {

    noteWorkspaceScroll();

    el.dataset.eqScrolling = "1";

  };



  const offEnd = onWorkspaceScrollEnd(() => {

    delete el.dataset.eqScrolling;

  });



  el.addEventListener("scroll", onScroll, { passive: true });

  return () => {

    el.removeEventListener("scroll", onScroll);

    offEnd();

    if (endTimer) clearTimeout(endTimer);

    scrolling = false;

    delete el.dataset.eqScrolling;

  };

}



/**

 * useSyncExternalStore helper — notify only when not scrolling; flush once on scroll end.

 */

/** Restore main desk scroll after layout/grid reflows (retries through RGL paint). */
export function restoreWorkspaceScroll(el: HTMLElement | null, scrollTop: number): void {
  if (!el || scrollTop <= 0) return;
  let attempts = 0;
  const apply = () => {
    el.scrollTop = scrollTop;
    attempts += 1;
    if (attempts < 4 && el.scrollTop < scrollTop - 8) {
      requestAnimationFrame(apply);
    }
  };
  requestAnimationFrame(apply);
}

export function subscribePaused<T>(

  subscribe: (onChange: () => void) => () => void,

  getSnapshot: () => T,

): (onChange: () => void) => () => void {

  return (onChange) => {

    const wrapped = () => {

      if (!scrolling) onChange();

    };

    const unsub = subscribe(wrapped);

    const offEnd = onWorkspaceScrollEnd(onChange);

    return () => {

      unsub();

      offEnd();

    };

  };

}


