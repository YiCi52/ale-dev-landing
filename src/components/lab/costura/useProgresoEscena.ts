"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

/*
  useProgresoEscena — una sola fuente de verdad para toda la escena.

  Publica el progreso 0..1 de la sección pegajosa como variable CSS (--p) en el
  propio contenedor. Todos los subsistemas (gato, cristal, portal, proyecto)
  LEEN esa variable; ninguno orquesta a otro. Ese es el requisito de "una sola
  escena, no siete animaciones".

  El progreso sale de la geometría de la sección, no de un IntersectionObserver
  con bandas: así es inmune a los saltos de scroll (rueda rápida, barra
  arrastrada, ancla) — misma lección que useGatoScrub en la rama luna.

  `alPintar` recibe el progreso de cada cuadro. Lo usa la costura para medir el
  destino real en el DOM justo cuando importa.
*/
export function useProgresoEscena(
  ref: RefObject<HTMLElement | null>,
  alPintar?: (p: number) => void,
) {
  useEffect(() => {
    const seccion = ref.current;
    if (!seccion) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Sin recorrido: la escena colapsa a su estado final y el contenido queda
      // disponible. No se esconde nada, se quita el trayecto.
      seccion.style.setProperty("--p", "1");
      alPintar?.(1);
      return;
    }

    let raf = 0;
    const pintar = () => {
      raf = 0;
      const rect = seccion.getBoundingClientRect();
      const recorrido = rect.height - window.innerHeight;
      const p = recorrido <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / recorrido));
      seccion.style.setProperty("--p", p.toFixed(4));
      alPintar?.(p);
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(pintar);
    };

    pintar();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, [ref, alPintar]);
}
