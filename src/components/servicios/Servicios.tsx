import { Eyebrow, Heading, Reveal, Section, Text } from "@/components/ui";
import { cn } from "@/lib/cn";
import DecryptedText from "@/components/DecryptedText";
import { RetainerBlock } from "./RetainerBlock";

type BuildItem = {
  title: string;
  note: string;
};

const buildItems: ReadonlyArray<BuildItem> = [
  {
    title: "Sitios editoriales para arquitectos y diseñadores",
    note: "Tipografía con carácter, jerarquía clara, cada proyecto presentado como merece.",
  },
  {
    title: "Portafolios que elevan el trabajo, no compiten con él",
    note: "Layout pensado para que las imágenes manden, sin pinta de plantilla SquareSpace.",
  },
  {
    title: "Interfaces a medida con motion sutil",
    note: "Transiciones que aclaran, no distraen. Mobile-first, accesible, rápido.",
  },
  {
    title: "SEO técnico real y core web vitals serios",
    note: "Lighthouse ≥95, schema markup, sitemap, og:image. No plugins genéricos.",
  },
  {
    title: "Seguridad auditada antes de entregar",
    note: "Headers de seguridad, formularios protegidos contra spam y bots, datos de tus clientes tratados según la ley colombiana. Recibes el reporte de auditoría con tu sitio.",
  },
];

type PriceItem = {
  service: string;
  price: string;
};

const priceItems: ReadonlyArray<PriceItem> = [
  { service: "Landing 1 página", price: "desde $1.5M COP" },
  { service: "Sitio portafolio 5 páginas", price: "desde $3.6M COP" },
];

export function Servicios() {
  return (
    <Section
      id="servicios"
      containerSize="wide"
      className="border-t border-[color:var(--color-border)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
        <div>
          <Eyebrow pill>
            <DecryptedText text="Servicios" animateOn="view" sequential speed={45} />
          </Eyebrow>
          <Reveal variant="clip" className="mt-6">
            <Heading level="h2">
              Qué construyo
              <br />
              <span className="text-muted">y cuánto cuesta.</span>
            </Heading>
          </Reveal>
          <Reveal delay={120}>
            <Text size="lg" tone="muted" className="mt-8">
              Diseño y desarrollo a medida para estudios pequeños y profesionales
              independientes que necesitan que su web esté a la altura del trabajo
              que muestran.
            </Text>
          </Reveal>
        </div>

        <div className="space-y-16">
          <ul className="space-y-10">
            {buildItems.map((item, i) => (
              <li
                key={item.title}
                className={cn(
                  "border-b border-[color:var(--color-border)] pb-10",
                  i === buildItems.length - 1 && "border-b-0 pb-0",
                )}
              >
                <Reveal delay={i * 90}>
                  <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
                    <span
                      aria-hidden
                      className="reveal-hairline mt-3 h-px w-6 bg-foreground"
                    />
                    <div>
                      <Text size="lg" className="font-medium">
                        {item.title}
                      </Text>
                      <Text size="sm" tone="subtle" className="mt-2">
                        {item.note}
                      </Text>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal>
            <div>
              <Eyebrow as="span">Precios desde</Eyebrow>
              <dl className="mt-6 grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-x-10">
                {priceItems.map((item) => (
                  <div key={item.service} className="contents">
                    <dt className="font-serif text-lg text-foreground border-b border-[color:var(--color-border)] py-4">
                      {item.service}
                    </dt>
                    <dd className="font-sans text-sm text-muted border-b border-[color:var(--color-border)] py-4 sm:text-right">
                      {item.price}
                    </dd>
                  </div>
                ))}
              </dl>
              <Text size="sm" tone="subtle" className="mt-6 max-w-md">
                Anticipo del 50% vía Bre-B antes de empezar. Cliente fuera de
                Colombia: equivalente en USD vía Wise.
              </Text>
            </div>
          </Reveal>

          <Reveal>
            <RetainerBlock />
          </Reveal>

          <Reveal>
            <div className="border-t border-[color:var(--color-border)] pt-10">
              <Eyebrow as="span" className="text-subtle">
                Lo que no hago hoy
              </Eyebrow>
              <Text size="base" tone="muted" className="mt-4 max-w-xl">
                E-commerce con inventario complejo, apps nativas, plataformas con
                datos médicos o financieros. Si tu proyecto va por ahí, te
                recomiendo a alguien que lo haga mejor que yo.
              </Text>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
