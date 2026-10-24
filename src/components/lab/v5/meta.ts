import type { Metadata } from "next";

import type { Idioma } from "./textos";

/*
  Metadatos de cada página de la v5 (24-oct, la v5 pasa a ser el sitio): canónica propia, su par en el otro idioma
  (hreflang) y la misma descripción en Open Graph. `ruta` es la ruta en español ("/" o "/trabajo"); el inglés vive
  bajo /en. El título lleva el sufijo "· Castillo Studio" desde el layout raíz.
*/
export function metaDe(ruta: string, idioma: Idioma, titulo: string | { absolute: string }, descripcion: string): Metadata {
  const es = ruta;
  const en = ruta === "/" ? "/en" : `/en${ruta}`;
  const propia = idioma === "es" ? es : en;
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: propia, languages: { "es-CO": es, en, "x-default": es } },
    openGraph: { title: typeof titulo === "string" ? `${titulo} · Castillo Studio` : titulo.absolute, description: descripcion, url: propia, locale: idioma === "es" ? "es_CO" : "en_US", siteName: "Castillo Studio", type: "website" },
    robots: { index: true, follow: true },
  };
}
