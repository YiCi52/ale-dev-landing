"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { Hora } from "./Hora";
import { HABLEMOS } from "./marca";
import { type Cursor, encuadre, pintarNoche } from "./noche";
import { observarProgreso, sinMovimiento } from "./scroll";

/*
  Hero v5, "Luz prestada": la casa de piedra, nogal y cuarzo de noche (120 cuadros renderizados en Blender,
  scripts/v5/casa_luna.py). El scroll hace salir la luna creciente, la cámara se acerca y al final se encienden las
  luces de adentro; en ese momento aparece la consulta que llega. En celular el encuadre se corre de la luna a la casa.
*/
const TOTAL = 120;
const FIN_PELICULA = 0.86;            // el último 14 % del recorrido se queda en el cuadro final, con la consulta a la vista
const ENCIENDE = 100 / TOTAL;         // desde este cuadro la casa ya está encendida

function ruta(ancho: number, i: number): string {
  return `/lab/v5/casa/${ancho}/c-${String(i + 1).padStart(3, "0")}.webp`;
}

/** Orden de carga: primero uno de cada 8 cuadros (el scroll ya tiene algo que mostrar), luego se rellenan los huecos. */
function ordenDeCarga(): number[] {
  const orden: number[] = [];
  for (const paso of [8, 4, 2, 1]) for (let i = 0; i < TOTAL; i += paso) if (!orden.includes(i)) orden.push(i);
  return orden;
}

/** Ajusta la densidad del lienzo (máx. ~2000 px de ancho: más no gana nitidez con cuadros de 1440). */
function dimensionar(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const dpr = Math.min(2, window.devicePixelRatio || 1, 2000 / Math.max(1, canvas.clientWidth));
  const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  return canvas.getContext("2d");
}

