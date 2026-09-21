/* ---------------------------------------------------------------------------
   E3 · UMBRAL — PRUEBA DE LAB (13-sep-2026). No es contenido ni produccion.

   El espacio siguiente es una sala abstracta renderizada en Blender cuya camara
   sale de la propia pagina: en cada p, la escala y el sitio del iris dibujado
   fijan a que distancia del plano del iris esta la camara (ver
   gatoC/lookdev/2026-09-13-e3-umbral/scripts/umbral_e3.py). Por eso la sala esta
   DETRAS del iris y no encima: se ve solo por la pupila, con su paralaje real.

   Versiones para comparar (?v=1 | 2 | 3 | 4 | 5 | 51):
     v1  sala de 24 R, recorte limpio de la pupila, derrame calido fijo
     v2  sala de 8.9 R (mas paralaje) + BORDE: refraccion en el canto, sangrado
         de luz hacia dentro y hacia fuera, y el color lo pone la propia sala
     v4  ATRAVESAR EL ESPESOR: desde p 0.94 el iris ya no es una imagen que escala.
         Blender lo rinde como PLANO REAL (con el cuadro aprobado de E2-B4) en la misma
         escena que la sala, con el espesor de la pupila detras, y la camara CRUZA el
         plano. La pagina solo compone dos pasadas: sala (es4s) + iris y espesor (es4i).
     v5  EL CRUCE VISIBLE: mismo mecanismo que v4, con la cara del iris 1,8 R por delante
         de la sala (el espesor pasa a ~2 R) y la camara en tramos parejos: delante ·
         aproximacion · en la cara · dentro del espesor · detras · dentro de la sala.
     v51 (v5.1) misma arquitectura que v5; solo el aspecto de las paredes del espesor
         (fibras mas cortas, menos brillo hacia la salida, destellos al tono de la fibra,
         salida algo mas estrecha para que el borde del iris dure un poco mas).
     v3  misma sala que v2. BORDE FISICO: lo que se ve de la sala lo decide el alfa
         REAL del iris (no una elipse), refraccion mas sutil, espesor con sombra
         apenas violeta, y la luz de la sala pasa ENTRE LAS FIBRAS del iris (modulada
         por su propia luminancia, sin cambiar su textura)
--------------------------------------------------------------------------- */

export const E3_RECURSOS = "/lab/hero-e3/recursos";

/** mismas constantes que el horneado del cristal (relevo_e2B4.py) */
const K = 2.05 / 6.6;
const PUPILA_EN_CUADRO: readonly [number, number] = [0.5354, 0.5];

/** la luz de la sala sobre el borde de la pupila (B) */
const LUZ_BORDE = { maximo: 0.5, alcance: 0.38, p0: 0.895, p1: 0.955 };
/** v2 · el canto del umbral: refraccion y sangrado (ninguno deforma el iris) */
const CANTO = { refraccion: 1.1, anillo0: 0.8, anillo1: 0.99, peso: 0.7, dentro: 0.3, maximoBorde: 0.72 };
/** v3 · borde fisico */
const CANTO3 = {
  refraccion: 1.05, anillo0: 0.86, anillo1: 1.0, peso: 0.45, dentro: 0.22,
  mascara: 1.35,                       // la elipse solo acota; el borde lo pone el alfa del iris
  espesor: { desde: 0.88, rgba: "34,26,64", alfa: 0.38 },   // sombra del canto, apenas violeta
  fibras: { hasta: 1.14, fuerza: 0.28, contraste: 1.8 },  // la luz de la sala entre las fibras
  maximoBorde: 0.5,
};

const suave = (x: number): number => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

export type Rect = { x: number; y: number; lado: number };
export type Pupila = { cx: number; cy: number; ax: number; ay: number; apertura: number };
export type Espacio = {
  version: number; ps: number[];
  imgs: (HTMLImageElement | null)[];
  colores: (string | null)[];
  /** VENTANA: los nombres se guardan y las imagenes se piden despues, por tramo */
  archivos: string[];
};
const INDICE: Record<number, string> = { 1: "indice.json", 2: "indice2.json", 3: "indice3.json" };

/** v4 · desde aqui manda la escena 3D del umbral (en 0.94 coincide con el iris 2D) */
export const P_UMBRAL = 0.94;
export type Umbral = {
  ps: number[];
  sala: (HTMLImageElement | null)[]; iris: (HTMLImageElement | null)[];
  /** VENTANA: idem, los nombres de las dos pasadas */
  archSala: string[]; archIris: string[];
};

/** v4 · lee el INDICE de las dos pasadas del umbral (sala + iris con su espesor).
    Ya no baja las imagenes: 86 cuadros de 1440x900 son 1.063 MB decodificados y
    solo se dibuja uno. Los pide la ventana (ver ventana.ts) por tramo de p. */
