"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { Hora } from "./Hora";
import { HABLEMOS } from "./marca";
import { RAIZ, TEXTOS, type Idioma } from "./textos";
import { faseLunar } from "./luna-hoy";
import { type Cursor, type LunaCuadro, encuadre, pintarLluvia, pintarLuna, pintarNoche } from "./noche";
import { observarProgreso, sinMovimiento } from "./scroll";

/*
  Hero v5, "Luz prestada": la casa de piedra, nogal y cuarzo de noche (120 cuadros renderizados en Blender,
  scripts/v5/casa_luna.py). El scroll hace salir la luna creciente, la cámara se acerca y al final se encienden las
  luces de adentro; en ese momento aparece la consulta que llega. En celular el encuadre se corre de la luna a la casa.
  Los cuadros vienen sin luna: la web la pinta con la fase real de hoy. En tema claro la misma película es de día.
*/
const TOTAL = 120;
const FIN_PELICULA = 0.86;            // el último 14 % del recorrido se queda en el cuadro final, con la consulta a la vista
const ENCIENDE = 100 / TOTAL;         // desde este cuadro la casa ya está encendida

const LUNAS = "/lab/v5/casa/luna.json";
// 21-oct: en celular de pie va un render vertical propio (mismo ancho de mirada; arriba cielo, abajo agua) en vez de
// recortar la película horizontal. Su luna y su orilla son las mismas, pasadas al alto 9:16 (luna-vertical.json).
const VERTICAL = "(max-aspect-ratio: 4/5)";
const LUNAS_VERTICAL = "/lab/v5/casa/luna-vertical.json";
type Juego = 1440 | 960 | "v";
/** Dónde empieza el agua (0–1 del alto de la imagen); baja un poco a medida que la cámara se acerca. */
const orilla = (vertical: boolean, avance: number) => (vertical ? 0.5744 + 0.0158 * avance : 0.735 + 0.05 * avance);
const MEDIO_MES = 29.530588853 / 2;
// lluvia: empieza al azar unos segundos después de entrar, dura un rato y vuelve cada tanto
const azar = (min: number, max: number) => min + Math.random() * (max - min);
const LLUVIA_PRIMERA: [number, number] = [5000, 16000];
const LLUVIA_DURA: [number, number] = [16000, 28000];
const LLUVIA_PAUSA: [number, number] = [45000, 100000];

