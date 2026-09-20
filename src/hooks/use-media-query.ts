"use client";

import { useEffect, useState } from "react";

/** Subscribe to a CSS media query. Defaults to `false` until mounted (SSR-safe). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** Tailwind `sm` breakpoint and up (640px). */
export function useIsSmUp(): boolean {
  return useMediaQuery("(min-width: 640px)");
}
