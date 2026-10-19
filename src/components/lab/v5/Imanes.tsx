"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/*
  Botones que se acercan al cursor (solo con mouse; con dedo o movimiento reducido no hacen nada). 19-oct (Alejo): más
  suave, el seguimiento fuerte hacía que "Hablemos" y "Ver trabajo" se pisaran: 12 % de la distancia y tope de 5 px.
*/
const RADIO = 36, FUERZA = 0.12, TOPE = 5;   // suave: como mucho 5 px, para que los botones vecinos no se pisen

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
        const mx = Math.max(-TOPE, Math.min(TOPE, dx * FUERZA)), my = Math.max(-TOPE, Math.min(TOPE, dy * FUERZA));
        b.style.translate = dentro ? `${mx.toFixed(1)}px ${my.toFixed(1)}px` : "";
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
