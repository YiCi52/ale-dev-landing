"use client";

import { useEffect, useRef, useState } from "react";

import { HeroCrystalMount } from "@/components/hero/HeroCrystalMount";
import {
  altoVisible,
  distanciaParaFraccion,
  type Encuadre,
} from "@/components/hero/encuadre";

/*
  Lab · HERO como una sola escena — prototipo.

  Rige SPEC-hero-estados.md. Un solo numero, p, gobierna todo. Nadie escucha a
  nadie: el cristal no sabe que existe el gato, deriva del mismo progreso.

  --- POR QUE SE ANCLA POR LA PISADA Y NO POR LA NARIZ ---

  La version anterior anclaba el fotograma por la NARIZ: dado donde queria la
  nariz en pantalla, colocaba el cuadro. Parecia lo correcto, porque la nariz es
  el punto de contacto. Es justo al reves, y por dos motivos medidos:

  1. Si la nariz esta clavada en un punto de pantalla, la nariz no se mueve, y
     el gesto que hay que contar ES el de la nariz acercandose al cristal. Con
     el ancla en la nariz, lo que se ve moverse es el CUERPO hacia atras.
  2. La altura de la nariz varia entre poses de 0.626 (estirarse) a 1.165
     (sentado): media altura de gato. Anclando ahi, el cuerpo pega saltos
     verticales de hasta 0.42 unidades — y el peor cae justo en el contacto.

  Ahora el ancla es la PISADA, que es lo que la fisica mantiene quieto: un gato
  no atraviesa el suelo. La nariz pasa a ser un punto que se MIDE, no que se
  impone, y el cristal va a buscarla donde de verdad queda.

  Efecto secundario y buscado: teniendo la linea de suelo por fotograma se puede
  dibujar la sombra de contacto donde el gato realmente apoya. Eso, mas que
  ninguna otra cosa, es lo que hace que la escena deje de parecer dos laminas
  flotando.

  --- EL AVANCE ES REAL ---

  El gato no traslada en el mundo de Blender (moverlo ahi solo lo empujaba
  contra el borde del cuadro). Traslada en PANTALLA, y CAMINO_PIE avanza de
  forma monotona durante la caminata: sin eso, alternar dos poses de paso es una
  cinta de correr — las patas tijeretean bajo un cuerpo quieto.
*/

const N = 120;
const RUTA = (i: number) =>
  `/lab/gatoc/seq/gc_${String(i + 1).padStart(4, "0")}.webp`;

/* ---------------------------------------------------------------------------
   MEDIDO — no estimado. Sale del alfa de los propios fotogramas con
   scripts/medir_anclajes.py. Si se re-hornea la secuencia, se regenera.
--------------------------------------------------------------------------- */

/** [p, x, y] del punto mas adelantado del hocico, sobre el cuadro de 800px */
const NARIZ: number[][] = [
  [0.0, 0.2309, 0.2906], [0.042, 0.2455, 0.2906], [0.084, 0.2659, 0.3271],
  [0.1261, 0.4287, 0.3569], [0.1681, 0.6751, 0.3785], [0.2101, 0.8061, 0.3626],
  [0.2521, 0.826, 0.3604], [0.2941, 0.8403, 0.3798], [0.3361, 0.8399, 0.3701],
  [0.3782, 0.8336, 0.3567], [0.4202, 0.8098, 0.3727], [0.4622, 0.7621, 0.3686],
  [0.5042, 0.7684, 0.3686], [0.5462, 0.7595, 0.3804], [0.5882, 0.7416, 0.3574],
  [0.6303, 0.7444, 0.4689], [0.6723, 0.7136, 0.4976], [0.7143, 0.6903, 0.3354],
  [0.7563, 0.6838, 0.3354], [0.7983, 0.6684, 0.3683], [0.8403, 0.6406, 0.3911],
  [0.8824, 0.5973, 0.3887], [0.9244, 0.4905, 0.2924], [0.9664, 0.4302, 0.306],
  [1.0, 0.4148, 0.306],
];

