/*
  La noche viva del hero (Alejo, 19-oct: "movimiento orgánico que no provoca el usuario" + "efectos interactivos").
  Sobre el cuadro renderizado se pinta, cuadro a cuadro: el agua que ondula sola (franjas horizontales corridas con un
  seno lento), las ondas que deja el cursor al pasar por el agua, y unas pocas estrellas que titilan en el cielo.
  Todo en el mismo canvas 2D, sin WebGL.
*/

export type Cursor = { x: number; y: number; fuerza: number };

const FRANJA = 3;                      // alto en px (del lienzo) de cada franja de agua
const ESTRELLAS = Array.from({ length: 34 }, (_, i) => {
  // posiciones fijas (semilla) en la franja alta del cielo; brillo y ritmo propios
  const a = Math.sin(i * 12.9898) * 43758.5453, b = Math.sin(i * 78.233) * 12345.6789;
  const fx = a - Math.floor(a), fy = b - Math.floor(b);
  return { x: fx, y: 0.03 + fy * 0.3, r: 0.6 + (i % 3) * 0.35, ritmo: 0.6 + (i % 5) * 0.27, fase: i * 1.7 };
});

type Encuadre = { x: number; y: number; dw: number; dh: number; escala: number };

/** Cómo cae la imagen en el lienzo (cover, con `foco` horizontal), en px del lienzo. */
export function encuadre(w: number, h: number, img: HTMLImageElement, foco: number): Encuadre {
  const escala = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * escala, dh = img.naturalHeight * escala;
  const x = Math.min(0, Math.max(w - dw, w / 2 - dw * foco));
  return { x, y: (h - dh) / 2, dw, dh, escala };
}

/** Pinta el cuadro con el agua viva desde `horizonte` (0–1 de la imagen) hacia abajo, y las estrellas encima. */
export function pintarNoche(ctx: CanvasRenderingContext2D, img: HTMLImageElement, e: Encuadre, horizonte: number, t: number, cursor: Cursor, estrellas: number): void {
  const { x, y, dw, dh, escala } = e;
  ctx.drawImage(img, x, y, dw, dh);
  const y0 = y + dh * horizonte;
  const alto = ctx.canvas.height;
  for (let py = Math.max(0, y0); py < alto; py += FRANJA) {
    const hondo = (py - y0) / Math.max(1, alto - y0);                 // 0 en la orilla, 1 abajo
    let dx = Math.sin(t * 0.8 + py * 0.035) * (0.6 + 2.6 * hondo) + Math.sin(t * 0.45 + py * 0.011) * 1.2 * hondo;
    if (cursor.fuerza > 0.01) {
      const d = Math.hypot(0, py - cursor.y) + 0.0001;
      const cerca = Math.exp(-(d * d) / (2 * 90 * 90));
      dx += Math.sin(d * 0.09 - t * 7) * 9 * cerca * cursor.fuerza;
    }
    const sy = (py - y) / escala;
    ctx.drawImage(img, 0, sy, img.naturalWidth, FRANJA / escala, x + dx, py, dw, FRANJA);
  }
  if (estrellas <= 0) return;
  const w = ctx.canvas.width;
  for (const s of ESTRELLAS) {
    const brillo = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.ritmo + s.fase))) * estrellas;
    ctx.globalAlpha = brillo * 0.85;
    ctx.fillStyle = "#e8edf5";
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * alto, s.r * (w / 1440 + 0.4), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
