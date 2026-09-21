/* ---------------------------------------------------------------------------
   HERO · las curvas de la escena y sus tres ayudantes.

   Todo lo que se mueve en la escena sale de un solo numero, p, a traves de estas
   curvas. Viven aparte solo para que HeroEscena.tsx quede por debajo de las 800
   lineas; los valores son exactamente los aprobados (E3-v5.1) y no se tocan.
--------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
   MEDIDO — no estimado. Sale del alfa de los propios fotogramas con
   scripts/medir_anclajes.py. Si se re-hornea la secuencia, se regenera.
--------------------------------------------------------------------------- */

/** [p, x, y] del punto mas adelantado del hocico, sobre el cuadro de 800px */
export const NARIZ: number[][] = [
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
export const PISADA: number[][] = [
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
export const CAMINO_PIE: number[][] = [
  [0.0, 0.26, 0.74], [0.1, 0.27, 0.745], [0.2, 0.32, 0.76],
  [0.42, 0.5, 0.79], [0.52, 0.545, 0.8], [0.64, 0.6, 0.81],
  [0.7, 0.625, 0.815], [0.77, 0.625, 0.815], [0.89, 0.6, 0.78],
  [1.0, 0.565, 0.7],
];

/** alto aparente del gato, en fraccion del alto del viewport */
export const ESCALA_GATO: number[][] = [
  [0.0, 0.4], [0.2, 0.56], [0.52, 0.7], [0.7, 0.76], [0.89, 0.6], [1.0, 0.3],
];

/** diametro del cristal, en fraccion del alto del viewport */
export const DIAM_CRISTAL: number[][] = [
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
export const CRISTAL_LEJOS: number[][] = [
  [0.0, 0.8, 0.66], [0.2, 0.79, 0.68], [0.47, 0.76, 0.72],
];

/** Progreso 0..1 de una seccion pegajosa. Inmune a saltos de scroll. */
export function progresoDe(section: HTMLElement): number {
  const rect = section.getBoundingClientRect();
  const total = rect.height - window.innerHeight;
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, -rect.top / total));
}

/** rampa suave 0..1 dentro de un rango (coseno: sin tirones en los extremos) */
export function tramo(p: number, a: number, b: number): number {
  const t = Math.min(1, Math.max(0, (p - a) / (b - a || 1)));
  return 0.5 - Math.cos(t * Math.PI) / 2;
}

/** interpola una curva de puntos [p, ...valores] */
export function curva(p: number, pts: number[][]): number[] {
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
