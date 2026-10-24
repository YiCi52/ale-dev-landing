import type { Metadata } from "next";

import { Cierre } from "@/components/lab/v5/Cierre";
import { SobreMi } from "@/components/lab/v5/SobreMi";
import { metaDe } from "@/components/lab/v5/meta";

/* Sobre mí: quién está detrás de Castillo Studio y cómo trabaja. */
export const metadata: Metadata = metaDe("/sobre-mi", "es", "Sobre mí", "Alejandro Díaz del Castillo: diseño y construyo sitios para estudios de arquitectura e interiorismo, con un solo proyecto a la vez.");

export default function SobreMiPage() {
  return (
    <div className="pt-16">
      <SobreMi />
      <Cierre />
    </div>
  );
}
