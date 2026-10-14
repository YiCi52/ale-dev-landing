"use client";

import { useEffect, useRef } from "react";

import { cubrir, type Datos } from "./agua/escena";
import type { Cuadro, MotorLuna } from "./luna/MotorLuna";
import { bloquesDeFrase, familia, pintarBloques, puntosDeCapas, type Bloque } from "./luna/textos";
import { CAPAS, FRASES, estadoDe, fraseDe, type EstadoLuna } from "./luna/tiempos";
import { observarProgreso, sinMovimiento } from "./scroll";

/*
  La luna (reemplaza la muestra de materiales, 14-oct). Ver luna/tiempos.ts para el guion.
  El scroll solo mueve la historia; girar la luna es con el mouse o el dedo, aparte.
*/
const MAPA = "/lab/v4/luna/luna-nasa-2k.jpg";
const PRIMER_CUADRO = "/lab/v4/rio/rio-001.webp";
// Logo B (creciente fina): círculo de radio 100 menos uno de 91 corrido 24 a la derecha
const C_LOGO = (() => {
  const R = 100, r = 91, dx = 24, x = (R * R - r * r + dx * dx) / (2 * dx), y = Math.sqrt(R * R - x * x);
  return `M${x.toFixed(2)},${(-y).toFixed(2)} A${R},${R} 0 1 0 ${x.toFixed(2)},${y.toFixed(2)} A${r},${r} 0 ${x > dx ? 1 : 0} 1 ${x.toFixed(2)},${(-y).toFixed(2)}Z`;
})();

const mezclarColor = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
const CUARZO = [243, 240, 234], PIEDRA = [10, 11, 15];

/**
 * La noche nace dentro del círculo de la luna (se oscurece el disco y la C se vuelve luz) y después crece hasta
 * tragarse la pantalla, como un eclipse. Así el paso de blanco a negro nunca pasa por gris.
 */
function pintarNoche(capa: HTMLDivElement, e: EstadoLuna, w: number, h: number) {
  const r = e.radio * h;
  const crece = Math.max(0, (e.noche - 0.25) / 0.75);
  capa.style.opacity = String(Math.min(1, e.noche / 0.25));
  capa.style.clipPath = `circle(${(r * 0.995 + Math.hypot(w, h) * crece * crece).toFixed(1)}px at ${(e.x * w).toFixed(1)}px ${(e.y * h).toFixed(1)}px)`;
}

function pintarLogo(svg: SVGSVGElement, e: EstadoLuna, w: number, h: number) {
  const r = e.radio * h;
  svg.style.transform = `translate(${e.x * w - r * 1.1}px, ${e.y * h - r * 1.1}px)`;
  svg.setAttribute("width", String(r * 2.2));
  svg.setAttribute("height", String(r * 2.2));
  svg.style.color = mezclarColor(PIEDRA, CUARZO, Math.min(1, e.noche / 0.25));   // mientras el disco se oscurece, la C se vuelve luz
  svg.style.opacity = String(Math.max(0, 1 - e.solida * 2.2));   // la C se va antes de que la luna 3D termine de aparecer
  const circulo = svg.querySelector("circle");
  if (circulo) circulo.style.strokeDashoffset = String(1 - e.linea);
}

