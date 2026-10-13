"use client";

import { useEffect, useRef } from "react";

import { observarProgreso, sinMovimiento } from "./scroll";

/*
  Dos filas de texto enorme que se cruzan con el scroll (referencia: Zentro).
  13-oct (Alejo): fotos de PROYECTOS entre las palabras —no muestras de material—
  y frases que se entiendan solas: qué hago (sitios que se recorren) y qué pasa
  después (cada consulta llega a tu correo).
*/
type Pieza = { texto?: string; foto?: string; alt?: string };

const FILA_A: Pieza[] = [
  { texto: "SITIOS PARA ARQUITECTOS" }, { foto: "mh-sala" }, { texto: "QUE SE RECORREN" }, { foto: "villa-salon" },
  { texto: "SITIOS PARA ARQUITECTOS" }, { foto: "mh-cocina" },
];
const FILA_B: Pieza[] = [
  { texto: "CADA CONSULTA" }, { foto: "villa-llegada" }, { texto: "LLEGA A TU CORREO" }, { foto: "mh-sala" },
  { texto: "CADA CONSULTA" }, { foto: "villa-salon" }, { texto: "LLEGA A TU CORREO" },
];

function Fila({ piezas, filaRef }: { piezas: Pieza[]; filaRef: React.RefObject<HTMLParagraphElement | null> }) {
  return (
    <p ref={filaRef} aria-hidden className="v4-display whitespace-nowrap text-[clamp(44px,11vw,170px)] leading-[1.05] will-change-transform">
      {piezas.map((p, i) =>
        p.foto ? (
          <span key={i} className="v4-chip" style={{ backgroundImage: `url(/lab/v4/proyectos/${p.foto}.webp)` }} />
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
    // cada fila recorre TODO su largo (en px), sin importar el ancho de la pantalla: en celular también pasan las fotos
    const mover = (fila: HTMLParagraphElement | null, p: number, haciaIzquierda: boolean) => {
      if (!fila) return;
      const sobra = Math.max(0, fila.scrollWidth - window.innerWidth);
      const t = haciaIzquierda ? p : 1 - p;
      fila.style.transform = `translate3d(${-sobra * t}px, 0, 0)`;
    };
    return observarProgreso(el, (p) => {
      mover(filaA.current, p, true);
      mover(filaB.current, p, false);
    });
  }, []);

  return (
    <section ref={seccion} aria-label="Sitios para arquitectos que se recorren; cada consulta llega a tu correo" className="relative h-[220vh]">
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
