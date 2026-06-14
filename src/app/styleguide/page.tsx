import {
  Button,
  Container,
  Divider,
  Eyebrow,
  Heading,
  Section,
  Text,
} from "@/components/ui";

const colorTokens = [
  { name: "bg", var: "--color-bg", note: "Fondo base" },
  { name: "bg-elevated", var: "--color-bg-elevated", note: "Superficie elevada" },
  { name: "fg", var: "--color-fg", note: "Foreground principal" },
  { name: "fg-muted", var: "--color-fg-muted", note: "Texto secundario" },
  { name: "fg-subtle", var: "--color-fg-subtle", note: "Texto desactivado" },
  { name: "border", var: "--color-border", note: "Borde sutil" },
  { name: "border-strong", var: "--color-border-strong", note: "Borde definido" },
];

const headingLevels = ["display", "h1", "h2", "h3", "h4"] as const;
const textSizes = ["sm", "base", "lg", "xl"] as const;
const buttonVariants = ["primary", "secondary", "ghost"] as const;
const buttonSizes = ["sm", "md", "lg"] as const;

export default function StyleguidePage() {
  return (
    <main>
      <Section spacing="tight" containerSize="wide">
        <Eyebrow>Styleguide · Internal</Eyebrow>
        <Heading level="h1" className="mt-4">
          Sistema de diseño
        </Heading>
        <Text size="lg" tone="muted" className="mt-4 max-w-2xl">
          Tokens, tipografía y primitives del proyecto. Esta página no se publica al sitio
          final — sirve para iterar visual antes de construir secciones.
        </Text>
      </Section>

      <Section spacing="tight" containerSize="wide" className="border-t border-[color:var(--color-border)]">
        <Eyebrow>Paleta</Eyebrow>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {colorTokens.map((token) => (
            <div
              key={token.var}
              className="border border-[color:var(--color-border)] rounded-sm overflow-hidden"
            >
              <div
                className="h-24 w-full"
                style={{ background: `var(${token.var})` }}
              />
              <div className="p-4 bg-[color:var(--color-bg-elevated)]">
                <Text size="sm" tone="default" className="font-mono">
                  {token.name}
                </Text>
                <Text size="sm" tone="muted" className="mt-1">
                  {token.note}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section spacing="tight" containerSize="wide" className="border-t border-[color:var(--color-border)]">
        <Eyebrow>Tipografía · Headings</Eyebrow>
        <div className="mt-10 space-y-12">
          {headingLevels.map((level) => (
            <div key={level} className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 sm:gap-8 items-baseline">
              <Eyebrow as="span" className="text-subtle">
                {level}
              </Eyebrow>
              <Heading level={level}>El criterio se ve.</Heading>
            </div>
          ))}
        </div>
      </Section>

      <Section spacing="tight" containerSize="wide" className="border-t border-[color:var(--color-border)]">
        <Eyebrow>Tipografía · Body</Eyebrow>
        <div className="mt-10 space-y-8">
          {textSizes.map((size) => (
            <div key={size} className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 sm:gap-8 items-baseline">
              <Eyebrow as="span" className="text-subtle">
                size={size}
              </Eyebrow>
              <Text size={size}>
                Cada decisión visible es una decisión deliberada. La tipografía no es decoración.
              </Text>
            </div>
          ))}
          <Divider />
          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 sm:gap-8 items-baseline">
            <Eyebrow as="span" className="text-subtle">
              tone=muted
            </Eyebrow>
            <Text tone="muted">
              Las webs de plantilla se ven todas iguales porque nadie tomó una sola decisión.
            </Text>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 sm:gap-8 items-baseline">
            <Eyebrow as="span" className="text-subtle">
              tone=subtle
            </Eyebrow>
            <Text tone="subtle">
              Para metadatos, fechas, captions y otra información secundaria.
            </Text>
          </div>
        </div>
      </Section>

      <Section spacing="tight" containerSize="wide" className="border-t border-[color:var(--color-border)]">
        <Eyebrow>Buttons</Eyebrow>
        <div className="mt-10 space-y-12">
          {buttonVariants.map((variant) => (
            <div key={variant}>
              <Eyebrow as="span" className="text-subtle">
                variant={variant}
              </Eyebrow>
              <div className="mt-4 flex flex-wrap gap-4 items-end">
                {buttonSizes.map((size) => (
                  <Button key={size} variant={variant} size={size}>
                    Hablemos
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section spacing="tight" containerSize="wide" className="border-t border-[color:var(--color-border)]">
        <Eyebrow>Eyebrow</Eyebrow>
        <div className="mt-8">
          <Eyebrow>Alejandro Díaz del Castillo · Dev freelance</Eyebrow>
        </div>
      </Section>
    </main>
  );
}
