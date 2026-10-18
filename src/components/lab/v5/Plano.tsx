"use client";

import { useEffect, useRef } from "react";

import { observarProgreso, sinMovimiento } from "./scroll";
import { ANCLAS_FINAL } from "./anclas";

/*
  "Por dentro": el mismo último cuadro del hero se apaga y queda su dibujo de líneas (Freestyle, misma cámara), el idioma
  del arquitecto. Luego se encienden las llamadas: cada parte de la casa señala una parte del sistema. Las anclas salen de
  Blender (posición en pantalla de cada punto en el cuadro 120), así la línea toca exactamente la celosía, la isla, etc.
*/
type Llamada = { id: keyof typeof ANCLAS_FINAL; titulo: string; texto: string; dx: number; dy: number };

const LLAMADAS: Llamada[] = [
  { id: "proyectos", titulo: "Proyectos", texto: "Fotos, planos y ficha técnica de cada obra.", dx: 0.06, dy: -0.2 },
  { id: "recorrido", titulo: "Recorridos", texto: "La obra a pantalla completa, para caminarla antes de llamarte.", dx: -0.12, dy: -0.14 },
  { id: "formulario", titulo: "Formulario", texto: "Pregunta lo que tú preguntarías: tipo de proyecto, metros, presupuesto, fecha.", dx: -0.16, dy: 0.17 },
  { id: "aviso", titulo: "Aviso", texto: "Cada consulta llega a tu WhatsApp en el mismo minuto.", dx: 0.16, dy: 0.12 },
  { id: "respaldo", titulo: "Respaldo", texto: "Copia semanal y datos tratados según la Ley 1581.", dx: 0.02, dy: 0.13 },
];

/** Convierte una posición 0–1 de la imagen (16:9, recortada como cover) a 0–1 del contenedor. */
function enContenedor(x: number, y: number, w: number, h: number): [number, number] {
  const escala = Math.max(w / 16, h / 9), dw = 16 * escala, dh = 9 * escala;
  return [((w - dw) / 2 + x * dw) / w, ((h - dh) / 2 + y * dh) / h];
}

export function Plano() {
  const seccion = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = seccion.current;
    if (!el) return;
    const render = el.querySelector<HTMLImageElement>(".v5-plano-render");
    const lineas = el.querySelector<HTMLImageElement>(".v5-plano-lineas");
    const llamadas = Array.from(el.querySelectorAll<HTMLElement>(".v5-llamada"));
    const items = Array.from(el.querySelectorAll<HTMLElement>(".v5-plano-lista li"));
    const trazos = Array.from(el.querySelectorAll<SVGLineElement>(".v5-plano-svg line"));
    const puntos = Array.from(el.querySelectorAll<SVGCircleElement>(".v5-plano-svg circle"));
    const fija = el.querySelector<HTMLElement>(".v5-plano-fija");

    const ubicar = () => {
      if (!fija) return;
      const w = fija.clientWidth, h = fija.clientHeight;
      LLAMADAS.forEach((ll, i) => {
        const [ax, ay] = enContenedor(...(ANCLAS_FINAL[ll.id] as [number, number]), w, h);
        const lx = Math.min(0.86, Math.max(0.04, ax + ll.dx)), ly = Math.min(0.9, Math.max(0.3, ay + ll.dy));
        puntos[i]?.setAttribute("cx", `${ax * 100}%`); puntos[i]?.setAttribute("cy", `${ay * 100}%`);
        trazos[i]?.setAttribute("x1", `${ax * 100}%`); trazos[i]?.setAttribute("y1", `${ay * 100}%`);
        trazos[i]?.setAttribute("x2", `${lx * 100}%`); trazos[i]?.setAttribute("y2", `${ly * 100}%`);
        const c = llamadas[i];
        if (c) {
          // la etiqueta va del lado de la línea, salvo que no quepa: entonces se voltea al otro lado
          const ancho = c.offsetWidth + 8, margen = 16;
          const izquierda = lx < ax ? lx * w - ancho >= margen : lx * w + ancho > w - margen;
          c.style.left = `${lx * 100}%`; c.style.top = `${ly * 100}%`;
          c.style.transform = `translate(${izquierda ? "calc(-100% - 8px)" : "8px"}, -50%)`;
        }
      });
    };
    ubicar();
    window.addEventListener("resize", ubicar);

    const aplicar = (p: number) => {
      const apaga = Math.min(1, Math.max(0, (p - 0.04) / 0.26));            // el render se apaga
      const dibuja = Math.min(1, Math.max(0, (p - 0.12) / 0.24));           // el dibujo aparece
      if (render) render.style.filter = `brightness(${1 - 0.86 * apaga}) saturate(${1 - apaga})`;
      if (lineas) lineas.style.opacity = String(dibuja);
      LLAMADAS.forEach((_, i) => {
        const on = p > 0.38 + i * 0.09;
        llamadas[i]?.toggleAttribute("data-visible", on);
        items[i]?.toggleAttribute("data-visible", on);
        const t = trazos[i];
        if (t) { t.style.strokeDasharray = "1"; t.style.strokeDashoffset = on ? "0" : "1"; t.style.opacity = on ? "1" : "0"; }
        puntos[i]?.setAttribute("r", on ? "3.5" : "0");
      });
    };
    const quitar = sinMovimiento() ? (aplicar(1), () => {}) : observarProgreso(el, aplicar);
    return () => { quitar(); window.removeEventListener("resize", ubicar); };
  }, []);

  return (
    <section ref={seccion} className="v5-plano" aria-labelledby="v5-plano-t">
      <div className="v5-plano-fija">
        {/* eslint-disable-next-line @next/next/no-img-element -- último cuadro del hero (misma cámara) */}
        <img src="/lab/v5/casa/1440/c-120.webp" alt="" className="v5-plano-capa v5-plano-render" loading="lazy" />
        {/* eslint-disable-next-line @next/next/no-img-element -- dibujo de líneas de la misma vista */}
        <img src="/lab/v5/casa/lineas.webp" alt="" className="v5-plano-capa v5-plano-lineas" loading="lazy" style={{ opacity: 0 }} />
        <svg className="v5-plano-svg" aria-hidden>
          {LLAMADAS.map((ll) => (
            <g key={ll.id}>
              <line pathLength={1} style={{ opacity: 0, transition: "stroke-dashoffset 500ms cubic-bezier(0.23,1,0.32,1), opacity 200ms ease" }} />
              <circle r="0" style={{ transition: "r 300ms ease" }} />
            </g>
          ))}
        </svg>
        <div className="v5-plano-titulo v5-gutter">
          <p className="v5-mono">Por dentro</p>
          <h2 id="v5-plano-t" className="v5-display">Lo que no se ve también <span className="v5-luz">se diseña.</span></h2>
        </div>
        {LLAMADAS.map((ll) => (
          <div key={ll.id} className="v5-llamada">
            <span className="v5-mono">{ll.titulo}</span>
            {ll.texto}
          </div>
        ))}
        <ol className="v5-plano-lista v5-gutter">
          {LLAMADAS.map((ll) => (
            <li key={ll.id}>
              <span className="v5-mono" style={{ color: "var(--calido)" }}>—</span>
              <span><strong className="font-medium">{ll.titulo}.</strong> {ll.texto}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
