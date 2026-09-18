/* ---------------------------------------------------------------------------
   ENCUADRE Y LOOK DEL CRISTAL — matematica y constantes, SIN three.

   Este archivo existe por una razon medida. Las escenas del lab importaban
   `altoVisible` y `distanciaParaFraccion` —valores, no tipos— desde
   HeroCrystal.tsx, que importa three, @react-three/fiber y drei en su cabecera.
   Eso anulaba el `dynamic(ssr: false)` de HeroCrystalMount: en el build de
   produccion three terminaba en un chunk compartido, y MOVIL descargaba ~956 kB
   de WebGL que no puede ejecutar nunca, porque la puerta de HeroCrystalMount lo
   impide. Esa puerta evitaba el RENDER, no la DESCARGA.

   Aqui no hay ni un import de three, a proposito. HeroCrystal sigue
   re-exportando todo lo de abajo, asi que nada de lo que ya importaba desde alli
   se rompe; lo que cambia es de donde importan las escenas, que ahora pueden
   hablar de encuadre sin arrastrar el motor 3D.

   PARA VOLVER ATRAS: devolver estos dos bloques a HeroCrystal.tsx y reapuntar
   los imports de HeroEscena y HeroEscenaE3.
--------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
   ENCUADRE

   Producción coloca el cristal con CSS: la caja va pegada a la derecha y ocupa
   el 54% del ancho, y la malla vive descentrada dentro del lienzo. Eso funciona
   cuando la caja no se mueve.

   No funciona cuando alguien quiere DIRIGIR el cristal —moverlo, acercarlo,
   agrandarlo— porque el objeto está anclado al borde derecho de su propio
   lienzo: al agrandar la caja, el cristal crece Y se sale a la vez, y el canvas
   lo corta. Medido a p=0.70 con 1440x900: el lienzo terminaba en x=1368 con el
   cristal cortado, y leía como una PARED azul plana, no como un objeto.

   Así que el encuadre se hace donde de verdad vive el objeto: en la escena 3D.
   La caja se queda quieta y lo que cambia es la posición de la malla y la
   DISTANCIA DE CÁMARA. Es composición real —hay perspectiva y profundidad— en
   vez de un escalado de un contenedor recortado.

   ENCUADRE_BASE son los valores de producción. Si nadie pasa `encuadreRef`,
   nada cambia respecto de antes.
--------------------------------------------------------------------------- */

export type Encuadre = {
  /** posición de la malla dentro de la escena (unidades de mundo) */
  x: number;
  y: number;
  z: number;
  /** distancia de la cámara: gobierna tamaño aparente Y profundidad */
  distancia: number;
};

export const ENCUADRE_BASE: Encuadre = { x: 0.5, y: -0.55, z: 0, distancia: 5 };

/** Alto visible en el plano z=0, en unidades de mundo, para una distancia dada.
    Con fov 30°: 2·d·tan(15°). Sirve para convertir "quiero que ocupe tanto de
    la pantalla" en una distancia de cámara concreta. */
export const altoVisible = (distancia: number) =>
  2 * distancia * Math.tan((30 * Math.PI) / 180 / 2);

/** Distancia de cámara para que el cristal (diámetro ≈1.96) ocupe la fracción
    `f` del alto del lienzo. Inversa de altoVisible. Equivale a 3.657 / f. */
export const distanciaParaFraccion = (f: number) =>
  1.96 / (2 * Math.max(0.001, f) * Math.tan((30 * Math.PI) / 180 / 2));

/** Por debajo de esta distancia el objeto ya no cabe entero en su propio lienzo
    y los bordes lo cortan: radio 0.98 más la deriva de Float (~0.07) sobre
    tan(15°). Equivale a que el cristal ocupe ~0.93 del alto. Cruzarlo es legítimo
    cuando el cristal deja de ser un objeto y pasa a ocupar el cuadro; cruzarlo
    sin querer es el recorte que hacía leer el cristal como una pared plana. */
export const DISTANCIA_MINIMA_ENTERO = 3.92;

