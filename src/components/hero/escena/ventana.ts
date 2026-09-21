/* ---------------------------------------------------------------------------
   CARGADOR CON VENTANA — 17-sep-2026.

   El problema, medido: la escena sostenia 1.863,5 MB de bitmaps decodificados
   para 2.875 kB transferidos, una amplificacion de 665x. La causa no es el peso
   de los archivos sino que se mantenian TODOS decodificados a la vez: 302
   imagenes, cada una a su tamano nativo (el umbral, 86 cuadros de 1440x900, son
   1.063 MB por si solos). Y en cualquier p se dibuja UN cuadro de cada
   secuencia; el resto solo ocupa RAM.

   Esto mantiene decodificada una ventana de +-radio cuadros alrededor del que se
   esta mirando y suelta el resto. No cambia ni un pixel: el cuadro que se dibuja
   es el mismo.

   COMO SE DESACTIVA: radio = Infinity. No hay dos caminos de codigo — con
   Infinity la ventana pide todos los cuadros y no libera ninguno, que es
   exactamente el comportamiento anterior.

   HOLGURA. Se libera mas alla de radio + holgura, no en el borde de la ventana:
   sin esa histeresis, un scroll que oscila sobre un limite pide y suelta el mismo
   cuadro en cada fotograma.

   SCROLL RAPIDO. Ni la ventana mas grande alcanza a un tiron: a 45 px de scroll
   por cuadro, un flick de 2.000 px salta 44 cuadros. No se intenta ganar esa
   carrera. Se hacen dos cosas: pedir del centro hacia fuera, para que el cuadro
   que hace falta llegue primero, y soltar lo que quedo fuera de la ventana
   AUNQUE este en vuelo, que cancela su peticion y libera el ancho de banda para
   los que si se van a ver. Mientras llega, `cuadro()` devuelve el mas cercano
   que ya bajo — igual que antes — asi que nunca hay hueco, solo un cuadro algo
   viejo durante unos milisegundos.
--------------------------------------------------------------------------- */

export type Ventana = {
  nombre: string;
  /** cuantos cuadros tiene la secuencia */
  n: number;
  /** cuadros a cada lado que se mantienen decodificados. Infinity = sin ventana */
  radio: number;
  /** histeresis: se libera mas alla de radio + holgura */
  holgura: number;
  /** la url del cuadro i */
  url: (i: number) => string;
  /** donde viven las imagenes. Es el MISMO array que ya usaba la escena */
  imgs: (HTMLImageElement | null)[];
  /** algo derivado que se recalcula al cargar (el color medio de la sala) */
  extra: (string | null)[];
  calcExtra?: (im: HTMLImageElement) => string;
  /** se llama cuando entra un cuadro: la escena lo usa para forzar un repintado */
  alCargar?: () => void;
  centro: number;
  /** los cuadros que ya se pidieron y todavia no llegaron */
  enVuelo: Set<number>;
  /** el tamano nativo del cuadro, recordado desde el primero que cargo. Se
      guarda porque al liberar la secuencia ya no hay imagen a la que
      preguntarselo, y sin el no se puede convertir cuadros a MB. */
  px: [number, number] | null;
};

export function crearVentana(o: {
  nombre: string;
  n: number;
  radio: number;
  holgura?: number;
  url: (i: number) => string;
  imgs: (HTMLImageElement | null)[];
  extra?: (string | null)[];
  calcExtra?: (im: HTMLImageElement) => string;
  alCargar?: () => void;
}): Ventana {
  return {
    nombre: o.nombre,
    n: o.n,
    radio: o.radio,
    holgura: o.holgura ?? Math.max(2, Math.round(o.radio * 0.4)),
    url: o.url,
    imgs: o.imgs,
    extra: o.extra ?? new Array(o.n).fill(null),
    calcExtra: o.calcExtra,
    alCargar: o.alCargar,
    centro: -1,
    enVuelo: new Set(),
    px: null,
  };
}

