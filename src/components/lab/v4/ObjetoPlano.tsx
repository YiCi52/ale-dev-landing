"use client";

import { useEffect, useRef } from "react";

import { aPantalla, observarProgreso, pintarCubriendo, precargar, rutasSecuencia, sinMovimiento } from "./scroll";

/*
  Remate de la intro (referencia: animejs.com): la muestra de materiales gira con
  el scroll, sus capas se separan y el render se convierte en su plano de líneas.
  Las líneas guía apuntan a lo que trae cada sitio. Cuadros pre-renderizados en
  Blender (scripts/v4/objeto_plano.py); anclas.json trae dónde cae cada punto.
*/
const N = 90;
const BASE = "/lab/v4/objeto";
const ETIQUETAS: { id: string; texto: string; lado: "izq" | "der"; y: number }[] = [
  { id: "diseno", texto: "Diseño a la medida de tu obra", lado: "der", y: 0.2 },
  { id: "recorrido", texto: "Recorrido de cada proyecto", lado: "izq", y: 0.24 },
  { id: "formulario", texto: "Formulario que filtra", lado: "der", y: 0.5 },
  { id: "aviso", texto: "Aviso inmediato a tu correo", lado: "der", y: 0.78 },
  { id: "respaldo", texto: "Respaldo semanal de cada consulta", lado: "izq", y: 0.72 },
];
type Anclas = Record<string, Record<string, [number, number]>>;

function dibujarGuias(svg: SVGSVGElement, lienzo: HTMLCanvasElement, img: HTMLImageElement | undefined, fila: Record<string, [number, number]>, mostrar: number) {
  const w = lienzo.clientWidth;
  const h = lienzo.clientHeight;
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  ETIQUETAS.forEach((e) => {
    const linea = svg.querySelector<SVGPolylineElement>(`[data-g="${e.id}"]`);
    const texto = svg.querySelector<SVGTextElement>(`[data-t="${e.id}"]`);
    if (!linea || !texto || !fila[e.id]) return;
    const [ax, ay] = aPantalla(lienzo, img, fila[e.id][0], fila[e.id][1]);
    const tx = e.lado === "der" ? w * 0.72 : w * 0.28;
    const ty = h * e.y;
    linea.setAttribute("points", `${ax},${ay} ${tx},${ty} ${tx + (e.lado === "der" ? 18 : -18)},${ty}`);
    linea.style.strokeDashoffset = String(1 - mostrar);
    texto.setAttribute("x", String(tx + (e.lado === "der" ? 26 : -26)));
    texto.setAttribute("y", String(ty + 4));
    texto.setAttribute("text-anchor", e.lado === "der" ? "start" : "end");
    texto.style.opacity = String(Math.max(0, (mostrar - 0.4) / 0.6));
  });
}

export function ObjetoPlano() {
  const seccion = useRef<HTMLElement>(null);
  const render = useRef<HTMLCanvasElement>(null);
  const lineas = useRef<HTMLCanvasElement>(null);
  const guias = useRef<SVGSVGElement>(null);
  const lista = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = seccion.current;
    if (!el || !render.current || !lineas.current || !guias.current) return;
    const cR = render.current, cL = lineas.current, svg = guias.current;
    let anclas: Anclas = {};
    let p = sinMovimiento() ? 1 : 0;
    const pintar = () => {
      const f = Math.min(N, Math.max(1, Math.round(1 + p * (N - 1))));
      pintarCubriendo(cR, imgsR[f - 1]);
      pintarCubriendo(cL, imgsL[f - 1]);
      const plano = Math.min(1, Math.max(0, (p - 0.62) / 0.28)); // el render se vuelve plano en el último tercio
      cR.style.opacity = String(1 - plano * 0.92);
      cL.style.opacity = String(plano);
      if (anclas[f]) dibujarGuias(svg, cR, imgsR[f - 1], anclas[f], plano);
      if (lista.current) lista.current.style.opacity = String(Math.max(0, (plano - 0.4) / 0.6));
    };
    const imgsR = precargar(rutasSecuencia(BASE, "render", N), (i) => i === 0 && pintar());
    const imgsL = precargar(rutasSecuencia(BASE, "lineas", N), () => undefined);
    fetch(`${BASE}/anclas.json`).then((r) => r.json()).then((j: Anclas) => { anclas = j; pintar(); }).catch(() => undefined);
    if (sinMovimiento()) { pintar(); return; }
    return observarProgreso(el, (v) => { p = v; pintar(); });
  }, []);

  return (
    <section ref={seccion} aria-labelledby="v4-plano-titulo" className="relative h-[300vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <h2 id="v4-plano-titulo" className="v4-mono absolute left-4 top-24 z-10 sm:left-12">
          Piedra · nogal · cuarzo — y lo que hay debajo
        </h2>
        <canvas ref={render} className="absolute inset-0 h-full w-full" aria-hidden />
        <canvas ref={lineas} className="absolute inset-0 h-full w-full opacity-0" aria-hidden />
        <svg ref={guias} className="absolute inset-0 hidden h-full w-full lg:block" role="img" aria-label="Lo que trae cada sitio: diseño a la medida, recorrido de cada proyecto, formulario que filtra, aviso inmediato a tu correo y respaldo semanal.">
          {ETIQUETAS.map((e) => (
            <g key={e.id}>
              <polyline data-g={e.id} pathLength={1} fill="none" stroke="var(--veta-oro)" strokeWidth={1} strokeDasharray="1" strokeDashoffset="1" />
              <text data-t={e.id} fill="var(--cuarzo-50)" opacity={0} style={{ font: "400 11px var(--font-geist-mono)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                {e.texto}
              </text>
            </g>
          ))}
        </svg>
        {/* En celular no caben las guías a los lados: la misma información va como lista debajo del plano */}
        <ol ref={lista} className="v4-mono absolute inset-x-4 bottom-10 grid gap-2 opacity-0 lg:hidden" style={{ color: "var(--cuarzo-50)" }}>
          {ETIQUETAS.map((e, i) => (
            <li key={e.id} className="flex gap-3 border-t pt-2" style={{ borderColor: "var(--linea)" }}>
              <span style={{ color: "var(--veta-oro)" }}>{String(i + 1).padStart(2, "0")}</span>
              {e.texto}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
