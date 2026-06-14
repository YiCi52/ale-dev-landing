import { Eyebrow, Heading, Section, Text } from "@/components/ui";

const siItems = [
  {
    title: "Landings de marca o producto",
    note: "Una página con criterio, pensada para convertir.",
  },
  {
    title: "Sitios corporativos pequeños",
    note: "5–10 secciones, navegación clara, copy editado.",
  },
  {
    title: "Web apps con auth y base de datos",
    note: "Login, dashboards, lógica de negocio, Supabase.",
  },
  {
    title: "PWAs y dashboards a medida",
    note: "Instalables en mobile, rápidas, sin pinta de plantilla.",
  },
  {
    title: "Migraciones desde Wix o WordPress",
    note: "A un stack moderno que escala y se ve serio.",
  },
];

const noItems = [
  {
    title: "E-commerce con inventario complejo",
    note: "Pagos, stock, devoluciones legales — fuera de scope hoy.",
  },
  {
    title: "Apps nativas iOS / Android",
    note: "Trabajo PWA. Para nativo te recomiendo a alguien.",
  },
  {
    title: "Plataformas con datos sensibles",
    note: "Salud, financiero, menores — compliance fuera de mi alcance.",
  },
  {
    title: "Mantenimiento de sistemas legacy",
    note: "No toco código viejo de otros sin reescribirlo.",
  },
  {
    title: "Cambios urgentes sin alcance",
    note: "Si no podemos describir qué cambia, mejor no empezamos.",
  },
];

type ItemListProps = {
  label: string;
  tone: "yes" | "no";
  items: ReadonlyArray<{ title: string; note: string }>;
};

function ItemList({ label, tone, items }: ItemListProps) {
  const markerColor =
    tone === "yes"
      ? "border-foreground text-foreground"
      : "border-[color:var(--color-border-strong)] text-subtle";

  return (
    <div>
      <div className="flex items-baseline gap-3 border-b border-[color:var(--color-border)] pb-4">
        <span
          aria-hidden
          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-2 font-sans text-xs ${markerColor}`}
        >
          {tone === "yes" ? "SÍ" : "NO"}
        </span>
        <Eyebrow as="span">{label}</Eyebrow>
      </div>
      <ul className="mt-8 space-y-8">
        {items.map((item) => (
          <li key={item.title} className="grid grid-cols-[auto_1fr] gap-4 items-start">
            <span
              aria-hidden
              className={`mt-2 h-px w-6 ${
                tone === "yes" ? "bg-foreground" : "bg-[color:var(--color-border-strong)]"
              }`}
            />
            <div>
              <Text
                size="lg"
                tone={tone === "yes" ? "default" : "muted"}
                className="font-medium"
              >
                {item.title}
              </Text>
              <Text size="sm" tone="subtle" className="mt-2">
                {item.note}
              </Text>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Servicios() {
  return (
    <Section
      id="servicios"
      containerSize="wide"
      className="border-t border-[color:var(--color-border)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
        <div>
          <Eyebrow>Servicios</Eyebrow>
          <Heading level="h2" className="mt-6">
            Qué construyo
            <br />
            <span className="text-muted">(y qué no).</span>
          </Heading>
          <Text size="lg" tone="muted" className="mt-8">
            Te lo cuento de entrada para que no perdamos tiempo ni vos ni yo.
            Si tu proyecto está en la columna izquierda, hablemos.
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <ItemList label="Lo que tomo" tone="yes" items={siItems} />
          <ItemList label="Lo que no, hoy" tone="no" items={noItems} />
        </div>
      </div>
    </Section>
  );
}
