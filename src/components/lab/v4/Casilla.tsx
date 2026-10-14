"use client";

import { useEffect, useRef } from "react";

import { observarProgreso, sinMovimiento } from "./scroll";

/*
  Pitch B, de prueba (Alejo, 14-oct: "prueba la B también"). Referencias: Fiddle ("DESIGN THAT ___") y StringTune.
  Una sola línea grande dentro de una casilla quieta: dos líneas verticales doradas a los lados, un contador
  "01 / 03" y una línea de progreso. Al cruzar cada tercio del scroll, las letras de la frase salen hacia arriba
  y entran las de la siguiente con un desfase corto por letra; al subir, se deshace. Nada más se mueve.
*/
const FRASES = ["Diseño a la medida de tu obra.", "Cada proyecto se recorre.", "Cada consulta llega a tu correo."];

export function Casilla() {
  const seccion = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = seccion.current;
    if (!el || sinMovimiento()) return;
    const frases = Array.from(el.querySelectorAll<HTMLElement>("[data-frase]"));
    const contador = el.querySelector<HTMLElement>("[data-contador]");
    const barra = el.querySelector<HTMLElement>("[data-barra]");
    let actual = -1;
    return observarProgreso(el, (p) => {
      const i = Math.min(FRASES.length - 1, Math.floor(p * FRASES.length));
      if (barra) barra.style.transform = `scaleX(${p.toFixed(4)})`;
      if (i === actual) return;
      const baja = i > actual;
      frases.forEach((f, k) => {
        f.dataset.estado = k === i ? "dentro" : k < i ? "arriba" : "abajo";
        // si se sube, las letras salen hacia abajo: el movimiento sigue la dirección del scroll
        if (!baja && k > i) f.dataset.estado = "abajo";
      });
      if (contador) contador.textContent = `${String(i + 1).padStart(2, "0")} / ${String(FRASES.length).padStart(2, "0")}`;
      actual = i;
    });
  }, []);

  return (
    <section ref={seccion} id="v4-casilla" aria-label="Lo que hago" className="v4-casilla relative h-[300svh]">
      <div className="v4-casilla-fija sticky top-0 flex h-[100svh] flex-col items-center justify-center px-4">
        <div className="v4-casilla-caja">
          {FRASES.map((f, k) => (
            <p key={f} data-frase data-estado={k === 0 ? "dentro" : "abajo"} className="v4-display v4-casilla-frase" aria-hidden={k !== 0}>
              {f.split("").map((c, j) => (
                <span key={j} style={{ ["--j" as string]: j }}>{c === " " ? " " : c}</span>
              ))}
            </p>
          ))}
        </div>
        <div className="mt-10 flex w-[min(560px,80vw)] items-center gap-4">
          <span data-contador className="v4-mono" style={{ color: "var(--veta-oro)" }}>01 / 03</span>
          <span className="relative h-px flex-1" style={{ background: "var(--linea)" }}>
            <span data-barra className="absolute inset-0 origin-left" style={{ background: "var(--veta-oro)", transform: "scaleX(0)" }} />
          </span>
        </div>
        <ul className="sr-only">{FRASES.map((f) => <li key={f}>{f}</li>)}</ul>
      </div>
    </section>
  );
}