/** [p, ySuelo, xIzq, xDer] de la linea de pisada, sobre el cuadro de 800px */
const PISADA: number[][] = [
  [0.0, 0.7385, 0.3256, 0.438], [0.042, 0.7385, 0.3258, 0.4308], [0.084, 0.7385, 0.3022, 0.4221],
  [0.1261, 0.7385, 0.3316, 0.4508], [0.1681, 0.7385, 0.3043, 0.6527], [0.2101, 0.7385, 0.2573, 0.7827],
  [0.2521, 0.7385, 0.2467, 0.8048], [0.2941, 0.7385, 0.2563, 0.8023], [0.3361, 0.7385, 0.2449, 0.8056],
  [0.3782, 0.7385, 0.2337, 0.8177], [0.4202, 0.7385, 0.2447, 0.7933], [0.4622, 0.7385, 0.2475, 0.7637],
  [0.5042, 0.7385, 0.2466, 0.7686], [0.5462, 0.7385, 0.2544, 0.7402], [0.5882, 0.7385, 0.2426, 0.7463],
  [0.6303, 0.7385, 0.2854, 0.6733], [0.6723, 0.7385, 0.5705, 0.641], [0.7143, 0.7385, 0.2555, 0.7186],
  [0.7563, 0.7385, 0.2564, 0.7133], [0.7983, 0.7385, 0.2598, 0.6861], [0.8403, 0.7385, 0.2565, 0.6432],
  [0.8824, 0.7385, 0.2641, 0.6056], [0.9244, 0.7385, 0.2635, 0.3868], [0.9664, 0.7385, 0.2764, 0.3866],
  [1.0, 0.7385, 0.2834, 0.3864],
];

/* ---------------------------------------------------------------------------
   PUESTA EN ESCENA — todo en fraccion del viewport.
--------------------------------------------------------------------------- */

/** donde apoya el gato. Avanza de verdad: 0.26 -> 0.63 de ancho, y BAJA al
    acercarse (mas cerca = mas abajo en pantalla) y sube al alejarse. */
const CAMINO_PIE: number[][] = [
  [0.0, 0.26, 0.74], [0.1, 0.27, 0.745], [0.2, 0.32, 0.76],
  [0.42, 0.5, 0.79], [0.52, 0.545, 0.8], [0.64, 0.6, 0.81],
  [0.7, 0.625, 0.815], [0.77, 0.625, 0.815], [0.89, 0.6, 0.78],
  [1.0, 0.565, 0.7],
];

/** alto aparente del gato, en fraccion del alto del viewport */
const ESCALA_GATO: number[][] = [
  [0.0, 0.4], [0.2, 0.56], [0.52, 0.7], [0.7, 0.76], [0.89, 0.6], [1.0, 0.3],
];

/** diametro del cristal, en fraccion del alto del viewport */
const DIAM_CRISTAL: number[][] = [
  [0.0, 0.1], [0.2, 0.14], [0.42, 0.26], [0.52, 0.36], [0.64, 0.46],
  [0.7, 0.5], [0.77, 0.58], [0.89, 0.74], [0.95, 1.15], [1.0, 2.3],
];
/* La cola llega a 2.3 por una razon medida, no estetica. La pupila mide 0.836·f
   del alto del viewport (0.8 del radio del disco, y el disco 2.09·f). Para
   ATRAVESARLA hay que pasar de f≈1.2 (donde la pupila iguala la pantalla). Con
   2.3 la pupila mide 1.92 pantallas: se sale del cuadro y ya estamos dentro.
   Con la cola anterior (0.95) la pupila se quedaba en 0.79 de pantalla y el
   iris seguia enmarcandola: se veia el umbral, no se cruzaba. */
