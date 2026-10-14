import type { Metadata } from "next";

import { Constelacion } from "@/components/lab/v4/constelacion/Constelacion";

// Prueba aislada (14-oct): la constelación de las 14 capas, para decidir si entra a la página v4.
export const metadata: Metadata = { title: "Prueba · constelación", robots: { index: false, follow: false } };

export default function ConstelacionPage() {
  return (
    <main>
      <Constelacion />
    </main>
  );
}
