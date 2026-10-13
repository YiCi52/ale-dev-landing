/*
  Utilidades del prototipo v4: progreso de una sección alta con contenido
  pegado (sticky) y dibujo de secuencias de fotogramas en un canvas.
  Sin estado de React en el bucle: el scroll escribe directo al DOM/canvas.
*/

export function sinMovimiento(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Llama `alCambiar(p)` con p ∈ [0, 1]: 0 cuando la sección toca el borde superior, 1 al terminar de pasar. */
export function observarProgreso(el: HTMLElement, alCambiar: (p: number) => void): () => void {
  let pendiente = 0;
  const medir = () => {
    pendiente = 0;
    const r = el.getBoundingClientRect();
    const recorrido = Math.max(1, r.height - window.innerHeight);
    alCambiar(Math.min(1, Math.max(0, -r.top / recorrido)));
  };
  const pedir = () => {
    if (!pendiente) pendiente = requestAnimationFrame(medir);
  };
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  medir();
  return () => {
    window.removeEventListener("scroll", pedir);
    window.removeEventListener("resize", pedir);
    if (pendiente) cancelAnimationFrame(pendiente);
  };
}

export function rutasSecuencia(base: string, prefijo: string, total: number, ext = "webp"): string[] {
  return Array.from({ length: total }, (_, i) => `${base}/${prefijo}-${String(i + 1).padStart(3, "0")}.${ext}`);
}

/** Precarga todos los cuadros; `alListo` se llama con cada uno que termina (para pintar el primero cuanto antes). */
export function precargar(rutas: string[], alListo: (i: number) => void): HTMLImageElement[] {
  return rutas.map((src, i) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => alListo(i);
    img.src = src;
    return img;
  });
}

/** Dibuja la imagen cubriendo el canvas (como object-fit: cover), con densidad de pantalla limitada a 2. */
export function pintarCubriendo(canvas: HTMLCanvasElement, img: HTMLImageElement | undefined): void {
  if (!img || !img.complete || !img.naturalWidth) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth * dpr;
  const h = canvas.clientHeight * dpr;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const escala = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * escala;
  const dh = img.naturalHeight * escala;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

/** Convierte una posición normalizada de la imagen (0-1) a coordenadas del canvas mostrado con "cover". */
export function aPantalla(canvas: HTMLCanvasElement, img: HTMLImageElement | undefined, x: number, y: number): [number, number] {
  const cw = canvas.clientWidth;
  const ch = canvas.clientHeight;
  const iw = img?.naturalWidth || 16;
  const ih = img?.naturalHeight || 9;
  const escala = Math.max(cw / iw, ch / ih);
  return [(cw - iw * escala) / 2 + x * iw * escala, (ch - ih * escala) / 2 + y * ih * escala];
}
