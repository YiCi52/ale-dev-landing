"use client";

import { useEffect, useRef } from "react";

import { AguaGL, type Escena } from "./agua/AguaGL";
import { PELICULA, cuadroExacto, cubrir, eclipseDe, mezclarDatos, proyectoDe, type Datos } from "./agua/escena";
import { CacheCuadros } from "./agua/cache";
import { lienzoCielo } from "./cielo/estrellas";
import { observarProgreso, pintarCubriendo, precargar, rutasSecuencia, sinMovimiento } from "./scroll";

/*
  Galería v4 (idea de Alejo, 12/13-oct). Caminas por el piso de nogal hacia el
  agua mirando la luna llena; en el borde bajas la mirada y solo ves agua. La
  luna se eclipsa EN EL REFLEJO hasta dejar una línea de luz, y dentro del disco
  negro aparecen tus proyectos uno por uno, como reflejos que se disuelven
  "como azúcar en agua" con el scroll. El cursor mueve el agua (no el piso).
  Cuadros pre-renderizados en Blender (scripts/v4/rio_luna.py) + WebGL propio.
*/
const BASE = "/lab/v4/rio";
const PROYECTOS = [
  { id: "mh", nombre: "MH Interior", tipo: "Sitio de cliente · 2026", href: "/trabajo/mh-interior", img: "/lab/v4/proyectos/mh-sala.webp" },
  { id: "villa", nombre: "Villa Savoye", tipo: "Lab · casas icónicas Nº 1", href: "/lab/villa-savoye", img: "/lab/v4/proyectos/villa-salon.webp" },
] as const;

type Estado = {
  p: number; datos: Datos | null; escena: Escena | null; cursor: [number, number] | null; cerca: number;
  /** desplazamiento suavizado de la luna hacia el cursor (solo cuando el cursor está encima, como un botón magnético) */
  sigue: [number, number];
  /** lo mismo para el reflejo y el proyecto dentro del agua */
  sigueAgua: [number, number];
};

/** Imán: si el cursor está sobre el disco (radio en alturas), devuelve hacia dónde tirar; si no, cero. */
function iman(cursor: [number, number] | null, cx: number, cy: number, radio: number, asp: number): [number, number] {
  if (!cursor) return [0, 0];
  const dx = cursor[0] - cx, dy = cursor[1] - cy;
  if (Math.hypot(dx * asp, dy) > radio * 1.15) return [0, 0];
  return [dx * 0.12, dy * 0.12];
}

function entrarPorElAgua(x: number, y: number, img: string, destino: string) {
  if (sinMovimiento()) return window.location.assign(destino);
  [0, 140, 300].forEach((retraso, i) => {
    const onda = document.createElement("span");
    onda.className = "v4-onda";
    const t = 260 + i * 120;
    Object.assign(onda.style, { left: `${x}px`, top: `${y}px`, width: `${t * 2}px`, height: `${t * 2}px`, animationDelay: `${retraso}ms` });
    document.body.appendChild(onda);
    window.setTimeout(() => onda.remove(), 1600);
  });
  const portal = document.createElement("div");
  portal.className = "v4-portal";
  Object.assign(portal.style, { backgroundImage: `url(${img})`, clipPath: `circle(0% at ${x}px ${y}px)` });
  document.body.appendChild(portal);
  requestAnimationFrame(() => requestAnimationFrame(() => { portal.style.clipPath = `circle(150% at ${x}px ${y}px)`; }));
  window.setTimeout(() => window.location.assign(destino), 950);
}

