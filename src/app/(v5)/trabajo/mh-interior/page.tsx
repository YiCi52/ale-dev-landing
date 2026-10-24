import type { Metadata } from "next";

import { CasoMH } from "@/components/lab/v5/CasoMH";
import { Cierre } from "@/components/lab/v5/Cierre";

/* Caso MH Interior (24-oct): con la piel de la v5, igual que el resto del sitio. */
export const metadata: Metadata = {
  alternates: { canonical: "/trabajo/mh-interior" },
  title: "MH Interior Design — portafolio bilingüe con captura de clientes",
  description:
    "Caso completo: sitio de portafolio para una diseñadora de interiores en Bogotá, con seis proyectos, dos idiomas y un sistema que registra y notifica cada contacto.",
};

export default function MHInteriorPage() {
  return (
    <div>
      <CasoMH />
      <Cierre />
    </div>
  );
}
