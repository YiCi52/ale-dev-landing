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

const ROUTES: readonly Entry[] = [
  { path: "", lastModified: "2026-08-03", changeFrequency: "monthly", priority: 1 },
  // Los casos llevan la prueba de trabajo: prioridad alta, después de la home.
  { path: "/trabajo/mh-interior", lastModified: "2026-08-02", changeFrequency: "monthly", priority: 0.9 },
  { path: "/trabajo/macrolift", lastModified: "2026-08-02", changeFrequency: "monthly", priority: 0.8 },
  { path: "/sobre-mi", lastModified: "2026-08-02", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacidad", lastModified: "2026-06-19", changeFrequency: "yearly", priority: 0.3 },
  /*
    `/lab` y sus tres réplicas quedan FUERA a propósito: publicarlo es una
    decisión abierta (pendientes-maestro). OJO: robots.ts hoy SÍ permite
    rastrearlo, así que dejarlo fuera del sitemap no lo esconde. Cuando se
    decida: o entra acá, o se agrega a `disallow` en robots.ts.
  */
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