/** Escena del cuadro actual en coordenadas de pantalla (máscara del agua, luna del cielo, su reflejo). */
function calcularEscena(c: HTMLCanvasElement, img: HTMLImageElement, f: number, s: Estado, visible: number): Escena {
  const entero = Math.floor(f), d = mezclarDatos(s.datos?.[entero], s.datos?.[entero + 1], f - entero);
  const asp = c.clientWidth / c.clientHeight;
  const t = cubrir(c.clientWidth, c.clientHeight, img.naturalWidth || 1920, img.naturalHeight || 1080);
  const [rx, ry] = d ? t.aPantalla(d.reflejo[0], d.reflejo[1]) : [0.5, 0.5];
  const [lx, ly] = d?.luna ? t.aPantalla(d.luna[0], d.luna[1]) : [0.5, -1];
  const lr = d?.luna_radio ? t.alto(d.luna_radio) : 0.1;
  // 14-oct (Alejo): la luna y el reflejo siguen al cursor SOLO si está encima de ellos (botón magnético), suavizado
  const objetivo = iman(s.cursor, lx, ly, lr, asp);
  s.sigue = [s.sigue[0] + (objetivo[0] - s.sigue[0]) * 0.08, s.sigue[1] + (objetivo[1] - s.sigue[1]) * 0.08];
  const dr = d ? t.alto(d.radio) : 0.2;
  const objetivoAgua = iman(s.cursor, rx, ry, dr, asp);
  s.sigueAgua = [s.sigueAgua[0] + (objetivoAgua[0] - s.sigueAgua[0]) * 0.08, s.sigueAgua[1] + (objetivoAgua[1] - s.sigueAgua[1]) * 0.08];
  const dist = s.cursor ? Math.hypot((s.cursor[0] - lx) * asp, s.cursor[1] - ly) : 9;
  s.cerca += (Math.max(0, 1 - dist / (lr * 3)) - s.cerca) * 0.08;
  return {
    cubre: t.uniforme,
    mascara: [d ? t.aPantalla(0, d.horizonte)[1] : 0, d ? t.aPantalla(0, d.piso)[1] : 1],
    lunaCielo: [lx + s.sigue[0], ly + s.sigue[1], lr],
    disco: [rx + s.sigueAgua[0], ry + s.sigueAgua[1], dr],
    eclipse: eclipseDe(s.p),
    cerca: s.cerca,
    visible,
  };
}

function pintarEtiqueta(el: HTMLElement | null, e: Escena, indice: number, c: HTMLCanvasElement) {
  if (!el) return;
  const pr = PROYECTOS[indice];
  el.style.opacity = String(e.visible);
  el.style.pointerEvents = e.visible > 0.6 ? "auto" : "none";
  el.style.transform = `translate(-50%, 0) translate(${e.disco[0] * c.clientWidth}px, ${(e.disco[1] + e.disco[2] + 0.03) * c.clientHeight}px)`;
  const a = el.querySelector("a");
  if (a && a.getAttribute("href") !== pr.href) {
    a.setAttribute("href", pr.href);
    el.querySelector("[data-nombre]")!.textContent = pr.nombre;
    el.querySelector("[data-tipo]")!.textContent = pr.tipo;
  }
}

