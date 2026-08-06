"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
  Scroll mantequilla: Lenis interpola la posición de scroll cuadro a cuadro
  (lerp) en vez de saltar con cada tick de la rueda — el "feel" de los sitios
  de referencia. Sincronizado con el ticker de GSAP para que los ScrollTriggers
  escrubeen sobre el valor suavizado. Se apaga con prefers-reduced-motion.
*/

export function GkLenis() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    // Handle para debugging/QA (solo dev): saltos programáticos van por lenis.scrollTo
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
