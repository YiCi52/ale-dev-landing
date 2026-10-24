import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/*
  Capa 14 — descubribilidad.

  Dos cosas que este archivo hacía mal y ahora no:

  1. Listaba 2 de las rutas públicas. Faltaban los DOS casos de trabajo, que
     son justamente las páginas que cargan la prueba y las que interesa
     posicionar.
  2. Usaba `new Date()`, así que cada build le decía a Google que todo había
     cambiado. Frescura falsa: Google aprende a ignorar el dato y se pierde la
     señal el día que el cambio sí es real.

  Las fechas salen del historial de git de cada página (último commit que tocó
  su contenido). Al editar una página de verdad, actualizar su fecha acá — es
  el precio de que el dato signifique algo.
*/

type Entry = {
  path: string;
  lastModified: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

/* 24-oct-2026: la v5 es el sitio. Español en la raíz y su par en inglés bajo /en (hreflang en cada página). */
const HOY = "2026-10-24";
const ROUTES: readonly Entry[] = [
  { path: "", lastModified: HOY, changeFrequency: "monthly", priority: 1 },
  { path: "/en", lastModified: HOY, changeFrequency: "monthly", priority: 0.9 },
  // Los casos llevan la prueba de trabajo: prioridad alta, después de la home.
  { path: "/trabajo", lastModified: HOY, changeFrequency: "monthly", priority: 0.9 },
  { path: "/en/trabajo", lastModified: HOY, changeFrequency: "monthly", priority: 0.8 },
  { path: "/trabajo/mh-interior", lastModified: HOY, changeFrequency: "monthly", priority: 0.9 },
  { path: "/trabajo/villa-savoye", lastModified: HOY, changeFrequency: "monthly", priority: 0.8 },
  { path: "/servicios", lastModified: HOY, changeFrequency: "monthly", priority: 0.8 },
  { path: "/en/servicios", lastModified: HOY, changeFrequency: "monthly", priority: 0.7 },
  { path: "/sobre-mi", lastModified: HOY, changeFrequency: "monthly", priority: 0.7 },
  { path: "/en/sobre-mi", lastModified: HOY, changeFrequency: "monthly", priority: 0.6 },
  { path: "/hablemos", lastModified: HOY, changeFrequency: "yearly", priority: 0.6 },
  { path: "/en/hablemos", lastModified: HOY, changeFrequency: "yearly", priority: 0.5 },
  { path: "/privacidad", lastModified: "2026-06-19", changeFrequency: "yearly", priority: 0.3 },
  // /lab queda fuera: son pruebas internas (noindex) y las réplicas de marcas redirigen a la home.
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
