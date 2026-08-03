import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Eyebrow, Heading, Section, Text } from "@/components/ui";

/*
  Baraja de casos — pila vertical apilable.

  Referencia: vanity.llc/work (navegado 2026-08-02), donde las cartas se
  recorren en vertical y la activa ocupa el escenario mientras las demás
  quedan como lonjas. NO se copió su otra baraja —el coverflow horizontal de
  su home— porque esa está construida para diez proyectos: su gracia ES la
  cantidad, y con dos cartas se ve vacía y miente sobre la escala.

  Cómo funciona, y por qué así:
  - Cada carta es `position: sticky` con un tope escalonado (`--i`). Al bajar,
    la carta nueva sube y se detiene un poco más abajo que la anterior, así
    queda a la vista una franja de la de atrás. Eso es la pila.
  - Sin JavaScript y sin observadores: es scroll nativo. La sección no depende
    de que monte nada para ser usable.
  - Sin animar altura ni márgenes (ECC prohíbe animar propiedades de layout).
    El efecto de profundidad lo da el escalonado en sí, no una animación.
  - Cada carta es un <Link> real: funciona con teclado, con "abrir en pestaña
    nueva" y sin JS.
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

      <ol className="baraja mt-16">
        {casos.map((c, i) => (
          <li
            key={c.slug}
            className="baraja__carta"
            style={{ "--i": i } as CSSProperties}
          >
            <Link
              href={`/trabajo/${c.slug}`}
              className="group grid grid-cols-1 overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] transition-[border-color] duration-[var(--duration-slow)] hover:border-[color:var(--color-border-strong)] lg:grid-cols-[1.15fr_1fr]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[color:var(--color-bg)] lg:aspect-auto lg:min-h-[26rem]">
                <Image
                  src={c.img}
                  alt={c.alt}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover object-top transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] pointer-fine:group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-col justify-between gap-10 p-8 sm:p-10 lg:p-12">
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                    {c.eyebrow}
                  </span>
                  <Heading level="h3" as="h3" className="mt-5">
                    {c.titulo}
                  </Heading>
                  <Text size="lg" tone="muted" className="mt-4 max-w-md">
                    {c.resultado}
                  </Text>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-subtle">
                    {c.meta}
                  </span>
                  <span
                    aria-hidden
                    className="font-mono text-xs uppercase tracking-[0.18em] text-foreground transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-quart)] pointer-fine:group-hover:translate-x-1"
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
