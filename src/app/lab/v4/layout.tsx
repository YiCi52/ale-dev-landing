import type { Metadata } from "next";
import { Marcellus, Manrope } from "next/font/google";

import { Cabecera } from "@/components/lab/v4/Cabecera";

import "./v4.css";

/*
  Prototipo de la dirección v4 (13-oct-2026): piedra negra + nogal + cuarzo.
  Tipografía elegida por Alejo: Marcellus (display, letra de inscripción) +
  Manrope (texto). Sin cursivas. Las etiquetas siguen en Geist Mono, que ya
  carga el layout raíz. Vive en /lab para no tocar la home ni indexarse.
*/
const marcellus = Marcellus({ variable: "--font-marcellus", subsets: ["latin"], weight: "400", display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Prototipo v4 — piedra, nogal y cuarzo",
  robots: { index: false, follow: false },
};

export default function V4Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v4-raiz ${marcellus.variable} ${manrope.variable}`}>
      <Cabecera />
      {children}
    </div>
  );
}
