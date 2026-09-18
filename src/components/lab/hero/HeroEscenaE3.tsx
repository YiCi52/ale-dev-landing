"use client";

/* E3 · UMBRAL — COPIA DE PRUEBA de HeroEscena.tsx (13-sep-2026, lab).
   La escena aprobada (gato, fractura, relevo E2-B4, iris, scroll) NO cambia: esta
   copia solo agrega el espacio de prueba detras de la pupila y la luz que derrama
   sobre su borde. Todo lo nuevo esta en umbralE3.ts y marcado con «E3». */
import { useEffect, useRef, useState } from "react";

import {
  E3_RECURSOS, cargarEspacio, cuadroEspacio, indiceDeCuadro, pintarEspacio,
  pintarLuzBorde, pintarLuzFibras, pupilaEnPantalla, type Espacio, type Pupila,
  P_UMBRAL, cargarUmbral, cuadroUmbral, colorMedio, type Umbral,
} from "./umbralE3";
import {
  activar, crearVentana, cuadro, type Ventana,
} from "./ventana";
import { HeroCrystalMount } from "@/components/hero/HeroCrystalMount";
import {
  altoVisible,
  distanciaParaFraccion,
  LOOK_VOLUMEN,
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
/** el cuadro en que el relevo pasa del horneado de produccion al de E2-B4. No es
    un numero elegido: el propio horneado declara q_relevo 0.55, y 0.55 x 59 = 32. */
const CX_RELEVO = 32;
// E3: el relevo es E2-B4 (aprobada), servida desde lookdev; lo anterior, produccion
const RUTA_CX = (i: number) =>
  i >= CX_RELEVO
    ? `${E3_RECURSOS}/cx_${String(i + 1).padStart(4, "0")}.webp`
    : `/lab/gatoc/cristal/cx_${String(i + 1).padStart(4, "0")}.webp`;

/* ---------------------------------------------------------------------------
   LA COSTURA DE p≈0.8695 — 17-sep-2026.

   Los dos horneados tienen la MISMA geometria: misma camara (ortho 6.6), mismo
   punto de contacto, mismo diametro y la misma silueta (|dAlfa| medio 0.00/255
   sobre los 28 cuadros comunes). La costura no era entonces un salto de FORMA
   sino de MATERIAL: el horneado de produccion sale lechoso y plano (lum media
   151) y el de E2-B4 violeta y vitreo (lum media 84). En el cuadro 33, que existe
   en los dos, la diferencia medida era 69.7/255, y el corte se veia como un
   escalon de luminancia de -44.3% EN UN SOLO CUADRO — cuando el paso normal entre
   cuadros vecinos es de 0.5 a 0.9.

   No se arregla con una curva de tono global: medido, el mapeo de un horneado al
   otro NO es monotono a lo largo de toda la secuencia, porque al formarse el iris
   los dos materiales divergen tambien en estructura y no solo en tono. Pero SI se
   arregla en el tramo que importa, y por una razon medida: el horneado de
   produccion es fotometricamente estable en sus 32 cuadros (lum 150.7 a 158.4,
   rango 7.7), asi que una sola cadena le sirve a todos.

   Esta es esa cadena, ajustada contra los cuatro cuadros que existen en los dos
   horneados y minimizando el error CON el recorte metido dentro de la perdida
   (sin eso las altas luces salian quemadas en crema y los negros aplastados):
     residuo 19.9/255 frente a 69.7 sin corregir · 0.00% quemado · 0.48% aplastado
     y el salto de la costura queda en 1.2 (1.4%), dentro del ruido entre cuadros.

   Va como filtro del lienzo y NO como imagenes ya corregidas a proposito:
   corregirlas al cargar costaria otros ~180 MB de bitmaps decodificados, y la
   memoria es justamente el problema de esta escena. Asi cuesta cero bytes.

   PARA VOLVER ATRAS: CORRECCION_A = "none".
--------------------------------------------------------------------------- */
const CORRECCION_A = "saturate(0.375) brightness(0.740) contrast(2.775)";

/* ---------------------------------------------------------------------------
   RADIOS DE LA VENTANA — cuantos cuadros se mantienen decodificados a cada lado
   del que se mira. Salen de dividir memoria entre latencia, con el peso real de
   cada cuadro medido:
     gato      800x800   = 2,44 MB/cuadro   x 120 cuadros = 293 MB si se guardan todos
     cristal  1200x1200  = 5,76 MB/cuadro   x  60         = 330 MB
     sala     1440x900   = 5,18 MB/cuadro   x  36         = 178 MB
     umbral   1440x900   = 5,18 MB/cuadro   x  86 (2 pasadas x 43) = 1.063 MB
   Al umbral se le da el radio mas corto porque es el mas caro por cuadro y su
   tramo de p es el mas corto (0.94-1.00): ahi cada cuadro dura muy poco scroll.
   PARA DESACTIVAR LA VENTANA: poner Infinity. No es un apagado simulado — con
   Infinity se piden todos los cuadros y no se libera ninguno, que es letra por
   letra el comportamiento que habia antes de que existiera este cargador.
--------------------------------------------------------------------------- */
const RADIO_GATO = 14;
const RADIO_CRISTAL = 12;
const RADIO_SALA = 8;
// el iris del umbral se hornea a 2880x1800 (20,7 MB por cuadro, medido), cuatro
// veces la sala: por eso lleva el radio mas corto de las cinco secuencias.
const RADIO_UMBRAL = 6;

/* ---------------------------------------------------------------------------
   RETRATO · ALTURA DE REFERENCIA DE LA COMPOSICION — 18-sep-2026.

   El problema, medido en iPhone 13 (390x664): de p=0.55 en adelante el cristal
   se iba por el borde derecho. Solo el 57% del disco quedaba dentro del cuadro en
   0.55, el 24% en 0.60 y el 16% en 0.70.

   Primero se probo un tope al DIAMETRO del cristal. No sirvio: bajo el diametro
   del 85% al 72% del ancho y la fraccion dentro del cuadro paso del 16% al 17%.
   La medicion decia por que — el problema no es el tamano sino el SITIO: a p=0.70
   el centro del disco caia en x=504 sobre un viewport de 390, o sea 114 px fuera.

   Y la causa esta un paso antes: TODOS los tamanos de la escena se derivan del
   ALTO del viewport (`lado = H * ESCALA_GATO * 1.35`, `radio = H * f / 2`),
   mientras los sitios se derivan del ANCHO. En 1440x900 eso cuadra; en retrato el
   gato mide 681 px de ancho sobre 390 disponibles, su nariz queda pegada al borde
   derecho, y el cristal —que se ancla en la nariz— sale del cuadro detras de ella.

   La solucion es una sola: los tamanos se miden contra una ALTURA DE REFERENCIA
   que respeta el ancho, no contra el alto crudo. Asi escalan TODOS JUNTOS y cada
   relacion de la composicion aprobada se conserva; lo unico que cambia es que en
   un telefono la escena se compone mas chica, que es lo que cabe.

   ASPECTO_BASE es la proporcion en la que se autorizo la composicion (1440x900).
   En escritorio la referencia sale igual al alto y no cambia NADA:
     1440x900 -> 1440/1.6 = 900 = H      1280x720 -> 800 > 720, manda H
     1920x1080 -> 1200 > 1080, manda H   390x664  -> 390/1.6 = 244 < 664
   La condicion solo se activa cuando la pantalla es mas angosta que 1.6, que en
   escritorio no pasa.

   El cristal ademas devuelve su referencia al alto crudo con una rampa antes de
   P_UMBRAL: desde ahi manda el horneado del umbral a cuadro completo y la pupila,
   el espesor y el cruce quedan EXACTAMENTE como estan. El umbral no se toca.

   No cambia ninguna curva, ni la geometria del gato, ni el asset del cristal.
   PARA VOLVER ATRAS: ASPECTO_BASE = 0.
--------------------------------------------------------------------------- */
const ASPECTO_BASE = 1440 / 900;
/* La correccion se suelta ANTES de que empiece el umbral, no durante. Con
   [0.8, P_UMBRAL] quedaba a medias en 0.87 (tramo = 0.5) y eso movia la pupila en
   el tramo de aproximacion al umbral, que esta congelado: medido, el cuadro de
   movil en 0.87 diferia en 16,7/255. Con [0.72, 0.87] la correccion cubre justo
   el tramo del problema (<=0.70) y en 0.87 ya vale 1, asi que de ahi en adelante
   —pupila, espesor, sala y cruce— todo queda identico. */
const SUELTA_TOPE: readonly [number, number] = [0.72, 0.87];
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

export function HeroEscenaE3() {
  const sectionRef = useRef<HTMLElement>(null);
  const fondoRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cristalRef = useRef<HTMLDivElement>(null);
  const cxRef = useRef<HTMLCanvasElement>(null);
  const espacioRef = useRef<HTMLCanvasElement>(null);   // E3: la sala detras de la pupila
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

    /* El bucle de pintado solo trabaja cuando p cambia. Con ventana los cuadros
       entran mientras uno esta quieto, asi que hay que invalidar el ultimo p para
       que el nuevo cuadro se dibuje; sin esto, al abrir en p=0 el cristal quedaba
       ausente hasta el primer scroll. */
    const repintar = () => { previo = -1; };

    const imgs: (HTMLImageElement | null)[] = new Array(N).fill(null);
    let primero = false;
    const vGato = crearVentana({
      nombre: "gato", n: N, radio: RADIO_GATO, url: RUTA, imgs,
      alCargar: () => {
        if (!primero) { primero = true; setListo(true); }
        repintar();
      },
    });

    // la secuencia del cristal: misma ventana, otro radio
    const cxs: (HTMLImageElement | null)[] = new Array(N_CX).fill(null);
    const vCristal = crearVentana({
      nombre: "cristal", n: N_CX, radio: RADIO_CRISTAL, url: RUTA_CX,
      imgs: cxs, alCargar: repintar,
    });
    // E3: la sala de prueba y un lienzo auxiliar para la luz que derrama sobre el iris
    // ?v=1..5 o ?v=51 (v5.1). v4, v5 y v5.1 usan v3 por debajo del umbral.
    const pedida = Number(new URLSearchParams(window.location.search).get("v") ?? "1");
    const version = [2, 3, 4, 5, 51].includes(pedida) ? pedida : 1;
    const en3D = version >= 4;
    const espacio: Espacio = {
      version: en3D ? 3 : version, ps: [], imgs: [], colores: [], archivos: [],
    };
    const umbral: Umbral = { ps: [], sala: [], iris: [], archSala: [], archIris: [] };
    const indiceUmbral = version === 51 ? "indice51.json" : version === 5 ? "indice5.json" : "indice4.json";
    // Las ventanas de la sala y del umbral se crean cuando llega su indice: hasta
    // entonces no se sabe cuantos cuadros hay ni como se llaman.
    let vSala: Ventana | null = null;
    let vUmbralSala: Ventana | null = null;
    let vUmbralIris: Ventana | null = null;
    void cargarEspacio(espacio).then(() => {
      if (!espacio.archivos.length) return;
      vSala = crearVentana({
        nombre: "sala", n: espacio.archivos.length, radio: RADIO_SALA,
        url: (i) => espacio.archivos[i], imgs: espacio.imgs,
        extra: espacio.colores, calcExtra: colorMedio, alCargar: repintar,
      });
    });
    if (en3D) {
      void cargarUmbral(umbral, indiceUmbral).then(() => {
        if (!umbral.archSala.length) return;
        const n = umbral.archSala.length;
        vUmbralSala = crearVentana({
          nombre: "umbral-sala", n, radio: RADIO_UMBRAL,
          url: (i) => umbral.archSala[i], imgs: umbral.sala, alCargar: repintar,
        });
        vUmbralIris = crearVentana({
          nombre: "umbral-iris", n, radio: RADIO_UMBRAL,
          url: (i) => umbral.archIris[i], imgs: umbral.iris, alCargar: repintar,
        });
      });
    }
    const luzBorde = document.createElement("canvas");
    const cantoE3 = document.createElement("canvas");
    const fibrasE3 = document.createElement("canvas");
    const cxCercano = (i: number): HTMLImageElement | null => cuadro(vCristal, i);

    /** si el pedido no bajo aun, el mas cercano: el gato nunca desaparece */
    const masCercano = (i: number): HTMLImageElement | null => cuadro(vGato, i);

    /** el cuadro de una secuencia indexada por p (la sala y el umbral traen su
        propio array de p en el indice, no un reparto regular) */
    const indiceEnPs = (ps: number[], p: number): number => {
      let mejor = 0, dist = Infinity;
      for (let i = 0; i < ps.length; i++) {
        const d = Math.abs(ps[i] - p);
        if (d < dist) { dist = d; mejor = i; }
      }
      return mejor;
    };

    /* ---------------------------------------------------------------------
       VENTANA · cada secuencia se sostiene SOLO en el tramo de p en que de
       verdad se dibuja. Los limites no son elegidos: salen del propio codigo.
         gato      se apaga con tramo(p, 0.85, 0.93) -> invisible desde 0.93
         cristal   entra con tramo(p, 0.70, 0.78); en movil, desde p=0
         sala      cuadroEspacio() devuelve null antes de su primer p, y desde
                   P_UMBRAL la tapa la escena 3D del umbral
         umbral    solo manda desde P_UMBRAL (0.94)
       Se les da un margen de 0.04 de p por delante para que el cuadro llegue
       antes de hacer falta. Fuera de su tramo se suelta la secuencia ENTERA: es
       lo que baja el pico, porque el iris del umbral son 850 MB si se guarda
       completo y no se ve en el 90% del recorrido.
    --------------------------------------------------------------------- */
    const MARGEN = 0.04;

    /** QUE SECUENCIAS VIVEN EN ESTE p, y en que cuadro. */
    type Plan = { v: Ventana | null; dentro: boolean; i: number };
    const plan = (p: number): Plan[] => {
      const qcx = Math.min(1, Math.max(0, (p - CX_P0) / (CX_P1 - CX_P0)));
      const p0Sala = espacio.ps.length ? espacio.ps[0] : 1;
      const iSala = espacio.ps.length ? indiceEnPs(espacio.ps, p) : 0;
      const iUmb = umbral.ps.length ? indiceEnPs(umbral.ps, p) : 0;
      return [
        { v: vGato, i: p * (N - 1), dentro: p < 0.93 + MARGEN },
        { v: vCristal, i: qcx * (N_CX - 1), dentro: sinWebgl || p > 0.7 - MARGEN },
        { v: vSala, i: iSala,
          dentro: espacio.ps.length > 0 && p > p0Sala - MARGEN && p < P_UMBRAL + MARGEN },
        { v: vUmbralSala, i: iUmb,
          dentro: umbral.ps.length > 0 && p > P_UMBRAL - MARGEN },
        { v: vUmbralIris, i: iUmb,
          dentro: umbral.ps.length > 0 && p > P_UMBRAL - MARGEN },
      ];
    };

    const centrarTodo = (p: number) => {
      for (const x of plan(p)) activar(x.v, x.dentro, x.i);
    };

    let W = 0, H = 0;
    let dprActual = 1;   // E3
    /* MOVIL · HeroCrystalMount no monta WebGL por debajo de 768px o sin puntero
       fino, y lo hace a proposito para que three.js no se ejecute en telefono.
       Consecuencia, medida antes de este arreglo: de p=0 a p=0.70 no habia NI UN
       pixel de cristal en pantalla, asi que el gato caminaba, giraba y llegaba al
       beat de CONTACTO hacia nada, y en 0.87 el cristal aparecia de golpe ya
       fracturado. Se perdian los dos primeros eslabones de la cadena.

       Aqui no se inventa un hero nuevo: se usa la MISMA secuencia horneada, que
       ya esta descargada. Para p < CX_P0 la escena ya calcula el cuadro 0 (qcx se
       satura en 0), y medido sobre los propios archivos los cuadros cx_0001 a
       cx_0019 son el cristal INTACTO e inmovil —area constante de 75.215 px y
       caja constante de 114.918—, asi que el cuadro 0 es literalmente el mismo
       objeto con el que la secuencia arranca en 0.72: el empalme no existe.
       Memoria adicional: cero. Ese cuadro ya estaba cargado y decodificado.

       La consulta se copia de HeroCrystalMount a proposito: si cambia alli, esto
       tiene que cambiar con ella. */
    const CONSULTA_WEBGL = "(min-width: 768px) and (pointer: fine)";
    let sinWebgl = false;
    /** RETRATO: la altura contra la que se miden los tamanos. Igual al alto en
        cuanto la pantalla es 1.6 o mas ancha, o sea siempre en escritorio. */
    let kRetrato = 1;
    const medir = () => {
      sinWebgl = !window.matchMedia(CONSULTA_WEBGL).matches;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      const cxc = cxRef.current;
      if (cxc) {
        cxc.width = Math.round(W * dpr); cxc.height = Math.round(H * dpr);
        const g2 = cxc.getContext("2d");
        if (g2) g2.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      const esc = espacioRef.current;   // E3
      if (esc) {
        esc.width = Math.round(W * dpr); esc.height = Math.round(H * dpr);
        const g3 = esc.getContext("2d");
        if (g3) g3.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      for (const c of [luzBorde, cantoE3, fibrasE3]) {
        c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      }
      dprActual = dpr;
      kRetrato = Math.min(1, W / ASPECTO_BASE / H);
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
        // RETRATO: el tamano del gato se mide contra la referencia, no contra el
        // alto crudo. En escritorio kRetrato vale 1 y la expresion es la de antes.
        const lado = H * kRetrato * curva(p, ESCALA_GATO)[0] * 1.35;
        const [ys, xi, xd] = curva(p, PISADA);
        const [pieX, pieY] = curva(p, CAMINO_PIE);
        const ox = W * pieX - ((xi + xd) / 2) * lado;
        const oy = H * pieY - ys * lado;
        // la nariz SALE de la geometria: no se impone, se mide
        const [nfx, nfy] = curva(p, NARIZ);
        void nfx; void nfy; // la nariz se recalcula abajo, congelada tras el contacto

        // VENTANA: primero pedir, despues dibujar.
        centrarTodo(p);

        /* ---------- CRISTAL: encuadre en el espacio 3D ---------- */
        const f = curva(p, DIAM_CRISTAL)[0];
        const dist = distanciaParaFraccion(f);
        const vh = altoVisible(dist);
        const vw = vh * (W / H);
        // RETRATO: idem para el cristal, pero su referencia vuelve al alto crudo
        // con una rampa antes de P_UMBRAL, para que el umbral quede intacto.
        const kCristal = kRetrato + (1 - kRetrato) * tramo(p, SUELTA_TOPE[0], SUELTA_TOPE[1]);
        const radio = (H * kCristal * f) / 2;
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
        // se apaga durante el relevo: a partir de 0.78 manda la secuencia horneada.
        // Sale del `if` porque en movil esta misma curva gobierna la presencia del
        // horneado, que es lo que alli hace de cristal.
        const vivo = (0.3 + tramo(p, 0.05, 0.45) * 0.7 - abre * 0.35)
          * (1 - tramo(p, 0.7, 0.78));
        if (cristalRef.current) {
          const s = cristalRef.current.style;
          s.opacity = vivo.toFixed(3);
          s.setProperty("--agita", busca.toFixed(3));
          s.setProperty("--pulso", pulso.toFixed(3));
        }

        /* ---------- RELEVO: del cristal vivo a la transformacion horneada ---------- */
        // Los dos coexisten en el tramo 0.70-0.78. El vivo se apaga, el horneado
        // se enciende, y el bloom pasa por encima justo en el cruce.
        const releve = tramo(p, 0.7, 0.78);
        /* MOVIL: sin cristal vivo, la capa horneada tiene que estar presente desde
           p=0. Se SUMA a `releve` en vez de sustituirlo para que el traspaso no
           tenga bache: en 0.70 vale 1+0, en 0.74 vale 0.5+0.5 y en 0.78 vale 0+1.
           Tomar el maximo hundiria la opacidad a 0.5 justo en mitad del relevo.
           En escritorio la expresion es, caracter por caracter, la de antes. */
        const presencia = sinWebgl ? Math.min(1, vivo + releve) : releve;
        let pupilaE3: Pupila | null = null;   // E3
        let cuadroE3: ReturnType<typeof cuadroEspacio> = null;
        let corrigeA = false;   // COSTURA: el cuadro dibujado viene del horneado A
        const qcx = Math.min(1, Math.max(0, (p - CX_P0) / (CX_P1 - CX_P0)));
        const cxc = cxRef.current;
        const gcx = cxc ? cxc.getContext("2d") : null;
        if (cxc && gcx) {
          gcx.clearRect(0, 0, W, H);
          if (presencia > 0.001) {
            const im2 = cxCercano(Math.round(qcx * (N_CX - 1)));
            // E3-v4: desde el umbral manda la escena 3D (iris real + espesor + sala)
            const c4 = en3D && p >= P_UMBRAL ? cuadroUmbral(umbral, p) : null;
            if (c4) {
              gcx.drawImage(c4.sala, 0, 0, W, H);
              gcx.drawImage(c4.iris, 0, 0, W, H);
            } else if (im2) {
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
              // COSTURA: el cuadro que de verdad se dibuja puede no ser el pedido
              // (cxCercano cae al vecino que ya haya bajado), asi que la correccion
              // se decide por el indice del cuadro DIBUJADO, no por el pedido.
              const idxCx = indiceDeCuadro(im2);
              corrigeA = idxCx < CX_RELEVO;
              gcx.drawImage(im2, cx - ax * L, cy - ay * L, L, L);
              // E3 · UMBRAL: la pupila de ESTE cuadro, en pantalla. Por ella se ve la
              // sala (que esta detras) y su luz cae sobre el iris que la rodea.
              const rect = { x: cx - ax * L, y: cy - ay * L, lado: L };
              pupilaE3 = pupilaEnPantalla(idxCx, rect);
              cuadroE3 = cuadroEspacio(espacio, p);
              pintarLuzBorde(gcx, luzBorde, im2, rect, pupilaE3, p, dprActual,
                             cuadroE3?.color ?? "255,236,210", version);
              if (version === 3) {
                pintarLuzFibras(gcx, fibrasE3, im2, rect, pupilaE3, p, dprActual,
                                cuadroE3?.color ?? "255,236,210");
              }
            }
          }
          cxc.style.opacity = presencia.toFixed(3);
          // La correccion de la costura va en el filtro CSS de la CAPA y no en
          // ctx.filter. Medido: por drawImage costaba un 16% de fps en el tramo
          // 0.70-0.87 (30.4 -> 25.6), porque el filtro se aplica en CPU sobre el
          // area dibujada y el cristal se dibuja a ~2160 px, mas grande que su
          // nativo de 1200. Aqui lo hace el compositor, una vez por capa.
          // Es equivalente y no una aproximacion: en el tramo del horneado A este
          // lienzo tiene SOLO el cristal — la luz del borde arranca en
          // LUZ_BORDE.p0 = 0.895 y el horneado A deja de usarse en 0.8695.
          const filtroCapa = corrigeA ? CORRECCION_A : "none";
          if (cxc.style.filter !== filtroCapa) cxc.style.filter = filtroCapa;
        }
        const gesp = espacioRef.current?.getContext("2d");   // E3
        if (gesp) {
          pintarEspacio(gesp, W, H, releve > 0.001 ? cuadroE3 : null, pupilaE3,
                        en3D ? 3 : version, cantoE3, dprActual);
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
          // al mudarse fuera de .he-siguiente dejo de heredar su opacidad, y la
          // opacidad efectiva era el PRODUCTO de las dos. Se multiplica a mano
          // para que la curva quede identica a la aprobada, no parecida.
          marcaRef.current.style.opacity = (llega * tramo(p, 0.9, 1)).toFixed(3);
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
        {/* el siguiente espacio: vive DEBAJO del iris y se ve por la pupila.
            Su TEXTO ya no vive aqui: el remate esta en .he-texto, mas abajo. */}
        <div ref={siguienteRef} className="he-siguiente" aria-hidden />
        {/* E3: la sala de prueba, debajo del iris; solo se ve por la pupila */}
        <canvas ref={espacioRef} className="he-espacio" aria-hidden />
        <div ref={cristalRef} className="he-cristal" aria-hidden>
          {/* la caja no se mueve: el encuadre va por encuadreRef, dentro de la escena 3D */}
          <HeroCrystalMount
            className="pointer-events-none absolute inset-0"
            veloInferior={null}
            encuadreRef={encuadreRef}
            /* CRISTAL VIVO p 0.42-0.70: solo material y entorno, nada de forma,
               posicion, escala ni interaccion. Ver LOOK_VOLUMEN en HeroCrystal.
               PARA VOLVER ATRAS: quitar esta linea (vuelve a LOOK_PRODUCCION). */
            look={LOOK_VOLUMEN}
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
          {/* REMATE de p=1. Estaba dentro de .he-siguiente (z2) y el umbral (z3)
              lo tapaba durante TODO el tramo en que le toca entrar (0.955-0.985,
              y el umbral manda desde 0.94): no podia verse nunca. Es texto, asi
              que vive en la capa del texto. Contenido y timing sin cambiar. */}
          <p ref={marcaRef} className="he-siguiente__marca">
            <span>Caso 01</span>
            MH Interior — un sitio que no muestra el proyecto: lo hace atravesable.
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
