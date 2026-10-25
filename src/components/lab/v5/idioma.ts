import type { Idioma } from "./textos";

/* 24-oct: español en la raíz, inglés bajo /en (antes /lab/v5 y /lab/v5/en). */
const esIngles = (ruta: string) => ruta === "/en" || ruta.startsWith("/en/");

/** Idioma según la ruta (/en/... es inglés). */
export function idiomaDe(ruta: string | null): Idioma {
  return ruta && esIngles(ruta) ? "en" : "es";
}

/*
  Las páginas que SÍ tienen par en inglés. El caso de MH Interior, la Villa y privacidad viven solo en español: antes
  el botón EN les anteponía /en a ciegas y llevaba a un 404 (25-oct-2026, recorrido de producción).
*/
const CON_INGLES = new Set(["/", "/hablemos", "/servicios", "/sobre-mi", "/trabajo"]);

/** La misma página en el otro idioma; si no tiene par, la portada del otro idioma. */
export function rutaEnOtro(ruta: string | null): string {
  if (!ruta || ruta === "/") return "/en";
  if (esIngles(ruta)) return ruta.slice(3) || "/";
  return CON_INGLES.has(ruta) ? "/en" + ruta : "/en";
}
