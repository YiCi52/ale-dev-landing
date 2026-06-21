import { Button, Container, Eyebrow, Heading, Text } from "@/components/ui";

export function Hero() {
  return (
    <section className="flex flex-1 items-center py-32 sm:py-40">
      <Container size="wide">
        <Eyebrow>Castillo Studio · Diseño + desarrollo</Eyebrow>
        <Heading level="display" className="mt-8 max-w-5xl">
          Sitios que muestran tu trabajo tan bien como es.
          <br />
          <span className="text-muted">
            Para arquitectos, diseñadores de interior y estudios con criterio visual.
          </span>
        </Heading>
        <Text size="xl" tone="muted" className="mt-10 max-w-2xl">
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
        <div className="mt-20 flex flex-wrap items-center gap-x-8 gap-y-2 text-subtle">
          <Eyebrow as="span" className="text-subtle">
            Bogotá, Colombia
          </Eyebrow>
          <Eyebrow as="span" className="text-subtle">
            Disponible 2026
          </Eyebrow>
          <Eyebrow as="span" className="text-subtle">
            Anticipo Bre-B
          </Eyebrow>
        </div>
      </Container>
    </section>
  );
}
