/*
  ⚠️ NO CONECTADO — intento fallido del 20-ago, guardado por lo que enseña.

  QUE FUNCIONA (verificado en pantalla): el mapeo por nombre es correcto —
  c1_2 aterriza en el piloti procedural, y las PROPORCIONES coinciden exactas
  (1 : 10.5 : 1 en ambos). El lightmap carga, el decodificador meshopt esta
  bien puesto, y llegaron a injertarse 143 de 152 piezas sin fallos de caja.

  QUE FALLO: el ajuste por caja envolvente DEFORMA. Escalar por eje para
  calzar cajas distintas aplasta las piezas — la villa dejo de leerse como
  casa (pilotis vueltos munones, muros como paneles tirados). Verificado con
  captura antes de revertir.

  LA CAUSA REAL, sin resolver: la geometria del GLB llega NORMALIZADA (todas
  las cajas rondan 2.0, firma de la cuantizacion de meshopt) y ni la
  geometria cruda ni aplicarle matrixWorld reconstruyen el tamano original
  (el piloti da 2.0 crudo y 0.70 con matriz; deberia dar 3.3).

  POR DONDE SEGUIR, en orden de probabilidad:
  1. Exportar SIN cuantizar (gltf-transform dedup/prune, sin meshopt). Pesa
     mas pero las posiciones quedan en unidades reales y el injerto es directo.
  2. Si eso resuelve, recien ahi evaluar si vale comprimir.
  3. Alternativa mas limpia: dejar de injertar y cargar el GLB horneado COMO
     la villa, re-atachando materiales y coreografia con villa-coreografia.json
     (que ya existe y tiene las 86 piezas con home + offsets).
*/

import * as THREE from "three";

import type { VillaBuild } from "./villaModel";

/*
  Ronda 5 — enchufar la luz horneada en Blender.

  La idea que hace esto barato: NO se reemplaza la villa procedural. Se le
  cambia a cada malla SOLO la geometría por la horneada, que es idéntica en
  forma pero trae un segundo canal UV (el lightmap). Así sobreviven intactos
  los materiales, la coreografía del desarme (userData.home/offsets), el modo
  noche y el raycaster del hover — nada de re-atacharlos a mano.

  El puente es el nombre: el exportador numera cada malla con su índice de
  recorrido (c1_27, mov45, fijo3), y acá se recorre en el MISMO orden. Es
  determinista porque buildVilla() construye siempre igual.

  El error clásico de lightmaps en three es olvidar `channel = 1`: la textura
  se lee contra el UV0 y sale todo negro o embarrado.
*/

const GLB = "/lab/villa-savoye/villa-baked.glb";
const LIGHTMAP = "/lab/villa-savoye/villa-lightmap.webp";

/** Cuánto pesa la luz horneada sobre el color base. */
const INTENSIDAD = 1.15;

