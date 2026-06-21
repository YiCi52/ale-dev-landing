import {
  Button,
  CatMascot,
  Container,
  Eyebrow,
  Heading,
  Text,
} from "@/components/ui";

const badges = ["Bogotá, Colombia", "Disponible 2026", "Anticipo Bre-B"];

export function Hero() {
  return (
    <section className="flex flex-1 items-center py-32 sm:py-40">
      <Container size="wide">
        <div className="hero-enter">
          <div className="flex items-center gap-3 text-muted">
            <CatMascot className="h-10 w-auto" />
            <Eyebrow as="span">Castillo Studio · Diseño + desarrollo</Eyebrow>
          </div>
          <Heading level="display" className="mt-8 max-w-4xl">
            Sitios que muestran tu trabajo tan bien como es.
          </Heading>
          <Heading level="h3" as="h2" className="mt-6 max-w-2xl text-muted">
            Para arquitectos, diseñadores de interior y estudios con criterio
            visual.
          </Heading>
          <Text size="lg" tone="muted" className="mt-8 max-w-xl">
            Diseño editorial y desarrollo a medida en Next.js. Desde Bogotá,
            para clientes en cualquier parte.
          </Text>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Button as="a" href="#contacto" size="lg" variant="primary">
              Hablemos de tu proyecto
            </Button>
            <Button as="a" href="#casos" size="lg" variant="ghost">
              Ver caso real ↓
            </Button>
          </div>
          <ul className="mt-20 flex flex-wrap items-center gap-x-3 gap-y-3">
            {badges.map((b) => (
              <li key={b}>
                <span className="inline-flex items-center rounded-full border border-[color:var(--color-accent-muted)]/40 px-3 py-1.5 font-sans text-xs uppercase tracking-[0.18em] text-[color:var(--color-accent)]/85">
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
