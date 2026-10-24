"use client";

import { type CSSProperties, useEffect, useRef } from "react";

import { MARCAS, PlantaSvg } from "./PlantaSvg";
import { observarProgreso, sinMovimiento } from "./scroll";
import { TEXTOS, type Idioma } from "./textos";
import "./planta.css";

/*
  "Por dentro" (Alejo, 19-oct: "que de frente pase a un plano desde arriba"; 21-oct: "¿no puedes volver a la vista desde
  arriba?"). El último cuadro del hero se apaga en su dibujo de líneas y la cámara sube hasta quedar encima (72 cuadros,
  scripts/v5/casa_luna.py pasada "planta"). Arriba, la planta en tinta (PlantaSvg) se dibuja EXACTAMENTE sobre ese último
  cuadro (mismo encuadre en metros), el render se va y queda el papel. Al final el dibujo se corre a la izquierda y la
  lista de los cinco recintos entra a la derecha.
*/
const CUADROS = 72;
const tramo = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const ruta = (i: number) => `/lab/v5/planta/p-${String(i + 1).padStart(3, "0")}.webp`;

export function Plano({ idioma = "es" }: { idioma?: Idioma }) {
  const tp = TEXTOS[idioma].plano;
  const seccion = useRef<HTMLElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = seccion.current, canvas = lienzo.current;
    const fija = el?.querySelector<HTMLElement>(".v5-plano-fija");
    if (!el || !canvas || !fija) return;
    const render = el.querySelector<HTMLImageElement>(".v5-plano-render");
    const lista = el.querySelector<HTMLElement>(".v5-planta-lista");
    const raiz = el.closest<HTMLElement>(".v5-raiz");
    const ponerRender = () => {
      if (render) render.src = `/lab/v5/${raiz?.getAttribute("data-tema") === "claro" ? "casa-dia" : "casa-sinluna"}/1440/c-120.webp`;
    };
    ponerRender();
    const vigia = new MutationObserver(ponerRender);
    if (raiz) vigia.observe(raiz, { attributes: true, attributeFilter: ["data-tema"] });

    // ---- la subida de cámara: 72 cuadros pintados en cover sobre el lienzo ----
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
    // con movimiento reducido se muestra la planta terminada: basta el último cuadro
    const reducido = sinMovimiento();
    const pedidas = Array.from({ length: reducido ? 1 : CUADROS }, (_, k) => {
      const i = reducido ? CUADROS - 1 : k;
      const img = new Image();
      img.decoding = "async";
      img.onload = () => { if (!vivo) return; cuadros[i] = img; if (Math.abs(i - actual) < 6) dibujar(); };
      img.src = ruta(i);
      return img;
    });
    window.addEventListener("resize", dibujar);

    // ---- el recinto y su renglón de la lista se encienden juntos ----
    const marcar = (id: string | null) => {
      el.querySelectorAll<Element>("[data-llamada]").forEach((n) => {
        n.toggleAttribute("data-activo", n.getAttribute("data-llamada") === id);
        n.toggleAttribute("data-atenuado", id !== null && n.getAttribute("data-llamada") !== id);
      });
    };
    const alEntrar = (ev: Event) => marcar((ev.target as Element | null)?.closest?.("[data-llamada]")?.getAttribute("data-llamada") ?? null);
    const alSalir = () => marcar(null);
    fija.addEventListener("pointerover", alEntrar);
    fija.addEventListener("focusin", alEntrar);
    fija.addEventListener("pointerleave", alSalir);
    fija.addEventListener("focusout", alSalir);

    // ---- guion del scroll ----
    const aplicar = (p: number) => {
      fija.style.setProperty("--apaga", String(tramo(p, 0, 0.1)));        // el render del hero se apaga…
      fija.style.setProperty("--lineas", String(tramo(p, 0.04, 0.12)));   // …y queda su dibujo de líneas
      const i = Math.round(tramo(p, 0.12, 0.5) * (CUADROS - 1));          // la cámara sube
      if (i !== actual) { actual = i; dibujar(); }
      fija.style.setProperty("--trazo", String(tramo(p, 0.48, 0.72)));   // la tinta se dibuja encima
      fija.style.setProperty("--papel", String(tramo(p, 0.56, 0.7)));     // el dibujo de Blender se va, queda el papel
      fija.style.setProperty("--relleno", String(tramo(p, 0.66, 0.78)));
      fija.style.setProperty("--asienta", String(tramo(p, 0.76, 0.86))); // el plano se corre a la izquierda
      fija.style.setProperty("--llamadas", String(tramo(p, 0.82, 0.95)));
      // mientras la lista no se ve, el teclado no entra en ella (WCAG 2.4.7)
      lista?.toggleAttribute("inert", tramo(p, 0.82, 0.95) < 0.05);
    };
    const quitar = sinMovimiento() ? (actual = CUADROS - 1, aplicar(1), () => {}) : observarProgreso(el, aplicar);
    return () => {
      vivo = false; quitar(); vigia.disconnect(); window.removeEventListener("resize", dibujar);
      fija.removeEventListener("pointerover", alEntrar); fija.removeEventListener("focusin", alEntrar);
      fija.removeEventListener("pointerleave", alSalir); fija.removeEventListener("focusout", alSalir);
      for (const img of pedidas) { img.onload = null; img.src = ""; }
    };
  }, []);

  return (
    <section ref={seccion} className="v5-plano" aria-labelledby="v5-plano-t">
      <div className="v5-plano-fija">
        {/* eslint-disable-next-line @next/next/no-img-element -- último cuadro del hero (misma cámara) */}
        <img src="/lab/v5/casa-sinluna/1440/c-120.webp" alt="" className="v5-plano-render" loading="lazy" />
        <div className="v5-papel" aria-hidden />
        <div className="v5-planta-escena">
          <canvas ref={lienzo} className="v5-planta-lienzo" aria-hidden />
          <PlantaSvg corte={tp.corte} nombres={tp.llamadas.map((l) => l[0])} />
        </div>
        <header className="v5-planta-titulo v5-gutter">
          <p className="v5-mono">{tp.rotulo}</p>
          <h2 id="v5-plano-t" className="v5-display">{tp.titulo} <span className="v5-luz">{tp.tituloLuz}</span></h2>
        </header>
        <ol className="v5-planta-lista">
          {tp.llamadas.map(([nombre, texto], k) => (
            <li key={nombre} data-llamada={MARCAS[k].id} tabIndex={0} style={{ "--i": k / tp.llamadas.length } as CSSProperties}>
              <span className="v5-planta-numero" aria-hidden>{k + 1}</span>
              <span><strong className="font-medium">{nombre}.</strong> {texto}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