export async function cargarUmbral(destino: Umbral, archivo = "indice4.json"): Promise<void> {
  let indice: { cuadros: { p: number; sala: string; iris: string }[] };
  try {
    const res = await fetch(`${E3_RECURSOS}/${archivo}`, { cache: "no-store" });
    if (!res.ok) return;
    indice = await res.json();
  } catch {
    return;
  }
  destino.ps = indice.cuadros.map((c) => c.p);
  destino.sala = indice.cuadros.map(() => null);
  destino.iris = indice.cuadros.map(() => null);
  destino.archSala = indice.cuadros.map((c) => `${E3_RECURSOS}/${c.sala}`);
  destino.archIris = indice.cuadros.map((c) => `${E3_RECURSOS}/${c.iris}`);
}

/** v4 · el cuadro del umbral mas cercano a p con sus dos pasadas ya cargadas */
export function cuadroUmbral(u: Umbral, p: number): { sala: HTMLImageElement; iris: HTMLImageElement } | null {
  let mejor = -1;
  let dist = Infinity;
  u.ps.forEach((pi, i) => {
    const d = Math.abs(pi - p);
    if (u.sala[i] && u.iris[i] && d < dist) { dist = d; mejor = i; }
  });
  const sala = mejor >= 0 ? u.sala[mejor] : null;
  const iris = mejor >= 0 ? u.iris[mejor] : null;
  return sala && iris ? { sala, iris } : null;
}

/** la pupila del cuadro horneado `idx` (0..59), en px de pantalla */
export function pupilaEnPantalla(idx: number, r: Rect): Pupila {
  const q = idx / 59;
  const th = Math.min(1, Math.max(0, (q - 0.55) / 0.45));
  const a = 0.088 + (0.42 - 0.088) * suave((q - 0.62) / 0.38);
  const apertura = th > 0 ? suave((th - 0.15) / 0.6) : 0;
  return {
    cx: r.x + PUPILA_EN_CUADRO[0] * r.lado,
    cy: r.y + PUPILA_EN_CUADRO[1] * r.lado,
    ax: a * apertura * K * r.lado,
    ay: 0.4 * apertura * K * r.lado,
    apertura,
  };
}

/** el indice del cuadro horneado a partir de su nombre (cx_0047.webp -> 46) */
export function indiceDeCuadro(im: HTMLImageElement): number {
  const m = /cx_(\d{4})\.webp/.exec(im.src);
  return m ? Number(m[1]) - 1 : 0;
}

/** el color medio de un cuadro de la sala: es la luz que esa sala derrama */
export function colorMedio(im: HTMLImageElement): string {
  const c = document.createElement("canvas");
  c.width = 8; c.height = 5;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return "255,236,210";
  g.drawImage(im, 0, 0, 8, 5);
  const d = g.getImageData(0, 0, 8, 5).data;
  let r = 0, v = 0, a = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; v += d[i + 1]; a += d[i + 2]; }
  const n = d.length / 4;
  const k = 255 / Math.max(1, Math.max(r, v, a) / n);   // normalizado: solo el matiz
  return `${Math.round((r / n) * k)},${Math.round((v / n) * k)},${Math.round((a / n) * k)}`;
}

/** lee el INDICE de la secuencia del espacio. Las imagenes las pide la ventana:
    son 36 cuadros de 1440x900 (178 MB) para un tramo de p de 0.07 de largo. */
export async function cargarEspacio(destino: Espacio): Promise<void> {
  const archivo = INDICE[destino.version] ?? "indice.json";
  let indice: { cuadros: { p: number; archivo: string }[] };
  try {
    const res = await fetch(`${E3_RECURSOS}/${archivo}`, { cache: "no-store" });
    if (!res.ok) return;                       // la sala aun no esta renderizada
    indice = await res.json();
  } catch {
    return;                                    // sin sala, la prueba corre como el control
  }
  destino.ps = indice.cuadros.map((c) => c.p);
  destino.imgs = indice.cuadros.map(() => null);
  destino.colores = indice.cuadros.map(() => "255,236,210");
  destino.archivos = indice.cuadros.map((c) => `${E3_RECURSOS}/${c.archivo}`);
}

/** el cuadro del espacio mas cercano a p que ya bajo; null antes de que se abra la pupila */
export function cuadroEspacio(e: Espacio, p: number): { im: HTMLImageElement; color: string } | null {
  if (!e.ps.length || p < e.ps[0] - 0.002) return null;
  let mejor = -1;
  let dist = Infinity;
  e.ps.forEach((pi, i) => {
    const d = Math.abs(pi - p);
    if (e.imgs[i] && d < dist) { dist = d; mejor = i; }
  });
  const im = mejor >= 0 ? e.imgs[mejor] : null;
  return im ? { im, color: e.colores[mejor] ?? "255,236,210" } : null;
}

