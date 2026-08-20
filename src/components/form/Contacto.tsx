import { Eyebrow, Heading, Reveal, Section, Text } from "@/components/ui";
import DecryptedText from "@/components/DecryptedText";
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
          <Eyebrow pill>
            <DecryptedText text="Contacto" animateOn="view" sequential speed={45} />
          </Eyebrow>
          <Reveal variant="clip" className="mt-6">
            <Heading level="h2">
              Empecemos por
              <br />
              <span className="text-muted">una conversación.</span>
            </Heading>
          </Reveal>
          <Reveal delay={120}>
            <Text size="lg" tone="muted" className="mt-8 max-w-md">
              Cuéntame qué tienes en mente. Si encaja en lo que construyo, te paso
              propuesta en 2–3 días. Si no, te recomiendo a alguien que sí.
            </Text>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <ContactForm />
        </Reveal>
      </div>
    </Section>
  );
}
