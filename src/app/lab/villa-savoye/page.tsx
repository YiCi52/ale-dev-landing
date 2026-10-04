import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Inter } from "next/font/google";

import { VsHero } from "@/components/lab/villa-savoye/VsHero";
import { VsRecorrido } from "@/components/lab/villa-savoye/VsRecorrido";
import { VsPuntos } from "@/components/lab/villa-savoye/VsPuntos";
import { VsGaleria } from "@/components/lab/villa-savoye/VsGaleria";
import { VsObra } from "@/components/lab/villa-savoye/VsObra";
import { VsFicha } from "@/components/lab/villa-savoye/VsFicha";
import { VsHomenaje } from "@/components/lab/villa-savoye/VsHomenaje";
import { ESTACIONES, RECINTOS } from "@/components/lab/villa-savoye/contenido";

import "./villa-savoye.css";

/*
  Lab "Villa Savoye" — casas icónicas Nº 1 (dirección A «Purismo», aprobada
  2026-08-11). v2 (4-oct-2026): el 3D vivo de agosto se reemplaza por la casa
  reconstruida en Blender desde el DWG y las fotos del museo, mostrada en
  renders por estación. El recorrido en video tiene su espacio reservado
  (VsRecorrido) hasta que esté producido.

  Ficción declarada: homenaje de estudio, no afiliado a la Fondation Le
  Corbusier ni al Centre des monuments nationaux.
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
  title: "Lab · Villa Savoye — la casa reconstruida",
  description:
    "La Villa Savoye de Le Corbusier reconstruida desde el plano y las fotografías del museo: los cinco puntos de la arquitectura moderna, la promenade y sus recintos. Pieza de estudio de Castillo Studio.",
  robots: { index: false, follow: false },
};

export default function VillaSavoyePage() {
  return (
    <main className={`vs ${display.variable} ${body.variable} ${mono.variable}`}>
      <VsHero />
      <VsRecorrido />
      <VsPuntos />
      <VsGaleria
        id="vs-promenade-titulo"
        titulo="La promenade"
        intro="Le Corbusier diseñó la casa para recorrerla: del vestíbulo a la rampa y de la rampa al hall."
        vistas={ESTACIONES}
      />
      <VsGaleria
        id="vs-recintos-titulo"
        titulo="Los recintos"
        intro="Amueblada con lo que documentan las fotos y el folleto del museo; lo que no está documentado se marca como interpretación."
        vistas={RECINTOS}
      />
      <VsObra />
      <VsFicha />
      <VsHomenaje />
    </main>
  );
}
