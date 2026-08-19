import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

import type { VillaBuild } from "./villaModel";

/*
  Ronda 8 — muebles y escala humana. La casa vacía se lee como maqueta;
  con muebles se lee como casa. Poly Haven CC0 optimizados con
  gltf-transform (meshopt + WebP 1024): 4 GLBs ≈ 1.15 MB en total.
  meshopt y no Draco: el decoder son ~8 KB gzip vs ~85 KB fijos de Draco.

  Los muebles viven en el SALÓN (piano nobile, lado oeste) y llevan la
  misma coreografía que su losa: suben con la casa (paso 1) y viajan en
  el cajón de la planta libre (paso 3) — la planta se extrae de la
  carpeta CON su vida adentro. Posiciones fuera del corredor del tour
  (holgura verificada ≥1.8 respecto a la curva de la promenade).
*/

const BASE = "/lab/villa-savoye/muebles";
const Y_NOBILE = 3.625; // top de la baldosa oscura del nobile
const Y_TECHO = 6.925; // top de la baldosa de la terraza-jardín
const Y_SUELO = 0.12; // top de la plataforma de concreto
// espejo de villaModel: LIFT del paso 1, DRAWER del paso 3, ROOF del paso 2
const OFFSETS_NOBILE = [
  { step: 1, delta: new THREE.Vector3(0, 2.6, 0) },
  { step: 3, delta: new THREE.Vector3(16, 0, 0) },
];
const OFFSETS_TECHO = [
  { step: 1, delta: new THREE.Vector3(0, 2.6, 0) },
  { step: 2, delta: new THREE.Vector3(0, 6.5, 0) },
];
const SIN_OFFSETS: { step: number; delta: THREE.Vector3 }[] = [];

type Pieza = { archivo: string; x: number; y: number; z: number; rotY: number; offsets: typeof OFFSETS_NOBILE };
const PIEZAS: Pieza[] = [
  // ── salón (nobile): dos lounge de espaldas a la cinta oeste + centro
  { archivo: "mid_century_lounge_chair", x: -8.3, y: Y_NOBILE, z: 1.2, rotY: Math.PI / 2, offsets: OFFSETS_NOBILE },
  { archivo: "mid_century_lounge_chair", x: -8.3, y: Y_NOBILE, z: -1.4, rotY: Math.PI / 2, offsets: OFFSETS_NOBILE },
  { archivo: "modern_coffee_table_01", x: -6.9, y: Y_NOBILE, z: -0.1, rotY: 0, offsets: OFFSETS_NOBILE },
  { archivo: "modern_arm_chair_01", x: -6.2, y: Y_NOBILE, z: 2.4, rotY: -Math.PI * 0.78, offsets: OFFSETS_NOBILE },
  { archivo: "potted_plant_04", x: -8.8, y: Y_NOBILE, z: -6.5, rotY: 0.4, offsets: OFFSETS_NOBILE },
  // ── comedor junto a la cinta norte
  { archivo: "dining_table", x: -4.5, y: Y_NOBILE, z: -7.6, rotY: Math.PI / 2, offsets: OFFSETS_NOBILE },
  { archivo: "dining_chair_02", x: -3.5, y: Y_NOBILE, z: -7.0, rotY: -Math.PI * 0.65, offsets: OFFSETS_NOBILE },
  { archivo: "dining_chair_02", x: -5.5, y: Y_NOBILE, z: -7.0, rotY: Math.PI * 0.65, offsets: OFFSETS_NOBILE },
  { archivo: "dining_chair_02", x: -4.5, y: Y_NOBILE, z: -8.7, rotY: 0, offsets: OFFSETS_NOBILE },
  // ── toit-jardin (viaja con el techo en el paso 2): jardineras + estar
  { archivo: "planter_box_02", x: -7.5, y: Y_TECHO, z: 8.6, rotY: 0, offsets: OFFSETS_TECHO },
  { archivo: "planter_box_02", x: -3.5, y: Y_TECHO, z: 8.6, rotY: 0, offsets: OFFSETS_TECHO },
  { archivo: "outdoor_table_chair_set_01", x: 6.5, y: Y_TECHO, z: 5.0, rotY: 0.6, offsets: OFFSETS_TECHO },
  // ── planta baja: una maceta en la explanada, cerca del vestíbulo
  { archivo: "potted_plant_04", x: -7.0, y: Y_SUELO, z: 6.0, rotY: 2.1, offsets: SIN_OFFSETS },
];

export type Muebles = { dispose: () => void };

/** carga y coloca los muebles; llama onListo SIEMPRE (también en error) */
export function cargarMuebles(villa: VillaBuild, onListo: () => void): Muebles {
  let disposed = false;
  const grupos: THREE.Group[] = [];

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  const soltarRecursos = (g: THREE.Object3D) => {
    g.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          const std = m as THREE.MeshStandardMaterial;
          std.map?.dispose();
          std.normalMap?.dispose();
          std.roughnessMap?.dispose();
          std.metalnessMap?.dispose();
          std.aoMap?.dispose();
          m.dispose();
        }
      }
    });
  };

  const cargas = PIEZAS.map(
    (pieza) =>
      new Promise<void>((resolve) => {
        loader.load(
          `${BASE}/${pieza.archivo}.glb`,
          (gltf) => {
            if (disposed) {
              soltarRecursos(gltf.scene);
              resolve();
              return;
            }
            const g = gltf.scene;
            g.position.set(pieza.x, pieza.y, pieza.z);
            g.rotation.y = pieza.rotY;
            g.userData.home = new THREE.Vector3(pieza.x, pieza.y, pieza.z);
            g.userData.offsets = pieza.offsets;
            g.traverse((o) => {
              if (o instanceof THREE.Mesh) {
                o.castShadow = true;
                o.receiveShadow = true;
              }
            });
            villa.root.add(g);
            villa.animated.push(g);
            grupos.push(g);
            resolve();
          },
          undefined,
          () => resolve(), // fail-open: un mueble caído no bloquea el revelado
        );
      }),
  );
  void Promise.all(cargas).then(onListo);

  return {
    dispose: () => {
      disposed = true;
      for (const g of grupos) {
        villa.root.remove(g);
        const i = villa.animated.indexOf(g);
        if (i >= 0) villa.animated.splice(i, 1);
        soltarRecursos(g);
      }
    },
  };
}
