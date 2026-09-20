"use client";

import dynamic from "next/dynamic";

/**
 * M2 cinema layer — the tiny mount wrapper (§4 component contract).
 * `ssr:false` keeps ZERO cinema JS in the initial M1 bundle: the heavy
 * orchestrator (GSAP + Lenis + engines, <= 90KB gz total) loads after the
 * M1 content paints. Server Components cannot use ssr:false, hence this
 * client shim — the one sanctioned file split beyond the §4 map.
 */
const Film = dynamic(() => import("./film").then((m) => ({ default: m.Film })), {
  ssr: false,
});

export function CinemaFilm() {
  return <Film />;
}
