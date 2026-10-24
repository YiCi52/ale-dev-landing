"use client";

import { useEffect, useRef } from "react";

import { observarProgreso, sinMovimiento } from "./scroll";
import { espiral, medirLetras } from "./espiral";
import { TEXTOS, type Idioma } from "./textos";

/*
  "Luz prestada": la idea de la página en un párrafo. 21-oct (Alejo: "que la aparición de las letras sea más inmersiva,
  que aparezca en espiral y se organice"): la sección se queda fija; las letras de la primera frase aparecen girando en
  una espiral alrededor de la luna que no está, y con el scroll cada una se suelta y vuela a su lugar (espiral.ts).
  Con la frase armada, el resto del párrafo se enciende palabra por palabra, con las muestras de los tres materiales
  entre frases (técnica de Zentro: el material como una palabra más).
*/
type Pieza = { t: string } | { muestra: "cuarzo" | "nogal" | "piedra" };

function piezas(idioma: Idioma): Pieza[] {
  const [, b, c, d] = TEXTOS[idioma].manifiesto.partes;
  return [{ muestra: "cuarzo" }, { t: b }, { muestra: "nogal" }, { t: c }, { muestra: "piedra" }, { t: d }];
}

const ARMA = 0.5;   // hasta aquí del recorrido, la frase se arma; después se enciende el resto

export function Manifiesto({ idioma = "es" }: { idioma?: Idioma }) {
  const seccion = useRef<HTMLElement>(null);
  const primera = TEXTOS[idioma].manifiesto.partes[0];

  useEffect(() => {
    const el = seccion.current;
    const fija = el?.querySelector<HTMLElement>(".v5-manifiesto-fija");
    if (!el || !fija || sinMovimiento()) return;
    const letras = Array.from(el.querySelectorAll<HTMLElement>(".v5-letra"));
    const palabras = Array.from(el.querySelectorAll<HTMLElement>(".v5-palabra"));
    el.setAttribute("data-vivo", "");   // primero el modo fijo: las medidas se toman en el lugar donde van a quedar
    let medidas = medirLetras(fija, letras);
    let ultimo = 0;
    const aplicar = (p: number) => {
      ultimo = p;
      espiral(letras, medidas, fija, Math.min(1, p / ARMA));
      const resto = Math.min(1, Math.max(0, (p - ARMA) / (0.92 - ARMA)));
      const encendidas = Math.round(resto * palabras.length);
      palabras.forEach((w, i) => w.toggleAttribute("data-encendida", i < encendidas));
      fija.toggleAttribute("data-armada", p >= ARMA * 0.98);
    };
    const alRedimensionar = () => { medidas = medirLetras(fija, letras); aplicar(ultimo); };
    window.addEventListener("resize", alRedimensionar);
    let vivo = true;
    document.fonts?.ready.then(() => { if (vivo) alRedimensionar(); });
    const quitar = observarProgreso(el, aplicar);
    return () => { vivo = false; quitar(); window.removeEventListener("resize", alRedimensionar); el.removeAttribute("data-vivo"); };
  }, []);

  return (
    <section ref={seccion} className="v5-manifiesto" aria-labelledby="v5-manifiesto-t">
      <div className="v5-manifiesto-fija v5-gutter">
        <p id="v5-manifiesto-t" className="v5-mono mb-10">{TEXTOS[idioma].manifiesto.rotulo}</p>
        <p className="v5-display">
          <span className="sr-only">{primera} </span>
          <span aria-hidden>
            {primera.split(" ").map((w, j) => (
              <span key={j} className="v5-letras-palabra">
                {Array.from(w).map((l, k) => <span key={k} className="v5-letra">{l}</span>)}
              </span>
            ))}
          </span>{" "}
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
      </div>
    </section>
  );
}
