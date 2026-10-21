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

export type Encuadre = { x: number; y: number; dw: number; dh: number; escala: number };
/** Luna de un cuadro: centro x, y (0–1 de la imagen) y radio (fracción del alto), medidos del render (public/lab/v5/casa/luna.json). */
export type LunaCuadro = [number, number, number];

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

/**
 * La luna de verdad (Alejo, 19-oct: "que esté en sincronía con la fase real"). El render no la trae: se pinta aquí, en el
 * punto y del tamaño que tenía en Blender, con la parte iluminada de hoy. Creciente: luz a la derecha; menguante, a la
 * izquierda. De noche brilla y deja ver el resto del disco (luz de la Tierra); de día es un disco pálido sobre el cielo.
 */
export function pintarLuna(ctx: CanvasRenderingContext2D, e: Encuadre, luna: LunaCuadro, iluminada: number, creciente: boolean, dia: boolean): void {
  const cx = e.x + luna[0] * e.dw, cy = e.y + luna[1] * e.dh, r = luna[2] * e.dh;
  if (r <= 0) return;
  ctx.save();
  ctx.translate(cx, cy);
  if (!dia) {
    // halo y disco apagado
    const halo = ctx.createRadialGradient(0, 0, r * 0.9, 0, 0, r * 3.2);
    halo.addColorStop(0, `rgba(214, 224, 240, ${0.05 + 0.18 * iluminada})`);
    halo.addColorStop(1, "rgba(214, 224, 240, 0)");
    ctx.fillStyle = halo;
    ctx.fillRect(-r * 3.2, -r * 3.2, r * 6.4, r * 6.4);
    ctx.fillStyle = "rgba(190, 202, 222, 0.07)";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
  }
  if (iluminada > 0.01) {
    if (!creciente) ctx.scale(-1, 1);
    // borde iluminado (media circunferencia derecha) y vuelta por el terminador, una media elipse
    const rx = r * Math.abs(1 - 2 * iluminada);
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
    ctx.ellipse(0, 0, Math.max(0.01, rx), r, 0, Math.PI / 2, -Math.PI / 2, iluminada < 0.5);
    ctx.closePath();
    ctx.fillStyle = dia ? "rgba(255, 255, 255, 0.82)" : "#f3f1ea";
    if (!dia) { ctx.shadowColor = "rgba(236, 240, 250, 0.7)"; ctx.shadowBlur = r * 0.5; }
    ctx.fill();
  }
  ctx.restore();
}

/* ---------- lluvia (Alejo, 20-oct: "con temporizador, aleatorio al entrar a la página") ---------- */
const GOTAS = Array.from({ length: 160 }, (_, i) => {
  const a = Math.sin(i * 91.17) * 43758.5453, b = Math.sin(i * 47.31) * 24634.6345;
  return { x: a - Math.floor(a), y: b - Math.floor(b), v: 0.9 + (i % 7) * 0.08, largo: 0.6 + (i % 5) * 0.2 };
});
const ONDAS = 26;

/** Gotas que caen y círculos que abren en el agua; `intensidad` 0–1 (sube y baja suave desde el hero). */
export function pintarLluvia(ctx: CanvasRenderingContext2D, e: Encuadre, horizonte: number, t: number, intensidad: number, dia: boolean): void {
  if (intensidad <= 0.01) return;
  const w = ctx.canvas.width, h = ctx.canvas.height, k = w / 1440;
  // el cielo se cierra un poco
  ctx.fillStyle = dia ? `rgba(70, 80, 92, ${0.22 * intensidad})` : `rgba(4, 6, 12, ${0.28 * intensidad})`;
  ctx.fillRect(0, 0, w, h);
  // gotas: trazos finos, inclinados, que bajan en bucle
  ctx.strokeStyle = dia ? `rgba(235, 240, 246, ${0.38 * intensidad})` : `rgba(190, 205, 228, ${0.32 * intensidad})`;
  ctx.lineWidth = Math.max(1, 1.1 * k);
  ctx.beginPath();
  const n = Math.round(GOTAS.length * intensidad);
  for (let i = 0; i < n; i++) {
    const g = GOTAS[i];
    const y = ((g.y + t * g.v * 1.3) % 1) * (h + 60 * k) - 30 * k;
    const x = ((g.x + t * 0.05) % 1) * w;
    const l = 26 * g.largo * k;
    ctx.moveTo(x, y); ctx.lineTo(x - l * 0.12, y + l);
  }
  ctx.stroke();
  // círculos en el agua: cada onda nace en un punto distinto en cada ciclo y se abre aplastada por la perspectiva
  const y0 = e.y + e.dh * horizonte;
  if (y0 >= h) return;
  ctx.strokeStyle = dia ? "rgba(245, 248, 252, 1)" : "rgba(200, 214, 236, 1)";
  for (let i = 0; i < ONDAS * intensidad; i++) {
    const ciclo = t * 0.9 + i * 0.137;
    const fase = ciclo % 1, vuelta = Math.floor(ciclo);
    const a = Math.sin((i + 1) * 12.9898 + vuelta * 78.233) * 43758.5453, b = Math.sin((i + 1) * 39.346 + vuelta * 11.135) * 24634.6345;
    const hondo = b - Math.floor(b);
    const cx = (a - Math.floor(a)) * w, cy = y0 + 6 * k + hondo * (h - y0);
    const rx = (6 + 22 * fase) * k * (0.6 + hondo);
    ctx.globalAlpha = (1 - fase) * 0.4 * intensidad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, rx * 0.22, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
