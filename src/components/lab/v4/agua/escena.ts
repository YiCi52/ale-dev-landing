/*
  Matemática pura de la galería v4 (sin DOM), para poder probarla aparte:
  cómo se reparte el scroll entre la película del río y los proyectos, y cómo
  pasar coordenadas del cuadro pre-renderizado a coordenadas de pantalla.
*/

/*
  Reparto del scroll (14-oct): la película de Blender es solo caminar y bajar la mirada; el eclipse y los proyectos
  ocurren en vivo sobre el agua, con el reflejo quieto y el agua moviéndose sola.
*/
export const PELICULA = 0.35;
export const FIN_ECLIPSE = 0.5;

/** Avance del eclipse 0 (llena) → 1 (eclipsada), mientras se mira el agua. */
export function eclipseDe(p: number): number {
  return Math.min(1, Math.max(0, (p - PELICULA) / (FIN_ECLIPSE - PELICULA)));
}

export type Datos = Record<
  string,
  { reflejo: [number, number]; radio: number; piso: number; horizonte: number; luna?: [number, number]; luna_radio?: number }
>;

export function cuadroDe(p: number, total: number): number {
  const t = Math.min(1, Math.max(0, p / PELICULA));
  return Math.min(total, Math.max(1, Math.round(1 + t * (total - 1))));
}

/**
 * Qué proyecto se ve y cuánto: cada uno aparece (0→1), se queda y se disuelve (1→0);
 * el último no se disuelve para que la sección termine con algo en el agua.
 */
export function proyectoDe(p: number, cantidad: number): { indice: number; visible: number } {
  if (p <= FIN_ECLIPSE || cantidad <= 0) return { indice: 0, visible: 0 };
  const seg = Math.min(cantidad - 1e-6, ((p - FIN_ECLIPSE) / (1 - FIN_ECLIPSE)) * cantidad);
  const indice = Math.floor(seg);
  const s = seg - indice;
  const ultimo = indice === cantidad - 1;
  let visible = 1;
  if (s < 0.3) visible = s / 0.3;
  else if (s > 0.7 && !ultimo) visible = 1 - (s - 0.7) / 0.3;
  return { indice, visible: Math.min(1, Math.max(0, visible)) };
}

/** Transformación object-fit: cover entre una imagen (iw × ih) y una pantalla (W × H). */
export function cubrir(W: number, H: number, iw: number, ih: number) {
  const s = Math.max(W / iw, H / ih);
  const dw = iw * s;
  const dh = ih * s;
  const ox = (W - dw) / 2;
  const oy = (H - dh) / 2;
  return {
    /** pantalla (0-1) → cuadro (0-1): escala.xy y desplazamiento.xy para el shader */
    uniforme: [W / dw, H / dh, -ox / dw, -oy / dh] as [number, number, number, number],
    /** cuadro (0-1) → pantalla (0-1) */
    aPantalla: (x: number, y: number): [number, number] => [(x * dw + ox) / W, (y * dh + oy) / H],
    /** largo en alturas del cuadro → alturas de pantalla */
    alto: (r: number) => (r * dh) / H,
  };
}
