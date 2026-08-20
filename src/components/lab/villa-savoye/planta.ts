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

/*
  ── EL RESTO DE LA CASA, para que los verificadores la vean ────────────────

  El chequeo del recorrido solo miraba los tabiques del nobile y las fachadas,
  y daba "0 colisiones" mientras la cámara atravesaba la herradura de la
  planta baja y salía por la losa de cubierta. Tercera vez que el mismo error
  aparece: un verificador que mira un subconjunto reporta cero y no significa
  nada. Todo lo que ocupa espacio vive acá.
*/

/** Alturas de referencia (deben coincidir con villaModel). */
export const H_PILOTIS = 3.3;
export const H_BANDA_INF = 0.55;
export const H_VENTANA = 1.2;
export const H_BANDA_SUP = 1.5;
export const H_VOLUMEN = H_BANDA_INF + H_VENTANA + H_BANDA_SUP;
export const Y_LOSA = H_PILOTIS + 0.15;
export const Y_TECHO = H_PILOTIS + H_VOLUMEN;

/*
  El VACÍO de la losa del nobile por donde sube la rampa. Estaba en las
  coordenadas de la rampa vieja (x 1.0…3.4) y por eso la cámara salía por el
  piso: subía la rampa y se estrellaba contra la losa.
*/
export const VACIO_RAMPA = { x0: -1.5, x1: 0.1, z0: -7.0, z1: 4.78 };

/** Planta baja: la herradura acristalada + el bloque recto de servicio. */
export const H_RDC = H_PILOTIS - 0.2;
/*
  La herradura lleva PUERTA. Sin ella el vestíbulo es una vitrina cerrada y
  la promenade entra atravesando el vidrio — que es literalmente lo que
  pasaba. El hueco mira al sur, que es por donde se llega desde el jardín.
*/
export const HERRADURA = {
  cx: 0.3, cz: 1.0, r: 6.5,
  arcIni: Math.PI * 0.62, arcLen: Math.PI * 1.62,
  /** ángulos (rad) del hueco de entrada, dentro del arco */
  puerta: [5.95, 6.35] as [number, number],
};
export const BLOQUE_SERVICIO = { x: -6.1, z: -3.6, w: 5.2, d: 6.4 };

/** Paneles de la losa de cubierta: la huella menos los dos vacíos y el hueco de la rampa. */
export const LOSA: Array<[number, number, number, number]> = [
  // La banda de la RAMPA (x −1.5…0.1) queda ABIERTA AL CIELO en todo su
  // largo: los tramos C y D son exteriores, como en la casa real. Antes solo
  // se abría el trozo norte y la cámara salía por el techo a mitad de subida.
  [-9.5, -1.5, -10.625, -4.57], // norte-oeste
  [0.1, 9.5, -10.625, -4.57], // norte-este
  [-1.5, 0.1, -10.625, -7.0], // norte-centro, arriba del arranque de la rampa
  [-9.5, -1.5, 4.78, 10.625], // sur-oeste, sobre la cocina
  [0.1, 9.5, 4.78, 10.625], // sur-este, sobre la salle
  [-1.5, 0.1, 4.78, 10.625], // sur-centro, donde la rampa ya termino
  [-9.5, -1.5, -4.57, 2.4], // centro-oeste
  [0.1, 1.4, -4.57, 2.4], // centro-este, junto a la rampa
  [-6.35, -1.5, 2.4, 4.78], // centro-oeste-norte, al lado del vacio chico
  [0.1, 1.4, 2.4, 4.78],
];

/** TODO lo que un recorrido puede atravesar, como cajas [min,max] con nombre. */
export function cajasTodas(): Array<[string, number[], number[]]> {
  const T_MURO = 0.3;
  const out: Array<[string, number[], number[]]> = [];
  for (const [mn, mx] of cajasNobile(Y_LOSA, Y_TECHO)) out.push(["tabique nobile", mn, mx]);

  const bandas: Array<[string, number, number]> = [
    ["inf", H_PILOTIS, H_PILOTIS + H_BANDA_INF],
    ["sup", H_PILOTIS + H_BANDA_INF + H_VENTANA, Y_TECHO],
  ];
  for (const [n, y0, y1] of bandas) {
    out.push([`fachada +z ${n}`, [-W / 2, y0, D / 2 - T_MURO], [W / 2, y1, D / 2]]);
    out.push([`fachada -z ${n}`, [-W / 2, y0, -D / 2], [W / 2, y1, -D / 2 + T_MURO]]);
    out.push([`fachada +x ${n}`, [W / 2 - T_MURO, y0, -D / 2], [W / 2, y1, D / 2]]);
    out.push([`fachada -x ${n}`, [-W / 2, y0, -D / 2], [-W / 2 + T_MURO, y1, D / 2]]);
  }

  // losa del nobile (el piso: la cámara no puede atravesarlo desde abajo)
  // la losa del nobile, en paneles alrededor del vacío de la rampa
  const v = VACIO_RAMPA;
  out.push(["losa nobile oeste", [-W / 2, H_PILOTIS, -D / 2], [v.x0, Y_LOSA, D / 2]]);
  out.push(["losa nobile este", [v.x1, H_PILOTIS, -D / 2], [W / 2, Y_LOSA, D / 2]]);
  out.push(["losa nobile norte", [v.x0, H_PILOTIS, -D / 2], [v.x1, Y_LOSA, v.z0]]);
  out.push(["losa nobile sur", [v.x0, H_PILOTIS, v.z1], [v.x1, Y_LOSA, D / 2]]);

  // planta baja: el bloque de servicio (la herradura se chequea radialmente)
  const b = BLOQUE_SERVICIO;
  out.push(["bloque de servicio", [b.x - b.w / 2, 0, b.z - b.d / 2], [b.x + b.w / 2, H_RDC, b.z + b.d / 2]]);

  // cubierta
  for (const [x0, x1, z0, z1] of LOSA)
    out.push(["losa de cubierta", [x0, Y_TECHO, z0], [x1, Y_TECHO + 0.4, z1]]);
  const A = 0.22;
  out.push(["antepecho +z", [-W / 2, Y_TECHO, D / 2 - A], [W / 2, Y_TECHO + 1.25, D / 2]]);
  out.push(["antepecho -z", [-W / 2, Y_TECHO, -D / 2], [W / 2, Y_TECHO + 1.25, -D / 2 + A]]);
  out.push(["antepecho +x", [W / 2 - A, Y_TECHO, -D / 2], [W / 2, Y_TECHO + 1.25, D / 2]]);
  out.push(["antepecho -x", [-W / 2, Y_TECHO, -D / 2], [-W / 2 + A, Y_TECHO + 1.25, D / 2]]);
  return out;
}
