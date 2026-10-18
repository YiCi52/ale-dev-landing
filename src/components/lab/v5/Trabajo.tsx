"use client";

import Link from "next/link";
import type { PointerEvent } from "react";

/*
  Trabajo: cada foto está a oscuras y el cursor es una linterna que la ilumina (el efecto de cursor solo vive en las
  imágenes, regla de Alejo del 12-oct). En pantallas táctiles se ven encendidas desde el principio.
*/
type Obra = { id: string; nombre: string; tipo: string; detalle: string; img: string; href: string; accion: string };

const OBRAS: Obra[] = [
  { id: "mh", nombre: "MH Interior", tipo: "Sitio de cliente · 2026", detalle: "Portafolio de interiorismo con formulario, aviso y resumen semanal.", img: "/lab/v5/proyectos/mh-sala.webp", href: "/trabajo/mh-interior", accion: "Ver el caso" },
  { id: "villa", nombre: "Villa Savoye", tipo: "Lab · casas icónicas Nº 1", detalle: "La casa de Le Corbusier reconstruida desde sus planos para recorrerla.", img: "/lab/v5/proyectos/villa-salon.webp", href: "/lab/villa-savoye", accion: "Ver el recorrido" },
];

function mover(e: PointerEvent<HTMLAnchorElement>) {
  if (e.pointerType === "touch") return;
  const r = e.currentTarget.getBoundingClientRect();
  const luz = e.currentTarget.querySelector<HTMLElement>(".v5-linterna-encendida");
  if (!luz) return;
  luz.style.setProperty("--x", `${e.clientX - r.left}px`);
  luz.style.setProperty("--y", `${e.clientY - r.top}px`);
}

function encender(e: PointerEvent<HTMLAnchorElement>, radio: string) {
  e.currentTarget.querySelector<HTMLElement>(".v5-linterna-encendida")?.style.setProperty("--r", radio);
}

export function Trabajo() {
  return (
    <section id="v5-trabajo" className="v5-trabajo v5-gutter" aria-labelledby="v5-trabajo-t">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="v5-mono mb-5">Trabajo</p>
          <h2 id="v5-trabajo-t" className="v5-display text-[clamp(40px,6vw,96px)]">Obras <span className="v5-luz">encendidas</span></h2>
        </div>
        <p className="v5-texto max-w-[34ch]">Pasa el cursor: cada proyecto se ilumina por partes, como una casa de noche.</p>
      </div>
      <div className="v5-trabajo-grilla">
        {OBRAS.map((o) => (
          <article key={o.id} className="v5-obra">
            <Link href={o.href} className="v5-linterna" onPointerMove={mover} onPointerEnter={(e) => encender(e, "220px")} onPointerLeave={(e) => encender(e, "0px")} tabIndex={-1} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element -- foto del proyecto, a oscuras */}
              <img src={o.img} alt="" className="v5-linterna-apagada" loading="lazy" />
              {/* eslint-disable-next-line @next/next/no-img-element -- la misma foto, iluminada donde está el cursor */}
              <img src={o.img} alt="" className="v5-linterna-encendida" loading="lazy" aria-hidden />
            </Link>
            <div className="v5-obra-datos">
              <h3 className="v5-display">{o.nombre}</h3>
              <span className="v5-mono">{o.tipo}</span>
            </div>
            <p className="v5-texto">{o.detalle} <Link href={o.href} className="v5-enlace" aria-label={`${o.accion}: ${o.nombre}`}>{o.accion}</Link></p>
          </article>
        ))}
      </div>
    </section>
  );
}
