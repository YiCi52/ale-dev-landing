/*
  Los labs públicos de Castillo Studio (4-oct-2026). La home los muestra en
  la sección "Labs"; cada uno vive en /lab/<slug>. Son piezas de estudio:
  réplicas o exploraciones declaradas como tales dentro de cada página.
  La Villa va destacada: es el lab #1 de la línea "casas icónicas" y el
  único construido desde planos y fotos reales.
*/

export type Lab = {
  slug: string;
  nombre: string;
  tipo: string;
  resumen: string;
  imagen: string;
  alt: string;
};

export const LAB_DESTACADO: Lab = {
  slug: "villa-savoye",
  nombre: "Villa Savoye",
  tipo: "Casas icónicas · Nº 1",
  resumen:
    "La casa de Le Corbusier reconstruida desde el plano DWG y más de 100 fotografías, recinto por recinto. El recorrido por la promenade está en producción.",
  imagen: "/lab/villa-savoye/v2/llegada.webp",
  alt: "Render de la Villa Savoye desde el camino de llegada: el volumen blanco sobre pilotis y la planta baja verde.",
};

export const LABS: ReadonlyArray<Lab> = [
  {
    slug: "alche",
    nombre: "ALCHE",
    tipo: "Objeto 3D · cromo",
    resumen: "Una sola forma que cambia de estado con el scroll: cromo, malla y trazo.",
    imagen: "/lab/miniaturas/alche.webp",
    alt: "Hero de ALCHE: un triángulo de cromo sobre tipografía gigante.",
  },
  {
    slug: "gatekeep",
    nombre: "Gatekeep",
    tipo: "Réplica de estudio",
    resumen: "El musgo crece donde pasa el cursor; un cubo que se arma cuadro a cuadro.",
    imagen: "/lab/miniaturas/gatekeep.webp",
    alt: "Hero de Gatekeep: título en partículas sobre fondo oscuro.",
  },
  {
    slug: "setby",
    nombre: "Setby",
    tipo: "Logística · pre-render",
    resumen: "Un contenedor suspendido que se escrubea con el scroll, sin WebGL en vivo.",
    imagen: "/lab/miniaturas/setby.webp",
    alt: "Hero de Setby: un contenedor colgando entre las palabras Precision y Delivery.",
  },
  {
    slug: "taurus",
    nombre: "Taurus",
    tipo: "Fintech · interfaz",
    resumen: "Landing de una firma de trading con gráfico de velas vivo y precios.",
    imagen: "/lab/miniaturas/taurus.webp",
    alt: "Hero de Taurus: titular Join the Arena junto a un gráfico de velas.",
  },
];
