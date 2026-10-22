/*
  El calco (21-oct, Alejo: "misma esencia que fiddle, ajustada a nosotros"). En fiddle el cursor deja píxeles dañados que
  se borran; aquí, por donde pasa el cursor la foto de la obra se vuelve por cuadros su dibujo en tinta (el mismo papel
  de "Por dentro") y cada cuadro vuelve a la foto después de ~1,2 s. Solo en las imágenes de la galería (regla del
  12-oct), nunca en táctil ni con movimiento reducido. Sin React en el bucle: el puntero escribe celdas y un rAF las pinta
  mientras haya alguna viva.
*/
const CELDA = 28;            // px CSS de un cuadro del calco
const VIDA = [1050, 1450];   // ms que dura cada cuadro (cada uno distinto, así no se apagan en bloque)
const SOSTIENE = 0.55;       // fracción de la vida en que el cuadro está entero antes de empezar a irse
const RADIO = 2.6;           // en cuadros: el área que descubre el cursor (21-oct, Alejo: "que se aprecie más")

type Celda = { x: number; y: number; lado: number; nace: number; vida: number };

/** `foco`: el mismo object-position de la foto (0–1), para que el calco calce si la foto no está centrada. */
export function montarCalco(marco: HTMLElement, lienzo: HTMLCanvasElement, rutaCalco: string, foco = { x: 0.5, y: 0.5 }): () => void {
  const celdas = new Map<string, Celda>();
  let calco: HTMLImageElement | null = null;
  let cuadro = 0;
  let ultimo: { x: number; y: number } | null = null;

  const pedirCalco = () => {
    if (calco) return;
    calco = new Image();
    calco.decoding = "async";
    calco.src = rutaCalco;
  };

  const marcar = (x: number, y: number, ahora: number) => {
    const cx = Math.floor(x / CELDA), cy = Math.floor(y / CELDA);
    const poner = (gx: number, gy: number, lado: number) => {
      const clave = `${gx},${gy},${lado}`;
      const previa = celdas.get(clave);
      const vida = VIDA[0] + Math.random() * (VIDA[1] - VIDA[0]);
      celdas.set(clave, { x: gx * CELDA, y: gy * CELDA, lado: lado * CELDA, nace: ahora, vida: previa ? Math.max(vida, previa.vida) : vida });
    };
    // un círculo de cuadros alrededor del cursor: el centro siempre, el borde se deshace al azar (no queda un disco liso)
    const r = Math.ceil(RADIO);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const d = Math.hypot(dx, dy) / RADIO;
        if (d <= 1 && Math.random() < 1.15 - d * d) poner(cx + dx, cy + dy, 1);
      }
    }
    if (Math.random() < 0.08) poner(cx - (cx % 2), cy - (cy % 2), 2);   // de vez en cuando un bloque doble
  };

  const pintar = () => {
    cuadro = 0;
    const ctx = lienzo.getContext("2d");
    const w = marco.clientWidth, h = marco.clientHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (lienzo.width !== Math.round(w * dpr) || lienzo.height !== Math.round(h * dpr)) {
      lienzo.width = Math.round(w * dpr);
      lienzo.height = Math.round(h * dpr);
    }
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const ahora = performance.now();
    const listo = calco?.complete && calco.naturalWidth > 0;
    // el calco se pinta en "cover", igual que la foto, para que cada línea calce sobre lo que dibuja
    const s = listo ? Math.max(w / calco!.naturalWidth, h / calco!.naturalHeight) : 1;
    const ox = listo ? (w - calco!.naturalWidth * s) * foco.x : 0;
    const oy = listo ? (h - calco!.naturalHeight * s) * foco.y : 0;
    for (const [clave, c] of celdas) {
      const t = (ahora - c.nace) / c.vida;
      if (t >= 1) { celdas.delete(clave); continue; }
      if (!listo) continue;
      const alfa = t < SOSTIENE ? 1 : 1 - ((t - SOSTIENE) / (1 - SOSTIENE)) ** 2;
      ctx.globalAlpha = alfa;
      ctx.drawImage(calco!, (c.x - ox) / s, (c.y - oy) / s, c.lado / s, c.lado / s, c.x, c.y, c.lado, c.lado);
      ctx.globalAlpha = alfa * 0.22;
      ctx.strokeStyle = "#e8edf5";
      ctx.lineWidth = 1;
      ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.lado - 1, c.lado - 1);
    }
    ctx.globalAlpha = 1;
    if (celdas.size) cuadro = requestAnimationFrame(pintar);
  };

  const alMover = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    pedirCalco();
    const r = marco.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const ahora = performance.now();
    // si el cursor va rápido se rellenan los cuadros intermedios: el rastro no queda punteado
    if (ultimo) {
      const pasos = Math.min(12, Math.ceil(Math.hypot(x - ultimo.x, y - ultimo.y) / (CELDA * 0.6)));
      for (let i = 1; i < pasos; i++) marcar(ultimo.x + ((x - ultimo.x) * i) / pasos, ultimo.y + ((y - ultimo.y) * i) / pasos, ahora);
    }
    marcar(x, y, ahora);
    ultimo = { x, y };
    if (!cuadro) cuadro = requestAnimationFrame(pintar);
  };
  const alSalir = () => { ultimo = null; };

  marco.addEventListener("pointerenter", pedirCalco);
  marco.addEventListener("pointermove", alMover);
  marco.addEventListener("pointerleave", alSalir);
  return () => {
    cancelAnimationFrame(cuadro);
    marco.removeEventListener("pointerenter", pedirCalco);
    marco.removeEventListener("pointermove", alMover);
    marco.removeEventListener("pointerleave", alSalir);
  };
}
