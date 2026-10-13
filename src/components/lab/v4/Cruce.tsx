"use client";

import { useEffect, useRef } from "react";

import { observarProgreso, sinMovimiento } from "./scroll";

/*
  Dos filas de texto enorme que se cruzan con el scroll (referencia: Zentro),
  con muestras de los materiales metidas entre las palabras como si fueran letras:
  cada material tiene su momento sin necesidad de una escena.
*/
type Pieza = { texto?: string; chip?: "piedra" | "nogal" | "cuarzo" };

const FILA_A: Pieza[] = [
  { texto: "DISEÑO" }, { chip: "nogal" }, { texto: "RECORRIDO" }, { chip: "cuarzo" }, { texto: "PROYECTO" }, { chip: "piedra" },
  { texto: "DISEÑO" }, { chip: "nogal" }, { texto: "RECORRIDO" },
];
const FILA_B: Pieza[] = [
  { texto: "CONSULTAS" }, { chip: "cuarzo" }, { texto: "QUE LLEGAN" }, { chip: "piedra" }, { texto: "REGISTRADAS" }, { chip: "nogal" },
  { texto: "CONSULTAS" }, { chip: "cuarzo" }, { texto: "QUE LLEGAN" },
];

function Fila({ piezas, filaRef }: { piezas: Pieza[]; filaRef: React.RefObject<HTMLParagraphElement | null> }) {
  return (
    <p ref={filaRef} aria-hidden className="v4-display whitespace-nowrap text-[clamp(52px,11vw,170px)] leading-[1.05] will-change-transform">
      {piezas.map((p, i) =>
        p.chip ? (
          <span key={i} className="v4-chip" style={{ backgroundImage: `url(/lab/v4/materiales/${p.chip}.webp)` }} />
        ) : (
          <span key={i}>{p.texto} </span>
        ),
      )}
    </p>
  );
}

export function Cruce() {
  const seccion = useRef<HTMLElement>(null);
  const filaA = useRef<HTMLParagraphElement>(null);
  const filaB = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = seccion.current;
    if (!el || sinMovimiento()) return;
    return observarProgreso(el, (p) => {
      const d = (p - 0.5) * 38; // % de su propio ancho
      if (filaA.current) filaA.current.style.transform = `translate3d(${-8 - d}%, 0, 0)`;
      if (filaB.current) filaB.current.style.transform = `translate3d(${-30 + d}%, 0, 0)`;
    });
  }, []);

  return (
    <section ref={seccion} aria-label="Qué hace Castillo Studio" className="relative h-[220vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center gap-2 overflow-hidden">
        <Fila piezas={FILA_A} filaRef={filaA} />
        <Fila piezas={FILA_B} filaRef={filaB} />
        <p className="mx-4 mt-10 max-w-[52ch] text-base leading-relaxed sm:mx-12" style={{ color: "var(--cuarzo-200)" }}>
          Diseño el sitio de tu estudio a la medida de tu obra. Y lo que pasa después de la visita —el formulario, el aviso a tu
          correo, el respaldo— viene construido desde el primer día.
        </p>
      </div>
    </section>
  );
}