/* La cola se calibro CONTRA EL RENDER, no a ojo. Con 2.2 el iris crecia tanto
   que en p=1 solo se veia el interior de la pupila: cuadro vacio. Con 1.15
   seguia pasandose. Con 0.95 la pupila queda en ~0.8 del alto del viewport: se
   lee como un portal vertical con el iris alrededor, que es el umbral, no un
   fundido a negro. La p=0.93 es la que manda visualmente y ahi el iris ya llena
   el cuadro. */

/** centro del cristal mientras aun NO ha encontrado al gato (fraccion viewport) */
const CRISTAL_LEJOS: number[][] = [
  [0.0, 0.8, 0.66], [0.2, 0.79, 0.68], [0.47, 0.76, 0.72],
];

/* ---------------------------------------------------------------------------
   LA TRANSFORMACION DEL CRISTAL, horneada.

   A partir del contacto el cristal deja de ser el objeto vivo de R3F y pasa a
   ser una secuencia horneada en Blender: fractura desde el punto de contacto,
   fragmentos, superficie del iris, iris completo. Se hornea porque exige
   consistencia entre fotogramas — a mano las facetas no se sueltan igual dos
   veces — y porque el iris es GatoC_iris_v1, el material aprobado.

   EL RELEVO. Los dos cristales coexisten durante un tramo corto con un fundido
   cruzado, y el BLOOM tapa la diferencia: el vivo esta girando en su propio
   reloj y el horneado tiene una orientacion fija, asi que sin un fotograma de
   luz encima el cambio se notaria. Es el mismo truco que un flash sobre un
   corte de montaje.
--------------------------------------------------------------------------- */
const N_CX = 60;
const RUTA_CX = (i: number) =>
  `/lab/gatoc/cristal/cx_${String(i + 1).padStart(4, "0")}.webp`;
/** donde cae el punto de contacto dentro del cuadro horneado, y que fraccion del
    cuadro ocupaba el cristal intacto. Salen del propio horneado (meta.json). */
const CX_CONTACTO = [0.2512, 0.4493];
const CX_DIAM = 0.297;
/** donde cae el CENTRO del cristal intacto dentro del cuadro horneado. Derivado:
    la camara del horneado se centra en el centroide de la masa (0.877, ·, -0.189)
    con ortho 6.6, y el cristal esta en el origen del mundo, asi que
      x = 0.5 - 0.877/6.6 = 0.3671     y = 0.5 + (-0.189)/6.6 ... = 0.4714
    Anclar por ESTE punto —y no por el contacto— es lo que hace que el cristal
    horneado caiga exactamente donde estaba el vivo, sin salto en el relevo. */
const CX_CENTRO = [0.3671, 0.4714];
/** la transformacion ocupa este tramo de p: arranca justo despues del contacto */
const CX_P0 = 0.72, CX_P1 = 1.0;

/** El icosaedro no es una esfera: su silueta media cae en ~0.87 del circunradio.
    Usar 1.0 haria que el "borde" tocara la nariz solo en los vertices. */
const RADIO_VISUAL = 0.87;

/** Progreso 0..1 de una seccion pegajosa. Inmune a saltos de scroll. */
function progresoDe(section: HTMLElement): number {
  const rect = section.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, -rect.top / total));
}

const BEATS: [number, string][] = [
  [0.0, "0 · ENTRADA"], [0.07, "1 · DESPERTAR"], [0.2, "2 · CAMINATA"],
  [0.42, "3 · ATENCIÓN"], [0.52, "4 · APROXIMACIÓN"], [0.64, "5 · CONTACTO"],
  [0.77, "6 · RESPUESTA"], [0.89, "7 · UMBRAL"],
];
const beatDe = (p: number) =>
  BEATS.reduce((acc, [q, n]) => (p >= q ? n : acc), BEATS[0][1]);

/** rampa suave 0..1 dentro de un rango (coseno: sin tirones en los extremos) */
function tramo(p: number, a: number, b: number): number {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a || 1)));
  return 0.5 - Math.cos(t * Math.PI) / 2;
}

