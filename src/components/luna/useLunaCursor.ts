"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

/*
  useLunaCursor — la luna sigue el cursor LEVEMENTE.

  El puntero escribe un objetivo y un rAF lo persigue con lerp (factor bajo
  = inercia de astro, no de mouse). Las variables (--mx/--my en -1..1) se
  escriben en el WRAPPER .luna y no en el escenario: el reflejo vive en la
  capa fija del mar (LunaMar), que es hermana del escenario, y los vars solo
  bajan por herencia desde el ancestro común.

  Las ondas del dedo viven en LunaMar (existen en toda la página); acá queda
  solo el astro. Touch y reduced-motion apagan el sistema.
*/

const LERP = 0.055;

export function useLunaCursor(escenarioRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const wrapper = escenarioRef.current?.closest<HTMLElement>(".luna");
    if (!wrapper) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let objX = 0;
    let objY = 0;
    let curX = 0;
    let curY = 0;
    let rafId = 0;
    let vivo = false;

    const tick = () => {
      curX += (objX - curX) * LERP;
      curY += (objY - curY) * LERP;
      wrapper.style.setProperty("--mx", curX.toFixed(4));
      wrapper.style.setProperty("--my", curY.toFixed(4));
      // se apaga solo cuando ya llegó — nada de rAF eterno en reposo
      if (Math.abs(objX - curX) + Math.abs(objY - curY) > 0.001) {
        rafId = requestAnimationFrame(tick);
      } else {
        vivo = false;
      }
    };

    const onMove = (e: PointerEvent) => {
      objX = (e.clientX / window.innerWidth) * 2 - 1;
      objY = (e.clientY / window.innerHeight) * 2 - 1;
      if (!vivo) {
        vivo = true;
        rafId = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, [escenarioRef]);
}
