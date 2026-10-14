"use client";

import { useEffect, useRef } from "react";

import { observarProgreso, precargar, rutasSecuencia, sinMovimiento } from "./scroll";

/*
  El muro (Alejo, 14-oct): un solo muro arquitectónico con los tres materiales —paño de piedra negra, listones de
  nogal, nicho con losa de cuarzo encendida— visto en un recorrido lateral al atardecer. Con el scroll la cámara
  camina frente al muro y aparece una frase por material. Cuadros de Blender (scripts/v4/muro_recorrido.py); entre
  dos cuadros se funden para que el paso se sienta continuo y no a saltos.
*/
const N = 48;
const BASE = "/lab/v4/muro";
const FRASES = [
  { material: "Piedra negra", texto: "Diseño a la medida de tu obra." },
  { material: "Nogal", texto: "Cada proyecto se recorre." },
  { material: "Cuarzo", texto: "Cada consulta llega a tu correo." },
] as const;

/** Dibuja el cuadro `f` (1..N, con decimales) fundiendo el entero de abajo con el de arriba, como object-fit: cover. */
function pintar(c: HTMLCanvasElement, imgs: HTMLImageElement[], f: number) {
  const a = imgs[Math.floor(f) - 1], b = imgs[Math.min(N, Math.floor(f) + 1) - 1];
  if (!a?.complete || !a.naturalWidth) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = c.clientWidth * dpr, h = c.clientHeight * dpr;
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const ctx = c.getContext("2d");
  if (!ctx) return;
  const s = Math.max(w / a.naturalWidth, h / a.naturalHeight), dw = a.naturalWidth * s, dh = a.naturalHeight * s;
  ctx.globalAlpha = 1;
  ctx.drawImage(a, (w - dw) / 2, (h - dh) / 2, dw, dh);
  const resto = f - Math.floor(f);
  if (resto > 0.01 && b?.complete && b.naturalWidth) {
    ctx.globalAlpha = resto;
    ctx.drawImage(b, (w - dw) / 2, (h - dh) / 2, dw, dh);
    ctx.globalAlpha = 1;
  }
}

/** Cuánto se ve la frase i (0-1): entra en su tercio del recorrido, se queda y sale antes de la siguiente. */
function visibilidad(p: number, i: number): number {
  const centro = (i + 0.5) / FRASES.length, medio = 0.5 / FRASES.length;
  const d = Math.abs(p - centro) / medio;   // 0 en el centro de su tercio, 1 en el borde
  return Math.min(1, Math.max(0, (1 - d) / 0.45));
}

export function Muro() {
  const seccion = useRef<HTMLElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const frases = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = seccion.current, c = lienzo.current;
    if (!el || !c) return;
    let p = sinMovimiento() ? 0.5 : 0;
    const dibujar = () => {
      pintar(c, imgs, 1 + p * (N - 1));
      frases.current?.querySelectorAll<HTMLElement>("[data-frase]").forEach((nodo, i) => {
        const v = visibilidad(p, i);
        nodo.style.opacity = String(v);
        nodo.style.transform = `translate3d(0, ${(1 - v) * 18}px, 0)`;
        nodo.style.filter = `blur(${(1 - v) * 6}px)`;
      });
    };
    const imgs = precargar(rutasSecuencia(BASE, "muro", N), (i) => i === 0 && dibujar());
    if (sinMovimiento()) return;
    return observarProgreso(el, (v) => { p = v; dibujar(); });
  }, []);

  return (
    <section ref={seccion} id="v4-muro" aria-label="El muro: piedra negra, nogal y cuarzo" className="v4-muro relative h-[420vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden" style={{ background: "var(--piedra-950)" }}>
        <canvas ref={lienzo} className="absolute inset-0 h-full w-full" aria-hidden />
        <div className="v4-muro-sombra absolute inset-0" aria-hidden />
        <div ref={frases} className="absolute inset-x-4 bottom-[12svh] sm:inset-x-12">
          {FRASES.map((f, i) => (
            <div key={f.material} data-frase className="v4-muro-frase absolute bottom-0 left-0">
              <p className="v4-mono" style={{ color: "var(--veta-oro)" }}>
                {String(i + 1).padStart(2, "0")} · {f.material}
              </p>
              <p className="v4-display mt-4 max-w-[18ch] text-[clamp(34px,5.4vw,86px)] leading-[1.02]">{f.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
