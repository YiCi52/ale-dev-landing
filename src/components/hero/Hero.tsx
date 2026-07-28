import {
  Button,
  CatMascot,
  Container,
  Eyebrow,
  Heading,
  Text,
} from "@/components/ui";
import { AnimatedHeadline } from "@/components/hero/AnimatedHeadline";
import { HeroAtmosphere } from "@/components/hero/HeroAtmosphere";
import { HeroCrystalMount } from "@/components/hero/HeroCrystalMount";
import { MagneticButton } from "@/components/ui/MagneticButton";

const badges = ["Bogotá, Colombia", "Disponible 2026", "Anticipo Bre-B"];

export function Hero() {
  return (
    <section className="relative isolate flex flex-1 items-center overflow-hidden py-32 sm:py-40">
      <HeroAtmosphere />
      <HeroCrystalMount />
      <Container size="wide">
        <div className="hero-enter relative z-10">
          <div
            tabIndex={0}
            className="cat-mascot-wrap inline-flex items-center gap-3 text-muted outline-none rounded-sm"
          >
            <CatMascot className="h-10 w-auto" />
            <Eyebrow as="span">Castillo Studio · Diseño + desarrollo</Eyebrow>
          </div>
          <AnimatedHeadline
            text="Sitios que muestran tu trabajo tan bien como es."
            className="mt-8 max-w-4xl"
          />
          <Heading level="h3" as="h2" className="mt-6 max-w-2xl text-muted">
            Para arquitectos, diseñadores de interior y estudios con criterio
            visual.
          </Heading>
          <Text size="lg" tone="muted" className="mt-8 max-w-xl">
            Diseño editorial y desarrollo a medida en Next.js. Desde Bogotá,
            para clientes en cualquier parte.
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
