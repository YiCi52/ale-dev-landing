import Image from "next/image";
import { Button, Eyebrow, Heading, Section, Text } from "@/components/ui";

/*
  Caso #1 del nicho — MH Interior Design (Mari Hernández, Bogotá).
  Sitio de portafolio bilingüe para diseñadora de interiores, entregado
  y en producción 2026-07. Reemplaza el placeholder "en construcción"
  que vivía en CasoMacroLift.
*/

const decisiones = [
  {
    titulo: "Dark editorial como firma",
    body:
      "Las competidoras del nicho se ven demasiado blancas y genéricas. La dirección visual parte de la paleta propia de la marca — carbón, crema cálida — con tipografía en mayúsculas y peso medio que deja que los renders protagonicen.",
  },
  {
    titulo: "Bilingüe desde el día uno",
    body:
      "Español e inglés con detección automática del idioma del visitante. La diseñadora ya trabajó con clientes en Florida, USA — el sitio no podía cerrarle esa puerta.",
  },
  {
    titulo: "Cada proyecto con su propia galería",
    body:
      "Seis proyectos, cuatro sistemas de galería distintos: doble columna día/noche para un DJ booth, sub-enlaces por tipología de habitación para un hotel, obra ejecutada vs renders para una colaboración internacional. El contenido manda sobre el template.",
  },
];

const screenshots = [
  {
    src: "/casos/mhinterior/shot-1-hero.png",
    alt: "Hero del sitio MH Interior Design con carrusel de proyectos a pantalla completa",
    caption: "Carrusel editorial a pantalla completa",
  },
  {
    src: "/casos/mhinterior/shot-2-portafolio.png",
    alt: "Grilla de portafolio borde a borde con proyectos personales",
    caption: "Portafolio borde a borde",
  },
  {
    src: "/casos/mhinterior/shot-3-proyecto.png",
    alt: "Detalle de proyecto Akanti con galería de renders",
    caption: "Detalle de proyecto con galería propia",
  },
  {
    src: "/casos/mhinterior/shot-4-servicios.png",
    alt: "Página de servicios con cuatro etapas e iconografía lineal",
    caption: "Servicios en cuatro etapas con iconografía propia",
  },
];

const stack = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind 4",
  "Supabase",
  "Make",
  "Vercel",
];

export function CasoMHInterior() {
  return (
    <Section
      id="casos"
      containerSize="wide"
      className="border-t border-[color:var(--color-border)]"
    >
      <div className="max-w-3xl">
        <Eyebrow>Caso · Diseño interior</Eyebrow>
        <Heading level="h2" className="mt-6">
          MH Interior Design.
        </Heading>
        <Text size="lg" tone="muted" className="mt-6">
          Portafolio bilingüe para diseñadora de interiores · Bogotá · 2026
        </Text>
        <Text size="base" tone="subtle" className="mt-6 max-w-2xl">
          Mari Hernández tenía el portafolio regado en Instagram y clientes
          que llegaban solo por voz a voz. Necesitaba una presencia propia
          que mostrara su trabajo al nivel de su trabajo — y que convirtiera
          visitas en conversaciones.
        </Text>
      </div>

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-16 lg:gap-24">
        <div>
          <Eyebrow>El encargo</Eyebrow>
          <Text size="xl" className="mt-6">
            Seis proyectos, dos idiomas, y una regla: que nada se vea a
            plantilla.
          </Text>
          <Text size="lg" tone="muted" className="mt-8 max-w-xl">
            Renders fotorrealistas, fotos de obra real y conceptos académicos
            conviviendo en un mismo sitio, cada uno con la estructura que su
            contenido pedía. Más un canal de contacto que le avisa a Mari en
            el momento en que alguien deja sus datos.
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
        <Eyebrow>El sitio</Eyebrow>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10">
          {screenshots.map((s) => (
            <figure key={s.src} className="group flex flex-col gap-4">
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

          <Eyebrow className="mt-12">Estado</Eyebrow>
          <Text size="base" tone="muted" className="mt-6 max-w-md">
            Entregado y en producción. Form de contacto con notificación
            inmediata a la diseñadora, base de leads propia con retención
            definida y resumen semanal automático. La cliente aprobó cada
            fase sobre el sitio en vivo, no sobre mockups.
          </Text>
        </div>

        <div className="flex flex-col items-start gap-6 lg:items-end lg:text-right">
          <Eyebrow>En vivo</Eyebrow>
          <Text size="lg" tone="muted" className="max-w-sm">
            Recorrelo como lo haría un cliente de Mari: proyectos, galerías
            y contacto — en español o inglés.
          </Text>
          <Button
            as="a"
            href="https://mhinterior.vercel.app"
            size="md"
            variant="primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver MH Interior Design ↗
          </Button>
        </div>
      </div>
    </Section>
  );
}
