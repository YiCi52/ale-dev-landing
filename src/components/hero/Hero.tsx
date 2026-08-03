import { Button, Container, Heading, Text } from "@/components/ui";
import { AnimatedHeadline } from "@/components/hero/AnimatedHeadline";
import { SelloCastillo } from "@/components/hero/SelloCastillo";
import { HeroAtmosphere } from "@/components/hero/HeroAtmosphere";
import { HeroCrystalMount } from "@/components/hero/HeroCrystalMount";
import { MagneticButton } from "@/components/ui/MagneticButton";

/**
 * Badges de credibilidad. NO usar jerga local (Bre-B, etc.): el mercado
 * destino incluye USA y un visitante extranjero no la entiende.
 * Ver CLAUDE.md → "Rediseño v2 — decisiones vigentes".
 */
const badges = ["Bogotá · remoto", "Disponible 2026", "Sistema de captura incluido"];

export function Hero() {
  return (
    <section className="relative isolate flex flex-1 items-center overflow-hidden py-32 sm:py-40">
      <HeroAtmosphere />
      <HeroCrystalMount />
      <Container size="wide">
        <div className="hero-enter relative z-10">
          <SelloCastillo />
          {/*
            El titular carga el DOLOR, no el mecanismo (inversión 2026-08-02).
            Antes decía "No una vitrina. Un sistema que captura." — una
            distinción de categoría que solo entiende quien YA sabe que las
            vitrinas fallan, y quien crea esa conciencia era la segunda línea.
            O sea que el hero respondía una pregunta que todavía no había
            hecho hacer. Referencia que lo confirma: vanity.llc abre con
            "Design that sells" y deja "custom websites built for…" abajo.
            El giro seco del final ("…no.") viene de la disciplina impasible
            de oryzo.ai: el remate no se guiña el ojo.
          */}
          <AnimatedHeadline
            text="Tu trabajo ya impresiona. Lo que pasa después, no."
            className="mt-8 max-w-4xl"
          />
          <Heading level="h3" as="h2" className="mt-6 max-w-2xl text-muted">
            No una vitrina: un sistema que captura.
          </Heading>
          <Text size="lg" tone="muted" className="mt-8 max-w-xl">
            El sitio donde tus referidos terminan de decidirse. Diseño
            editorial y desarrollo a medida para arquitectos, diseñadores de
            interior y estudios con criterio visual.
          </Text>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <MagneticButton>
              <Button as="a" href="#contacto" size="lg" variant="primary">
                Hablemos de tu proyecto
              </Button>
            </MagneticButton>
            <Button as="a" href="#casos" size="lg" variant="ghost">
              Ver caso real ↓
            </Button>
          </div>
          <ul className="mt-20 flex flex-wrap items-center gap-x-3 gap-y-3">
            {badges.map((b) => (
              <li key={b}>
                <span className="inline-flex items-center rounded-full border border-[color:var(--color-accent-muted)]/40 bg-white/[0.03] px-3 py-1.5 font-sans text-xs uppercase tracking-[0.18em] text-[color:var(--color-accent)]/85 backdrop-blur-md">
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
