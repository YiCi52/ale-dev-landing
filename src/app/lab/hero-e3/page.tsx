import type { Metadata } from "next";

import { HeroEscena } from "@/components/hero/escena/HeroEscena";

import "./hero-e3.css";

/**
 * Lab · vista previa del hero de PRODUCCION (desde el 19-sep-2026).
 *
 * Era la prueba E3 del umbral (13-sep). Cerrada la v5.1, la escena salio del lab a
 * `components/hero/escena/` y esta pagina solo la monta tal cual la vera la home,
 * con un panel de relleno detras para comprobar que suelta el scroll. Sirve para
 * revisarla en un despliegue de vista previa antes de ponerla en `/`.
 */
export const metadata: Metadata = {
  title: "Lab · Hero (vista previa)",
  robots: { index: false, follow: false },
};

export default function HeroE3LabPage() {
  return (
    <>
      <HeroEscena />
      <section className="he-despues">
        <p>Vista previa del hero. Lo que sigue aquí es relleno, no contenido.</p>
      </section>
    </>
  );
}
