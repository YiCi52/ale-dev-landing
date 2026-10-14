"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/*
  Cabecera de todas las páginas v4 (Alejo, 15-oct): el logo (la C) y el nombre juntos son UN solo botón que vuelve al
  inicio; si ya estás en el inicio, sube arriba. El menú se despliega en un panel de vidrio esmerilado
  (glassmorphism) con las pestañas que toda página tiene (referencia: el menú de fiddle.digital).
*/
const C_LOGO = (() => {
  const R = 100, r = 91, dx = 24, x = (R * R - r * r + dx * dx) / (2 * dx), y = Math.sqrt(R * R - x * x);
  return `M${x.toFixed(2)},${(-y).toFixed(2)} A${R},${R} 0 1 0 ${x.toFixed(2)},${y.toFixed(2)} A${r},${r} 0 ${x > dx ? 1 : 0} 1 ${x.toFixed(2)},${(-y).toFixed(2)}Z`;
})();

const INICIO = "/lab/v4";
const PESTANAS = [
  { href: `${INICIO}/trabajo`, nombre: "Trabajo", nota: "Servicios y proyectos" },
  { href: `${INICIO}/acerca`, nombre: "Acerca de", nota: "Quién está detrás" },
  { href: `${INICIO}/hablemos`, nombre: "Hablemos", nota: "Agenda 15 minutos" },
] as const;

export function Cabecera() {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => { if (e.key === "Escape") { setAbierto(false); boton.current?.focus(); } };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  const alInicio = (e: React.MouseEvent) => {
    setAbierto(false);
    if (ruta === INICIO) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  return (
    <>
      <header className="v4-cabecera">
        <Link href={INICIO} onClick={alInicio} className="v4-marca" aria-label="Castillo Studio, volver al inicio">
          <svg viewBox="-110 -110 220 220" aria-hidden className="v4-marca-logo">
            <path d={C_LOGO} fill="currentColor" />
          </svg>
          <span className="v4-mono" style={{ color: "inherit" }}>Castillo Studio</span>
        </Link>
        <button ref={boton} type="button" className="v4-menu-boton v4-mono" aria-expanded={abierto} aria-controls="v4-menu" onClick={() => setAbierto((a) => !a)}>
          <span aria-hidden className="v4-menu-rayas" data-abierto={abierto} />
          {abierto ? "Cerrar" : "Menú"}
        </button>
      </header>
      <nav id="v4-menu" aria-label="Menú principal" className="v4-menu" data-abierto={abierto} inert={!abierto}>
        <ol className="grid gap-1">
          {PESTANAS.map((p, i) => (
            <li key={p.href}>
              <Link href={p.href} className="v4-menu-item" onClick={() => setAbierto(false)} aria-current={ruta === p.href ? "page" : undefined} style={{ ["--i" as string]: i }}>
                <span className="v4-display v4-menu-nombre">{p.nombre}</span>
                <span className="v4-mono">{p.nota}</span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="v4-menu-pie">
          <Link href={`${INICIO}#v4-proyectos`} className="v4-mono" onClick={() => setAbierto(false)}>Proyectos</Link>
          <span className="v4-mono">Estudio web para arquitectura e interiorismo</span>
        </div>
      </nav>
    </>
  );
}