/** elipse de la pupila, en el sistema del lienzo */
function caminoPupila(g: CanvasRenderingContext2D, pup: Pupila, escala: number): void {
  g.beginPath();
  g.ellipse(pup.cx, pup.cy, pup.ax * escala + 2, pup.ay * escala + 2, 0, 0, Math.PI * 2);
}

/** v2 · el canto: un anillo con la sala comprimida (refraccion) + sangrado hacia dentro */
function pintarCanto(
  g: CanvasRenderingContext2D, aux: HTMLCanvasElement, im: HTMLImageElement,
  W: number, H: number, pup: Pupila, color: string, dpr: number, version: number,
): void {
  const c = version === 3 ? CANTO3 : CANTO;
  const o = aux.getContext("2d");
  if (!o || pup.ax < 6) return;
  o.setTransform(1, 0, 0, 1, 0, 0);
  o.clearRect(0, 0, aux.width, aux.height);
  o.setTransform(dpr, 0, 0, dpr, 0, 0);
  // la sala, ampliada alrededor del centro de la pupila: el canto ve lo mismo, torcido
  o.save();
  o.translate(pup.cx, pup.cy);
  o.scale(c.refraccion, c.refraccion);
  o.translate(-pup.cx, -pup.cy);
  o.drawImage(im, 0, 0, W, H);
  o.restore();
  // ... y solo se queda en el anillo del borde
  o.save();
  o.globalCompositeOperation = "destination-in";
  o.translate(pup.cx, pup.cy);
  o.scale(Math.max(pup.ax, 1), Math.max(pup.ay, 1));
  const anillo = o.createRadialGradient(0, 0, c.anillo0, 0, 0, c.anillo1);
  anillo.addColorStop(0, "rgba(0,0,0,0)");
  anillo.addColorStop(0.75, `rgba(0,0,0,${c.peso * 0.6})`);
  anillo.addColorStop(1, `rgba(0,0,0,${c.peso})`);
  o.fillStyle = anillo;
  o.beginPath();
  o.arc(0, 0, c.anillo1, 0, Math.PI * 2);
  o.fill();
  o.restore();
  g.save();
  caminoPupila(g, pup, version === 3 ? CANTO3.mascara : 1.03);
  g.clip();
  g.drawImage(aux, 0, 0, aux.width / dpr, aux.height / dpr);
  if (version === 3) {
    // espesor: el canto interior del vano se oscurece hacia el filo, con el violeta del iris
    g.save();
    g.globalCompositeOperation = "source-atop";
    g.translate(pup.cx, pup.cy);
    g.scale(Math.max(pup.ax, 1), Math.max(pup.ay, 1));
    const e = CANTO3.espesor;
    const sombra = g.createRadialGradient(0, 0, e.desde, 0, 0, 1.0);
    sombra.addColorStop(0, `rgba(${e.rgba},0)`);
    sombra.addColorStop(1, `rgba(${e.rgba},${e.alfa})`);
    g.fillStyle = sombra;
    g.beginPath();
    g.arc(0, 0, 1.0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  // sangrado de la luz de la sala hacia DENTRO del borde (la luz se derrama, no corta)
  g.globalCompositeOperation = "lighter";
  g.translate(pup.cx, pup.cy);
  g.scale(Math.max(pup.ax, 1), Math.max(pup.ay, 1));
  const dentro = g.createRadialGradient(0, 0, 0.72, 0, 0, 1.02);
  dentro.addColorStop(0, `rgba(${color},0)`);
  dentro.addColorStop(1, `rgba(${color},${c.dentro})`);
  g.fillStyle = dentro;
  g.beginPath();
  g.arc(0, 0, 1.02, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** la sala, recortada a la pupila: detras del iris solo se ve por el agujero */
export function pintarEspacio(
  g: CanvasRenderingContext2D, W: number, H: number,
  cuadro: { im: HTMLImageElement; color: string } | null, pup: Pupila | null,
  version: number, aux: HTMLCanvasElement, dpr: number,
): void {
  g.clearRect(0, 0, W, H);
  if (!cuadro || !pup || pup.apertura <= 0) return;
  g.save();
  // v3: la elipse solo acota (x1.35): el borde visible lo decide el alfa real del iris,
  // que se pinta encima. v1/v2: recorte eliptico casi exacto.
  caminoPupila(g, pup, version === 3 ? CANTO3.mascara : 1.03);
  g.clip();
  g.drawImage(cuadro.im, 0, 0, W, H);
  g.restore();
  if (version >= 2) pintarCanto(g, aux, cuadro.im, W, H, pup, cuadro.color, dpr, version);
}

/** v3 · la luz de la sala pasa ENTRE LAS FIBRAS: mas luz donde el iris es mas oscuro,
    solo en una banda junto al borde y solo sobre pixeles de iris. No cambia la textura:
    es luz sumada, modulada por la luminancia del propio iris. */
export function pintarLuzFibras(
  g: CanvasRenderingContext2D, aux: HTMLCanvasElement, iris: HTMLImageElement,
  r: Rect, pup: Pupila, p: number, dpr: number, color: string,
): void {
  const f = CANTO3.fibras;
  const fuerza = f.fuerza * suave((p - LUZ_BORDE.p0) / (LUZ_BORDE.p1 - LUZ_BORDE.p0));
  const o = aux.getContext("2d");
  if (!o || fuerza < 0.003 || pup.ax < 6) return;
  o.setTransform(1, 0, 0, 1, 0, 0);
  o.clearRect(0, 0, aux.width, aux.height);
  o.setTransform(dpr, 0, 0, dpr, 0, 0);
  // 1 · el iris invertido en luminancia: claro donde el iris es oscuro (entre fibras)
  o.filter = `grayscale(1) invert(1) contrast(${f.contraste})`;
  o.drawImage(iris, r.x, r.y, r.lado, r.lado);
  o.filter = "none";
  // 2 · con el color de la sala, solo sobre pixeles de iris
  o.globalCompositeOperation = "source-atop";
  o.fillStyle = `rgba(${color},0.55)`;
  o.fillRect(0, 0, aux.width / dpr, aux.height / dpr);
  // 3 · solo en la banda junto al filo, que se apaga hacia afuera
  o.globalCompositeOperation = "destination-in";
  o.save();
  o.translate(pup.cx, pup.cy);
  o.scale(Math.max(pup.ax, 1), Math.max(pup.ay, 1));
  const banda = o.createRadialGradient(0, 0, 0.98, 0, 0, f.hasta);
  banda.addColorStop(0, `rgba(0,0,0,${fuerza.toFixed(3)})`);
  banda.addColorStop(1, "rgba(0,0,0,0)");
  o.fillStyle = banda;
  o.beginPath();
  o.arc(0, 0, f.hasta, 0, Math.PI * 2);
  o.fill();
  o.restore();
  o.globalCompositeOperation = "source-over";
  g.save();
  g.globalCompositeOperation = "lighter";
  g.drawImage(aux, 0, 0, aux.width / dpr, aux.height / dpr);
  g.restore();
}

/** B · la luz de la sala cae sobre el iris alrededor de la pupila (solo donde hay iris) */
export function pintarLuzBorde(
  g: CanvasRenderingContext2D, luz: HTMLCanvasElement, iris: HTMLImageElement,
  r: Rect, pup: Pupila, p: number, dpr: number, color: string, version: number,
): void {
  const techo = version === 3 ? CANTO3.maximoBorde : version === 2 ? CANTO.maximoBorde : LUZ_BORDE.maximo;
  const fuerza = techo * suave((p - LUZ_BORDE.p0) / (LUZ_BORDE.p1 - LUZ_BORDE.p0));
  const o = luz.getContext("2d");
  if (!o || fuerza < 0.003 || pup.apertura <= 0) return;
  o.setTransform(1, 0, 0, 1, 0, 0);
  o.clearRect(0, 0, luz.width, luz.height);
  o.setTransform(dpr, 0, 0, dpr, 0, 0);
  o.save();
  o.translate(pup.cx, pup.cy);
  o.scale(Math.max(pup.ax, 1), Math.max(pup.ay, 1));
  const r1 = 1 + LUZ_BORDE.alcance;
  const gr = o.createRadialGradient(0, 0, 0.96, 0, 0, r1);
  gr.addColorStop(0, `rgba(${color},${fuerza.toFixed(3)})`);
  gr.addColorStop(0.3, `rgba(${color},${(fuerza * 0.4).toFixed(3)})`);
  gr.addColorStop(1, `rgba(${color},0)`);
  o.fillStyle = gr;
  o.beginPath();
  o.arc(0, 0, r1, 0, Math.PI * 2);
  o.fill();
  o.restore();
  o.globalCompositeOperation = "destination-in";
  o.drawImage(iris, r.x, r.y, r.lado, r.lado);
  o.globalCompositeOperation = "source-over";
  g.save();
  g.globalCompositeOperation = "lighter";
  g.drawImage(luz, 0, 0, luz.width / dpr, luz.height / dpr);
  g.restore();
}
