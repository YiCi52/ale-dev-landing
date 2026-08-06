import Link from "next/link";
import { Eyebrow, Section, Text } from "@/components/ui";

/*
  Testimonio en la HOME.

  Vive acá y no solo dentro del caso porque al pasar el sitio a multipágina el
  caso completo se fue a /trabajo/mh-interior, y con él se fue la única prueba
  social que había — la home quedó sin una sola voz que no fuera la propia.
  Un testimonio de alguien que pagó es el activo más fuerte de un freelance;
  escondido detrás de un clic no trabaja.

  Texto verbatim de Maria Hernández (2026-07-11), recortado a las dos frases
  que hacen el trabajo. El completo sigue en el caso, y el enlace lleva ahí:
  quien quiera verificar que no está editado a conveniencia, puede.
*/
export function Testimonio() {
  return (
    <Section
      id="testimonio"
      containerSize="wide"
      className="border-t border-[color:var(--color-border)]"
    >
      <figure className="mx-auto max-w-4xl">
        <Eyebrow as="span">Una clienta</Eyebrow>
        <blockquote className="mt-8">
          <Text
            size="xl"
            className="font-serif text-2xl italic leading-relaxed sm:text-3xl"
          >
            “Como diseñadora de interiores necesitaba una página web que
            reflejara mi estilo y él supo entender perfectamente mis
            necesidades. Hoy tengo una página funcional, estética y alineada
            con mi identidad profesional que me ha ayudado a conectar con
            nuevas oportunidades.”
          </Text>
        </blockquote>
        <figcaption className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Text size="base" tone="muted">
            Maria Hernández · MH Interior Design
          </Text>
          <Link
            href="/trabajo/mh-interior"
            className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-accent)] underline-offset-4 transition-opacity hover:opacity-70 hover:underline"
          >
            Ver el caso completo →
          </Link>
        </figcaption>
      </figure>
    </Section>
  );
}
