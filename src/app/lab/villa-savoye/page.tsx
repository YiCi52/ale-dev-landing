import type { Metadata } from "next";
import localFont from "next/font/local";

import { VsLenis } from "@/components/lab/villa-savoye/VsLenis";
import { VsHero } from "@/components/lab/villa-savoye/VsHero";
import { VsDesarme } from "@/components/lab/villa-savoye/VsDesarme";
import { VsPromenade } from "@/components/lab/villa-savoye/VsPromenade";
import { VsFicha } from "@/components/lab/villa-savoye/VsFicha";
import { VsHomenaje } from "@/components/lab/villa-savoye/VsHomenaje";

import "./villa-savoye.css";

/*
  Lab "Villa Savoye" — casas icónicas Nº 1 (brief: design-system/castillo-v2/
  brief-lab-villa-savoye.md, dirección A «Purismo» aprobada 2026-08-11).

  Ficción declarada: homenaje de estudio, no afiliado a la Fondation Le
  Corbusier. Una casa, su propio microsite: el volumen se desarma por capas
  con el scroll y cada capa ES uno de los cinco puntos de Le Corbusier.
  3D vivo justificado porque el usuario dirige el desarme (regla v10);
  modelo procedural en código, cero assets externos.
*/

// fuentes locales desde 1-oct (ver src/app/layout.tsx): mismos archivos de Google Fonts, sin red en el build
const display = localFont({
  src: "../../../fonts/Archivo-100-900-latin.woff2",
  variable: "--font-vs-display",
  weight: "100 900",
  display: "swap",
});

const body = localFont({
  src: "../../../fonts/Inter-100-900-latin.woff2",
  variable: "--font-vs-body",
  weight: "100 900",
  display: "swap",
});

const mono = localFont({
  src: [
    { path: "../../../fonts/IBMPlexMono-400-latin.woff2", weight: "400", style: "normal" },
    { path: "../../../fonts/IBMPlexMono-500-latin.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-vs-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lab · Villa Savoye — la casa que se desarma",
  description:
    "Homenaje interactivo a la Villa Savoye de Le Corbusier: los cinco puntos de la arquitectura moderna, desarmados capa por capa con el scroll. Pieza de estudio de Castillo Studio.",
  robots: { index: false, follow: false },
};

export default function VillaSavoyePage() {
  return (
    <main className={`vs ${display.variable} ${body.variable} ${mono.variable}`}>
      <VsLenis />
      <VsHero />
      <VsDesarme />
      <VsPromenade />
      <VsFicha />
      <VsHomenaje />
    </main>
  );
}
