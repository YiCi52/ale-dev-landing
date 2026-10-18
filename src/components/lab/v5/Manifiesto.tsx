"use client";

import { useEffect, useRef } from "react";

import { observarProgreso, sinMovimiento } from "./scroll";

/*
  "Luz prestada": la idea de la página en un párrafo. Las palabras se encienden con el scroll, como la fachada cuando
  sale la luna, y entre ellas hay muestras de los tres materiales (técnica de Zentro: el material como una palabra más).
*/
type Pieza = { t: string } | { muestra: "cuarzo" | "nogal" | "piedra" };

const TEXTO: Pieza[] = [
  { t: "La luna no tiene luz propia." }, { muestra: "cuarzo" },
  { t: "Toma la del sol y la devuelve, para que de noche se vea lo que hay." }, { muestra: "nogal" },
  { t: "Eso hacemos con tu obra: la mostramos como es y, cuando alguien la ve y quiere la suya," }, { muestra: "piedra" },
  { t: "te avisa." },
];

export function Manifiesto() {
  const seccion = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = seccion.current;
    if (!el || sinMovimiento()) return;
    const palabras = Array.from(el.querySelectorAll<HTMLElement>(".v5-palabra"));
    return observarProgreso(el, (p) => {
      // el párrafo termina de encenderse cuando la sección va en el 70 % de su paso
      const encendidas = Math.round(Math.min(1, Math.max(0, (p - 0.05) / 0.65)) * palabras.length);
      palabras.forEach((w, i) => w.toggleAttribute("data-encendida", i < encendidas));
    });
  }, []);

  return (
    <section ref={seccion} className="v5-manifiesto v5-gutter" aria-labelledby="v5-manifiesto-t">
      <p id="v5-manifiesto-t" className="v5-mono mb-10">Luz prestada</p>
      <p className="v5-display">
        {TEXTO.map((pieza, i) =>
          "muestra" in pieza ? (
            <span key={i} className="v5-muestra" aria-hidden style={{ backgroundImage: `url(/lab/v5/materiales/${pieza.muestra}.webp)` }} />
          ) : (
            pieza.t.split(" ").map((w, j) => (
              <span key={`${i}-${j}`}>
                <span className="v5-palabra">{w}</span>{" "}
              </span>
            ))
          ),
        )}
      </p>
    </section>
  );
}
