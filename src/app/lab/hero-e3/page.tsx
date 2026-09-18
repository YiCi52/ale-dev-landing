import type { Metadata } from "next";

import { HeroEscenaE3 } from "@/components/lab/hero/HeroEscenaE3";

import "../hero/hero.css";
import "./hero-e3.css";

/**
 * Lab · E3 UMBRAL — prueba corta del mecanismo de entrada (13-sep-2026).
 *
 * Una sola pregunta: ¿atravesar la pupila se siente como ENTRAR a un espacio?
 * El espacio es abstracto y de prueba; no es MH Interior ni contenido.
 * La escena aprobada (/lab/hero) no se toca.
 */
export const metadata: Metadata = {
  title: "Lab · E3 umbral (prueba)",
  robots: { index: false, follow: false },
};

export default function HeroE3LabPage() {
  return (
    <main className="he-e3">
      <HeroEscenaE3 />
      <section className="he-despues">
        <p>Prueba E3 · umbral. Espacio abstracto de prueba, no es contenido.</p>
      </section>
    </main>
  );
}
