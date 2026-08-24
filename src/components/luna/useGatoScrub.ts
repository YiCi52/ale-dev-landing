"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

/*
  useGatoScrub — el gato camina CON el scroll, no entre beats.

  La versión anterior saltaba de posición en posición con un ease de 1.8s:
  se sentía teletransportado. Ahora la posición sale del PROGRESO continuo
  de la narrativa (0..1), así el gato avanza y retrocede exactamente con la
  rueda — parar a mitad de camino lo deja a mitad de camino.

  El camino es una lista de puntos (x en %, y en svh desde abajo, escala) y
  se interpola linealmente por tramos. Mientras hay desplazamiento real el
  gato "camina" (clase is-caminando = bob de pasos en CSS) y mira hacia
  donde va (scaleX invertido al ir a la izquierda). Al detenerse, se sienta
  quieto y la cola sigue viva.
*/

type Punto = { p: number; x: number; y: number; s: number };

/* la orilla de ida, y el giro final hacia el reflejo (entra al agua) */
const CAMINO: Punto[] = [
  { p: 0.0, x: 14, y: 29, s: 1 },
  { p: 0.2, x: 26, y: 29, s: 1 },
  { p: 0.4, x: 38, y: 29, s: 0.97 },
  { p: 0.6, x: 58, y: 29, s: 0.94 },
  { p: 0.8, x: 70, y: 29, s: 0.9 },
  { p: 0.92, x: 56, y: 25, s: 0.76 },
  { p: 1.0, x: 50, y: 20, s: 0.6 },
];

/** progreso de un scroll pegajoso: 0 cuando arranca, 1 cuando el último
    tramo llegó al viewport. Exportado: el beat activo también se deriva de
    acá (round(prog × beats)) — a diferencia del IO con banda central, el
    progreso es inmune a saltos de scroll (lección RevealV2). */
export function progresoDe(section: HTMLElement): number {
  const rect = section.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, -rect.top / total));
}

function puntoEn(prog: number): Punto {
  let a = CAMINO[0];
  for (const b of CAMINO) {
    if (prog <= b.p) {
      const rango = b.p - a.p || 1;
      const t = (prog - a.p) / rango;
      return {
        p: prog,
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        s: a.s + (b.s - a.s) * t,
      };
    }
    a = b;
  }
  return CAMINO[CAMINO.length - 1];
}

export function useGatoScrub(
  escenarioRef: RefObject<HTMLElement | null>,
  gatoRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const escenario = escenarioRef.current;
    const gato = gatoRef.current;
    if (!escenario || !gato) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ultimaX = -1;
    let mirando = 1;
    let quietudId = 0;
    let rafId = 0;
    let pedido = false;

    const pintar = () => {
      pedido = false;
      const punto = puntoEn(progresoDe(escenario));
      gato.style.left = `${punto.x}%`;
      gato.style.bottom = `${punto.y}svh`;

      const dx = ultimaX < 0 ? 0 : punto.x - ultimaX;
      ultimaX = punto.x;
      if (Math.abs(dx) > 0.01) mirando = dx >= 0 ? 1 : -1;
      gato.style.transform = `translateX(-50%) scale(${punto.s}) scaleX(${mirando})`;

      if (!quieto && Math.abs(dx) > 0.01) {
        gato.classList.add("is-caminando");
        window.clearTimeout(quietudId);
        quietudId = window.setTimeout(
          () => gato.classList.remove("is-caminando"),
          160,
        );
      }
    };

    const onScroll = () => {
      if (pedido) return;
      pedido = true;
      rafId = requestAnimationFrame(pintar);
    };

    pintar();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(quietudId);
      cancelAnimationFrame(rafId);
    };
  }, [escenarioRef, gatoRef]);
}
