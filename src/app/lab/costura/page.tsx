import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CosturaEscena } from "@/components/lab/costura/CosturaEscena";

import "./costura.css";

/**
 * Lab · Costura — ETAPA 0 del hero como escena guiada por scroll.
 *
 * Prueba UNA sola cosa: que la transformación
 *     Hero → Portal → primera carta de Selected Work
 * se puede hacer sin costura visible.
 *
 * Todo es placeholder a propósito (círculo, rombo, bloque de color). Los assets
 * finales no se producen hasta que esta costura esté aprobada — es el riesgo
 * más alto del rediseño y el más barato de probar.
 *
 * Contrato: design-system/castillo-v2/SPEC-hero-escena.md
 */
export const metadata: Metadata = {
  title: "Lab · Prototipo de costura",
  robots: { index: false, follow: false },
};

export default function CosturaPage() {
  // Banco de trabajo interno del hero: existe en desarrollo, en produccion es 404.
  // La escena que sale al publico es components/hero/escena (vista previa: /lab/hero-e3).
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main>
      <CosturaEscena />
    </main>
  );
}
