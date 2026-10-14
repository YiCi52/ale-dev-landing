"use client";

import { useEffect, useRef } from "react";

import { observarProgreso, sinMovimiento } from "./scroll";

/*
  Muro de materiales (Alejo eligió la opción A, 14-oct; reemplaza la tira de letras que corría de lado).
  Tres losas de piso a techo —piedra negra, nogal, cuarzo— con una sola frase que las cruza y cambia de color
  según el material que pisa. Con el scroll la frase se revela palabra por palabra y un brillo de pulido recorre
  el muro; después las losas se abren como paneles (piedra a la izquierda, nogal hacia abajo, cuarzo a la derecha).
  Cada losa lleva su propia copia de la frase recortada a su ancho: así la letra se va con su panel al abrirse.
*/
const FRASE = "Sitios que se recorren como tu obra. Cada consulta llega a tu correo.";
const PALABRAS = FRASE.split(" ");
const LOSAS = [
  { id: "piedra", nombre: "Piedra negra", tinta: "var(--cuarzo-50)", sombra: "0 2px 0 rgba(0,0,0,.55), 0 -1px 0 rgba(255,255,255,.05)" },
  { id: "nogal", nombre: "Nogal", tinta: "var(--cuarzo-50)", sombra: "0 2px 0 rgba(0,0,0,.45), 0 -1px 0 rgba(255,255,255,.06)" },
  { id: "cuarzo", nombre: "Cuarzo", tinta: "var(--piedra-950)", sombra: "0 1px 0 rgba(255,255,255,.7), 0 -1px 0 rgba(0,0,0,.08)" },
] as const;
// reparto del scroll: 0–0,5 se escribe la frase · 0,5–0,62 quieta · 0,62–1 el muro se abre
const FIN_FRASE = 0.5, ABRE = 0.62;

export function Muro() {
  const seccion = useRef<HTMLElement>(null);
  const muro = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = seccion.current, m = muro.current;
    if (!el || !m || sinMovimiento()) return;
    const paneles = Array.from(m.querySelectorAll<HTMLElement>("[data-losa]"));
    return observarProgreso(el, (p) => {
      const escribe = Math.min(1, p / FIN_FRASE);
      const abre = Math.min(1, Math.max(0, (p - ABRE) / (1 - ABRE)));
      const e = abre * abre * (3 - 2 * abre);
      m.style.setProperty("--escribe", escribe.toFixed(4));
      m.style.setProperty("--brillo", Math.min(1, p / ABRE).toFixed(4));
      paneles.forEach((pn, i) => {
        const t = i === 1 ? Math.max(0, (e - 0.12) / 0.88) : e;   // el nogal baja un instante después: se lee como puerta
        pn.style.transform = i === 0 ? `translate3d(${-101 * t}%,0,0)` : i === 2 ? `translate3d(${101 * t}%,0,0)` : `translate3d(0,${101 * t}%,0)`;
      });
    });
  }, []);

  return (
    <section ref={seccion} id="v4-muro" aria-label={FRASE} className="v4-muro relative h-[300vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden" style={{ background: "var(--piedra-950)" }}>
        <div ref={muro} className="v4-muro-losas absolute inset-0 grid grid-cols-3" style={{ ["--n" as string]: PALABRAS.length }}>
          {LOSAS.map((l, i) => (
            <div key={l.id} data-losa className="v4-losa relative overflow-hidden" style={{ backgroundImage: `url(/lab/v4/materiales/losa-${l.id}.webp)` }}>
              <p
                aria-hidden
                className="v4-display v4-muro-frase"
                style={{ color: l.tinta, textShadow: l.sombra, left: `calc(${-i * 100}% + var(--margen))` }}
              >
                {PALABRAS.map((w, j) => (
                  <span key={j} style={{ ["--i" as string]: j }}>{w} </span>
                ))}
              </p>
              <span className="v4-mono v4-losa-nombre" style={{ color: l.id === "cuarzo" ? "#55534e" : "var(--apagado)" }}>
                {String(i + 1).padStart(2, "0")} · {l.nombre}
              </span>
              <span className="v4-losa-brillo" aria-hidden />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