/* ---------------------------------------------------------------------------
   EL LOOK DEL VIDRIO — 17-sep-2026.

   Medido a 1440x900 con la escena E3: el cristal vivo leia como un POLIGONO AZUL
   PLANO, y se podia cuantificar — el rango de luminancia p5-p95 del objeto caia
   de 104 (p 0.42) a 45.6 (p 0.70). Cuanto mas grande, mas plano.

   La causa no era la luz sino DOS cosas del material:

   1. Sin caras traseras, un icosaedro de 20 caras es una cascara: no hay
      estructura interna que mirar. `backside` rinde tambien el interior.
   2. `background` acaba en scene.background mientras drei rinde el buffer de
      transmision (MeshTransmissionMaterial.js:349). Un COLOR PLANO es, por
      construccion, un interior plano: el vidrio no tiene nada que refractar.
      Un equirectangular del MISMO eje lila le devuelve variacion y paralaje.

   Se deja como prop y no como cambio directo porque este componente es
   COMPARTIDO: lo montan produccion (Hero.tsx), /lab/gato, /lab/hero y
   /lab/hero-e3. LOOK_PRODUCCION son los valores de hoy, asi que quien no pase
   `look` — produccion incluida — se comporta exactamente igual que antes.
   Es el mismo patron que ya usa ENCUADRE_BASE mas abajo.

   No se toca: forma, posicion, escala, ior, iridiscencia, chromaticAberration,
   roughness, samples ni resolution (los dos ultimos son el costo dominante),
   ni el eje lila del MASTER: el degradado usa los colores que ya estaban.
--------------------------------------------------------------------------- */

export type LookCristal = {
  /** camino optico dentro del vidrio: gobierna cuanta profundidad se ve */
  thickness: number;
  /** rinde las caras traseras: sin esto el icosaedro es una cascara */
  backside: boolean;
  backsideThickness: number;
  /** el buffer de atras va a la mitad: el detalle de las caras internas no lo pide */
  backsideResolution: number;
  /** cuanto pesan los lightformers del entorno en los especulares */
  envMapIntensity: number;
  /** false = color plano (produccion) · true = degradado del mismo eje lila */
  entornoDegradado: boolean;
};

/** los valores de produccion, tal cual estaban */
export const LOOK_PRODUCCION: LookCristal = {
  thickness: 0.5,
  backside: false,
  backsideThickness: 0,
  // 256 y no 128 a proposito: sin la prop, drei resuelve `backsideResolution ||
  // resolution` = 256 y reserva ESE buffer. Igualarlo es lo que hace que
  // produccion quede identica y no solo parecida.
  backsideResolution: 256,
  envMapIntensity: 1,   // el default de meshPhysicalMaterial; pasarlo no cambia nada
  entornoDegradado: false,
};

/** E3 · lectura de volumen antes del contacto (p 0.42-0.70).
 *
 *  LO QUE CUESTA, MEDIDO (1440x900, 3 repeticiones, mediana):
 *    tramo 0.40-0.70   29.2 fps  ->  23.4 fps   (-20%)
 *    tramo 0.70-0.87   31.3 fps  ->  24.5 fps   (-22%, aqui el cristal vivo aun
 *                                                 coexiste con el horneado)
 *    recorrido 0-1     36.0 fps  ->  31.3 fps   (-13%)
 *
 *  Todo el coste es `backside`, y es una pasada de render extra: bajar
 *  backsideResolution a 64 no recupero nada (23.2 fps, dentro del ruido), asi que
 *  no es cuestion de tamano de buffer y no hay forma barata de comprarlo.
 *
 *  `entornoDegradado` en cambio es gratis (una textura de 256x128 generada una
 *  vez). Solo con el, el tramo 0.40-0.70 queda en 26.8 fps — pero medido en
 *  imagen, el degradado sobre todo ACLARA el cristal y es `backside` el que le
 *  devuelve estructura interna, que era el problema.
 *
 *  SI HAY QUE ELEGIR FPS: poner `backside: false` y dejar el degradado. Es una
 *  palabra y recupera dos tercios del coste, con menos volumen.
 */
export const LOOK_VOLUMEN: LookCristal = {
  thickness: 1.15,
  backside: true,
  backsideThickness: 0.35,
  backsideResolution: 128,
  envMapIntensity: 1.8,
  entornoDegradado: true,
};

/** El mismo violeta de CRYSTAL_BG, pero con variacion: cenit lila, nadir casi
    negro y los dos acentos laterales que ya tenian los lightformers. Se genera
    una vez (256x128) y no cuesta nada por fotograma. */
