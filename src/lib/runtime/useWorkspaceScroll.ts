"use client";



import { useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from "react";

import {

  isWorkspaceScrolling,

  lastWorkspaceScrollWithin,

  onWorkspaceScrollEnd,

  onWorkspaceScrollStart,

  subscribePaused,

} from "@/lib/runtime/workspaceScroll";



export function useWorkspaceScrollPaused(): boolean {

  return useSyncExternalStore(

    (onStoreChange) => {

      const offStart = onWorkspaceScrollStart(onStoreChange);

      const offEnd = onWorkspaceScrollEnd(onStoreChange);

      return () => {

        offStart();

        offEnd();

      };

    },

    () => isWorkspaceScrolling(),

    () => false,

  );

}



export function useScrollPausedSnapshot<T>(

  getSnapshot: () => T,

  subscribe: (onChange: () => void) => () => void,

): T {

  const pausedSubscribe = useCallback(

    (onChange: () => void) => subscribePaused(subscribe, getSnapshot)(onChange),

    [subscribe, getSnapshot],

  );

  return useSyncExternalStore(pausedSubscribe, getSnapshot, getSnapshot);

}



/** Re-apply scroll position after grid reflows unless an explicit desk reset is requested. */
export function useWorkspaceScrollAnchor(
  scrollRef: RefObject<HTMLElement | null>,
): { allowScrollReset: () => void } {
  const scrollTopRef = useRef(0);
  const allowResetRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const sync = () => {
      scrollTopRef.current = el.scrollTop;
    };
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    return () => el.removeEventListener("scroll", sync);
  }, [scrollRef]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (allowResetRef.current) {
      allowResetRef.current = false;
      scrollTopRef.current = el.scrollTop;
    }
  }, [scrollRef]);

  const allowScrollReset = useCallback(() => {
    allowResetRef.current = true;
    scrollTopRef.current = 0;
  }, []);

  return { allowScrollReset };
}



export { isWorkspaceScrolling, lastWorkspaceScrollWithin };