/** interpola una curva de puntos [p, ...valores] */
function curva(p: number, pts: number[][]): number[] {
  let a = pts[0];
  for (const b of pts) {
    if (p <= b[0]) {
      const t = (p - a[0]) / (b[0] - a[0] || 1);
      return a.slice(1).map((v, i) => v + (b[i + 1] - v) * t);
    }
    a = b;
  }
  return a.slice(1);
}

export function HeroEscena() {
  const sectionRef = useRef<HTMLElement>(null);
  const fondoRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cristalRef = useRef<HTMLDivElement>(null);
  const cxRef = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const siguienteRef = useRef<HTMLDivElement>(null);
  const marcaRef = useRef<HTMLParagraphElement>(null);
  const tituloRef = useRef<HTMLDivElement>(null);
  const contextoRef = useRef<HTMLParagraphElement>(null);
  const rotuloRef = useRef<HTMLParagraphElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  // el encuadre del cristal viaja por ref: cambiarlo por props re-renderizaria
  // React ~60 veces por segundo
  const encuadreRef = useRef<Encuadre | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const fondo = fondoRef.current;
    if (!section || !canvas || !fondo) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    const fx = fondo.getContext("2d");
    if (!ctx || !fx) return;

    const imgs: (HTMLImageElement | null)[] = new Array(N).fill(null);
    let primero = false;
    const cargar = (i: number) =>
      new Promise<void>((res) => {
        const im = new Image();
        im.onload = () => {
          imgs[i] = im;
          if (!primero) { primero = true; setListo(true); }
          res();
        };
        im.onerror = () => res();
        im.src = RUTA(i);
      });
    void (async () => {
      await cargar(0);
      for (let i = 1; i < N; i += 8) {
        await Promise.all(
          Array.from({ length: 8 }, (_, k) => i + k).filter((j) => j < N).map(cargar),
        );
      }
    })();

    // la secuencia del cristal: se carga igual que la del gato
    const cxs: (HTMLImageElement | null)[] = new Array(N_CX).fill(null);
    const cargarCx = (i: number) =>
      new Promise<void>((res) => {
        const im = new Image();
        im.onload = () => { cxs[i] = im; res(); };
        im.onerror = () => res();
        im.src = RUTA_CX(i);
      });
    void (async () => {
      for (let i = 0; i < N_CX; i += 8) {
        await Promise.all(
          Array.from({ length: 8 }, (_, k) => i + k).filter((j) => j < N_CX).map(cargarCx),
        );
      }
    })();
    const cxCercano = (i: number): HTMLImageElement | null => {
      if (cxs[i]) return cxs[i];
      for (let d = 1; d < N_CX; d++) {
        if (cxs[i - d]) return cxs[i - d];
        if (cxs[i + d]) return cxs[i + d];
      }
      return null;
    };

    /** si el pedido no bajo aun, el mas cercano: el gato nunca desaparece */
    const masCercano = (i: number): HTMLImageElement | null => {
      if (imgs[i]) return imgs[i];
      for (let d = 1; d < N; d++) {
        if (imgs[i - d]) return imgs[i - d];
        if (imgs[i + d]) return imgs[i + d];
      }
      return null;
    };

    let W = 0, H = 0;
    const medir = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      const cxc = cxRef.current;
      if (cxc) {
        cxc.width = Math.round(W * dpr); cxc.height = Math.round(H * dpr);
        const g2 = cxc.getContext("2d");
        if (g2) g2.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      for (const [c, g] of [[canvas, ctx], [fondo, fx]] as const) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    medir();
    window.addEventListener("resize", medir);

    let raf = 0;
    let previo = -1;

    const pintar = () => {
      const p = reduce ? 0.34 : progresoDe(section);
      if (Math.abs(p - previo) > 0.0004) {
        previo = p;

        /* ---------- GATO: anclado por la PISADA ---------- */
        const lado = H * curva(p, ESCALA_GATO)[0] * 1.35;
        const [ys, xi, xd] = curva(p, PISADA);
        const [pieX, pieY] = curva(p, CAMINO_PIE);
        const ox = W * pieX - ((xi + xd) / 2) * lado;
        const oy = H * pieY - ys * lado;
        // la nariz SALE de la geometria: no se impone, se mide
        const [nfx, nfy] = curva(p, NARIZ);
        void nfx; void nfy; // la nariz se recalcula abajo, congelada tras el contacto

        /* ---------- CRISTAL: encuadre en el espacio 3D ---------- */
        const f = curva(p, DIAM_CRISTAL)[0];
        const dist = distanciaParaFraccion(f);
        const vh = altoVisible(dist);
        const vw = vh * (W / H);
        const radio = (H * f) / 2;
        // Tres fases, y ninguna se solapa con la siguiente:
        //  lejos  el cristal esta puesto en el fondo, sobre el suelo
        //  busca  va a encontrar la nariz; su borde izquierdo la toca
        //  ocupa  deja de ser objeto: se suelta de la nariz y toma el cuadro
        // Soltarse no es cosmetico: pasado el contacto la nariz ya no es un dato
        // fiable (el gato gira de espaldas), y seguirla haria saltar al cristal.
        const [lx, ly] = curva(Math.min(p, 0.47), CRISTAL_LEJOS);
        const busca = tramo(p, 0.47, 0.66);
        const ocupa = tramo(p, 0.8, 1);
        const [nxq, nyq] = [
          ox + curva(Math.min(p, 0.77), NARIZ)[0] * lado,
          oy + curva(Math.min(p, 0.77), NARIZ)[1] * lado,
        ];
        const enNariz = nxq + radio * RADIO_VISUAL;
        const cx0 = W * lx * (1 - busca) + enNariz * busca;
        const cy0 = H * ly * (1 - busca) + nyq * busca;
        const cx = cx0 * (1 - ocupa) + W * 0.5 * ocupa;
        const cy = cy0 * (1 - ocupa) + H * 0.5 * ocupa;
        const pulso = Math.exp(-Math.pow((p - 0.7) / 0.045, 2));
        const abre = tramo(p, 0.89, 1);

        encuadreRef.current = {
          x: (cx / W - 0.5) * vw,
          y: (0.5 - cy / H) * vh,
          z: 0,
          distancia: dist,
        };
        if (cristalRef.current) {
          const s = cristalRef.current.style;
          // se apaga durante el relevo: a partir de 0.78 manda la secuencia horneada
          const vivo = (0.3 + tramo(p, 0.05, 0.45) * 0.7 - abre * 0.35)
            * (1 - tramo(p, 0.7, 0.78));
          s.opacity = vivo.toFixed(3);
          s.setProperty("--agita", busca.toFixed(3));
          s.setProperty("--pulso", pulso.toFixed(3));
        }

        /* ---------- RELEVO: del cristal vivo a la transformacion horneada ---------- */
        // Los dos coexisten en el tramo 0.70-0.78. El vivo se apaga, el horneado
        // se enciende, y el bloom pasa por encima justo en el cruce.
        const releve = tramo(p, 0.7, 0.78);
        const qcx = Math.min(1, Math.max(0, (p - CX_P0) / (CX_P1 - CX_P0)));
        const cxc = cxRef.current;
        const gcx = cxc ? cxc.getContext("2d") : null;
        if (cxc && gcx) {
          gcx.clearRect(0, 0, W, H);
          if (releve > 0.001) {
            const im2 = cxCercano(Math.round(qcx * (N_CX - 1)));
            if (im2) {
              // el cuadro se dimensiona para que SU cristal mida lo mismo que el
              // vivo, y se coloca para que sus centros coincidan: sin salto
              const L = (radio * 2) / CX_DIAM;
              // EL ANCLA MIGRA. Al principio del relevo se ancla por el CENTRO DEL
              // CRISTAL, que es lo que garantiza que el horneado caiga exactamente
              // donde estaba el vivo. Al final se ancla por el CENTRO DE LA MASA
              // (0.5, 0.5 del cuadro: es donde apunta la camara del horneado),
              // porque es ahi donde se forma el iris. Sin esta migracion el disco
              // quedaba descentrado ~380 px y en p=1 solo se veia su interior
              // oscuro en vez de la pupila.
              // El destino NO es el centro del disco sino el de la PUPILA, que
              // esta corrida +0.114 del radio (medido en la textura). En fraccion
              // del cuadro: 0.114 x 0.3105 = +0.0354. Sin esto la pupila terminaba
              // ~246 px a la derecha y el siguiente espacio salia recortado.
              const PUPILA_EN_CUADRO = [0.5354, 0.5];
              const ax = CX_CENTRO[0] + (PUPILA_EN_CUADRO[0] - CX_CENTRO[0]) * ocupa;
              const ay = CX_CENTRO[1] + (PUPILA_EN_CUADRO[1] - CX_CENTRO[1]) * ocupa;
              gcx.drawImage(im2, cx - ax * L, cy - ay * L, L, L);
            }
          }
          cxc.style.opacity = releve.toFixed(3);
        }

        /* ---------- BLOOM: tapa la costura del relevo ---------- */
        // Dos destellos, y los dos tapan una costura concreta:
        //  0.735  el cambio de cristal vivo a horneado
        //  0.955  el instante en que el borde de la pupila sale del cuadro
        const brillo = Math.exp(-Math.pow((p - 0.735) / 0.030, 2))
          + 0.55 * Math.exp(-Math.pow((p - 0.955) / 0.022, 2));
        if (bloomRef.current) {
          const s = bloomRef.current.style;
          s.opacity = (brillo * 0.9).toFixed(3);
          s.setProperty("--bx", `${((cx / W) * 100).toFixed(1)}%`);
          s.setProperty("--by", `${((cy / H) * 100).toFixed(1)}%`);
        }

        /* ---------- FONDO: suelo, sombra de contacto, charco de luz ---------- */
        // Al cruzar el umbral se DEJA LA SALA: el suelo, la sombra y el charco
        // pertenecen al sitio donde estaba el cristal, y ese sitio se abandona.
        // Sin esto el suelo seguiria dibujado por encima del siguiente espacio.
        const dejaLaSala = tramo(p, 0.86, 0.97);
        const sueloY = H * pieY;
        fx.clearRect(0, 0, W, H);
        fx.globalAlpha = 1 - dejaLaSala;
        // el suelo: una banda que nace en el horizonte y se cierra abajo
        const horizonte = sueloY - H * 0.13;
        const g = fx.createLinearGradient(0, horizonte, 0, H);
        g.addColorStop(0, "rgba(139,116,220,0)");
        g.addColorStop(0.45, "rgba(120,100,190,0.055)");
        g.addColorStop(1, "rgba(8,7,14,0.55)");
        fx.fillStyle = g;
        fx.fillRect(0, horizonte, W, H - horizonte);
        // Halo DETRAS del cristal. No es decoracion: un vidrio sobre negro no
        // tiene nada que refractar y se aplana a un poligono oscuro (medido:
        // su pixel mas brillante era 40/255). Poniendole luz detras, el
        // material —que no se toca— vuelve a tener algo que transmitir.
        const halo = fx.createRadialGradient(cx, cy, 0, cx, cy, radio * 1.7);
        const fh = 0.05 + busca * 0.13 + pulso * 0.16 + ocupa * 0.1;
        halo.addColorStop(0, `rgba(150,124,235,${fh.toFixed(3)})`);
        halo.addColorStop(0.55, `rgba(120,100,200,${(fh * 0.4).toFixed(3)})`);
        halo.addColorStop(1, "rgba(120,100,200,0)");
        fx.fillStyle = halo;
        fx.fillRect(cx - radio * 2, cy - radio * 2, radio * 4, radio * 4);
        // charco de luz del cristal sobre el suelo: la luz cae donde esta el objeto
        const luz = fx.createRadialGradient(cx, sueloY, 0, cx, sueloY, radio * 1.9);
        const fuerza = 0.1 + busca * 0.14 + pulso * 0.18;
        luz.addColorStop(0, `rgba(167,139,250,${fuerza.toFixed(3)})`);
        luz.addColorStop(1, "rgba(167,139,250,0)");
        fx.save();
        fx.translate(cx, sueloY); fx.scale(1, 0.22); fx.translate(-cx, -sueloY);
        fx.fillStyle = luz;
        fx.fillRect(cx - radio * 2, sueloY - radio * 2, radio * 4, radio * 4);
        fx.restore();
        // sombra de contacto: donde el gato APOYA, con el ancho real de su apoyo
        const anchoPie = Math.max(24, (xd - xi) * lado * 1.2);
        const som = fx.createRadialGradient(W * pieX, sueloY, 0, W * pieX, sueloY, anchoPie / 2);
        som.addColorStop(0, "rgba(4,3,9,0.55)");
        som.addColorStop(0.6, "rgba(4,3,9,0.22)");
        som.addColorStop(1, "rgba(4,3,9,0)");
        fx.save();
        fx.translate(W * pieX, sueloY); fx.scale(1, 0.2); fx.translate(-W * pieX, -sueloY);
        fx.fillStyle = som;
        fx.fillRect(W * pieX - anchoPie, sueloY - anchoPie, anchoPie * 2, anchoPie * 2);
        fx.restore();

        fx.globalAlpha = 1;

        /* ---------- DIBUJO DEL GATO ---------- */
        const im = masCercano(Math.round(p * (N - 1)));
        ctx.clearRect(0, 0, W, H);
        // el gato se queda en la sala: al cruzar el umbral ya no viene con nosotros
        ctx.globalAlpha = 1 - tramo(p, 0.85, 0.93);
        if (im) ctx.drawImage(im, ox, oy, lado, lado);
        // La luz del cristal cae sobre el gato. `source-atop` la recorta contra
        // la silueta ya dibujada, asi que solo se tine el gato y solo del lado
        // que mira al objeto. Es el ultimo eslabon del bucle causal: el suelo
        // los junta por abajo, la luz por arriba. Sin esto siguen siendo dos
        // laminas que pasan una delante de otra.
        const luzGato = 0.08 + busca * 0.15 + pulso * 0.2;
        if (im && luzGato > 0.02) {
          const lg = ctx.createRadialGradient(
            cx, cy, 0, cx, cy, Math.max(radio * 2.4, lado * 0.55),
          );
          lg.addColorStop(0, `rgba(178,150,255,${luzGato.toFixed(3)})`);
          lg.addColorStop(1, "rgba(178,150,255,0)");
          ctx.save();
          ctx.globalCompositeOperation = "source-atop";
          ctx.fillStyle = lg;
          ctx.fillRect(0, 0, W, H);
          ctx.restore();
        }
        // CONTRALUZ del umbral. El gato horneado trae un rim claro, asi que a
        // contraluz saldria brillante — al reves de lo que pide el beat. Se le
        // resta luz a medida que el portal la gana, hasta dejarlo en silueta.
        // `source-atop` otra vez: solo se oscurece el gato, no el fondo.
        if (im && ocupa > 0.01) {
          ctx.save();
          ctx.globalCompositeOperation = "source-atop";
          ctx.fillStyle = `rgba(9,8,16,${(ocupa * 0.78).toFixed(3)})`;
          ctx.fillRect(0, 0, W, H);
          ctx.restore();
        }

        /* ---------- UMBRAL: se cruza la pupila ----------
           No hay mascara ni overlay. El siguiente espacio esta DEBAJO del iris y
           solo se ve por donde el iris no existe: el agujero de la pupila, que
           es geometria real del horneado, con su forma de lente vertical.
           Al crecer el disco la pupila crece con el, hasta superar el cuadro.
           Entonces ya no hay iris que mirar: estamos del otro lado.
           Todo es funcion de p, asi que subir el scroll cierra la pupila. */
        if (siguienteRef.current) {
          siguienteRef.current.style.opacity = tramo(p, 0.90, 1).toFixed(3);
        }
        // FASE 0 (10-sep): en p=0.94 la pupila (~440 px) cortaba el texto por la mitad
        // ('sitio que no / ecto: lo hace / ble.'): el CONTENIDO estaba puesto a tamano
        // final desde 0.90 y la pupila lo destapaba como una mascara. El fondo (el lugar)
        // sigue entrando desde 0.90; el contenido entra cuando la pupila ya lo contiene
        // entero y llega escalando, para que tenga trayectoria. Composicion, no direccion.
        if (marcaRef.current) {
          const llega = tramo(p, 0.955, 0.985);
          marcaRef.current.style.opacity = llega.toFixed(3);
          marcaRef.current.style.transform = `scale(${(0.72 + 0.28 * llega).toFixed(4)})`;
        }

        /* ---------- TEXTO ---------- */
        if (tituloRef.current) {
          const t = tramo(p, 0.04, 0.2);
          tituloRef.current.style.opacity = (1 - t).toFixed(3);
          tituloRef.current.style.transform = `translate3d(0, ${(-t * 4).toFixed(2)}vh, 0)`;
        }
        if (contextoRef.current)
          contextoRef.current.style.opacity = (
            tramo(p, 0.24, 0.3) * (1 - tramo(p, 0.38, 0.42))
          ).toFixed(3);
        if (rotuloRef.current)
          rotuloRef.current.style.opacity = tramo(p, 0.955, 0.99).toFixed(3); // FASE 0: antes 0.92 -> asomaba sobre el iris, fuera de la pupila

        if (hudRef.current)
          hudRef.current.textContent =
            `p ${p.toFixed(3)} · ${beatDe(p)} · frame ${Math.round(p * (N - 1)) + 1}/${N}`;
      }
      raf = requestAnimationFrame(pintar);
    };
    raf = requestAnimationFrame(pintar);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", medir);
    };
  }, []);

  return (
    <section ref={sectionRef} className="he-escena">
      <div className="he-sticky">
        <canvas ref={fondoRef} className="he-fondo" aria-hidden />
        {/* el siguiente espacio: vive DEBAJO del iris y se ve por la pupila */}
        <div ref={siguienteRef} className="he-siguiente" aria-hidden>
          <p ref={marcaRef} className="he-siguiente__marca">
            <span>Caso 01</span>
            MH Interior — un sitio que no muestra el proyecto: lo hace atravesable.
          </p>
        </div>
        <div ref={cristalRef} className="he-cristal" aria-hidden>
          {/* la caja no se mueve: el encuadre va por encuadreRef, dentro de la escena 3D */}
          <HeroCrystalMount
            className="pointer-events-none absolute inset-0"
            veloInferior={null}
            encuadreRef={encuadreRef}
          />
        </div>
        <canvas ref={cxRef} className="he-cristalx" aria-hidden />
        <canvas
          ref={canvasRef}
          className={`he-gato${listo ? " is-listo" : ""}`}
          aria-hidden
        />
        <div ref={bloomRef} className="he-bloom" aria-hidden />
        {!listo && <div className="he-esqueleto" aria-hidden />}
        <div className="he-texto">
          <div ref={tituloRef} className="he-titulo">
            <h1>
              Tu trabajo ya impresiona.
              <br />
              Podría convencerlos aún más.
            </h1>
          </div>
          <p ref={contextoRef} className="he-contexto">
            Un sitio que no solo muestra el proyecto: lo hace atravesable.
          </p>
          <p ref={rotuloRef} className="he-rotulo">
            MH Interior · recorrido interactivo
          </p>
        </div>
        <div ref={hudRef} className="he-hud" />
      </div>
    </section>
  );
}