function ruta(ancho: Juego, i: number, dia = false): string {
  return `/lab/v5/${dia ? "casa-dia" : "casa-sinluna"}/${ancho}/c-${String(i + 1).padStart(3, "0")}.webp`;
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

export function Hero({ idioma = "es" }: { idioma?: Idioma }) {
  const t = TEXTOS[idioma].hero;
  const seccion = useRef<HTMLElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const poster = useRef<HTMLImageElement>(null);
  const consulta = useRef<HTMLElement>(null);
  const pista = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = seccion.current, canvas = lienzo.current;
    if (!el || !canvas) return;
    const vertical = window.matchMedia(VERTICAL).matches;
    const ancho: Juego = vertical ? "v" : window.matchMedia("(max-width: 820px)").matches ? 960 : 1440;
    const angosta = () => canvas.clientWidth / Math.max(1, canvas.clientHeight) < 1;
    const raiz = el.closest<HTMLElement>(".v5-raiz");
    const esDia = () => raiz?.getAttribute("data-tema") === "claro";
    let dia = esDia();
    let cuadros: (HTMLImageElement | null)[] = Array(TOTAL).fill(null);
    let actual = 0;
    let lunas: LunaCuadro[] | null = null;
    const fase = faseLunar(new Date());
    const fotoLuna = new Image();               // la luna real (la misma foto de la carga) para la fase de hoy
    fotoLuna.decoding = "async";
    fotoLuna.src = "/lab/v5/luna-llena.webp";
    const lluvia = { valor: 0, meta: 0 };

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
      const foco = !vertical && angosta() ? 0.34 + 0.18 * avance : 0.5;
      const ctx = dimensionar(canvas);
      if (!ctx) return;
      // el agua empieza en la orilla del espejo, que baja un poco a medida que la cámara se acerca
      const e = encuadre(canvas.width, canvas.height, img, foco);
      pintarNoche(ctx, img, e, orilla(vertical, avance), t, cursor, dia ? 0 : 1);
      const luna = lunas?.[actual];
      if (luna) pintarLuna(ctx, e, luna, fase.iluminada, fase.edad < MEDIO_MES, dia, fotoLuna);
      pintarLluvia(ctx, e, orilla(vertical, avance), t, lluvia.valor, dia);
      poster.current?.setAttribute("hidden", "");
    };

    let vivo = true;
    let pedidas: HTMLImageElement[] = [];
    const cancelar = () => { for (const img of pedidas) { img.onload = null; img.src = ""; } };
    const cargar = () => {
      cancelar();
      const propios: (HTMLImageElement | null)[] = Array(TOTAL).fill(null);
      // con movimiento reducido se muestra la casa encendida: basta el último cuadro (auditoría 23-oct)
      const orden = sinMovimiento() ? [TOTAL - 1] : ordenDeCarga();
      const primera = orden.slice(0, Math.ceil(TOTAL / 8));
      const ahorro = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
        || window.matchMedia("(max-width: 820px)").matches;
      const resto = orden.slice(primera.length).filter((i) => !ahorro || i % 2 === 0);
      const pedir = (i: number, k: number) => {
        const img = new Image();
        img.decoding = "async";
        if (k >= TOTAL / 8) img.fetchPriority = "low";   // la primera pasada (1 de cada 8) va normal; el relleno, después
        img.onload = () => {
          if (!vivo) return;
          propios[i] = img;
          // la película anterior sigue en pantalla hasta que la nueva tenga algo que mostrar cerca
          if (cuadros !== propios && Math.abs(i - actual) < 9) cuadros = propios;
          if (Math.abs(i - actual) < 9) dibujar();
        };
        img.src = ruta(ancho, i, dia);
        return img;
      };
      pedidas = primera.map(pedir);
      // el relleno no compite con el JS y las fuentes de la primera carga (auditoría de rendimiento 23-oct)
      const rellenar = () => { if (vivo) pedidas = pedidas.concat(resto.map((i, k) => pedir(i, k + primera.length))); };
      const enReposo = (f: () => void) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(f, { timeout: 2500 }) : setTimeout(f, 600));
      if (document.readyState === "complete") enReposo(rellenar);
      else window.addEventListener("load", () => enReposo(rellenar), { once: true });
    };
    if (dia && poster.current) {
      poster.current.src = ruta(1440, 0, true);
      poster.current.parentElement?.querySelector("source")?.setAttribute("srcset", ruta("v", 0, true));
    }
    cargar();
    // el botón de tema cambia la película (noche ↔ día) sin recargar la página
    const vigia = new MutationObserver(() => {
      if (esDia() === dia) return;
      dia = esDia();
      cargar();
    });
    if (raiz) vigia.observe(raiz, { attributes: true, attributeFilter: ["data-tema"] });
    const pedido = new AbortController();
    fetch(vertical ? LUNAS_VERTICAL : LUNAS, { signal: pedido.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`luna.json ${r.status}`))))
      .then((d: LunaCuadro[]) => { lunas = d; dibujar(); })
      .catch((err: unknown) => { if (!pedido.signal.aborted) console.warn("v5: sin datos de la luna", err); });
    fotoLuna.onload = () => { if (vivo) dibujar(); };
    const alRedimensionar = () => dibujar();
    window.addEventListener("resize", alRedimensionar);
    const soltar = () => {
      vivo = false;
      fotoLuna.onload = null;
      pedido.abort();
      vigia.disconnect();
      window.removeEventListener("resize", alRedimensionar);
      cancelar();
    };

    if (sinMovimiento()) {
      actual = TOTAL - 1;
      consulta.current?.setAttribute("data-visible", "");
      if (pista.current) pista.current.hidden = true;
      return soltar;
    }
    // la noche se mueve sola mientras el hero está a la vista: agua, estrellas y las ondas del cursor
    let cuadro = 0, aLaVista = true;
    const vivir = (ms: number) => {
      cursor.fuerza *= 0.965;
      lluvia.valor += (lluvia.meta - lluvia.valor) * 0.025;
      dibujar(ms / 1000);
      cuadro = aLaVista ? requestAnimationFrame(vivir) : 0;
    };
    let reloj = 0;
    const llover = () => { lluvia.meta = 1; reloj = window.setTimeout(escampar, azar(...LLUVIA_DURA)); };
    const escampar = () => { lluvia.meta = 0; reloj = window.setTimeout(llover, azar(...LLUVIA_PAUSA)); };
    reloj = window.setTimeout(llover, azar(...LLUVIA_PRIMERA));
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
    return () => { quitar(); soltar(); io.disconnect(); cancelAnimationFrame(cuadro); clearTimeout(reloj); el.removeEventListener("pointermove", alMover); };
  }, []);

  return (
    <section ref={seccion} className="v5-hero" aria-labelledby="v5-titulo">
      <div className="v5-hero-fija">
        <picture>
          <source media={VERTICAL} srcSet={ruta("v", 0)} width={720} height={1280} />
          {/* primer cuadro, visible antes de que cargue la secuencia */}
          <img ref={poster} src={ruta(1440, 0)} alt="" className="v5-hero-poster" fetchPriority="high" width={1440} height={810} />
        </picture>
        <canvas ref={lienzo} className="v5-hero-lienzo" aria-hidden />
        <div className="v5-hero-velo" />
        <aside ref={consulta} className="v5-consulta" aria-label={t.consultaAria}>
          <p className="v5-mono flex items-center gap-2" style={{ color: "var(--calido)" }}>
            <span className="v5-consulta-punto" /> {t.consulta}
          </p>
          <p className="mt-2 text-[17px] font-medium">{t.consultaTitulo}</p>
          <p className="mt-1 text-[14px]" style={{ color: "var(--luna-300)" }}>{t.consultaDetalle}</p>
        </aside>
        <p ref={pista} className="v5-hero-pista v5-mono">{t.pista}</p>
        <div className="v5-hero-texto v5-gutter">
          <div className="flex flex-wrap justify-between gap-x-6 gap-y-2">
            <p className="v5-mono">{t.rotulo}</p>
            <Hora idioma={idioma} />
          </div>
          <h1 id="v5-titulo" className="v5-display">
            {t.titulo} <span className="v5-luz">{t.tituloLuz}</span>
          </h1>
          <div className="v5-hero-sub">
            <p className="v5-texto">{t.sub}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={idioma === "es" ? HABLEMOS : `${RAIZ.en}/hablemos`} className="v5-boton v5-boton-luz" prefetch={false}>{t.cta}</Link>
              <Link href={`${RAIZ[idioma]}/trabajo`} className="v5-boton v5-boton-linea" prefetch={false}>{t.ver}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
