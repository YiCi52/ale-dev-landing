import Image from "next/image";
import Link from "next/link";
import { Eyebrow, Heading, Section, Text } from "@/components/ui";

/*
  Baraja de casos — patrón portfolio-first (referencia: vanity.llc).
  Cada caso es una TARJETA que enlaza a su propia página, en vez de vivir
  embebido en la home. Ver design-system/castillo-v2/arquitectura-multipagina.md

  Accesibilidad: cada tarjeta es un <Link> real, no un div con onClick — funciona
  con teclado, con clic derecho "abrir en pestaña nueva" y sin JS.
  El efecto de baraja es CSS (rotación en reposo que se endereza en hover/focus),
  así nada depende de una librería de motion para ser usable.
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

const casos: Caso[] = [
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

      <ul className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        {casos.map((c, i) => (
          <li key={c.slug} className="baraja-carta" data-index={i}>
            <Link
              href={`/trabajo/${c.slug}`}
              className="group block h-full overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] transition-[transform,border-color] duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] pointer-fine:hover:-translate-y-2 hover:border-[color:var(--color-border-strong)] focus-visible:-translate-y-2"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[color:var(--color-bg)]">
                <Image
                  src={c.img}
                  alt={c.alt}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover object-top transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] pointer-fine:group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
              <div className="p-8">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                  {c.eyebrow}
                </span>
                <Heading level="h3" as="h3" className="mt-4">
                  {c.titulo}
                </Heading>
                <Text size="base" tone="muted" className="mt-3 max-w-md">
                  {c.resultado}
                </Text>
                <div className="mt-8 flex items-center justify-between">
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
      </ul>
    </Section>
  );
}
