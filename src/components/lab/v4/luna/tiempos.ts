/*
  La luna y su plano (14-oct, segunda versión; la primera hacía polvo y Alejo la rechazó con razón).
  Guion: la luna 3D sobre la noche (se puede girar) → gira sola a su cara visible, la noche se abre en papel de
  cuarzo y la foto se funde en su plano técnico (curvas de nivel reales de la NASA), como pasar del render al plano
  → se trazan llamadas a rasgos reales con sus coordenadas → la parte de abajo se corta en sección y muestra los
  estratos (lo que se construye debajo de un sitio) → (Alejo, 14-oct noche) la luna vuelve a ser 3D, ya quieta, el
  fondo pasa a azul de noche, aparecen las estrellas y la luna sube a su lugar en el cielo de la galería → la sección
  se vuelve transparente y deja ver la galería, que ya está quieta debajo (sin dos lunas a la vez).
  Matemática pura del reparto del scroll (sin DOM) para poder probarla.
*/

type Tramo = readonly [number, number];

export const TRAMOS = {
  alinear: [0.08, 0.24],
  papel: [0.16, 0.3],
  plano: [0.2, 0.32],
  llamadas: [0.32, 0.45],
  corte: [0.45, 0.57],
  // Alejo (15-oct): las capas se van con la misma animación con la que aparecieron, ANTES de que vuelva la luna
  retira: [0.58, 0.64],
  vuelve: [0.64, 0.71],
  cielo: [0.71, 0.82],
  revelar: [0.85, 0.98],
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

/**
 * Estratos del corte: de la superficie hacia adentro. Son las 14 capas de producción agrupadas en 5 (Alejo, 14-oct:
 * catorce etiquetas en un corte no se leen). `capas` suma exactamente las 14.
 */
export const ESTRATOS = [
  { nombre: "Lo que ve tu cliente", capas: ["Diseño a la medida", "Carga inmediata", "Lista para buscadores"], material: "cuarzo" },
  { nombre: "Lo que captura", capas: ["Formulario que filtra", "Base de datos propia", "Freno al spam"], material: "nogal" },
  { nombre: "Lo que te avisa", capas: ["Aviso si algo falla"], material: "cuarzo" },
  { nombre: "Lo que lo sostiene", capas: ["Servidor sin mantenimiento", "Crece con las visitas", "Aguanta los picos", "Publicación automática"], material: "piedra" },
  { nombre: "Lo que lo protege", capas: ["Permisos cerrados", "Cabeceras de seguridad", "Respaldo semanal"], material: "nogal" },
] as const;

export function tramo(p: number, [a, b]: Tramo): number {
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}

const suave = (t: number) => t * t * (3 - 2 * t);

export type EstadoLuna = {
  /** 0 = gira libre, 1 = de frente mostrando su cara visible (y así se queda hasta el final) */
  alinear: number;
  /** 0 = noche, 1 = papel de cuarzo */
  papel: number;
  /** 0 = foto de la luna, 1 = plano de líneas */
  plano: number;
  /** avance del trazo de las llamadas y de sus textos */
  llamadas: number;
  /** avance del corte en sección (al volver la luna, el corte se va con el plano) */
  corte: number;
  /** 0 = negro piedra, 1 = azul de noche con estrellas */
  cielo: number;
  /** 0 = la sección tapa todo, 1 = transparente: se ve la galería que espera debajo */
  revelar: number;
  /** centro y radio en pantalla (fracciones; radio en alturas) */
  x: number;
  y: number;
  radio: number;
};

/**
 * `aspecto` = ancho / alto: en celular la luna no puede ser más ancha que la pantalla.
 * `destino` = dónde está la luna en el primer cuadro de la galería (x, y, radio): ahí termina.
 */
export function estadoDe(p: number, aspecto = 16 / 9, destino: [number, number, number] = [0.5, 0.19, 0.1]): EstadoLuna {
  const angosto = aspecto < 0.9;
  const vuelve = suave(tramo(p, TRAMOS.vuelve)), sube = suave(tramo(p, TRAMOS.cielo)), retira = tramo(p, TRAMOS.retira);
  const x0 = angosto ? 0.5 : 0.56, y0 = angosto ? 0.44 : 0.5;
  const r0 = angosto ? 0.34 * aspecto : Math.min(0.36, 0.44 * aspecto);
  // al volver la luna se centra; al subir va al lugar exacto de la luna de la galería
  const xc = x0 + (0.5 - x0) * vuelve, yc = y0 + (0.46 - y0) * vuelve, rc = r0 * (1 - 0.2 * vuelve);
  return {
    alinear: suave(tramo(p, TRAMOS.alinear)),
    papel: suave(tramo(p, TRAMOS.papel)) * (1 - vuelve),
    plano: suave(tramo(p, TRAMOS.plano)) * (1 - vuelve),
    llamadas: tramo(p, TRAMOS.llamadas) * (1 - retira),
    corte: suave(tramo(p, TRAMOS.corte)) * (1 - retira),
    cielo: sube,
    revelar: suave(tramo(p, TRAMOS.revelar)),
    x: xc + (destino[0] - xc) * sube,
    y: yc + (destino[1] - yc) * sube,
    radio: rc + (destino[2] - rc) * sube,
  };
}

/** Rasgo (lat, lon) → posición en el disco de la cara visible, en unidades del radio (y hacia abajo). */
export function enDisco(lat: number, lon: number): [number, number] {
  const la = (lat * Math.PI) / 180, lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), -Math.sin(la)];
}
