import { Eyebrow, Heading, Reveal, Section, Text } from "@/components/ui";
import { cn } from "@/lib/cn";
import DecryptedText from "@/components/DecryptedText";
import ScrollFloat from "@/components/ScrollFloat";

const pasos = [
  {
    n: "01",
    titulo: "Conversación",
    duracion: "30 min · gratis",
    body:
      "Una llamada para entender qué necesitas, para quién y por qué. Te pregunto todo lo que necesito para no improvisar después.",
  },
  {
    n: "02",
    titulo: "Propuesta y anticipo",
    duracion: "2–3 días",
    body:
      "Te paso por escrito qué construyo, qué entregable, qué plazo y cuánto cuesta. Anticipo del 50% antes de tocar código, en pesos o en dólares. Sin sorpresas.",
  },
  {
    n: "03",
    titulo: "Diseño y desarrollo",
    duracion: "según alcance",
    body:
      "Recibís un link en vivo desde el primer día. Veo cambios contigo, no después. Decisiones de diseño explicadas, no inventadas.",
  },
  {
    n: "04",
    titulo: "Iteración",
    duracion: "2 rondas incluidas",
    body:
      "Lo que no funciona se ajusta. Las dos rondas están dentro del precio acordado. Cambios fuera de alcance se cotizan aparte.",
  },
  {
    n: "05",
    titulo: "Entrega",
    duracion: "+ 1 mes de soporte",
    body:
      "Te paso código, accesos y un mes de soporte incluido para bugs y pequeños ajustes. Si quieres seguir, hablamos de mantenimiento.",
  },
];

export function Proceso() {
  return (
    <Section
      id="proceso"
      containerSize="wide"
      className="border-t border-[color:var(--color-border)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow pill>
            <DecryptedText text="Proceso" animateOn="view" sequential speed={45} />
          </Eyebrow>
          <ScrollFloat
            containerClassName="mt-6"
            textClassName="font-serif text-4xl sm:text-5xl leading-[1.05] tracking-[-0.015em] text-foreground"
          >
            Cómo trabajamos.
          </ScrollFloat>
          <Reveal delay={120}>
            <Text size="lg" tone="muted" className="mt-8">
              Sin caja negra. Cada etapa con un entregable claro, un tiempo
              estimado y una expectativa pactada de antemano.
            </Text>
          </Reveal>
        </div>

        <ol className="space-y-16">
          {pasos.map((paso, i) => (
            <li
              key={paso.n}
              className={cn(
                "border-b border-[color:var(--color-border)] pb-16",
                i === pasos.length - 1 && "border-0 pb-0",
              )}
            >
              <Reveal delay={i * 80}>
                <div className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10">
                  <span
                    aria-hidden
                    className="font-serif text-5xl sm:text-6xl text-[color:var(--color-accent)]/75 tabular-nums leading-none font-medium"
                  >
                    {paso.n}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                      <Heading level="h3" as="h3">
                        {paso.titulo}
                      </Heading>
                      <Eyebrow as="span" className="text-subtle">
                        {paso.duracion}
                      </Eyebrow>
                    </div>
                    <Text size="lg" tone="muted" className="mt-4 max-w-xl">
                      {paso.body}
                    </Text>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
