import { Eyebrow, Heading, Section, Text } from "@/components/ui";
import { ContactForm } from "./ContactForm";

export function Contacto() {
  return (
    <Section
      id="contacto"
      containerSize="wide"
      className="border-t border-[color:var(--color-border)]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-20 items-start">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow>Contacto</Eyebrow>
          <Heading level="h2" className="mt-6">
            Empecemos por
            <br />
            <span className="text-muted">una conversación.</span>
          </Heading>
          <Text size="lg" tone="muted" className="mt-8 max-w-md">
            Contame qué tenés en mente. Si encaja en lo que construyo, te paso
            propuesta en 2–3 días. Si no, te recomiendo a alguien que sí.
          </Text>
        </div>

        <ContactForm />
      </div>
    </Section>
  );
}
