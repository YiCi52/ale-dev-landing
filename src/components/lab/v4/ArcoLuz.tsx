"use client";

import { useEffect, useRef } from "react";

import { sinMovimiento } from "./scroll";

/*
  El arco de luz del hero (Alejo eligió la plantilla 165-5, 14-oct): una línea de luz como
  el halo del eclipse de la galería, que la anuncia. Al cargar se dibuja desde el centro
  hacia los lados; después su punto más brillante sigue al cursor, con un poco de retardo.
  Pantalla ancha: lienzo de 1440 × 900 estirado (el trazo no se deforma). Celular: su propio
  lienzo vertical con sus propios degradados (un SVG oculto no siempre presta los suyos).
*/
type Arco = { cx: number; cy: number; rx: number; ry: number };
// pantalla ancha: lienzo 1440 × 900 estirado; celular: lienzo vertical propio (si no, el arco se vuelve un huevo)
const ANCHO: Arco = { cx: 720, cy: -150, rx: 640, ry: 440 };
const ANGOSTO: Arco = { cx: 195, cy: -150, rx: 290, ry: 430 };

function mitades({ cx, cy, rx, ry }: Arco): string[] {
  const abajo = `${cx},${cy + ry}`;
  return [`M${abajo} A${rx},${ry} 0 0 1 ${cx - rx},${cy}`, `M${abajo} A${rx},${ry} 0 0 0 ${cx + rx},${cy}`];
}

function Trazos({ arco, base, brillo }: { arco: Arco; base: string; brillo: string }) {
  const capas = [
    { clase: "v4-arco-halo", ancho: 36, trazo: `url(#${base})` },
    { clase: "v4-arco-halo-corto", ancho: 9, trazo: `url(#${base})` },
    { clase: "v4-arco-linea", ancho: 1.4, trazo: `url(#${base})` },
    { clase: "v4-arco-linea", ancho: 2.4, trazo: `url(#${brillo})` },
  ];
  return capas.map((capa) =>
    mitades(arco).map((d) => (
      <path key={`${capa.clase}${capa.ancho}${d}`} d={d} className={capa.clase} fill="none" stroke={capa.trazo} strokeWidth={capa.ancho} vectorEffect="non-scaling-stroke" pathLength={1} />
    )),
  );
}

export function ArcoLuz() {
  const svg = useRef<SVGSVGElement>(null);
  const brillo = useRef<SVGRadialGradientElement>(null);

  useEffect(() => {
    const el = svg.current, g = brillo.current;
    if (!el || !g || sinMovimiento()) return;
    let objetivo = ANCHO.cx, actual = ANCHO.cx, raf = 0;
    const paso = () => {
      actual += (objetivo - actual) * 0.08;
      g.setAttribute("cx", actual.toFixed(1));
      raf = Math.abs(objetivo - actual) > 0.5 ? requestAnimationFrame(paso) : 0;
    };
    const mover = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      objetivo = ((e.clientX - r.left) / Math.max(1, r.width)) * 1440;   // solo el arco ancho sigue al cursor
      if (!raf) raf = requestAnimationFrame(paso);
    };
    window.addEventListener("pointermove", mover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", mover);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const base = (id: string) => (
    <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor="#f3f0ea" stopOpacity="0.1" />
      <stop offset="1" stopColor="#f3f0ea" stopOpacity="0.9" />
    </linearGradient>
  );
  return (
    <>
      <svg ref={svg} className="v4-arco v4-arco-ancho" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden>
        <defs>
          <radialGradient ref={brillo} id="v4-arco-brillo" gradientUnits="userSpaceOnUse" cx={ANCHO.cx} cy={ANCHO.cy + ANCHO.ry} r="420">
            <stop offset="0" stopColor="#fffdf7" stopOpacity="1" />
            <stop offset="1" stopColor="#fffdf7" stopOpacity="0" />
          </radialGradient>
          {base("v4-arco-base")}
        </defs>
        <Trazos arco={ANCHO} base="v4-arco-base" brillo="v4-arco-brillo" />
      </svg>
      <svg className="v4-arco v4-arco-angosto" viewBox="0 0 390 844" preserveAspectRatio="xMidYMin slice" aria-hidden>
        <defs>{base("v4-arco-base-m")}</defs>
        <Trazos arco={ANGOSTO} base="v4-arco-base-m" brillo="v4-arco-base-m" />
      </svg>
    </>
  );
}