export function Hero() {
  const seccion = useRef<HTMLElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const poster = useRef<HTMLImageElement>(null);
  const consulta = useRef<HTMLElement>(null);
  const pista = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = seccion.current, canvas = lienzo.current;
    if (!el || !canvas) return;
    const ancho = window.matchMedia("(max-width: 820px)").matches ? 960 : 1440;
    const angosta = () => canvas.clientWidth / Math.max(1, canvas.clientHeight) < 1;
    const cuadros: (HTMLImageElement | null)[] = Array(TOTAL).fill(null);
    let actual = 0;

    const cercano = (i: number): HTMLImageElement | null => {
      for (let d = 0; d < TOTAL; d++) {
        const a = cuadros[i - d], b = cuadros[i + d];
        if (a) return a;
        if (b) return b;
      }
      return null;
    };
    const cursor: Cursor = { x: 0, y: 0, fuerza: 0 };
    const dibujar = (t = performance.now() / 1000) => {
      const img = cercano(actual);
      if (!img) return;
      const avance = actual / (TOTAL - 1);
      const foco = angosta() ? 0.34 + 0.18 * avance : 0.5;
      const ctx = dimensionar(canvas);
      if (!ctx) return;
      // el agua empieza en la orilla del espejo, que baja un poco a medida que la cámara se acerca
      pintarNoche(ctx, img, encuadre(canvas.width, canvas.height, img, foco), 0.735 + 0.05 * avance, t, cursor, 1);
      poster.current?.setAttribute("hidden", "");
    };

    let vivo = true;
    const pedidas: HTMLImageElement[] = [];
    ordenDeCarga().forEach((i, k) => {
      const img = new Image();
      img.decoding = "async";
      if (k >= TOTAL / 8) img.fetchPriority = "low";   // la primera pasada (1 de cada 8) va normal; el relleno, después
      img.onload = () => { if (!vivo) return; cuadros[i] = img; if (Math.abs(i - actual) < 9) dibujar(); };
      img.src = ruta(ancho, i);
      pedidas.push(img);
    });
    const alRedimensionar = () => dibujar();
    window.addEventListener("resize", alRedimensionar);
    const soltar = () => {
      vivo = false;
      window.removeEventListener("resize", alRedimensionar);
      for (const img of pedidas) { img.onload = null; img.src = ""; }
    };

    if (sinMovimiento()) {
      actual = TOTAL - 1;
      consulta.current?.setAttribute("data-visible", "");
      if (pista.current) pista.current.hidden = true;
      return soltar;
    }
    // la noche se mueve sola mientras el hero está a la vista: agua, estrellas y las ondas del cursor
    let cuadro = 0, aLaVista = true;
    const vivir = (ms: number) => { cursor.fuerza *= 0.965; dibujar(ms / 1000); cuadro = aLaVista ? requestAnimationFrame(vivir) : 0; };
    const io = new IntersectionObserver(([en]) => {
      aLaVista = en.isIntersecting;
      if (aLaVista && !cuadro) cuadro = requestAnimationFrame(vivir);
    });
    io.observe(el);
    const alMover = (ev: PointerEvent) => {
      if (ev.pointerType === "touch") return;
      const r = canvas.getBoundingClientRect(), dpr = canvas.width / Math.max(1, r.width);
      cursor.x = (ev.clientX - r.left) * dpr; cursor.y = (ev.clientY - r.top) * dpr;
      if (cursor.y > canvas.height * 0.7) cursor.fuerza = Math.min(1, cursor.fuerza + 0.12);
    };
    el.addEventListener("pointermove", alMover);
    const quitar = observarProgreso(el, (p) => {
      const t = Math.min(1, p / FIN_PELICULA);
      const i = Math.round(t * (TOTAL - 1));
      consulta.current?.toggleAttribute("data-visible", t >= ENCIENDE + 0.04);
      if (pista.current) pista.current.style.opacity = p > 0.06 ? "0" : "1";
      if (i !== actual) { actual = i; dibujar(); }
    });
    return () => { quitar(); soltar(); io.disconnect(); cancelAnimationFrame(cuadro); el.removeEventListener("pointermove", alMover); };
  }, []);

  return (
    <section ref={seccion} className="v5-hero" aria-labelledby="v5-titulo">
      <div className="v5-hero-fija">
        {/* eslint-disable-next-line @next/next/no-img-element -- primer cuadro, visible antes de que cargue la secuencia */}
        <img ref={poster} src={ruta(1440, 0)} alt="" className="v5-hero-poster" fetchPriority="high" width={1440} height={810} />
        <canvas ref={lienzo} className="v5-hero-lienzo" aria-hidden />
        <div className="v5-hero-velo" />
        <aside ref={consulta} className="v5-consulta" aria-label="Ejemplo de consulta">
          <p className="v5-mono flex items-center gap-2" style={{ color: "var(--calido)" }}>
            <span className="v5-consulta-punto" /> Consulta nueva · ejemplo
          </p>
          <p className="mt-2 text-[17px] font-medium">Casa en Chía · 280 m²</p>
          <p className="mt-1 text-[14px]" style={{ color: "var(--luna-300)" }}>Tiene lote, busca diseño · para el próximo año</p>
        </aside>
        <p ref={pista} className="v5-hero-pista v5-mono">Desliza: sale la luna</p>
        <div className="v5-hero-texto v5-gutter">
          <div className="flex flex-wrap justify-between gap-x-6 gap-y-2">
            <p className="v5-mono">Estudio web para arquitectura e interiorismo</p>
            <Hora />
          </div>
          <h1 id="v5-titulo" className="v5-display">
            Tu obra, <span className="v5-luz">a la luz.</span>
          </h1>
          <div className="v5-hero-sub">
            <p className="v5-texto">
              Sitios donde el proyecto se recorre y cada consulta llega a tu WhatsApp en el mismo minuto.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={HABLEMOS} className="v5-boton v5-boton-luz">Hablemos 15 minutos</Link>
              <Link href="/lab/v5/trabajo" className="v5-boton v5-boton-linea">Ver trabajo</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
