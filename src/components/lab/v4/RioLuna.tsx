"use client";

import { useEffect, useRef } from "react";

import { observarProgreso, pintarCubriendo, precargar, rutasSecuencia, sinMovimiento } from "./scroll";

/*
  Galería v4 (idea de Alejo, 12/13-oct): asomado desde un piso de nogal sobre un
  canal de agua; una luna llena real se eclipsa con el scroll hasta dejar solo el
  halo blanco, y en el reflejo negro aparecen los proyectos. Tocar uno es meter
  el dedo en el agua: ondas circulares y una entrada tipo portal al proyecto.
  Cuadros pre-renderizados en Blender (scripts/v4/rio_luna.py), sin WebGL.
*/
const N = 120;
const BASE = "/lab/v4/rio";
const PROYECTOS = [
  { id: "mh", nombre: "MH Interior", tipo: "Sitio de cliente · 2026", href: "/trabajo/mh-interior", img: "/casos/mhinterior/shot-1-hero.png", x: 0.3 },
  { id: "villa", nombre: "Villa Savoye", tipo: "Lab · casas icónicas Nº 1", href: "/lab/villa-savoye", img: "/lab/villa-savoye/v2/llegada-noche.webp", x: 0.7 },
] as const;

function entrarPorElAgua(e: React.MouseEvent<HTMLAnchorElement>, img: string) {
  if (sinMovimiento() || e.metaKey || e.ctrlKey) return; // sin animación: el enlace navega solo
  e.preventDefault();
  const destino = e.currentTarget.href;
  const { clientX: x, clientY: y } = e;
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

export function RioLuna() {
  const seccion = useRef<HTMLElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const reflejos = useRef<HTMLDivElement>(null);
  const brillo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = seccion.current, c = lienzo.current, rf = reflejos.current;
    if (!el || !c || !rf) return;
    let p = sinMovimiento() ? 1 : 0;
    const pintar = () => {
      const f = Math.min(N, Math.max(1, Math.round(1 + Math.min(1, p / 0.86) * (N - 1))));
      pintarCubriendo(c, imgs[f - 1]);
      const ver = Math.min(1, Math.max(0, (p - 0.84) / 0.1));
      rf.style.opacity = String(ver);
      rf.style.pointerEvents = ver > 0.6 ? "auto" : "none";
    };
    const imgs = precargar(rutasSecuencia(BASE, "rio", N), (i) => i === 0 && pintar());
    if (sinMovimiento()) { pintar(); return; }
    return observarProgreso(el, (v) => { p = v; pintar(); });
  }, []);

  // la luna responde al cursor: el halo se enciende un poco cuando el puntero se le acerca
  const alMover = (e: React.PointerEvent<HTMLDivElement>) => {
    const b = brillo.current;
    if (!b || e.pointerType !== "mouse") return;
    const r = b.getBoundingClientRect();
    const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
    b.style.opacity = String(Math.max(0, 1 - d / (r.width * 1.2)) * 0.55);
  };

  return (
    <section id="v4-proyectos" ref={seccion} aria-labelledby="v4-proyectos-titulo" className="relative h-[420vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden" onPointerMove={alMover}>
        <canvas ref={lienzo} className="absolute inset-0 h-full w-full" aria-hidden />
        <div ref={brillo} aria-hidden className="pointer-events-none absolute left-1/2 top-[3%] h-[34vh] w-[34vh] -translate-x-1/2 rounded-full opacity-0 transition-opacity duration-300"
          style={{ background: "radial-gradient(circle, rgba(243,240,234,0.35) 0%, rgba(243,240,234,0.08) 45%, transparent 70%)" }} />
        <h2 id="v4-proyectos-titulo" className="v4-mono absolute left-4 top-24 z-10 sm:left-12">Proyectos</h2>
        <svg width="0" height="0" aria-hidden className="absolute">
          <filter id="v4-agua"><feTurbulence type="fractalNoise" baseFrequency="0.008 0.06" numOctaves="2" seed="4"><animate attributeName="baseFrequency" dur="9s" values="0.008 0.06;0.01 0.075;0.008 0.06" repeatCount="indefinite" /></feTurbulence><feDisplacementMap in="SourceGraphic" scale="9" /></filter>
        </svg>
        <div ref={reflejos} className="absolute inset-0 opacity-0">
          {PROYECTOS.map((pr) => (
            <a key={pr.id} href={pr.href} onClick={(e) => entrarPorElAgua(e, pr.img)} className="v4-reflejo"
              style={{ left: `${pr.x * 100}%`, top: "40%", width: "min(25vw, 360px)", aspectRatio: "16 / 10", translate: "-50% 0" }}>
              <img src={pr.img} alt="" loading="lazy" />
              <span className="mt-3 block text-left">
                <span className="v4-display block text-2xl" style={{ color: "var(--cuarzo-50)" }}>{pr.nombre}</span>
                <span className="v4-mono">{pr.tipo}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