function pedir(v: Ventana, i: number): void {
  if (v.imgs[i] || v.enVuelo.has(i)) return;
  const im = new Image();
  v.enVuelo.add(i);
  im.onload = () => {
    // Puede haber sido liberado mientras venia en vuelo (un scroll rapido lo
    // dejo fuera de la ventana). En ese caso se descarta: guardarlo volveria a
    // meter en memoria justo lo que se acaba de soltar.
    if (!v.enVuelo.has(i)) return;
    v.enVuelo.delete(i);
    v.imgs[i] = im;
    if (!v.px) v.px = [im.naturalWidth, im.naturalHeight];
    if (v.calcExtra) v.extra[i] = v.calcExtra(im);
    v.alCargar?.();
  };
  im.onerror = () => { v.enVuelo.delete(i); };
  im.src = v.url(i);
}

function liberar(v: Ventana, i: number): void {
  if (v.enVuelo.has(i)) {
    v.enVuelo.delete(i);      // deja de aceptarlo cuando llegue
  }
  const im = v.imgs[i];
  if (!im) return;
  /* Se suelta el atributo src, no `im.src = ""`: la cadena vacia resuelve contra
     la URL del documento y cada liberacion disparaba una peticion de la propia
     pagina (medido: 856 liberaciones atascaban la red). `removeAttribute` para la
     carga sin pedir nada. Y se anulan los manejadores para que un cuadro que
     venia en vuelo no vuelva a entrar por la puerta de atras. */
  im.onload = null;
  im.onerror = null;
  im.removeAttribute("srcset");
  im.removeAttribute("src");
  v.imgs[i] = null;
  v.extra[i] = null;
}

/** centra la ventana en el cuadro `i`: pide lo que falta y suelta lo que sobra */
export function centrar(v: Ventana, i: number): void {
  const c = Math.min(v.n - 1, Math.max(0, Math.round(i)));
  if (c === v.centro) return;      // sin movimiento, sin trabajo
  v.centro = c;

  // liberar primero: deja sitio antes de pedir, y cancela lo que ya no sirve
  const fuera = v.radio + v.holgura;
  if (Number.isFinite(fuera)) {
    for (let k = 0; k < v.n; k++) {
      if (Math.abs(k - c) > fuera) liberar(v, k);
    }
  }
  // ...y pedir del centro hacia fuera, para que lo urgente llegue primero
  const r = Number.isFinite(v.radio) ? v.radio : v.n;
  for (let d = 0; d <= r; d++) {
    const a = c - d, b = c + d;
    if (a >= 0) pedir(v, a);
    if (d > 0 && b < v.n) pedir(v, b);
  }
}

/** suelta la secuencia entera: para los tramos de p en que no se dibuja.
    Sin esto, `centrar` saturaba en el cuadro 0 y mantenia decodificada —y pedia—
    una secuencia que en ese p no se ve. Medido: eso costaba 18 s de latencia al
    saltar de 0.98 a 0.10, porque el salto disparaba 17 cuadros de iris de 20,7 MB
    que nadie iba a mirar. */
export function soltar(v: Ventana): void {
  if (v.centro === -1) return;
  v.centro = -1;
  if (!Number.isFinite(v.radio)) return;   // sin ventana, no se suelta nada
  for (let i = 0; i < v.n; i++) liberar(v, i);
}

/** centra si la secuencia se dibuja en este p; si no, la suelta entera */
export function activar(v: Ventana | null, dentro: boolean, i: number): void {
  if (!v) return;
  if (dentro) centrar(v, i);
  else soltar(v);
}

/** el cuadro `i` si ya bajo; si no, el mas cercano que si. Nunca deja hueco. */
export function cuadro(v: Ventana, i: number): HTMLImageElement | null {
  const c = Math.min(v.n - 1, Math.max(0, Math.round(i)));
  if (v.imgs[c]) return v.imgs[c];
  for (let d = 1; d < v.n; d++) {
    if (v.imgs[c - d]) return v.imgs[c - d];
    if (v.imgs[c + d]) return v.imgs[c + d];
  }
  return null;
}

