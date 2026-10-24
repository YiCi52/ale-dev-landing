import type { Idioma } from "./textos";

/* 24-oct: español en la raíz, inglés bajo /en (antes /lab/v5 y /lab/v5/en). */
const esIngles = (ruta: string) => ruta === "/en" || ruta.startsWith("/en/");

/** Idioma según la ruta (/en/... es inglés). */
export function idiomaDe(ruta: string | null): Idioma {
  return ruta && esIngles(ruta) ? "en" : "es";
}

/** La misma página en el otro idioma. */
export function rutaEnOtro(ruta: string | null): string {
  if (!ruta || ruta === "/") return "/en";
  if (esIngles(ruta)) return ruta.slice(3) || "/";
  return "/en" + ruta;
}
