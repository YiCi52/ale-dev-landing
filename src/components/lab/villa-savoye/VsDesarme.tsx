"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { VsScene } from "./VsScene";
import type { VsSceneHandle } from "./VsScene";

/*
  El capítulo del desarme: sección pineada de 5 "quintos" — un punto de
  Le Corbusier por quinto. Un solo ScrollTrigger con scrub alimenta la escena
  (progreso 0..1) y el crossfade de las fichas de texto; nada de 5 triggers
  compitiendo. Patrón de ensamblaje por piezas: igloo.inc, aquí en reversa.
  Reduced motion ⇒ sin pin: axonometría explotada estática + los 5 textos
  apilados y legibles (el contenido nunca depende del motion).
*/

const PUNTOS = [
  {
    n: "01",
    titulo: "Los pilotis",
    texto:
      "La casa no toca el suelo: se posa sobre una retícula de columnas delgadas. El jardín sigue de largo por debajo y el terreno queda intacto.",
  },
  {
    n: "02",
    titulo: "La cubierta-jardín",
    texto:
      "El techo no corona: cultiva. La superficie que la casa le quitó al suelo se devuelve arriba, convertida en solárium y jardín.",
  },
  {
    n: "03",
    titulo: "La planta libre",
    texto:
      "Las columnas cargan; los muros ya no. Cada nivel se organiza con libertad total — aquí la planta se extrae como un plano de la carpeta.",
  },
  {
    n: "04",
    titulo: "La ventana corrida",
    texto:
      "Liberada de cargar, la fachada se abre en una cinta continua de vidrio. La luz entra pareja y el paisaje se vuelve panorama.",
  },
  {
    n: "05",
    titulo: "La fachada libre",
    texto:
      "La piel exterior es solo eso: piel. Un plano blanco que compone en libertad, sin estructura a la cual obedecer.",
  },
];

export function VsDesarme() {
  const wrapRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<VsSceneHandle>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    const cards = cardsRef.current;
    if (!wrap || !cards) return;

    gsap.registerPlugin(ScrollTrigger);
    const fichas = Array.from(cards.querySelectorAll<HTMLElement>(".vs-punto"));
    const contador = wrap.querySelector<HTMLElement>(".vs-hud b");

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: "top top",
      end: "+=420%",
      pin: true,
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        sceneRef.current?.setProgress(p);
        // crossfade: la ficha i vive en [i/5,(i+1)/5) con rampas cortas
        fichas.forEach((el, i) => {
          const a = i / 5;
          const b = (i + 1) / 5;
          const enter = gsap.utils.clamp(0, 1, (p - a) / 0.035);
          const exit = i === 4 ? 1 : gsap.utils.clamp(0, 1, (b - p) / 0.035);
          const o = Math.min(enter, exit);
          gsap.set(el, { opacity: o, y: (1 - enter) * 22 });
        });
        if (contador) {
          const idx = Math.min(4, Math.floor(p * 5)) + 1;
          contador.textContent = `0${idx}`;
        }
      },
    });

    // el pin necesita altura estable: recalcular cuando cargan las fuentes
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh);

    return () => {
      st.kill();
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section className="vs-desarme vs-desarme--static" aria-labelledby="vs-desarme-titulo">
        <h2 id="vs-desarme-titulo" className="vs-eyebrow">
          Los cinco puntos, desarmados
        </h2>
        <VsScene isStatic />
        <div className="vs-static-list">
          {PUNTOS.map((p) => (
            <article key={p.n} className="vs-punto vs-punto--static">
              <span className="vs-punto-n">{p.n}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={wrapRef} className="vs-desarme" aria-labelledby="vs-desarme-titulo">
      <h2 id="vs-desarme-titulo" className="vs-visually-hidden">
        Los cinco puntos de la arquitectura moderna, desarmados capa por capa
      </h2>
      <VsScene ref={sceneRef} />
      <div className="vs-hud" aria-hidden="true">
        <b>01</b>
        <i>/ 05</i>
      </div>
      <div ref={cardsRef} className="vs-fichas">
        {PUNTOS.map((p) => (
          <article key={p.n} className="vs-punto">
            <span className="vs-punto-n">{p.n}</span>
            <h3>{p.titulo}</h3>
            <p>{p.texto}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
