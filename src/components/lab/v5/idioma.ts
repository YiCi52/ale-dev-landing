import { RAIZ, type Idioma } from "./textos";

/** Idioma según la ruta (/lab/v5/en/... es inglés). */
export function idiomaDe(ruta: string | null): Idioma {
  return ruta?.startsWith(RAIZ.en) ? "en" : "es";
}

/** La misma página en el otro idioma. */
export function rutaEnOtro(ruta: string | null): string {
  if (!ruta) return RAIZ.es;
  return ruta.startsWith(RAIZ.en) ? RAIZ.es + ruta.slice(RAIZ.en.length) : RAIZ.en + ruta.slice(RAIZ.es.length);
}
