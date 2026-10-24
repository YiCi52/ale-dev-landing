import type { Metadata } from "next";

import { Cierre } from "@/components/lab/v5/Cierre";
import { Plano } from "@/components/lab/v5/Plano";
import { Preguntas } from "@/components/lab/v5/Preguntas";
import { Servicios } from "@/components/lab/v5/Servicios";
import { metaDe } from "@/components/lab/v5/meta";

/* Servicios (Alejo, 19-oct: páginas aparte): por dentro (de la fachada a la planta), servicios y proceso, preguntas. */
export const metadata: Metadata = metaDe("/servicios", "es", "Servicios", "Qué lleva cada sitio: proyectos, recorridos, formulario, aviso inmediato y respaldo de tus datos. Desde $3.600.000 COP, en cinco semanas.");

export default function ServiciosPage() {
  return (
    <div>
      <h1 className="sr-only">Servicios · Castillo Studio</h1>
      <Plano />
      <Servicios />
      <Preguntas />
      <Cierre />
    </div>
  );
}