export function LunaCapas() {
  const seccion = useRef<HTMLElement>(null);
  const noche = useRef<HTMLDivElement>(null);
  const logo = useRef<SVGSVGElement>(null);
  const lienzo3d = useRef<HTMLCanvasElement>(null);
  const lienzo2d = useRef<HTMLCanvasElement>(null);
  const galeria = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = seccion.current, c3 = lienzo3d.current, c2 = lienzo2d.current, svg = logo.current;
    if (!el || !c3 || !c2 || !svg || sinMovimiento()) return;
    let motor: MotorLuna | null = null, vivo = true, visible = false, raf = 0, p = 0, antes = performance.now();
    let destino: [number, number, number] = [0.5, 0.12, 0.05];
    let datos: Datos | null = null;
    let frases: Bloque[][] = [];
    let lado = 4;
    const ctx = c2.getContext("2d");

    const medir = () => {
      const w = c2.clientWidth, h = c2.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
      c2.width = w * dpr; c2.height = h * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      const d = datos?.["1"];
      if (d?.luna && d.luna_radio) {
        const t = cubrir(w, h, 1920, 1080);
        destino = [...t.aPantalla(d.luna[0], d.luna[1]), t.alto(d.luna_radio)];
      }
      const titulo = familia(el, "--font-marcellus", "serif"), mono = familia(el, "--font-geist-mono", "monospace");
      // en celular la letra es chica: píxeles y polvo más finos para que se siga leyendo
      lado = w < 720 ? 2 : 4;
      frases = FRASES.map((f) => bloquesDeFrase(f, w, h * 0.83, titulo, lado));
      const paso = w < 720 ? 1 : 2;
      motor?.medir();
      motor?.ponerTexto(puntosDeCapas(CAPAS, w, h, { titulo, mono }, paso), w, h, paso);
    };

    const tick = (ahora: number) => {
      raf = 0;
      const dt = Math.min(0.05, (ahora - antes) / 1000);
      antes = ahora;
      const w = c2.clientWidth, h = c2.clientHeight;
      const e = estadoDe(p, destino, w / Math.max(1, h));
      if (noche.current) pintarNoche(noche.current, e, w, h);
      pintarLogo(svg, e, w, h);
      if (galeria.current) galeria.current.style.opacity = String(e.galeria);
      if (ctx) {
        ctx.clearRect(0, 0, w, h);
        const f = fraseDe(p);
        if (f.indice >= 0 && frases[f.indice]) pintarBloques(ctx, frases[f.indice], f.entra, f.sale, lado, h, "#f3f0ea");
      }
      const cuadro: Cuadro = { x: e.x, y: e.y, radio: e.radio, solida: e.solida, polvo: e.polvo, tiempo: ahora / 1000 };
      motor?.dibujar(cuadro, dt);
      if (vivo && visible) raf = requestAnimationFrame(tick);
    };
    const pedir = () => { if (!raf && visible) raf = requestAnimationFrame(tick); };

    const obs = new IntersectionObserver(([en]) => { visible = en.isIntersecting; pedir(); }, { rootMargin: "100px" });
    obs.observe(el);
    const dejar = observarProgreso(el, (v) => { p = v; pedir(); });
    const alCambiarTam = () => { medir(); pedir(); };
    window.addEventListener("resize", alCambiarTam);
    // el cursor de "agarrar" solo sobre la luna, y solo cuando se puede girar
    const cursor = (ev: PointerEvent) => {
      const e = estadoDe(p, destino, c3.clientWidth / Math.max(1, c3.clientHeight));
      const sobre = motor?.sobreLaLuna(ev.offsetX, ev.offsetY, { ...e, tiempo: 0 });
      if (c3.style.cursor !== "grabbing") c3.style.cursor = sobre ? "grab" : "";
    };
    c3.addEventListener("pointermove", cursor);

    Promise.all([
      import("./luna/MotorLuna"),
      document.fonts.ready,
      fetch("/lab/v4/rio/datos.json").then((r) => r.json() as Promise<Datos>).catch(() => null),
    ]).then(([m, , d]) => {
      if (!vivo) return;
      datos = d;
      motor = new m.MotorLuna(c3, MAPA);
      medir();
      pedir();
    }).catch(() => undefined);

    return () => {
      vivo = false;
      if (raf) cancelAnimationFrame(raf);
      obs.disconnect();
      dejar();
      window.removeEventListener("resize", alCambiarTam);
      c3.removeEventListener("pointermove", cursor);
      motor?.destruir();
    };
  }, []);

  return (
    <section ref={seccion} id="v4-luna" aria-labelledby="v4-luna-titulo" className="v4-luna relative h-[900vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden" style={{ backgroundColor: "rgb(243,240,234)" }}>
        <div ref={noche} className="absolute inset-0" style={{ backgroundColor: "var(--piedra-950)", clipPath: "circle(0px at 50% 40%)" }} aria-hidden />
        <h2 id="v4-luna-titulo" className="sr-only">Lo que hay debajo de cada sitio: catorce capas</h2>
        {/* eslint-disable-next-line @next/next/no-img-element -- fundido decorativo al primer cuadro de la galería */}
        <img ref={galeria} src={PRIMER_CUADRO} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-0" />
        <svg ref={logo} viewBox="-110 -110 220 220" className="v4-luna-logo absolute left-0 top-0" aria-hidden>
          <path d={C_LOGO} fill="currentColor" />
          <circle r="99.5" fill="none" stroke="currentColor" strokeWidth="1.2" pathLength={1} strokeDasharray="1" strokeDashoffset="1" transform="rotate(-90)" />
        </svg>
        <canvas ref={lienzo3d} className="absolute inset-0 h-full w-full" style={{ touchAction: "pan-y" }} aria-label="Luna en 3D: arrástrala para girarla" role="img" />
        <canvas ref={lienzo2d} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
        {/* El texto real (lectores de pantalla y movimiento reducido); visualmente lo escriben los píxeles y el polvo */}
        <div className="v4-luna-texto">
          <ul className="v4-luna-frases">
            {FRASES.map((f) => <li key={f} className="v4-display">{f}</li>)}
          </ul>
          <ol className="v4-luna-capas">
            {CAPAS.map((c, i) => (
              <li key={c}><span className="v4-mono" style={{ color: "var(--veta-oro)" }}>{String(i + 1).padStart(2, "0")}</span> {c}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
