import type { Metadata } from "next";
import { Archivo, Newsreader } from "next/font/google";

import { Cabecera } from "@/components/lab/v5/Cabecera";

import "./v5.css";

/*
  Versión 5 de la página propia (18-oct-2026): "Luz prestada". La v4 queda quieta en /lab/v4 para el feedback de Alejo.
  Archivo (con eje de ancho) manda en títulos y texto; Newsreader cursiva solo para las palabras de luz; Geist Mono (del
  layout raíz) para lo técnico. Vive en /lab para no tocar la home ni indexarse.
*/
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"], display: "swap" });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["italic"], weight: ["300", "400"], display: "swap" });

export const metadata: Metadata = {
  title: "Castillo Studio · v5",
  robots: { index: false, follow: false },
};

export default function V5Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v5-raiz ${archivo.variable} ${newsreader.variable}`}>
      <Cabecera />
      {children}
    </div>
  );
}
