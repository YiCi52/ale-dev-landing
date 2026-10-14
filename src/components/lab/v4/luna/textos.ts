/*
  Texto hecho de partes: (1) las frases como bloques que caen y se arman (referencia:
  la sección de píxeles de StringTune), y (2) las 14 capas como puntos de destino
  para el polvo de la luna. Ambos se muestrean de un canvas 2D con la fuente real.
*/

export type Bloque = { x: number; y: number; azar: number };
export type Punto = { x: number; y: number; oro: boolean };

/** Familia real detrás de la variable CSS (canvas no entiende var()). */
export function familia(el: HTMLElement, variable: string, respaldo: string): string {
  const v = getComputedStyle(el).getPropertyValue(variable).trim();
  return v ? `${v}, ${respaldo}` : respaldo;
}

function lineas(ctx: CanvasRenderingContext2D, texto: string, maximo: number): string[] {
  const salida: string[] = [];
  let actual = "";
  for (const palabra of texto.split(" ")) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (ctx.measureText(prueba).width > maximo && actual) {
      salida.push(actual);
      actual = palabra;
    } else actual = prueba;
  }
  return actual ? [...salida, actual] : salida;
}

/** Bloques de una frase centrada en (ancho/2, centroY), en px CSS. */
export function bloquesDeFrase(texto: string, ancho: number, centroY: number, fuente: string, lado: number): Bloque[] {
  const tam = Math.round(Math.min(56, Math.max(28, ancho * 0.036)));
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = tam * 4;
  const ctx = lienzo.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.font = `400 ${tam}px ${fuente}`;
  const ls = lineas(ctx, texto, ancho * 0.84);
  lienzo.height = Math.ceil(tam * 1.25 * ls.length + tam);
  ctx.font = `400 ${tam}px ${fuente}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ls.forEach((l, i) => ctx.fillText(l, ancho / 2, tam * 0.5 + tam * 1.25 * (i + 0.5)));
  const datos = ctx.getImageData(0, 0, lienzo.width, lienzo.height).data;
  const arriba = centroY - lienzo.height / 2;
  const bloques: Bloque[] = [];
  for (let y = 0; y < lienzo.height; y += lado) {
    for (let x = 0; x < lienzo.width; x += lado) {
      if (datos[((y + (lado >> 1)) * lienzo.width + x + (lado >> 1)) * 4 + 3] > 110) bloques.push({ x, y: arriba + y, azar: Math.random() });
    }
  }
  return bloques;
}

const suaveSalida = (t: number) => 1 - (1 - t) ** 3;

/** Entra: cada bloque cae desde arriba a su lugar. Sale: se desprende hacia abajo y se apaga. */
export function pintarBloques(ctx: CanvasRenderingContext2D, bloques: Bloque[], entra: number, sale: number, lado: number, alto: number, color: string) {
  ctx.fillStyle = color;
  for (const b of bloques) {
    const k = Math.min(1, Math.max(0, (entra - b.azar * 0.55) / 0.45));
    if (k <= 0) continue;
    const k2 = Math.min(1, Math.max(0, (sale - b.azar * 0.5) / 0.5));
    if (k2 >= 1) continue;
    const y = b.y - (1 - suaveSalida(k)) * alto * 0.28 + k2 * k2 * alto * 0.32;
    ctx.globalAlpha = 1 - k2;
    ctx.fillRect(b.x, y, lado - 1, lado - 1);
  }
  ctx.globalAlpha = 1;
}

/** Puntos de destino del polvo: las 14 capas en dos columnas (una en celular), en px CSS. */
export function puntosDeCapas(capas: readonly string[], ancho: number, alto: number, fuentes: { titulo: string; mono: string }, paso: number): Punto[] {
  const angosto = ancho < 720;
  const tam = Math.round(angosto ? Math.min(20, Math.max(15, ancho * 0.045)) : Math.min(30, Math.max(18, ancho * 0.02)));
  const fila = tam * (angosto ? 1.75 : 1.95);
  const columnas = angosto ? 1 : 2;
  const porColumna = Math.ceil(capas.length / columnas);
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.textBaseline = "middle";
  // ancho real de cada columna (número + nombre más largo) para centrar el bloque de verdad
  ctx.font = `400 ${tam}px ${fuentes.titulo}`;
  const sangria = tam * 1.6, separacion = tam * 3;
  const anchos = Array.from({ length: columnas }, (_, col) =>
    sangria + Math.max(...capas.slice(col * porColumna, (col + 1) * porColumna).map((c) => ctx.measureText(c).width)));
  const total = anchos.reduce((a, b) => a + b, 0) + separacion * (columnas - 1);
  const x0 = (ancho - total) / 2;
  const y0 = alto / 2 - (fila * porColumna) / 2;
  capas.forEach((c, i) => {
    const col = Math.floor(i / porColumna), f = i % porColumna;
    const x = x0 + anchos.slice(0, col).reduce((a, b) => a + b + separacion, 0), y = y0 + fila * (f + 0.5);
    ctx.font = `400 ${Math.round(tam * 0.55)}px ${fuentes.mono}`;
    ctx.fillStyle = "#f00";
    ctx.fillText(String(i + 1).padStart(2, "0"), x, y);
    ctx.font = `400 ${tam}px ${fuentes.titulo}`;
    ctx.fillStyle = "#0f0";
    ctx.fillText(c, x + sangria, y);
  });
  const datos = ctx.getImageData(0, 0, ancho, alto).data;
  const puntos: Punto[] = [];
  for (let y = 0; y < alto; y += paso) {
    for (let x = 0; x < ancho; x += paso) {
      const i = (y * ancho + x) * 4;
      if (datos[i + 3] > 120) puntos.push({ x: x + Math.random() * 0.6, y: y + Math.random() * 0.6, oro: datos[i] > datos[i + 1] });
    }
  }
  return puntos;
}
