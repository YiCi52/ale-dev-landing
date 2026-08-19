"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import type { PromenadeRig } from "./promenadeRig";
import { VsToggleNoche } from "./VsToggleNoche";

/*
  LA PROMENADE ARCHITECTURALE — el tour interior. Le Corbusier diseñó la
  Savoye para recorrerse en pendiente continua: aquí el scroll ES la rampa.
  La cámara y sus curvas viven en promenadeRig (import dinámico al entrar
  en viewport, ronda 2b); este componente maneja el ScrollTrigger, las
  fichas y el estado reduced-motion. El modelo es el MISMO del desarme,
  ensamblado (progreso 0 = home).
*/

const PARADAS = [
  {
    n: "I",
    titulo: "El umbral",
    texto: "Se llega por debajo de la casa. El vestíbulo curvo de vidrio verde recibe entre los pilotis — la puerta está donde llega el auto.",
  },
  {
    n: "II",
    titulo: "La rampa",
    texto: "Nada de escaleras como protagonista: una pendiente suave que se sube caminando sin pensar. La casa se revela en movimiento, no en fotos.",
  },
  {
    n: "III",
    titulo: "El salón y la terraza",
    texto: "La vidriera abre el salón; la ventana corrida vuelve el paisaje un panorama. Y al cruzar el corredor, la terraza: un cuarto sin techo, a cielo abierto.",
  },
  {
    n: "IV",
    titulo: "El solárium",
    texto: "La promenade termina en el cielo: las pantallas curvas enmarcan el sol. El techo devuelve el jardín que la casa tomó prestado.",
  },
];

export function VsPromenade() {
  const wrapRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const host = hostRef.current;
    const cards = cardsRef.current;
    if (!wrap || !host) return;

    const progressRef = { current: reduced ? 0.62 : 0 }; // estático: parada del salón
    let rig: PromenadeRig | null = null;
    let alive = true;
    let visible = false;
    const mount = async () => {
      const { mountPromenade } = await import("./promenadeRig");
      if (!alive || !visible || rig) return;
      rig = mountPromenade(host, () => progressRef.current);
    };
    const unmount = () => {
      rig?.dispose();
      rig = null;
    };
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        if (visible) void mount();
        else unmount();
      },
      { rootMargin: "20% 0px" },
    );
    io.observe(host);

    let st: ScrollTrigger | undefined;
    if (!reduced && cards) {
      gsap.registerPlugin(ScrollTrigger);
      const fichas = Array.from(cards.querySelectorAll<HTMLElement>(".vs-punto"));
      const contador = wrap.querySelector<HTMLElement>(".vs-hud b");
      st = ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "+=380%",
        pin: true,
        scrub: 0.7,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          rig?.markDirty();
          fichas.forEach((el, i) => {
            const a = i / 4;
            const b = (i + 1) / 4;
            const enter = gsap.utils.clamp(0, 1, (self.progress - a) / 0.03);
            const exit = i === 3 ? 1 : gsap.utils.clamp(0, 1, (b - self.progress) / 0.03);
            const o = Math.min(enter, exit);
            gsap.set(el, { opacity: o, y: (1 - enter) * 22 });
          });
          if (contador) contador.textContent = ["I", "II", "III", "IV"][Math.min(3, Math.floor(self.progress * 4))];
        },
      });
      if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => {
      st?.kill();
      alive = false;
      io.disconnect();
      unmount();
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section ref={wrapRef} className="vs-desarme vs-desarme--static" aria-labelledby="vs-prom-titulo">
        <h2 id="vs-prom-titulo" className="vs-eyebrow">
          La promenade, por dentro
        </h2>
        <div ref={hostRef} className="vs-scene" aria-hidden="true" />
        <div className="vs-static-list">
          {PARADAS.map((p) => (
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
    <section ref={wrapRef} className="vs-desarme vs-promenade" aria-labelledby="vs-prom-titulo">
      <h2 id="vs-prom-titulo" className="vs-visually-hidden">
        La promenade architecturale: el recorrido interior de la casa
      </h2>
      <div ref={hostRef} className="vs-scene" aria-hidden="true" />
      <div className="vs-hud">
        <VsToggleNoche />
        <span aria-hidden="true">
          <b>I</b>
          <i>/ IV</i>
        </span>
      </div>
      <div ref={cardsRef} className="vs-fichas">
        {PARADAS.map((p) => (
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
