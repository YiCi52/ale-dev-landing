"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/*
  Botones que se acercan al cursor (solo con mouse; con dedo o movimiento reducido no hacen nada). Un único listener en
  la ventana busca el botón más cercano dentro de 80 px y lo corre hasta un 30 % de la distancia; al salir vuelve.
*/
const RADIO = 80, FUERZA = 0.3;

export function Imanes() {
  const ruta = usePathname();
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const botones = Array.from(document.querySelectorAll<HTMLElement>(".v5-boton, .v5-nav-hablemos"));
    let pendiente = 0, ex = 0, ey = 0;
    const mover = () => {
      pendiente = 0;
      for (const b of botones) {
        const r = b.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = ex - cx, dy = ey - cy, d = Math.hypot(dx, dy);
        const dentro = d < RADIO + Math.max(r.width, r.height) / 2;
        b.style.translate = dentro ? `${(dx * FUERZA).toFixed(1)}px ${(dy * FUERZA).toFixed(1)}px` : "";
      }
    };
    const alMover = (e: PointerEvent) => { ex = e.clientX; ey = e.clientY; if (!pendiente) pendiente = requestAnimationFrame(mover); };
    window.addEventListener("pointermove", alMover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", alMover);
      cancelAnimationFrame(pendiente);
      for (const b of botones) b.style.translate = "";
    };
  }, [ruta]);
  return null;
}
