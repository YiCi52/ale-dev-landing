import Image from "next/image";
import { Eyebrow, Heading, Section, Text } from "@/components/ui";

const datos = [
  { label: "Ubicación", value: "Bogotá, Colombia" },
  { label: "Especialidad", value: "Diseño + desarrollo web" },
  { label: "Stack", value: "Next.js · Supabase · Tailwind" },
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
            Soy Alejandro. Diseñador y desarrollador en Bogotá, trabajando para
            clientes en cualquier parte. Construyo sitios para arquitectos,
            diseñadores de interior y estudios con criterio visual. Tipografía,
            motion y arquitectura cuidadas — cada decisión se discute contigo,
            no se improvisa.
          </Text>
          <Text size="lg" tone="muted" className="mt-6 max-w-xl">
            Antes construí MacroLift, una web app de nutrición para deportistas.
            Trabajo con foco en web craft — tipografía, motion, jerarquía.
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