export function RioLuna() {
  const seccion = useRef<HTMLElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const etiqueta = useRef<HTMLDivElement>(null);
  const estado = useRef<Estado>({ p: sinMovimiento() ? 1 : 0, datos: null, escena: null, cursor: null, cerca: 0, sigue: [0, 0], sigueAgua: [0, 0] });

  useEffect(() => {
    const el = seccion.current, c = lienzo.current;
    if (!el || !c) return;
    const agua = sinMovimiento() ? null : AguaGL.crear(c);
    // cuántos cuadros hay lo dicen los datos del render (74 antes, 110 desde la playa): se cargan después de leerlos
    let cuadros: HTMLImageElement[] = [], N = 0, cache: CacheCuadros | null = null;
    const fotos = PROYECTOS.map((pr) => { const i = new Image(); i.src = pr.img; return i; });
    const texLuna = new Image();
    texLuna.onload = () => agua?.ponerLuna(texLuna);
    texLuna.src = "/lab/v4/luna/luna-nasa-2k.jpg";
    agua?.ponerEstrellas(lienzoCielo(1024));
    fetch(`${BASE}/datos.json`).then((r) => r.json()).then((d: Datos) => {
      if (!vivo) return;
      estado.current.datos = d;
      N = Object.keys(d).length;
      cuadros = precargar(rutasSecuencia(BASE, "rio", N), () => undefined);
      cache = new CacheCuadros(cuadros);
      pedir();
    }).catch(() => undefined);
    let ultimoCuadro = -1, ultimoSiguiente = -1, ultimoProy = -1, vivo = true, visible = false, raf = 0, ultimoPaso = 0;

    const tick = () => {
      raf = 0;
      const s = estado.current;
      if (!N) { if (vivo && visible) raf = requestAnimationFrame(tick); return; }
      const exacto = cuadroExacto(s.p, N), f = Math.floor(exacto), sig = Math.min(N, f + 1), img = cuadros[f - 1];
      const { indice, visible: vis } = proyectoDe(s.p, PROYECTOS.length);
      if (!img?.complete) { if (vivo && visible) raf = requestAnimationFrame(tick); return; }
      const e = calcularEscena(c, img, exacto, s, vis);
      s.escena = e;
      if (agua) {
        agua.ajustar();
        // el cuadro sube ya decodificado (si no, decodificarlo al vuelo trababa la bajada de la cámara)
        cache?.alrededor(f, c.width);
        if (f !== ultimoCuadro) { agua.ponerCuadro(cache?.listo(f) ?? img, 0); ultimoCuadro = f; }
        // el siguiente cuadro se funde según el scroll: la cámara baja continua, no a saltos (Alejo, 14-oct)
        const imgSig = cuadros[sig - 1];
        if (sig !== ultimoSiguiente && imgSig?.complete) { agua.ponerCuadro(cache?.listo(sig) ?? imgSig, 1); ultimoSiguiente = sig; }
        agua.ponerMezcla(sig === ultimoSiguiente ? exacto - f : 0);
        if (indice !== ultimoProy && fotos[indice].complete) { agua.ponerProyecto(fotos[indice]); ultimoProy = indice; }
        // ondas del cursor (Alejo, 15-oct): rápidas como al principio, apenas más lentas, y de vida corta: muy visibles
        // pero no molestan. Un paso por cuadro de pantalla (tope ~60 por segundo).
        const ahora = performance.now();
        if (ahora - ultimoPaso >= 15) { agua.paso(); ultimoPaso = ahora; }
        agua.dibujar(e);
      } else pintarCubriendo(c, img);
      pintarEtiqueta(etiqueta.current, e, indice, c);
      if (vivo && visible && agua) raf = requestAnimationFrame(tick);
    };
    const pedir = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) pedir(); });
    io.observe(el);
    // la galería se monta una pantalla por debajo de la sección de la luna (margen −200svh): durante esa primera
    // pantalla queda quieta en su inicio (p = 0) mientras la luna termina de subir y se vuelve transparente encima
    const dejarDeObservar = observarProgreso(el, (v) => {
      const largo = el.offsetHeight - window.innerHeight, espera = window.innerHeight;
      estado.current.p = sinMovimiento() ? 1 : Math.max(0, (v * largo - espera) / Math.max(1, largo - espera));
      pedir();
    });
    let previo: [number, number] | null = null;
    const mover = (ev: PointerEvent) => {
      const e = estado.current.escena, r = c.getBoundingClientRect();
      if (!agua || !e) return;
      const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      estado.current.cursor = [x, y];
      if (y <= e.mascara[0] + 0.02 || y >= e.mascara[1] - 0.01) { previo = null; return; }   // el piso y el cielo no se mojan
      if (estado.current.p < PELICULA * 0.95) { previo = null; return; }   // el dedo moja el agua solo cuando ya la estás mirando
      const dist = previo ? Math.hypot(x - previo[0], y - previo[1]) : 1;
      if (dist < 0.004) return;
      agua.gota(x, y, 0.035, Math.min(0.07, 0.012 + dist * 1.6));
      previo = [x, y];
      pedir();
    };
    c.addEventListener("pointermove", mover);
    return () => { vivo = false; cache?.vaciar(); texLuna.onload = null; io.disconnect(); dejarDeObservar(); c.removeEventListener("pointermove", mover); if (raf) cancelAnimationFrame(raf); agua?.destruir(); };
  }, []);

  const tocarAgua = (ev: React.MouseEvent<HTMLCanvasElement>) => {
    const e = estado.current.escena, c = lienzo.current;
    if (!e || !c || e.visible < 0.6) return;
    const r = c.getBoundingClientRect();
    const dx = ((ev.clientX - r.left) / r.width - e.disco[0]) * (r.width / r.height), dy = (ev.clientY - r.top) / r.height - e.disco[1];
    if (Math.hypot(dx, dy) > e.disco[2]) return;
    const { indice } = proyectoDe(estado.current.p, PROYECTOS.length);
    entrarPorElAgua(ev.clientX, ev.clientY, PROYECTOS[indice].img, PROYECTOS[indice].href);
  };

  return (
    <section id="v4-proyectos" ref={seccion} aria-labelledby="v4-proyectos-titulo" className="relative z-0 -mt-[200svh] h-[720vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas ref={lienzo} onClick={tocarAgua} className="absolute inset-0 h-full w-full" aria-hidden />
        <h2 id="v4-proyectos-titulo" className="v4-mono absolute left-4 top-24 z-10 sm:left-12">Proyectos</h2>
        <div ref={etiqueta} className="absolute left-0 top-0 text-center opacity-0" style={{ transition: "opacity 200ms" }}>
          <a href={PROYECTOS[0].href} className="block focus-visible:outline focus-visible:outline-1" style={{ outlineColor: "var(--veta-oro)" }}>
            <span data-nombre className="v4-display block text-2xl" style={{ color: "var(--cuarzo-50)" }}>{PROYECTOS[0].nombre}</span>
            <span data-tipo className="v4-mono">{PROYECTOS[0].tipo}</span>
          </a>
        </div>
        <ul className="sr-only">
          {PROYECTOS.map((pr) => (<li key={pr.id}><a href={pr.href}>{pr.nombre} — {pr.tipo}</a></li>))}
        </ul>
      </div>
    </section>
  );
}
