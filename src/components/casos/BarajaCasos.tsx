"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Eyebrow, Heading, Section, Text } from "@/components/ui";

/*
  Baraja de casos — acordeón vertical guiado por scroll.

  Referencia exacta: vanity.llc/work, revisado frame a frame sobre una
  grabación que mandó Alejandro (2026-08-03). El mecanismo NO es apilar: las
  cartas no se superponen. Están todas en lista, y **la que queda en el centro
  del viewport se expande** mientras las demás se comprimen en franjas. Se ve
  el catálogo completo de un vistazo y una sola pieza protagoniza.

  (La primera versión que construí sí apilaba con `position: sticky`. Se veía
  bien pero era otra cosa; él lo notó comparando con el video.)

  SOBRE ANIMAR ALTURA — decisión consciente, no descuido:
  ECC pide evitar animar propiedades de layout porque obligan al navegador a
  rehacer geometría en cada cuadro. Acá se hace igual, y se justifica:
  - Son 2-6 cartas, no una lista larga.
  - `contain: layout paint` en cada carta acota el recálculo a su propia caja.
  - La imagen va en position absolute con object-fit, así que cambiar el alto
    del contenedor NO reflowea nada por dentro: solo cambia el recorte.
  - No hay alternativa con transform que no deforme la foto: `scaleY` estira.
  El costo se midió como aceptable para este número de elementos; si algún día
  hay 15 casos, esto se revisa.

  Guardas:
  - Sin JS la primera carta queda abierta y las demás cerradas PERO legibles:
    el rótulo (título + año) vive siempre visible en la franja, no solo al
    expandirse. En Vanity las franjas no llevan texto porque sus imágenes son
    packshots reconocibles; las de acá son capturas de sitios, que en una
    franja no se distinguen. Adaptación deliberada, no copia.
  - Cada carta es un <Link> real: teclado, clic derecho y sin JS.
  - prefers-reduced-motion: sin transición de alto (el cambio es instantáneo).
*/

type Caso = {
  slug: string;
  eyebrow: string;
  titulo: string;
  resultado: string;
  meta: string;
  img: string;
  alt: string;
};

const casos: ReadonlyArray<Caso> = [
  {
    slug: "mh-interior",
    eyebrow: "Caso · Diseño interior",
    titulo: "MH Interior Design",
    resultado:
      "Portafolio bilingüe con un sistema que registra y notifica cada contacto.",
    meta: "Bogotá · 2026",
    img: "/casos/mhinterior/shot-1-hero.png",
    alt: "Hero del sitio MH Interior Design con carrusel de proyectos",
  },
  {
    slug: "macrolift",
    eyebrow: "Capacidad técnica previa",
    titulo: "MacroLift",
    resultado:
      "Aplicación de cálculo nutricional: lógica, estado y despliegue propios.",
    meta: "Proyecto propio · 2025",
    img: "/casos/macrolift/shot-1.png",
    alt: "Interfaz de la aplicación MacroLift",
  },
];

export function BarajaCasos() {
  // Arranca en 0 y no en null: sin JS —o antes de que monte el observador— la
  // primera carta ya está abierta y la sección nunca se ve toda colapsada.
  const [activa, setActiva] = useState(0);
  const listaRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const lista = listaRef.current;
    if (!lista) return;

    const cartas = Array.from(
      lista.querySelectorAll<HTMLElement>("[data-indice]"),
    );
    if (!cartas.length) return;

    /*
      El rootMargin recorta el viewport a una banda estrecha en el centro, así
      que la única carta que "intersecta" es la que está en el medio. Es más
      barato y más estable que escuchar scroll y medir distancias a mano.
    */
    const observador = new IntersectionObserver(
      (entradas) => {
        const enElCentro = entradas.find((e) => e.isIntersecting);
        if (!enElCentro) return; // fuera de la banda: se mantiene la última
        const i = Number(
          (enElCentro.target as HTMLElement).dataset.indice ?? "0",
        );
        setActiva(i);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    cartas.forEach((c) => observador.observe(c));
    return () => observador.disconnect();
  }, []);

  return (
    <Section id="casos" containerSize="wide">
      <Eyebrow>Trabajo seleccionado</Eyebrow>
      <Heading level="h2" className="mt-6 max-w-3xl">
        Dos proyectos, contados completos.
      </Heading>
      <Text size="lg" tone="muted" className="mt-6 max-w-2xl">
        No capturas sueltas: qué problema tenía el cliente, qué se decidió y qué
        quedó funcionando después de la entrega.
      </Text>

      <ol ref={listaRef} className="baraja mt-16">
        {casos.map((c, i) => (
          <li
            key={c.slug}
            data-indice={i}
            data-activa={activa === i}
            className="baraja__carta"
          >
            <Link
              href={`/trabajo/${c.slug}`}
              className="group relative block h-full w-full overflow-hidden rounded-lg border border-[color:var(--color-border)] transition-[border-color] duration-[var(--duration-normal)] hover:border-[color:var(--color-border-strong)]"
            >
              <Image
                src={c.img}
                alt={c.alt}
                fill
                sizes="(min-width: 1024px) 90vw, 100vw"
                className="object-cover object-top transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] pointer-fine:group-hover:scale-[1.02]"
                loading="lazy"
              />
              {/* Velo: sin él el texto compite con la captura y ninguno gana. */}
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20"
              />

              {/*
                DOS capas ancladas al fondo, no un flex en columna. Motivo: el
                detalle oculto seguía ocupando su caja (`visibility: hidden`
                esconde pero NO quita espacio) y empujaba el título fuera del
                recorte de la franja — se veía cortado por arriba. Separadas,
                el rótulo queda clavado abajo y el detalle se recorta solo.
              */}
              <div className="baraja__detalle absolute inset-x-0 bottom-0 p-6 pb-24 sm:p-8 sm:pb-28 lg:p-10 lg:pb-32">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                  {c.eyebrow}
                </span>
                <Text size="lg" className="mt-4 max-w-md text-white/90">
                  {c.resultado}
                </Text>
              </div>

              {/* Rótulo: visible SIEMPRE, también con la carta en franja. */}
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 p-6 sm:p-8 lg:p-10">
                <Heading level="h3" as="h3" className="text-white">
                  {c.titulo}
                </Heading>
                <div className="flex items-baseline gap-6">
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/60">
                    {c.meta}
                  </span>
                  <span
                    aria-hidden
                    className="baraja__cta font-mono text-xs uppercase tracking-[0.18em] text-white transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-quart)] pointer-fine:group-hover:translate-x-1"
                  >
                    Ver caso →
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </Section>
  );
}
