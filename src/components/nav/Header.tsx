"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CatMascot } from "@/components/ui";
import { cn } from "@/lib/cn";

/*
  Navegación del sitio. Existe porque al pasar a multipágina las páginas
  quedaron sin puerta de entrada: /sobre-mi no estaba enlazada desde ningún
  lado y solo se llegaba escribiendo la URL.

  Sin listeners de scroll a propósito — el fondo es constante. Un header que
  cambia con el scroll obliga a escuchar cada frame de scroll, y esta página
  ya tiene de sobra corriendo.
*/

type Enlace = { href: string; label: string };

const ENLACES: ReadonlyArray<Enlace> = [
  { href: "/#casos", label: "Trabajo" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#contacto", label: "Contacto" },
];

export function Header() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  // El menú se cierra al navegar: sin esto queda abierto encima de la página
  // nueva, porque la navegación de Next no desmonta el header.
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [abierto]);

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/80 backdrop-blur-md">
      {/* Full-bleed con padding propio, no Container centrado: la marca se
          pega al borde izquierdo (brief 24-ago) — el patrón de los
          referentes (Zentro ancla su ✳ y su [Menu] a las esquinas). */}
      <div className="px-5 sm:px-10">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* La marca lleva el LOGO (el gato del sello) — pedido del brief
              24-ago: "falta el logo, y pegar castillo studio más a la
              izquierda". El corrimiento lo da el Container wide + -ml. */}
          <Link
            href="/"
            className="-ml-1 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-opacity hover:opacity-70"
          >
            <span className="block h-6 w-6 shrink-0" aria-hidden>
              <CatMascot className="h-full w-full" />
            </span>
            Castillo Studio
          </Link>

          <nav aria-label="Navegación principal" className="hidden sm:block">
            <ul className="flex items-center gap-8">
              {ENLACES.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="nav-enlace">
                    {e.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            aria-expanded={abierto}
            aria-controls="menu-movil"
            onClick={() => setAbierto((v) => !v)}
            className="sm:hidden -mr-2 flex h-10 w-10 items-center justify-center rounded-sm text-foreground"
          >
            <span className="sr-only">
              {abierto ? "Cerrar menú" : "Abrir menú"}
            </span>
            <span aria-hidden className="relative block h-3 w-5">
              <span
                className={cn(
                  "absolute left-0 block h-px w-5 bg-current transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-quart)]",
                  abierto ? "top-1.5 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-px w-5 bg-current transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-quart)]",
                  abierto ? "top-1.5 -rotate-45" : "top-3",
                )}
              />
            </span>
          </button>
        </div>

        {/*
          El panel móvil se desmonta al cerrarse en vez de ocultarse: así sus
          enlaces no quedan en el orden de tabulación cuando está cerrado.
        */}
        {abierto ? (
          <nav
            id="menu-movil"
            aria-label="Navegación principal"
            className="sm:hidden border-t border-[color:var(--color-border)] py-4"
          >
            <ul className="flex flex-col">
              {ENLACES.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="nav-enlace block py-3">
                    {e.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
