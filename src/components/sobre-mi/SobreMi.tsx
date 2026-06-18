import Image from "next/image";
import { Eyebrow, Heading, Section, Text } from "@/components/ui";

const datos = [
  { label: "Ubicación", value: "Bogotá, Colombia" },
  { label: "Formación", value: "Ing. de Software · 2026–" },
  { label: "Bachillerato", value: "Oakland Colegio Campestre · 2025" },
  { label: "Tiempo dedicado", value: "14h / semana" },
];

export function SobreMi() {
  return (
    <Section
      id="sobre-mi"
      containerSize="wide"
      className="border-t border-[color:var(--color-border)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-20 items-start">
        <figure className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-[color:var(--color-bg-elevated)]">
          <Image
            src="/sobre-mi/alejandro.jpg"
            alt="Alejandro Díaz del Castillo"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
            priority={false}
          />
        </figure>

        <div>
          <Eyebrow>Sobre mí</Eyebrow>
          <Heading level="h2" className="mt-6">
            Una persona,
            <br />
            <span className="text-muted">no una agencia.</span>
          </Heading>

          <Text size="lg" tone="muted" className="mt-10 max-w-xl">
            Soy Alejandro. Construyo webs y web apps para emprendedores y PYMEs
            en Colombia. Vendo criterio y ejecución, no velocidad. Cada
            decisión de diseño, copy y arquitectura se discute contigo, no se
            improvisa.
          </Text>
          <Text size="lg" tone="muted" className="mt-6 max-w-xl">
            Vengo del mundo del análisis y la automatización. Empecé a
            construir software porque me cansé de ver herramientas que prometen
            todo y no resuelven nada. Mi primer proyecto serio fue MacroLift —
            mi trabajo de grado de undécimo, sustentado en 2025.
          </Text>

          <dl className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 border-t border-[color:var(--color-border)] pt-10 max-w-xl">
            {datos.map((d) => (
              <div key={d.label}>
                <dt className="text-sm text-subtle uppercase tracking-[0.18em]">
                  {d.label}
                </dt>
                <dd className="mt-2 font-serif text-xl text-foreground">
                  {d.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}
