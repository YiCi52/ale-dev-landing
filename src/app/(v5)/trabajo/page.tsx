import type { Metadata } from "next";

import { Cierre } from "@/components/lab/v5/Cierre";
import { Testimonio } from "@/components/lab/v5/Testimonio";
import { Trabajo } from "@/components/lab/v5/Trabajo";
import { metaDe } from "@/components/lab/v5/meta";

/* Trabajo (Alejo, 19-oct: páginas aparte): las obras encendidas y la voz de una clienta. */
export const metadata: Metadata = metaDe("/trabajo", "es", "Trabajo", "Un sitio de cliente con captura de consultas y la Villa Savoye reconstruida desde sus planos para recorrerla.");

export default function TrabajoPage() {
  return (
    <div className="pt-16">
      <h1 className="sr-only">Trabajo · Castillo Studio</h1>
      <Trabajo />
      <Testimonio />
      <Cierre />
    </div>
  );
}