export async function aplicarBake(villa: VillaBuild): Promise<boolean> {
  /*
    FOTO SINCRONICA, antes de cualquier await. Es imprescindible: los muebles
    se agregan a villa.root mientras el GLB viaja por la red, y si el recorrido
    se hace despues, los indices quedan corridos y cada geometria aterriza en
    la pieza equivocada. El exportador numero las mallas en ESTE mismo orden.
  */
  const proc: THREE.Mesh[] = [];
  villa.root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) proc.push(m);
  });
  const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/libs/meshopt_decoder.module.js"),
  ]);

  /*
    El GLB va comprimido con EXT_meshopt_compression (mismo pipeline que los
    muebles). Sin el decodificador, GLTFLoader falla y — con el catch de
    sceneSetup — el fallo era MUDO: la escena se veia igual y no se sabia
    por que. Costo un rato encontrarlo.
  */
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  const gltf = await new Promise<{ scene: THREE.Group }>((res, rej) =>
    loader.load(GLB, res as never, undefined, rej),
  );

  /*
    Indice de geometrias horneadas por numero de malla, YA EN ESPACIO MUNDO.

    Los dos detalles que costaron una pasada entera:

    1) meshopt CUANTIZA las posiciones a enteros normalizados y compensa con
       la escala del nodo. La geometria cruda no esta en las unidades de la
       escena, asi que hay que hornear matrixWorld dentro de los vertices.
    2) Blender renombra los duplicados con sufijo .001, y eso rompia la
       lectura del indice del nombre (9 mallas perdidas). Se quita antes.
  */
  gltf.scene.updateMatrixWorld(true);
  const nombresGlb: string[] = [];
  const horneadas = new Map<number, { geo: THREE.BufferGeometry; mundo: THREE.Matrix4 }>();
  gltf.scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const limpio = m.name.replace(/\.\d+$/, "");
    const n = /(\d+)$/.exec(limpio)?.[1];
    if (n === undefined || horneadas.has(Number(n))) return;
    horneadas.set(Number(n), { geo: m.geometry, mundo: m.matrixWorld.clone() });

  });

  const tex = await new THREE.TextureLoader().loadAsync(LIGHTMAP);
  tex.channel = 1; // ← EL punto. Sin esto se lee contra UV0 y sale negro.
  tex.colorSpace = THREE.LinearSRGBColorSpace;
  tex.flipY = false;

  let injertadas = 0;
  const motivos = { sinGeo: 0, sinUV1: 0, bbox: 0 };
  const muestras: Array<{ nombre: string; proc: number[]; horneada: number[] }> = [];
  villa.root.updateMatrixWorld(true);
  proc.forEach((m, i) => {
    const h = horneadas.get(i);
    if (!h) {
      motivos.sinGeo++;
      return;
    }
    if (!h.geo.attributes.uv1) {
      motivos.sinUV1++;
      return;
    }

    /*
      AJUSTE POR CAJA. three y meshopt no se ponen de acuerdo en donde vive la
      escala de la cuantizacion (la geometria cruda viene normalizada a ~2.0 y
      el factor del nodo no reconstruye el tamano original). En vez de pelear
      con la convencion se usa un hecho verificado: la pieza horneada y la
      procedural son LA MISMA FORMA — el piloti mide 1:10.5:1 en las dos. Asi
      que se escala y centra la horneada para calzar en la caja de la
      procedural. Exacto, y no depende de que version de three haya debajo.

      La guarda es la PROPORCION: si las formas no son semejantes, no es la
      misma pieza y se salta en vez de deformarla.
    */
    m.geometry.computeBoundingBox();
    const cajaProc = m.geometry.boundingBox!;
    const a = cajaProc.getSize(new THREE.Vector3());

    const aLocal = h.geo.clone();
    aLocal.computeBoundingBox();
    const cruda = aLocal.boundingBox!.getSize(new THREE.Vector3());

    const norm = (v: THREE.Vector3) => {
      const mx = Math.max(v.x, v.y, v.z) || 1;
      return new THREE.Vector3(v.x / mx, v.y / mx, v.z / mx);
    };
    if (norm(cruda).distanceTo(norm(a)) > 0.12) {
      motivos.bbox++;
      return;
    }

    const esc = new THREE.Vector3(
      cruda.x > 1e-6 ? a.x / cruda.x : 1,
      cruda.y > 1e-6 ? a.y / cruda.y : 1,
      cruda.z > 1e-6 ? a.z / cruda.z : 1,
    );
    const centroCrudo = aLocal.boundingBox!.getCenter(new THREE.Vector3());
    const centroProc = cajaProc.getCenter(new THREE.Vector3());
    aLocal.translate(-centroCrudo.x, -centroCrudo.y, -centroCrudo.z);
    aLocal.scale(esc.x, esc.y, esc.z);
    aLocal.translate(centroProc.x, centroProc.y, centroProc.z);
    aLocal.computeBoundingBox();
    const b = aLocal.boundingBox!.getSize(new THREE.Vector3());
    if (muestras.length < 5)
      muestras.push({
        nombre: m.name || `#${i}`,
        proc: [+a.x.toFixed(2), +a.y.toFixed(2), +a.z.toFixed(2)],
        horneada: [+b.x.toFixed(2), +b.y.toFixed(2), +b.z.toFixed(2)],
      });

    m.geometry.dispose();
    m.geometry = aLocal;
    const mat = m.material as THREE.MeshStandardMaterial;
    if (mat && !Array.isArray(mat)) {
      mat.lightMap = tex;
      mat.lightMapIntensity = INTENSIDAD;
      mat.needsUpdate = true;
    }
    injertadas++;
  });

  if (process.env.NODE_ENV !== "production") {
    const diag = { injertadas, procedurales: proc.length, horneadas: horneadas.size, ...motivos, muestras, nombresGlb };
    console.info("[villa] bake:", diag);
    (window as unknown as { __bake?: unknown }).__bake = diag;
  }
  return injertadas > 0;
}
