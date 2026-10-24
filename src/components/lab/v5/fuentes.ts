import { Archivo, Newsreader } from "next/font/google";

/* Las fuentes de la v5, compartidas por su layout y por la página 404 (que vive fuera del grupo de rutas). */
export const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"], display: "swap" });
export const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["italic"], weight: ["300", "400"], display: "swap" });   // con precarga: sin ella la cursiva llegaba tarde y movía el título (CLS 0,19 en el caso de MH)
