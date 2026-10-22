/*
  Letras en espiral que se ordenan (Manifiesto, 21-oct). Cada letra tiene su lugar en el texto (medido sin transformar)
  y un lugar en una espiral alrededor del centro de la pantalla. Con q ∈ [0, 1]:
    0 → 0,3   la espiral aparece letra por letra (de adentro hacia afuera) y gira;
    0,3 → 1   cada letra se suelta de la espiral, en orden, y vuela a su lugar enderezándose.
  Solo transform y opacidad: nada de layout en el bucle.
*/
export type Medida = { x: number; y: number };   // centro de la letra en su lugar, relativo al centro del contenedor

const VUELTAS = 0.62;   // radianes entre una letra y la siguiente sobre la espiral
const GIRO = 2.4;       // cuánto gira la espiral mientras se arma (radianes)

const sat = (v: number) => Math.min(1, Math.max(0, v));
const suave = (v: number) => v * v * (3 - 2 * v);

export function medirLetras(contenedor: HTMLElement, letras: HTMLElement[]): Medida[] {
  for (const l of letras) l.style.transform = "";
  const c = contenedor.getBoundingClientRect();
  const cx = c.left + c.width / 2, cy = c.top + c.height / 2;
  return letras.map((l) => {
    const r = l.getBoundingClientRect();
    return { x: r.left + r.width / 2 - cx, y: r.top + r.height / 2 - cy };
  });
}

export function espiral(letras: HTMLElement[], medidas: Medida[], contenedor: HTMLElement, q: number): void {
  const n = letras.length;
  const radioMax = Math.min(contenedor.clientWidth, contenedor.clientHeight) * 0.42;
  const giro = -GIRO * suave(sat(q / 0.6));
  for (let i = 0; i < n; i++) {
    const f = i / Math.max(1, n - 1);
    // posición en la espiral: las primeras letras cerca del centro, las últimas afuera
    const ang = giro + i * VUELTAS;
    const rad = radioMax * (0.18 + 0.82 * f);
    const sx = Math.cos(ang) * rad, sy = Math.sin(ang) * rad * 0.62;   // espiral achatada, como vista en perspectiva
    // aparición sobre la espiral y salida hacia el texto, escalonadas
    const aparece = suave(sat((q - f * 0.22) / 0.12));
    const vuela = suave(sat((q - 0.3 - f * 0.42) / 0.28));
    const { x, y } = medidas[i];
    const dx = (sx - x) * (1 - vuela), dy = (sy - y) * (1 - vuela);
    const rot = (ang * 180) / Math.PI + 90;
    const escala = 0.55 + 0.45 * vuela + 0.2 * (1 - f) * (1 - vuela);
    letras[i].style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) rotate(${(rot * (1 - vuela)).toFixed(1)}deg) scale(${escala.toFixed(3)})`;
    letras[i].style.opacity = aparece.toFixed(3);
  }
}
