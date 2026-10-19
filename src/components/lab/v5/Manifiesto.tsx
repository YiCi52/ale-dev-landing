"use client";

import { useEffect, useRef } from "react";

import { observarProgreso, sinMovimiento } from "./scroll";
import { TEXTOS, type Idioma } from "./textos";

/*
  "Luz prestada": la idea de la página en un párrafo. Las palabras se encienden con el scroll, como la fachada cuando
  sale la luna, y entre ellas hay muestras de los tres materiales (técnica de Zentro: el material como una palabra más).
*/
type Pieza = { t: string } | { muestra: "cuarzo" | "nogal" | "piedra" };

function piezas(idioma: Idioma): Pieza[] {
  const [a, b, c, d] = TEXTOS[idioma].manifiesto.partes;
  return [{ t: a }, { muestra: "cuarzo" }, { t: b }, { muestra: "nogal" }, { t: c }, { muestra: "piedra" }, { t: d }];
}

export function Manifiesto({ idioma = "es" }: { idioma?: Idioma }) {
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
      <p id="v5-manifiesto-t" className="v5-mono mb-10">{TEXTOS[idioma].manifiesto.rotulo}</p>
      <p className="v5-display">
        {piezas(idioma).map((pieza, i) =>
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
