import type { Metadata } from "next";

import { Cierre } from "@/components/lab/v5/Cierre";
import { Plano } from "@/components/lab/v5/Plano";
import { Preguntas } from "@/components/lab/v5/Preguntas";
import { Servicios } from "@/components/lab/v5/Servicios";

/* Servicios (Alejo, 19-oct: páginas aparte): por dentro (de la fachada a la planta), servicios y proceso, preguntas. */
export const metadata: Metadata = { title: "Servicios · Castillo Studio", robots: { index: false, follow: false } };

export default function ServiciosPage() {
  return (
    <div>
      <Plano />
      <Servicios />
      <Preguntas />
      <Cierre />
    </div>
  );
}
