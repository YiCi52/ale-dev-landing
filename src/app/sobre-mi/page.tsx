import type { Metadata } from "next";
import { SobreMi } from "@/components/sobre-mi/SobreMi";
import { Proceso } from "@/components/proceso/Proceso";
import { Reveal } from "@/components/ui";

export const metadata: Metadata = {
  alternates: { canonical: "/sobre-mi" },
  title: "Sobre mí — Alejandro Díaz del Castillo",
  description:
    "Una persona, no una agencia. Quién está detrás de Castillo Studio y cómo trabaja: proceso, criterios y forma de acompañar cada proyecto.",
};

/*
  La persona vive en su propia página, no compitiendo con el trabajo en la home
  (mismo patrón que el sitio de la clienta: el "sobre mí" es su pestaña).
  El proceso viene aquí porque es parte de "cómo trabajo", no de la venta.
*/
export default function SobreMiPage() {
  return (
    // Sin migas de pan: el header persistente ya devuelve al inicio.
    <>
      <SobreMi />
      <Reveal>
        <Proceso />
      </Reveal>
    </>
  );
}
