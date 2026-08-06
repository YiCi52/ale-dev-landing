"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
  S4 — "Scroll based animations" (@avi_vashishta29): grid editorial oscuro tipo
  catálogo de artistas — columnas a velocidades distintas + reveals con clip-path.
  Nombres inventados (ejemplo vacío).
*/

const COLUMNS: { speed: number; tiles: { hue: number; name: string; dur: string; wide?: boolean }[] }[] = [
  {
    speed: 0.6,
    tiles: [
      { hue: 30, name: "ochenta inviernos", dur: "03:41" },
      { hue: 180, name: "sala vacía", dur: "02:58", wide: true },
      { hue: 84, name: "kiosko", dur: "04:12" },
      { hue: 320, name: "vidrio", dur: "01:47" },
    ],
  },
  {
    speed: 1.15,
    tiles: [
      { hue: 200, name: "noches de junio", dur: "05:03", wide: true },
      { hue: 12, name: "temporal", dur: "03:26" },
      { hue: 250, name: "casi ida", dur: "02:31" },
      { hue: 140, name: "estático", dur: "03:59", wide: true },
    ],
  },
  {
    speed: 0.85,
    tiles: [
      { hue: 48, name: "milimétrico", dur: "02:14" },
      { hue: 275, name: "vaho", dur: "04:47", wide: true },
      { hue: 160, name: "puerto seco", dur: "03:05" },
      { hue: 8, name: "señal", dur: "02:52" },
    ],
  },
  {
    speed: 1.4,
    tiles: [
      { hue: 100, name: "monte", dur: "03:33" },
      { hue: 220, name: "planetario", dur: "02:20" },
      { hue: 340, name: "no tan lejos", dur: "04:01", wide: true },
      { hue: 60, name: "civil", dur: "03:18" },
    ],
  },
];

export function GkGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  // Skeleton loaders (regla @haydenschmitty): shimmer al montar, contenido
  // resolviendo escalonado — nunca pop-in en bloque ni spinner genérico.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setLoaded(true), 1250);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Parallax por columna: cada una viaja distinto contra el mismo scroll.
      section.querySelectorAll<HTMLElement>(".gk-col").forEach((col) => {
        const speed = Number(col.dataset.speed ?? 1);
        gsap.fromTo(
          col,
          { yPercent: speed * 6 },
          {
            yPercent: speed * -14,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.5 },
          }
        );
      });

      // Reveal de cada pieza al entrar en viewport.
      section.querySelectorAll<HTMLElement>(".gk-tile").forEach((tile, i) => {
        gsap.fromTo(
          tile,
          { clipPath: "inset(14% 10% 14% 10% round 6px)", opacity: 0.2, y: 44 },
          {
            clipPath: "inset(0% 0% 0% 0% round 6px)",
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            delay: (i % 4) * 0.06,
            scrollTrigger: { trigger: tile, start: "top 92%" },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="gk-grid-section" ref={sectionRef} aria-label="Grid editorial (demo)">
      <div className="gk-section-head">
        <h2>Catálogo al scroll</h2>
        <span className="gk-eyebrow">columnas a 4 velocidades · skeleton al cargar</span>
      </div>
      <div className="gk-grid">
        {COLUMNS.map((col, ci) => (
          <div className="gk-col" data-speed={col.speed} key={ci}>
            {col.tiles.map((tile, ti) => (
              <figure
                key={tile.name}
                className={tile.wide ? "gk-tile gk-tile--wide" : "gk-tile"}
                data-loaded={loaded}
                style={{
                  background: `linear-gradient(165deg, hsl(${tile.hue} 30% 14%), hsl(${tile.hue} 45% 34%) 70%, hsl(${(tile.hue + 40) % 360} 50% 52%))`,
                  ["--skd" as string]: `${(ci * 4 + ti) * 70}ms`,
                }}
              >
                <figcaption>
                  <span>{tile.name}</span>
                  <span>{tile.dur}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
      <div className="gk-grid-fade" aria-hidden />
    </section>
  );
}
