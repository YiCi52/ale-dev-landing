/*
  El cielo de la página (Alejo, 14-oct: "menos estrellas, cúmulos que hagan las constelaciones de nuestro cielo
  nocturno, pocas y sin nombres"). Mismo cielo en la sección de la luna y en la galería, para que el paso de una a
  la otra sea continuo. Las figuras salen de posiciones reales (ascensión recta en horas, declinación en grados,
  magnitud) proyectadas alrededor de su centro; cada constelación se coloca en un punto del encuadre.
*/

type Real = [number, number, number];   // [AR h, Dec °, magnitud]

const ORION: Real[] = [[5.92, 7.41, 0.5], [5.42, 6.35, 1.6], [5.6, -1.2, 1.7], [5.68, -1.94, 1.8], [5.53, -0.3, 2.2], [5.24, -8.2, 0.1], [5.8, -9.67, 2.1], [5.59, 9.93, 3.4]];
const CRUZ_DEL_SUR: Real[] = [[12.44, -63.1, 0.8], [12.52, -57.11, 1.6], [12.8, -59.69, 1.3], [12.25, -58.75, 2.8], [12.36, -60.4, 3.6]];
const ESCORPION: Real[] = [[16.49, -26.43, 1.0], [16.01, -22.62, 2.3], [16.09, -19.8, 2.6], [15.98, -26.11, 2.9], [16.84, -34.29, 2.3], [16.91, -42.36, 3.0], [17.2, -43.24, 3.3], [17.62, -43.0, 1.9], [17.56, -37.1, 1.6], [17.51, -39.03, 2.7]];
const OSA_MAYOR: Real[] = [[11.06, 61.75, 1.8], [11.03, 56.38, 2.4], [11.9, 53.69, 2.4], [12.26, 57.03, 3.3], [12.9, 55.96, 1.8], [13.4, 54.93, 2.2], [13.79, 49.31, 1.9]];
const CASIOPEA: Real[] = [[0.15, 59.15, 2.3], [0.68, 56.54, 2.2], [0.95, 60.72, 2.5], [1.43, 60.24, 2.7], [1.91, 63.67, 3.4]];

export type Estrella = { x: number; y: number; brillo: number };

/** Proyecta una figura alrededor de su centro (gnomónica simple) y la coloca en (cx, cy) con `escala` (alturas de pantalla por grado). */
function figura(estrellas: Real[], cx: number, cy: number, escala: number, giro = 0): Estrella[] {
  const ra0 = estrellas.reduce((s, e) => s + e[0], 0) / estrellas.length;
  const de0 = estrellas.reduce((s, e) => s + e[1], 0) / estrellas.length;
  const c = Math.cos(giro), s = Math.sin(giro);
  return estrellas.map(([ra, de, mag]) => {
    const x = -(ra - ra0) * 15 * Math.cos((de0 * Math.PI) / 180), y = de - de0;   // el este queda a la izquierda, como en el cielo
    return { x: cx + (x * c - y * s) * escala, y: cy + (x * s + y * c) * escala, brillo: Math.max(0.25, 1.15 - mag * 0.24) };
  });
}

/** Unas pocas estrellas sueltas, siempre en el mismo lugar (semilla fija). */
function sueltas(n: number): Estrella[] {
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: n }, () => ({ x: azar() * 2.4 - 1.2, y: azar() * 0.55, brillo: 0.15 + azar() * 0.3 }));
}

/**
 * Coordenadas en "cielo", en ALTURAS de pantalla: x desde el centro (negativo = izquierda; en 16:9 se ve ±0,89),
 * y desde el horizonte hacia ARRIBA. Así las figuras no se deforman en ninguna pantalla; en celular solo se ve
 * la franja del centro (un cielo más despejado todavía). La luna queda al centro, a ~0,37 sobre el horizonte.
 */
export const CIELO: Estrella[] = [
  ...figura(ORION, -0.62, 0.3, 0.0105, -0.25),
  ...figura(CRUZ_DEL_SUR, 0.62, 0.15, 0.0105, 0.4),
  ...figura(ESCORPION, 0.42, 0.44, 0.0085, -0.6),
  ...figura(OSA_MAYOR, -0.3, 0.6, 0.0085, 0.2),
  ...figura(CASIOPEA, 0.8, 0.62, 0.009, 0.1),
  ...sueltas(22).map((e) => ({ ...e, y: 0.06 + e.y })),
];

/** Lado del lienzo del cielo: 2,4 alturas de ancho × 1 de alto. */
export const CIELO_ANCHO = 2.4;

/** Dibuja las estrellas como puntos suaves. `aPantalla` convierte coordenadas de cielo a px; `alfa` 0-1. */
export function pintarEstrellas(ctx: CanvasRenderingContext2D, aPantalla: (x: number, y: number) => [number, number], escala: number, alfa: number): void {
  if (alfa <= 0) return;
  for (const e of CIELO) {
    const [px, py] = aPantalla(e.x, e.y);
    const r = (0.45 + e.brillo * 1.05) * escala;
    const g = ctx.createRadialGradient(px, py, 0, px, py, r * 3);
    g.addColorStop(0, `rgba(240,242,250,${(alfa * e.brillo).toFixed(3)})`);
    g.addColorStop(0.25, `rgba(220,228,245,${(alfa * e.brillo * 0.35).toFixed(3)})`);
    g.addColorStop(1, "rgba(220,228,245,0)");
    ctx.fillStyle = g;
    ctx.fillRect(px - r * 3, py - r * 3, r * 6, r * 6);
  }
}

/** Lienzo del cielo completo para la galería (WebGL lo pega como textura): 2,4 × 1 alturas, horizonte abajo. */
export function lienzoCielo(alto: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.round(alto * CIELO_ANCHO); c.height = alto;
  const ctx = c.getContext("2d");
  if (ctx) pintarEstrellas(ctx, (x, y) => [(x / CIELO_ANCHO + 0.5) * c.width, (1 - y) * alto], alto / 900, 1);
  return c;
}
