/*
  LA PLANTA, EN UN SOLO LUGAR.

  Traducción directa de PLANTA.md §2 — el documento manda sobre esto, y esto
  manda sobre el resto del código.

  Por qué existe: `check-villa-tour.mjs` tenía su propia copia de los muros
  escrita a mano. Cuando la planta cambió, el verificador siguió midiendo la
  planta vieja y reportó "0 colisiones" mientras la cámara atravesaba media
  casa. Un verificador que no lee la misma fuente que el modelo no verifica
  nada: da falsa confianza, que es peor que no tenerlo.

  Ahora `villaModel.ts` construye desde acá y los scripts miden desde acá.
*/

export type Tabique = {
  /** el eje que se mantiene constante */
  eje: "x" | "z";
  v: number;
  /** tramo sobre el eje libre */
  a: number;
  b: number;
  /** huecos de puerta sobre el eje libre */
  puertas?: Array<[number, number]>;
  /** acristalado con montantes (el panel corredizo) */
  vidrio?: boolean;
  nombre: string;
};

/** Huella real: trama 4×4 de 4.75 m + voladizos de 1.125 en Z (PLANTA.md §1). */
export const CRUJIA = 4.75;
export const VOLADIZO = 1.125;
export const W = CRUJIA * 4; // 19.0 en x
export const D = CRUJIA * 4 + VOLADIZO * 2; // 21.25 en z
export const T_TABIQUE = 0.15;

export const TABIQUES: Tabique[] = [
  // El gesto central: la SALLE abre a la TERRASSE por el panel corredizo.
  // El tramo de vidrio ES la abertura — por eso va acristalado y sin puerta.
  { nombre: "panel corredizo salle↔terrasse", eje: "z", v: 4.78, a: 0.1, b: 9.5, vidrio: true,
    // corrido: el tramo abierto es POR DONDE SE PASA. Un panel macizo dejaria
    // el gesto central de la casa como algo que se mira y no se cruza.
    puertas: [[4.0, 7.0]] },
  { nombre: "muro sur del corredor", eje: "z", v: 4.78, a: -9.5, b: 0.1, puertas: [[-8.9, -8.0]] },
  { nombre: "cuisine ↔ salle", eje: "x", v: -4.79, a: 4.78, b: 10.63, puertas: [[6.4, 7.3]] },
  { nombre: "rampa · costado este", eje: "x", v: 0.1, a: -4.83, b: 4.78,
    // la rampa desemboca aca: sin esta puerta el corredor queda sellado
    puertas: [[1.2, 3.0]] },
  { nombre: "rampa · costado oeste", eje: "x", v: -1.5, a: -7.0, b: 4.78 },
  { nombre: "terrasse ↔ abri/boudoir", eje: "z", v: -4.83, a: 1.36, b: 9.5 },
  { nombre: "boudoir ↔ abri", eje: "x", v: 4.47, a: -10.63, b: -4.83, puertas: [[-7.6, -6.7]] },
  { nombre: "boudoir · costado oeste", eje: "x", v: 1.36, a: -10.63, b: -4.83 },
  { nombre: "ala de dormitorios · eje norte-sur", eje: "x", v: -5.12, a: -10.63, b: 4.78,
    puertas: [[-9.6, -8.7], [-3.6, -2.7], [2.6, 3.5]] },
  { nombre: "chambre 1 ↔ chambre 3", eje: "z", v: -4.99, a: -9.5, b: -5.12, puertas: [[-7.6, -6.7]] },
  { nombre: "chambre 3 ↔ terrasse de servicio", eje: "z", v: 1.92, a: -9.5, b: -5.12 },
  { nombre: "chambre 2 ↔ núcleo húmedo", eje: "z", v: -6.17, a: -5.12, b: 1.36, puertas: [[-3.4, -2.5]] },
  { nombre: "núcleo húmedo · cara sur", eje: "z", v: -0.28, a: -5.12, b: -1.5, puertas: [[-4.4, -3.5]] },
];

/** Parte el tramo [a,b] por los huecos de puerta y devuelve los pedazos macizos. */
export function tramosSolidos(
  a: number,
  b: number,
  puertas: Array<[number, number]> = [],
): Array<[number, number]> {
  const ordenadas = [...puertas].sort((p, q) => p[0] - q[0]);
  const out: Array<[number, number]> = [];
  let cursor = a;
  for (const [p0, p1] of ordenadas) {
    if (p0 > cursor) out.push([cursor, Math.min(p0, b)]);
    cursor = Math.max(cursor, p1);
  }
  if (cursor < b) out.push([cursor, b]);
  return out.filter(([u, w]) => w - u > 0.05);
}

/** Los muros del nobile como cajas [min, max], para los verificadores. */
export function cajasNobile(yMin: number, yMax: number): Array<[number[], number[]]> {
  const out: Array<[number[], number[]]> = [];
  const h = T_TABIQUE / 2;
  for (const t of TABIQUES) {
    for (const [u, w] of tramosSolidos(t.a, t.b, t.puertas)) {
      out.push(
        t.eje === "x"
          ? [[t.v - h, yMin, u], [t.v + h, yMax, w]]
          : [[u, yMin, t.v - h], [w, yMax, t.v + h]],
      );
    }
  }
  return out;
}
