"use client";

import Link from "next/link";
import type { PointerEvent } from "react";

import { TEXTOS, type Idioma } from "./textos";

/*
  Trabajo: cada foto está a oscuras y el cursor es una linterna que la ilumina (el efecto de cursor solo vive en las
  imágenes, regla de Alejo del 12-oct). En pantallas táctiles se ven encendidas desde el principio.
*/
const OBRAS = [
  { id: "mh", nombre: "MH Interior", img: "/lab/v5/proyectos/mh-sala.webp", href: "/trabajo/mh-interior" },
  { id: "villa", nombre: "Villa Savoye", img: "/lab/v5/proyectos/villa-salon.webp", href: "/lab/villa-savoye" },
];

function mover(e: PointerEvent<HTMLAnchorElement>) {
  if (e.pointerType === "touch") return;
  const r = e.currentTarget.getBoundingClientRect();
  const luz = e.currentTarget.querySelector<HTMLElement>(".v5-linterna-encendida");
  if (!luz) return;
  luz.style.setProperty("--x", `${e.clientX - r.left}px`);
  luz.style.setProperty("--y", `${e.clientY - r.top}px`);
}

function encender(e: PointerEvent<HTMLAnchorElement>) {
  if (e.pointerType === "touch") return;
  mover(e);   // la luz nace donde entra el cursor, no en el centro
  e.currentTarget.querySelector<HTMLElement>(".v5-linterna-encendida")?.style.setProperty("--r", "220px");
}

function apagar(e: PointerEvent<HTMLAnchorElement>) {
  e.currentTarget.querySelector<HTMLElement>(".v5-linterna-encendida")?.style.removeProperty("--r");
}

export function Trabajo({ idioma = "es" }: { idioma?: Idioma }) {
  const tx = TEXTOS[idioma].trabajo;
  return (
    <section id="v5-trabajo" className="v5-trabajo v5-gutter" aria-labelledby="v5-trabajo-t">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="v5-mono mb-5">{tx.rotulo}</p>
          <h2 id="v5-trabajo-t" className="v5-display text-[clamp(40px,6vw,96px)]">{tx.titulo} <span className="v5-luz">{tx.tituloLuz}</span></h2>
        </div>
        <p className="v5-texto max-w-[34ch]">{tx.pista}</p>
      </div>
      <div className="v5-trabajo-grilla">
        {OBRAS.map((o, k) => {
          const d = tx.obras[k];
          return (
          <article key={o.id} className="v5-obra">
            <Link href={o.href} className="v5-linterna" onPointerMove={mover} onPointerEnter={encender} onPointerLeave={apagar} tabIndex={-1} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element -- foto del proyecto, a oscuras */}
              <img src={o.img} alt="" className="v5-linterna-apagada" loading="lazy" />
              {/* eslint-disable-next-line @next/next/no-img-element -- la misma foto, iluminada donde está el cursor */}
              <img src={o.img} alt="" className="v5-linterna-encendida" loading="lazy" aria-hidden />
            </Link>
            <div className="v5-obra-datos">
              <h3 className="v5-display">{o.nombre}</h3>
              <span className="v5-mono">{d.tipo}</span>
            </div>
            <p className="v5-texto">{d.detalle} <Link href={o.href} className="v5-enlace" aria-label={`${d.accion}: ${o.nombre}`}>{d.accion}</Link></p>
          </article>
          );
        })}
      </div>
    </section>
  );
}
