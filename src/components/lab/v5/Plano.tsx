"use client";

import { useEffect, useRef } from "react";

import { observarProgreso, sinMovimiento } from "./scroll";

/*
  "Por dentro" (Alejo, 19-oct: "que de frente pase a un plano desde arriba"). El último cuadro del hero se apaga, queda
  su dibujo de líneas y la cámara sube hasta quedar encima; en la subida, un plano de corte a 1,2 m le quita el techo a
  la casa y queda la PLANTA, como en un plano de verdad (72 cuadros, scripts/v5/casa_luna.py pasada "planta"). Sobre la
  planta se dibujan las cotas y se encienden las llamadas: cada recinto señala una parte del sistema.
*/
const CUADROS = 72;
const FIN_SUBIDA = 0.68;
// anclas de cada recinto en el cuadro final (0–1 de la imagen 16:9), exportadas por Blender en planta.json
const LLAMADAS = [
  { id: "proyectos", x: 0.4665, y: 0.2875, titulo: "Proyectos", texto: "Fotos, planos y ficha técnica de cada obra.", lado: 1 },
  { id: "recorrido", x: 0.2056, y: 0.487, titulo: "Recorridos", texto: "La obra a pantalla completa, para caminarla antes de llamarte.", lado: -1 },
  { id: "formulario", x: 0.3754, y: 0.5169, titulo: "Formulario", texto: "Pregunta lo que tú preguntarías: tipo de proyecto, metros, presupuesto, fecha.", lado: 1 },
  { id: "aviso", x: 0.6041, y: 0.3975, titulo: "Aviso", texto: "Cada consulta llega a tu WhatsApp en el mismo minuto.", lado: 1 },
  { id: "respaldo", x: 0.804, y: 0.691, titulo: "Respaldo", texto: "Copia semanal y datos tratados según la Ley 1581.", lado: 1 },
] as const;

const ruta = (i: number) => `/lab/v5/planta/p-${String(i + 1).padStart(3, "0")}.webp`;

/** Posición en px del contenedor de un punto 0–1 de una imagen 16:9 recortada como cover y centrada. */
function enContenedor(x: number, y: number, w: number, h: number): [number, number] {
  const escala = Math.max(w / 16, h / 9), dw = 16 * escala, dh = 9 * escala;
  return [(w - dw) / 2 + x * dw, (h - dh) / 2 + y * dh];
}

