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

/*
  No hay tabla de precios pública (decisión 2026-08-01). Un número en COP
  ancla al visitante en el piso más bajo que vio y no traduce a un mercado
  en USD. En su lugar se publica el MÉTODO: qué pasa entre el primer mensaje
  y la cifra. Da la transparencia sin regalar el ancla, y de paso vende la
  conversación de diagnóstico.
*/
type CotizaStep = {
  step: string;
  title: string;
  note: string;
};

const cotizaSteps: ReadonlyArray<CotizaStep> = [
  {
    step: "01",
    title: "Una conversación de 20 minutos",
    note: "Cuántos interesados te llegan, quién los atiende, cuántos se quedan sin respuesta y cuánto vale uno que sí se convierte en trabajo.",
  },
  {
    step: "02",
    title: "El alcance por escrito, antes que la cifra",
    note: "Lista explícita de lo que incluye y de lo que no. Si algo se te ocurre a mitad del proyecto, va al plan de la siguiente versión — no a una factura sorpresa.",
  },
  {
    step: "03",
    title: "Un número, desglosado",
    note: "Vas a ver de dónde sale. Si no cuadra con lo que tienes, ajustamos el alcance — no el precio.",
  },
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
              <span className="text-muted">y cómo se cotiza.</span>
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
              <Eyebrow as="span">Cómo se cotiza</Eyebrow>
              <ol className="mt-6">
                {cotizaSteps.map((item) => (
                  <li
                    key={item.step}
                    className="grid grid-cols-[auto_1fr] gap-x-5 border-b border-[color:var(--color-border)] py-6 last:border-b-0"
                  >
                    <span
                      aria-hidden
                      className="font-mono text-xs tracking-[0.18em] text-[color:var(--color-accent)] pt-1.5"
                    >
                      {item.step}
                    </span>
                    <div>
                      <Text size="lg" className="font-medium">
                        {item.title}
                      </Text>
                      <Text size="sm" tone="subtle" className="mt-2 max-w-md">
                        {item.note}
                      </Text>
                    </div>
                  </li>
                ))}
              </ol>
              <Text size="sm" tone="subtle" className="mt-6 max-w-md">
                Anticipo del 50% antes de empezar. Se factura en pesos
                colombianos o en dólares, según dónde estés.
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
