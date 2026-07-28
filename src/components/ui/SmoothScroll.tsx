"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Smooth scroll global (Lenis). Es el "pegamento" premium del norte visual.
 * Respeta reduced-motion: si está activo, no inicializa el JS y el scroll
 * queda nativo. Ver reference_visual_north_star.
 *
 * También puentea Lenis con GSAP ScrollTrigger: sin sincronizar `ScrollTrigger.update`
 * al scroll de Lenis, los efectos scrub (ScrollFloat) van desfasados del scroll real.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ duration: 1.1 });
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, []);

  return null;
}