export function Plano() {
  const seccion = useRef<HTMLElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = seccion.current, canvas = lienzo.current;
    const fija = el?.querySelector<HTMLElement>(".v5-plano-fija");
    if (!el || !canvas || !fija) return;
    const render = el.querySelector<HTMLImageElement>(".v5-plano-render");
    const cotas = el.querySelector<SVGSVGElement>(".v5-plano-cotas");
    const llamadas = Array.from(el.querySelectorAll<HTMLElement>(".v5-llamada"));
    const items = Array.from(el.querySelectorAll<HTMLElement>(".v5-plano-lista li"));
    const titulo = el.querySelector<HTMLElement>(".v5-plano-titulo");
    const cuadros: (HTMLImageElement | null)[] = Array(CUADROS).fill(null);
    let actual = 0, vivo = true;

    const dibujar = () => {
      let img: HTMLImageElement | null = null;
      for (let d = 0; d < CUADROS && !img; d++) img = cuadros[actual - d] ?? cuadros[actual + d] ?? null;
      if (!img) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1, 2000 / Math.max(1, canvas.clientWidth));
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const escala = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, (w - img.naturalWidth * escala) / 2, (h - img.naturalHeight * escala) / 2, img.naturalWidth * escala, img.naturalHeight * escala);
    };
    const pedidas = Array.from({ length: CUADROS }, (_, i) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => { if (!vivo) return; cuadros[i] = img; if (Math.abs(i - actual) < 6) dibujar(); };
      img.src = ruta(i);
      return img;
    });

    const ubicar = () => {
      const w = fija.clientWidth, h = fija.clientHeight;
      LLAMADAS.forEach((ll, i) => {
        const c = llamadas[i];
        if (!c) return;
        const [ax, ay] = enContenedor(ll.x, ll.y, w, h);
        // la etiqueta va del lado indicado, salvo que no quepa
        const ancho = c.offsetWidth + 24;
        const derecha = ll.lado > 0 ? ax + ancho < w - 16 : ax - ancho < 16;
        c.style.left = `${ax}px`; c.style.top = `${ay}px`;
        c.style.transform = `translate(${derecha ? "16px" : "calc(-100% - 16px)"}, -50%)`;
        c.dataset.lado = derecha ? "der" : "izq";
      });
    };
    ubicar();
    window.addEventListener("resize", ubicar);

    const aplicar = (p: number) => {
      const apaga = Math.min(1, Math.max(0, p / 0.12));
      if (render) { render.style.filter = `brightness(${1 - 0.86 * apaga}) saturate(${1 - apaga})`; render.style.opacity = String(1 - Math.min(1, Math.max(0, (p - 0.2) / 0.18))); }
      canvas.style.opacity = String(Math.min(1, Math.max(0, (p - 0.04) / 0.1)));
      const i = Math.round(Math.min(1, Math.max(0, (p - 0.12) / (FIN_SUBIDA - 0.12))) * (CUADROS - 1));
      if (i !== actual) { actual = i; dibujar(); }
      cotas?.toggleAttribute("data-visible", p > FIN_SUBIDA + 0.02);
      // cuando la planta ocupa la pantalla, el título se aparta para no tapar el dibujo
      if (titulo) titulo.style.opacity = String(1 - 0.9 * Math.min(1, Math.max(0, (p - (FIN_SUBIDA - 0.08)) / 0.08)));
      LLAMADAS.forEach((_, k) => {
        const on = p > FIN_SUBIDA + 0.05 + k * 0.045;
        llamadas[k]?.toggleAttribute("data-visible", on);
        items[k]?.toggleAttribute("data-visible", on);
      });
    };
    const quitar = sinMovimiento() ? (actual = CUADROS - 1, aplicar(1), () => {}) : observarProgreso(el, aplicar);
    return () => {
      vivo = false; quitar(); window.removeEventListener("resize", ubicar);
      for (const img of pedidas) { img.onload = null; img.src = ""; }
    };
  }, []);

  return (
    <section ref={seccion} className="v5-plano" aria-labelledby="v5-plano-t">
      <div className="v5-plano-fija">
        {/* eslint-disable-next-line @next/next/no-img-element -- último cuadro del hero (misma cámara) */}
        <img src="/lab/v5/casa/1440/c-120.webp" alt="" className="v5-plano-capa v5-plano-render" loading="lazy" />
        <canvas ref={lienzo} className="v5-plano-capa" style={{ opacity: 0 }} aria-hidden />
        {/* cotas sobre la planta: misma caja 16:9 que la imagen (slice = cover), así quedan pegadas al dibujo */}
        <svg className="v5-plano-cotas" viewBox="0 0 1440 810" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <g className="v5-cota">
            <line x1="165" y1="668" x2="1228" y2="668" />
            <line x1="165" y1="658" x2="165" y2="678" /><line x1="1228" y1="658" x2="1228" y2="678" />
            <text x="696" y="696" textAnchor="middle">22,00 m</text>
          </g>
          <g className="v5-cota">
            <line x1="1262" y1="176" x2="1262" y2="634" />
            <line x1="1252" y1="176" x2="1272" y2="176" /><line x1="1252" y1="634" x2="1272" y2="634" />
            <text x="1282" y="410">9,50 m</text>
          </g>
          <text className="v5-cota-rotulo" x="165" y="150">PLANTA · NIVEL +0,55 · CORTE A 1,20 m</text>
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
