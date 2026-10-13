"use client";

import { useEffect, useRef } from "react";

import { AguaGL, type Escena } from "./agua/AguaGL";
import { cuadroDe, cubrir, proyectoDe, type Datos } from "./agua/escena";
import { observarProgreso, pintarCubriendo, precargar, rutasSecuencia, sinMovimiento } from "./scroll";

/*
  Galería v4 (idea de Alejo, 12/13-oct). Caminas por el piso de nogal hacia el
  agua mirando la luna llena; en el borde bajas la mirada y solo ves agua. La
  luna se eclipsa EN EL REFLEJO hasta dejar una línea de luz, y dentro del disco
  negro aparecen tus proyectos uno por uno, como reflejos que se disuelven
  "como azúcar en agua" con el scroll. El cursor mueve el agua (no el piso).
  Cuadros pre-renderizados en Blender (scripts/v4/rio_luna.py) + WebGL propio.
*/
const N = 130;
const BASE = "/lab/v4/rio";
const PROYECTOS = [
  { id: "mh", nombre: "MH Interior", tipo: "Sitio de cliente · 2026", href: "/trabajo/mh-interior", img: "/lab/v4/proyectos/mh-sala.webp" },
  { id: "villa", nombre: "Villa Savoye", tipo: "Lab · casas icónicas Nº 1", href: "/lab/villa-savoye", img: "/lab/v4/proyectos/villa-salon.webp" },
] as const;

type Estado = { p: number; datos: Datos | null; escena: Escena | null };

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

/** Escena del cuadro actual en coordenadas de pantalla (máscara del agua y disco del eclipse). */
function calcularEscena(c: HTMLCanvasElement, img: HTMLImageElement, d: Datos[string] | undefined, visible: number): Escena {
  const t = cubrir(c.clientWidth, c.clientHeight, img.naturalWidth || 1280, img.naturalHeight || 720);
  const [cx, cy] = d ? t.aPantalla(d.reflejo[0], d.reflejo[1]) : [0.5, 0.5];
  const horizonte = d ? t.aPantalla(0, d.horizonte)[1] : 0;
  const piso = d ? t.aPantalla(0, d.piso)[1] : 1;
  return { cubre: t.uniforme, mascara: [horizonte, piso], disco: [cx, cy, d ? t.alto(d.radio) : 0.2], visible };
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
  const estado = useRef<Estado>({ p: sinMovimiento() ? 1 : 0, datos: null, escena: null });

  useEffect(() => {
    const el = seccion.current, c = lienzo.current;
    if (!el || !c) return;
    const agua = sinMovimiento() ? null : AguaGL.crear(c);
    const cuadros = precargar(rutasSecuencia(BASE, "rio", N), () => undefined);
    const fotos = PROYECTOS.map((pr) => { const i = new Image(); i.src = pr.img; return i; });
    fetch(`${BASE}/datos.json`).then((r) => r.json()).then((d: Datos) => { estado.current.datos = d; }).catch(() => undefined);
    let ultimoCuadro = -1, ultimoProy = -1, vivo = true, visible = false, raf = 0;

    const tick = () => {
      raf = 0;
      const s = estado.current;
      const f = cuadroDe(s.p, N), img = cuadros[f - 1];
      const { indice, visible: vis } = proyectoDe(s.p, PROYECTOS.length);
      if (!img?.complete) { if (vivo && visible) raf = requestAnimationFrame(tick); return; }
      const e = calcularEscena(c, img, s.datos?.[f], vis);
      s.escena = e;
      if (agua) {
        agua.ajustar();
        if (f !== ultimoCuadro) { agua.ponerCuadro(img); ultimoCuadro = f; }
        if (indice !== ultimoProy && fotos[indice].complete) { agua.ponerProyecto(fotos[indice]); ultimoProy = indice; }
        agua.paso(); agua.paso(); agua.dibujar(e);
      } else pintarCubriendo(c, img);
      pintarEtiqueta(etiqueta.current, e, indice, c);
      if (vivo && visible && agua) raf = requestAnimationFrame(tick);
    };
    const pedir = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) pedir(); });
    io.observe(el);
    const dejarDeObservar = observarProgreso(el, (v) => { estado.current.p = sinMovimiento() ? 1 : v; pedir(); });
    let previo: [number, number] | null = null;
    const mover = (ev: PointerEvent) => {
      const e = estado.current.escena, r = c.getBoundingClientRect();
      if (!agua || !e) return;
      const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      if (y <= e.mascara[0] + 0.02 || y >= e.mascara[1] - 0.01) { previo = null; return; }   // el piso y el cielo no se mojan
      const dist = previo ? Math.hypot(x - previo[0], y - previo[1]) : 1;
      if (dist < 0.004) return;
      agua.gota(x, y, 0.025, Math.min(0.12, 0.025 + dist * 2.5));
      previo = [x, y];
      pedir();
    };
    c.addEventListener("pointermove", mover);
    return () => { vivo = false; io.disconnect(); dejarDeObservar(); c.removeEventListener("pointermove", mover); if (raf) cancelAnimationFrame(raf); agua?.destruir(); };
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
    <section id="v4-proyectos" ref={seccion} aria-labelledby="v4-proyectos-titulo" className="relative h-[620vh]">
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
