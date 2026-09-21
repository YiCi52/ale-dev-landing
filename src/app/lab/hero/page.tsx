import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HeroEscena } from "@/components/lab/hero/HeroEscena";

import "./hero.css";

/**
 * Lab · HERO como una sola escena — prototipo, no una sección del sitio.
 *
 * Existe para responder tres preguntas y ninguna más (SPEC-hero-estados §5):
 *   1. ¿La secuencia se siente como UNA escena o como ocho animaciones pegadas?
 *   2. ¿El gato conduce la atención hacia el cristal, o compiten?
 *   3. ¿El scroll hacia arriba deshace la escena de forma creíble?
 *
 * Si las tres son sí, se pule. Si alguna es no, se corrige el mapa de estados
 * antes de escribir una línea de código de producción.
 */
export const metadata: Metadata = {
  title: "Lab · Hero escena",
  robots: { index: false, follow: false },
};

export default function HeroLabPage() {
  // Banco de trabajo interno del hero: existe en desarrollo, en produccion es 404.
  // La escena que sale al publico es components/hero/escena (vista previa: /lab/hero-e3).
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main>
      <HeroEscena />
      <section className="he-despues">
        <p>Aquí abajo empezaría BarajaCasos. El hero suelta el scroll acá.</p>
      </section>
    </main>
  );
}
