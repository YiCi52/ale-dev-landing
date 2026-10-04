import Image from "next/image";
import Link from "next/link";

import { Eyebrow, Heading, Reveal, Section, Text } from "@/components/ui";
import { LAB_DESTACADO, LABS, type Lab } from "@/lib/labs";

/*
  Labs (4-oct-2026) — la sección 3 de la arquitectura del MASTER ("/lab
  público"). La Villa va grande porque es la pieza que más dice del método:
  una casa reconstruida desde planos y fotos. Los otros labs, en tarjetas.
  Las tarjetas son enlaces completos: todo el bloque es clicable, con hover
  de borde (no de color de fondo) como la baraja de casos.
*/

const ESTADO_RECORRIDO = "Recorrido en producción";

function TarjetaLab({ lab, indice }: { lab: Lab; indice: number }) {
  return (
    <Link
      href={`/lab/${lab.slug}`}
      className="group block overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] transition-[border-color] duration-[var(--duration-normal)] hover:border-[color:var(--color-border-strong)] focus-visible:border-[color:var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--color-accent)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={lab.imagen}
          alt={lab.alt}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw"
          className="object-cover object-top transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] pointer-fine:group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-fg-subtle)]">
          / {String(indice + 2).padStart(2, "0")} · {lab.tipo}
        </p>
        <h3 className="mt-2 text-balance text-lg font-semibold tracking-[-0.005em] text-[color:var(--color-fg)]">
          {lab.nombre}
        </h3>
        <Text size="sm" tone="subtle" className="mt-2">
          {lab.resumen}
        </Text>
      </div>
    </Link>
  );
}

function LabDestacado() {
  const lab = LAB_DESTACADO;
  return (
    <Link
      href={`/lab/${lab.slug}`}
      className="group grid overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] transition-[border-color] duration-[var(--duration-normal)] hover:border-[color:var(--color-border-strong)] focus-visible:border-[color:var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--color-accent)] lg:grid-cols-[3fr_2fr]"
    >
      <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[420px]">
        <Image
          src={lab.imagen}
          alt={lab.alt}
          fill
          sizes="(min-width: 1024px) 58vw, 92vw"
          className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] pointer-fine:group-hover:scale-[1.02]"
        />
        <span className="absolute left-4 top-4 rounded-full border border-[color:var(--color-border-strong)] bg-black/55 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-fg)] backdrop-blur-sm">
          {ESTADO_RECORRIDO}
        </span>
      </div>
      <div className="flex flex-col justify-between gap-8 p-6 lg:p-10">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-accent)]">
            / 01 · {lab.tipo}
          </p>
          <h3 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.015em] text-[color:var(--color-fg)] lg:text-4xl">
            {lab.nombre}
          </h3>
          <Text tone="muted" className="mt-4">
            {lab.resumen}
          </Text>
        </div>
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-fg)] transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-quart)] pointer-fine:group-hover:translate-x-1">
          Ver la casa <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export function LabsSeccion() {
  return (
    <Section id="labs" containerSize="wide" className="border-t border-[color:var(--color-border)]">
      <div className="max-w-2xl">
        <Eyebrow pill>Labs</Eyebrow>
        <Reveal variant="clip" className="mt-6">
          <Heading level="h2">
            Donde pruebo
            <br />
            <span className="text-muted">antes de construir.</span>
          </Heading>
        </Reveal>
        <Reveal delay={120}>
          <Text size="lg" tone="muted" className="mt-8">
            Piezas de estudio: réplicas declaradas y exploraciones propias. Aquí se prueba cada
            técnica antes de llevarla a un sitio real.
          </Text>
        </Reveal>
      </div>

      <Reveal className="mt-14">
        <LabDestacado />
      </Reveal>

      <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {LABS.map((lab, i) => (
          <li key={lab.slug}>
            <Reveal delay={i * 80}>
              <TarjetaLab lab={lab} indice={i} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
