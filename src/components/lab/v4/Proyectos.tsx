"use client";

import Link from "next/link";
import { useState } from "react";

/*
  Proyectos de la página Trabajo (Alejo, 15-oct; referencia: fiddle.digital/work). Filtro por tipo, vista en
  cuadrícula o en lista y un contador. Tarjetas pequeñas en cuadrícula escalonada, con nombre, tipo, año y lugar.
*/
type Tipo = "cliente" | "lab";
type Proyecto = { id: string; nombre: string; tipo: Tipo; etiqueta: string; anio: string; lugar: string; img: string; href: string };

const PROYECTOS: Proyecto[] = [
  { id: "mh", nombre: "MH Interior", tipo: "cliente", etiqueta: "Sitio de cliente", anio: "2026", lugar: "Colombia", img: "/lab/v4/proyectos/mh-sala.webp", href: "/trabajo/mh-interior" },
  { id: "villa", nombre: "Villa Savoye", tipo: "lab", etiqueta: "Lab · casas icónicas Nº 1", anio: "2026", lugar: "Poissy, Francia", img: "/lab/v4/proyectos/villa-salon.webp", href: "/lab/villa-savoye" },
];
const FILTROS: { id: "todos" | Tipo; nombre: string }[] = [
  { id: "todos", nombre: "Todos" },
  { id: "cliente", nombre: "Sitios de cliente" },
  { id: "lab", nombre: "Labs" },
];

export function Proyectos() {
  const [filtro, setFiltro] = useState<"todos" | Tipo>("todos");
  const [vista, setVista] = useState<"cuadricula" | "lista">("cuadricula");
  const lista = PROYECTOS.filter((p) => filtro === "todos" || p.tipo === filtro);
  return (
    <section aria-labelledby="v4-proyectos-t" className="px-4 pb-28 pt-20 sm:px-12">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b pb-6" style={{ borderColor: "var(--linea)" }}>
          <h2 id="v4-proyectos-t" className="v4-display text-[clamp(40px,6vw,88px)] leading-none">Proyectos</h2>
          <div className="flex flex-wrap items-center gap-2">
            {FILTROS.map((f) => (
              <button key={f.id} type="button" className="v4-pastilla v4-mono" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>{f.nombre}</button>
            ))}
            <span className="mx-2 h-4 w-px" style={{ background: "var(--linea)" }} aria-hidden />
            <button type="button" className="v4-pastilla v4-mono" aria-pressed={vista === "cuadricula"} onClick={() => setVista("cuadricula")}>Cuadrícula</button>
            <button type="button" className="v4-pastilla v4-mono" aria-pressed={vista === "lista"} onClick={() => setVista("lista")}>Lista</button>
            <span className="v4-display ml-3 text-[clamp(28px,3vw,44px)] leading-none" aria-label={`${lista.length} proyectos`}>{String(lista.length).padStart(2, "0")}</span>
          </div>
        </div>
        {vista === "cuadricula" ? (
          <ul className="v4-proy-cuadricula mt-12">
            {lista.map((p, i) => (
              <li key={p.id} style={{ ["--fila" as string]: i }}>
                <Link href={p.href} className="v4-proy-tarjeta">
                  {/* eslint-disable-next-line @next/next/no-img-element -- miniatura del proyecto */}
                  <img src={p.img} alt="" loading="lazy" />
                  <span className="v4-proy-datos">
                    <span className="v4-display text-[22px]">{p.nombre}</span>
                    <span className="v4-mono">{p.etiqueta} · {p.lugar} · {p.anio}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <ol className="mt-8">
            {lista.map((p, i) => (
              <li key={p.id}>
                <Link href={p.href} className="v4-proy-fila">
                  <span className="v4-mono">({String(lista.length - i).padStart(2, "0")})</span>
                  <span className="v4-display text-[clamp(24px,3vw,40px)]">{p.nombre}</span>
                  <span className="v4-mono">{p.etiqueta}</span>
                  <span className="v4-mono">{p.lugar}</span>
                  <span className="v4-mono">{p.anio}</span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
