import { Eyebrow, Heading, Section, Text } from "@/components/ui";

/*
  Encabezado de la sección de trabajo. Existe por una razón de posicionamiento,
  no decorativa: presenta los casos como una SELECCIÓN curada en vez de "los dos
  proyectos que tengo". Arquitectura portfolio-first — la prueba va antes que el
  pitch (ver design-system/castillo-v2/MASTER.md).
*/
export function SelectedWork() {
  return (
    <Section id="casos" spacing="tight">
      <Eyebrow>Trabajo seleccionado</Eyebrow>
      <Heading level="h2" className="mt-6 max-w-3xl">
        Dos proyectos, contados completos.
      </Heading>
      <Text size="lg" tone="muted" className="mt-6 max-w-2xl">
        No capturas sueltas: qué problema tenía el cliente, qué se decidió y
        qué quedó funcionando después de la entrega.
      </Text>
    </Section>
  );
}
