/*
  Prueba de la constelación (Alejo, 14-oct: "hagamos la prueba de la constelación solo para ver").
  Las 14 capas como estrellas alrededor de "Tu sitio"; cada estrato del plano de la luna es una constelación.
  Posiciones fijas (no aleatorias) para que la figura de cada grupo sea siempre la misma, como en un cielo real.
*/
import { ESTRATOS } from "../luna/tiempos";

export type Estrella = { id: string; nombre: string; grupo: number; pos: [number, number, number]; brillo: number };

/** Dirección de cada constelación en el cielo (vector unitario aproximado) y la figura de sus estrellas en el plano local. */
const FIGURAS: { dir: [number, number, number]; puntos: [number, number][] }[] = [
  { dir: [0.0, 0.85, 0.5], puntos: [[-0.5, 0.1], [0.05, 0.35], [0.55, -0.05]] },
  { dir: [0.9, 0.15, 0.4], puntos: [[-0.3, 0.45], [0.2, 0.0], [-0.1, -0.5]] },
  { dir: [0.55, -0.75, 0.35], puntos: [[0, 0]] },
  { dir: [-0.85, -0.35, 0.4], puntos: [[-0.55, 0.3], [-0.1, 0.05], [0.35, 0.3], [0.6, -0.25]] },
  { dir: [-0.6, 0.6, -0.5], puntos: [[-0.4, -0.3], [0.0, 0.25], [0.45, -0.1]] },
];

const RADIO = 1.95, ESCALA_FIGURA = 0.85;   // 14-oct noche (Alejo): "se siente vacío porque es muy grande para 5"

function normal(v: [number, number, number]): [number, number, number] {
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
}

/** Dos ejes perpendiculares a `d` para dibujar la figura sobre la esfera. */
function base(d: [number, number, number]): [[number, number, number], [number, number, number]] {
  const arriba: [number, number, number] = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const u = normal([arriba[1] * d[2] - arriba[2] * d[1], arriba[2] * d[0] - arriba[0] * d[2], arriba[0] * d[1] - arriba[1] * d[0]]);
  const v: [number, number, number] = [d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0]];
  return [u, v];
}

export const CENTRO: Estrella = { id: "sitio", nombre: "Tu sitio", grupo: -1, pos: [0, 0, 0], brillo: 1.6 };

export const ESTRELLAS: Estrella[] = ESTRATOS.flatMap((e, g) => {
  const d = normal(FIGURAS[g].dir), [u, v] = base(d);
  return e.capas.map((nombre, k) => {
    const [a, b] = FIGURAS[g].puntos[k];
    const pos: [number, number, number] = [0, 1, 2].map((i) => d[i] * RADIO + (u[i] * a + v[i] * b) * ESCALA_FIGURA) as [number, number, number];
    return { id: `${g}-${k}`, nombre, grupo: g, pos, brillo: k === 0 ? 1.15 : 0.85 };
  });
});

/** Líneas: dentro de cada constelación une sus estrellas en orden; la primera de cada una cuelga del centro. */
export const LINEAS: [Estrella, Estrella][] = ESTRATOS.flatMap((_, g) => {
  const del = ESTRELLAS.filter((s) => s.grupo === g);
  return [[CENTRO, del[0]] as [Estrella, Estrella], ...del.slice(1).map((s, i) => [del[i], s] as [Estrella, Estrella])];
});

/**
 * Estrellas menores sin nombre alrededor de cada constelación (como los cúmulos de un cielo real): le dan cuerpo
 * a cada grupo sin agregar etiquetas. Semilla fija: siempre las mismas.
 */
export const MENORES: [number, number, number][] = (() => {
  let semilla = 11;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647) * 2 - 1;
  return ESTRELLAS.flatMap((e) => Array.from({ length: 5 }, () => [e.pos[0] + azar() * 0.45, e.pos[1] + azar() * 0.45, e.pos[2] + azar() * 0.45] as [number, number, number]));
})();
