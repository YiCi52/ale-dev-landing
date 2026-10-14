/*
  La luna y su plano (14-oct, segunda versión; la primera hacía polvo y Alejo la rechazó con razón).
  Guion: la luna 3D sobre la noche (se puede girar) → gira sola a su cara visible, la noche se abre en papel de
  cuarzo y la foto se funde en su plano técnico (curvas de nivel reales de la NASA), como pasar del render al plano
  → se trazan llamadas a rasgos reales con sus coordenadas → la parte de abajo se corta en sección y muestra los
  estratos (lo que se construye debajo de un sitio) → la sección se funde a la noche de la galería, sin bajar la luna.
  Matemática pura del reparto del scroll (sin DOM) para poder probarla.
*/

type Tramo = readonly [number, number];

export const TRAMOS = {
  alinear: [0.1, 0.3],
  papel: [0.2, 0.36],
  plano: [0.26, 0.4],
  llamadas: [0.4, 0.58],
  corte: [0.6, 0.8],
  noche: [0.9, 1],
} as const satisfies Record<string, Tramo>;

/** Rasgos reales de la cara visible (latitud, longitud este) para las llamadas del plano. */
export const RASGOS = [
  // de norte a sur: así las líneas hacia la columna de etiquetas se cruzan lo mínimo
  { nombre: "Mar de las Lluvias", lat: 32.8, lon: -15.6 },
  { nombre: "Cráter Copérnico", lat: 9.62, lon: -20.08 },
  { nombre: "Mar de la Tranquilidad", lat: 8.5, lon: 31.4 },
  { nombre: "Sitio del Apolo 11", lat: 0.67, lon: 23.47 },
  { nombre: "Cráter Tycho", lat: -43.31, lon: -11.36 },
] as const;

/** Estratos del corte: de la superficie hacia adentro, cada uno con su material de trama. */
export const ESTRATOS = [
  { nombre: "Diseño a la medida", detalle: "la superficie que ve tu cliente", material: "cuarzo" },
  { nombre: "Recorrido de cada proyecto", detalle: "la obra se camina, no solo se mira", material: "nogal" },
  { nombre: "Formulario que filtra", detalle: "base de datos propia, permisos cerrados", material: "piedra" },
  { nombre: "Aviso a tu correo", detalle: "cada consulta, ese mismo minuto", material: "nogal" },
  { nombre: "Respaldo y seguridad", detalle: "copia semanal, cabeceras, freno al spam", material: "piedra" },
] as const;

export function tramo(p: number, [a, b]: Tramo): number {
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}

const suave = (t: number) => t * t * (3 - 2 * t);

export type EstadoLuna = {
  /** 0 = gira libre, 1 = de frente mostrando su cara visible (alineada con el plano) */
  alinear: number;
  /** 0 = noche, 1 = papel de cuarzo */
  papel: number;
  /** 0 = foto de la luna, 1 = plano de líneas */
  plano: number;
  /** avance del trazo de las llamadas y de sus textos */
  llamadas: number;
  /** avance del corte en sección */
  corte: number;
  /** fundido final a la noche de la galería */
  noche: number;
  /** centro y radio en pantalla (fracciones; radio en alturas) */
  x: number;
  y: number;
  radio: number;
};

/** `aspecto` = ancho / alto: en celular la luna no puede ser más ancha que la pantalla. */
export function estadoDe(p: number, aspecto = 16 / 9): EstadoLuna {
  const angosto = aspecto < 0.9;
  return {
    alinear: suave(tramo(p, TRAMOS.alinear)),
    papel: suave(tramo(p, TRAMOS.papel)),
    plano: suave(tramo(p, TRAMOS.plano)),
    llamadas: tramo(p, TRAMOS.llamadas),
    corte: suave(tramo(p, TRAMOS.corte)),
    noche: suave(tramo(p, TRAMOS.noche)),
    // en pantalla ancha la luna se corre a la derecha para dejar lugar al título y a la lista del corte
    // en celular la luna baja para dejar arriba el título y abajo la lista del corte
    x: angosto ? 0.5 : 0.56,
    y: angosto ? 0.5 : 0.5,
    radio: angosto ? 0.4 * aspecto : Math.min(0.36, 0.44 * aspecto),
  };
}

/** Rasgo (lat, lon) → posición en el disco de la cara visible, en unidades del radio (y hacia abajo). */
export function enDisco(lat: number, lon: number): [number, number] {
  const la = (lat * Math.PI) / 180, lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), -Math.sin(la)];
}
