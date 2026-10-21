"use client";

import { useEffect, useRef } from "react";

import { sinMovimiento } from "./scroll";

/*
  Letras revueltas (Alejo, 20-oct: "cuando pasas el cursor las letras están aleatorias y ya pasa a sus letras normales").
  Al entrar el cursor en la fila que lo contiene (`disparador`), cada letra muestra caracteres al azar y se asienta en
  orden, de izquierda a derecha. El texto real queda en aria-label: el lector de pantalla no oye el revoltijo.
*/
const SIGNOS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=/<>";
const PASO_MS = 38;        // cada letra se asienta este tiempo después de la anterior
const VUELTAS_MS = 260;    // cuánto revuelve la primera letra antes de asentarse

export function Revuelto({ texto, disparador }: { texto: string; disparador: string }) {
  const caja = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = caja.current;
    const fila = el?.closest<HTMLElement>(disparador);
    if (!el || !fila || sinMovimiento()) return;
    let cuadro = 0;
    const revolver = () => {
      cancelAnimationFrame(cuadro);
      // el ancho queda fijo mientras revuelve: los signos al azar no empujan el renglón
      if (!el.style.width) { el.style.display = "inline-block"; el.style.whiteSpace = "nowrap"; el.style.width = `${el.offsetWidth}px`; }
      const inicio = performance.now();
      const paso = (ahora: number) => {
        const t = ahora - inicio;
        let listo = true;
        el.textContent = Array.from(texto, (letra, i) => {
          if (letra === " " || t >= VUELTAS_MS + i * PASO_MS) return letra;
          listo = false;
          const signo = SIGNOS[Math.floor(Math.random() * SIGNOS.length)];
          return letra === letra.toLowerCase() ? signo.toLowerCase() : signo;
        }).join("");
        if (listo) { el.style.width = ""; el.style.display = ""; el.style.whiteSpace = ""; }
        cuadro = listo ? 0 : requestAnimationFrame(paso);
      };
      cuadro = requestAnimationFrame(paso);
    };
    fila.addEventListener("pointerenter", revolver);
    return () => { fila.removeEventListener("pointerenter", revolver); cancelAnimationFrame(cuadro); el.textContent = texto; };
  }, [texto, disparador]);

  return <span ref={caja} aria-hidden>{texto}</span>;
}
