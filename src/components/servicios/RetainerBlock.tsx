import { Eyebrow, Text } from "@/components/ui";

const includes: ReadonlyArray<string> = [
  "Monitoreo de uptime y errores en producción",
  "Security updates de dependencias críticas",
  "2 horas mensuales de cambios menores (copy, imágenes, ajustes)",
  "Soporte prioritario por WhatsApp o email",
];

export function RetainerBlock() {
  return (
    <aside
      aria-label="Cuidado mensual del sitio"
      className="rounded-sm border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-8 lg:p-10"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <Eyebrow as="span">Cuidado mensual del sitio</Eyebrow>
        <Text size="lg" className="font-serif font-medium">
          $400.000 COP / mes
        </Text>
      </div>

      <Text size="base" tone="muted" className="mt-6 max-w-xl">
        Después de los 30 días de soporte incluidos en cada proyecto, podés
        contratar mantenimiento continuo. No es obligatorio.
      </Text>

      <ul className="mt-8 space-y-4">
        {includes.map((item) => (
          <li
            key={item}
            className="grid grid-cols-[auto_1fr] gap-3 items-start"
          >
            <span aria-hidden className="mt-2.5 h-px w-4 bg-foreground" />
            <Text size="base">{item}</Text>
          </li>
        ))}
      </ul>

      <Text size="sm" tone="subtle" className="mt-8">
        Cancelable cuando quieras. Sin contrato mínimo. Se ofrece al firmar el
        proyecto, no después.
      </Text>
    </aside>
  );
}
