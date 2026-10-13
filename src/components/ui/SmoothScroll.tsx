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

    /*
      13-oct (Alejo): inercia "tipo Apple". `lerp` en vez de `duration`: el scroll se desliza hacia su destino a
      un ritmo constante por cuadro y frena poco a poco, sin tiempos fijos. Solo suaviza rueda y trackpad; en
      pantallas táctiles queda el scroll nativo (que ya trae inercia y se detiene si el dedo se queda quieto).
    */
    const lenis = new Lenis({ lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.9, syncTouch: false });
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
