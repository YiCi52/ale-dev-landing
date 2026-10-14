import type { Metadata } from "next";

import { Casilla } from "@/components/lab/v4/Casilla";

// Prueba aislada (14-oct): el pitch B, para compararlo con el C que quedó en la página v4.
export const metadata: Metadata = { title: "Prueba · pitch B", robots: { index: false, follow: false } };

export default function PitchBPage() {
  return (
    <main>
      <section className="flex h-[60svh] items-end px-4 pb-10 sm:px-12">
        <p className="v4-mono">Prueba del pitch B · baja para verlo</p>
      </section>
      <Casilla />
      <section className="h-[60svh]" />
    </main>
  );
}
