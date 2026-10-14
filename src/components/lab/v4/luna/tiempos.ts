/*
  Sección de la luna (idea de Alejo y Mari, 13-oct): reemplaza la muestra de materiales.
  Sobre blanco aparece la C del logo; se completa en una luna de línea, cae la noche y
  la luna se vuelve 3D (se puede girar). Pasan unas frases; la cámara se acerca hasta
  que la luna ocupa ~80% de la pantalla; el viento le arranca polvo y con ese polvo se
  escriben las 14 capas. Después la luna se rearma y baja a su lugar en el cielo de la
  galería. Matemática pura del reparto del scroll (sin DOM) para poder probarla.
*/

type Tramo = readonly [number, number];

export const TRAMOS = {
  logo: [0, 0.07],
  noche: [0.05, 0.15],
  frases: [0.15, 0.52],
  acercar: [0.52, 0.6],
  viento: [0.6, 0.78],
  rearme: [0.86, 0.93],
  bajar: [0.93, 1],
} as const satisfies Record<string, Tramo>;

export const FRASES = [
  "Una web que se ve bien es solo la superficie.",
  "Lo que importa pasa cuando alguien te escribe.",
  "Cada consulta llega a tu correo, ese mismo minuto.",
  "Cada semana, un respaldo de todas.",
  "Debajo de la superficie hay catorce capas.",
] as const;

export const CAPAS = [
  "Diseño a la medida",
  "Formulario que filtra",
  "Base de datos propia",
  "Permisos cerrados",
  "Servidor sin mantenimiento",
  "Crece con las visitas",
  "Publicación automática",
  "Cabeceras de seguridad",
  "Freno al spam",
  "Carga inmediata",
  "Aguanta los picos",
  "Aviso si algo falla",
  "Respaldo semanal",
  "Lista para buscadores",
] as const;

export function tramo(p: number, [a, b]: Tramo): number {
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}

const suave = (t: number) => t * t * (3 - 2 * t);

/** Qué frase se ve y en qué punto de su entrada (0→1) o salida (0→1) está. */
export function fraseDe(p: number, total = FRASES.length): { indice: number; entra: number; sale: number } {
  const t = tramo(p, TRAMOS.frases);
  if (t <= 0 || t >= 1) return { indice: -1, entra: 0, sale: 0 };
  const seg = Math.min(total - 1e-6, t * total);
  const indice = Math.floor(seg);
  const s = seg - indice;
  return { indice, entra: Math.min(1, s / 0.4), sale: Math.max(0, (s - 0.72) / 0.28) };
}

export type EstadoLuna = {
  /** 0 = blanco (cuarzo), 1 = noche (piedra) */
  noche: number;
  /** avance del trazo que completa la C en círculo */
  linea: number;
  /** opacidad de la luna 3D */
  solida: number;
  /** centro y radio en pantalla (fracciones; el radio en alturas de pantalla) */
  x: number;
  y: number;
  radio: number;
  /** 0 = luna entera, 1 = toda convertida en polvo y escribiendo las capas */
  polvo: number;
  /** fundido hacia el primer cuadro de la galería */
  galeria: number;
};

/**
 * `destino` = dónde está la luna en el primer cuadro de la galería (x, y, radio).
 * `aspecto` = ancho / alto de la pantalla: en celular la luna no puede ser más ancha que la pantalla.
 */
export function estadoDe(p: number, destino: [number, number, number], aspecto = 16 / 9): EstadoLuna {
  const noche = suave(tramo(p, TRAMOS.noche));
  const acercar = suave(tramo(p, TRAMOS.acercar));
  const bajar = suave(tramo(p, TRAMOS.bajar));
  const ida = tramo(p, TRAMOS.viento);
  const vuelta = tramo(p, TRAMOS.rearme);
  const base = { x: 0.5, y: 0.4, radio: Math.min(0.2, 0.42 * aspecto) };
  const cerca = { x: 0.5, y: 0.5, radio: Math.min(0.4, 0.48 * aspecto) };
  const mezcla = (a: number, b: number, t: number) => a + (b - a) * t;
  const x0 = mezcla(base.x, cerca.x, acercar), y0 = mezcla(base.y, cerca.y, acercar), r0 = mezcla(base.radio, cerca.radio, acercar);
  return {
    noche,
    linea: suave(tramo(p, TRAMOS.logo)),
    solida: suave(tramo(p, [0.09, 0.15])),
    x: mezcla(x0, destino[0], bajar),
    y: mezcla(y0, destino[1], bajar),
    radio: mezcla(r0, destino[2], bajar),
    polvo: Math.min(ida, 1 - vuelta),
    galeria: suave(tramo(p, [0.95, 1])),
  };
}
