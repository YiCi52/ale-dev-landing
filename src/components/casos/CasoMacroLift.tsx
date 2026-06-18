import Image from "next/image";
import { Button, Eyebrow, Heading, Section, Text } from "@/components/ui";

const decisiones = [
  {
    titulo: "Específica, no genérica",
    body:
      "MyFitnessPal y Cronometer apuntan a deportistas adultos con metas estéticas. MacroLift es para estudiantes de secundaria: el discurso, las métricas y los nutrientes priorizados son distintos.",
  },
  {
    titulo: "Nutrición ↔ rendimiento",
    body:
      "El dashboard vincula macronutrientes con foco, energía y memoria. No con grasa corporal. Decisión defendida en el marco teórico del trabajo de grado.",
  },
  {
    titulo: "Gratis y sin login obligatorio",
    body:
      "Toda la funcionalidad libre. Datos del perfil viven en localStorage para validar la hipótesis antes de invertir en backend. PWA-ready para el siguiente paso.",
  },
];

const screenshots = [
  {
    src: "/casos/macrolift/shot-1.png",
    alt: "Onboarding por pasos con barra de progreso",
    caption: "Onboarding en 4 pasos",
  },
  {
    src: "/casos/macrolift/shot-2.png",
    alt: "Dashboard de seguimiento nutricional con BMR, TDEE y meta calórica",
    caption: "Seguimiento diario adaptado al deporte",
  },
  {
    src: "/casos/macrolift/shot-3.png",
    alt: "Modal de configuración de perfil con actividad física y objetivo",
    caption: "Perfil parametrizable",
  },
  {
    src: "/casos/macrolift/shot-4.png",
    alt: "Centro educativo con cards de macronutrientes, micronutrientes, hidratación y metabolismo",
    caption: "Centro educativo integrado",
  },
];

const stack = ["React", "TypeScript", "Tailwind", "Vite", "localStorage"];

export function CasoMacroLift() {
  return (
    <Section
      id="casos"
      containerSize="wide"
      className="border-t border-[color:var(--color-border)]"
    >
      <div className="max-w-3xl">
        <Eyebrow>Caso #1</Eyebrow>
        <Heading level="h2" className="mt-6">
          MacroLift.
        </Heading>
        <Text size="lg" tone="muted" className="mt-6">
          Proyecto de grado · Oakland Colegio Campestre · 2025
        </Text>
      </div>

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-16 lg:gap-24">
        <div>
          <Eyebrow>Hipótesis</Eyebrow>
          <Text size="xl" className="mt-6">
            ¿Puede una app web ayudar a estudiantes de undécimo a entender la
            relación entre lo que comen y cómo rinden en el aula?
          </Text>
          <Text size="lg" tone="muted" className="mt-8 max-w-xl">
            El trabajo de grado parte de evidencia clínica: la malnutrición
            (por déficit o exceso) afecta concentración, memoria y asistencia
            escolar. Las apps existentes apuntan a otro público y otra
            métrica. MacroLift cierra esa brecha para una población específica.
          </Text>
        </div>

        <div>
          <Eyebrow>Decisiones</Eyebrow>
          <ul className="mt-6 space-y-10">
            {decisiones.map((d) => (
              <li key={d.titulo}>
                <Heading level="h4" as="h3">
                  {d.titulo}
                </Heading>
                <Text size="base" tone="muted" className="mt-3 max-w-md">
                  {d.body}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-24 border-t border-[color:var(--color-border)] pt-16">
        <Eyebrow>La app</Eyebrow>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">
          {screenshots.map((s) => (
            <figure
              key={s.src}
              className="group flex flex-col gap-4"
            >
              <div className="overflow-hidden rounded-md border border-[color:var(--color-border-strong)] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-out hover:-translate-y-1">
                <div className="flex items-center gap-1.5 px-4 py-3 bg-[color:var(--color-bg-elevated)] border-b border-[color:var(--color-border)]">
                  <span className="size-2.5 rounded-full bg-[color:var(--color-border-strong)]" aria-hidden />
                  <span className="size-2.5 rounded-full bg-[color:var(--color-border-strong)]" aria-hidden />
                  <span className="size-2.5 rounded-full bg-[color:var(--color-border-strong)]" aria-hidden />
                </div>
                <div className="relative aspect-[16/10] w-full bg-[color:var(--color-bg-elevated)]">
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover object-top"
                    loading="lazy"
                  />
                </div>
              </div>
              <figcaption className="text-sm text-subtle pl-1">{s.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="mt-24 border-t border-[color:var(--color-border)] pt-16 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-16 lg:gap-24">
        <div>
          <Eyebrow>Stack</Eyebrow>
          <ul className="mt-6 flex flex-wrap gap-2">
            {stack.map((tech) => (
              <li
                key={tech}
                className="px-3 py-1.5 text-sm font-medium border border-[color:var(--color-border-strong)] text-foreground rounded-full"
              >
                {tech}
              </li>
            ))}
          </ul>

          <Eyebrow className="mt-12">Estado actual</Eyebrow>
          <Text size="base" tone="muted" className="mt-6 max-w-md">
            v1 funcional y deployada. El cálculo de BMR/TDEE (Mifflin-St
            Jeor), el tracking y el centro educativo están terminados. En
            iteración: completar la base de datos nutricional colombiana y
            refinar el registro de comidas.
          </Text>
        </div>

        <div className="flex flex-col items-start gap-6 lg:items-end lg:text-right">
          <Eyebrow>Demo en vivo</Eyebrow>
          <Text size="lg" tone="muted" className="max-w-sm">
            Probá la app con tus propios datos. Todo corre en tu navegador,
            nada se envía a un servidor.
          </Text>
          <div className="flex flex-wrap gap-3">
            <Button
              as="a"
              href="https://flourishing-cranachan-4f54c2.netlify.app/"
              size="md"
              variant="primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir MacroLift ↗
            </Button>
            <Button
              as="a"
              href="https://github.com/YiCi52/Macrolift"
              size="md"
              variant="ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              Código en GitHub ↗
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
