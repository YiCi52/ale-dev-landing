import type { Metadata } from "next";

import { Cierre } from "@/components/lab/v5/Cierre";
import { Testimonio } from "@/components/lab/v5/Testimonio";
import { Trabajo } from "@/components/lab/v5/Trabajo";

/* Trabajo (Alejo, 19-oct: páginas aparte): las obras encendidas y la voz de una clienta. */
export const metadata: Metadata = { title: "Trabajo · Castillo Studio", robots: { index: false, follow: false } };

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
