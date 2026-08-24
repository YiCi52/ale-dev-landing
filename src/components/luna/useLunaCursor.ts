"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/*
  useLunaCursor — la reactividad de fondo pedida por Alejandro (24-ago):

  1. La luna sigue el cursor LEVEMENTE: el puntero escribe un objetivo y un
     rAF lo persigue con lerp (factor bajo = inercia de astro, no de mouse).
     El resultado son dos variables CSS (--mx/--my en -1..1) sobre el
     escenario; el desplazamiento real en px lo decide el CSS.
  2. El cursor sobre el agua es un dedo: al moverse por la banda inferior va
     dejando ondas — anillos elípticos que nacen, se expanden y mueren. Pool
     fijo de nodos reciclados (cero garbage por movimiento), solo transform y
     opacity.

  Touch queda fuera a propósito (el dedo real ya scrollea) y reduced-motion
  apaga todo el sistema.
*/

const POOL = 12;
/** px de recorrido del puntero entre onda y onda */
const PASO_ONDA = 64;
/** fracción de viewport (desde abajo) que cuenta como agua */
const ZONA_AGUA = 0.3;
const LERP = 0.055;

export function useLunaCursor(escenarioRef: RefObject<HTMLElement | null>) {
  const ondasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const escenario = escenarioRef.current;
    const contenedor = ondasRef.current;
    if (!escenario || !contenedor) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // pool de ondas, creado una vez
    const ondas = Array.from({ length: POOL }, () => {
      const o = document.createElement("div");
      o.className = "luna-onda";
      contenedor.appendChild(o);
      return o;
    });
    let ondaIdx = 0;
    let ultimaX = -1;
    let ultimaY = -1;

    // objetivo y estado del lerp de la luna
    let objX = 0;
    let objY = 0;
    let curX = 0;
    let curY = 0;
    let rafId = 0;
    let vivo = false;

    const tick = () => {
      curX += (objX - curX) * LERP;
      curY += (objY - curY) * LERP;
      escenario.style.setProperty("--mx", curX.toFixed(4));
      escenario.style.setProperty("--my", curY.toFixed(4));
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

      // el dedo en el agua: solo si el escenario está en pantalla y el
      // puntero cae en la banda inferior
      const enAgua = e.clientY > window.innerHeight * (1 - ZONA_AGUA);
      if (!enAgua) return;
      const rect = escenario.getBoundingClientRect();
      if (rect.bottom < window.innerHeight || rect.top > 0) return;

      const dist = Math.hypot(e.clientX - ultimaX, e.clientY - ultimaY);
      if (dist < PASO_ONDA) return;
      ultimaX = e.clientX;
      ultimaY = e.clientY;

      const onda = ondas[ondaIdx];
      ondaIdx = (ondaIdx + 1) % POOL;
      onda.style.left = `${e.clientX}px`;
      onda.style.top = `${e.clientY}px`;
      // reinicio de la animación: quitar la clase, forzar reflow, ponerla
      onda.classList.remove("is-viva");
      void onda.offsetWidth;
      onda.classList.add("is-viva");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(rafId);
      for (const o of ondas) o.remove();
    };
  }, [escenarioRef]);

  return ondasRef;
}
