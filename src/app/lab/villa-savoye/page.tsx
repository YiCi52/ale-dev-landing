import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Inter } from "next/font/google";

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

const display = Archivo({
  variable: "--font-vs-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const body = Inter({
  variable: "--font-vs-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-vs-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
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
