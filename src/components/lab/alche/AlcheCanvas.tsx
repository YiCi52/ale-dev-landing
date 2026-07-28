"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { AlcheObject } from "./AlcheObject";
import { alcheScroll } from "./scroll-store";

/**
 * Canvas WebGL fijo detrás del contenido HTML.
 *
 * Es un solo canvas para todo el documento: el mismo objeto acompaña al scroll
 * y cambia de material por sección, que es justamente el patrón del sitio de
 * referencia (un objeto, muchos estados) en vez de una escena por sección.
 */
export function AlcheCanvas() {
  const isReducedMotion = useReducedMotion();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    const updateProgress = () => {
      const scrollable = document.body.scrollHeight - window.innerHeight;
      alcheScroll.progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    };

    const updatePointer = (event: PointerEvent) => {
      alcheScroll.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      alcheScroll.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    window.addEventListener("pointermove", updatePointer, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      window.removeEventListener("pointermove", updatePointer);
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div className="alche-canvas" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 38 }}
        // Tope 1.6 en vez de 2: a dpr 2 en pantalla grande son ~5M de píxeles
        // por frame con material iridiscente + clearcoat. La diferencia visual
        // es imperceptible; la de coste, no.
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
      >
        <AlcheObject isReducedMotion={isReducedMotion} />
      </Canvas>
    </div>
  );
}
