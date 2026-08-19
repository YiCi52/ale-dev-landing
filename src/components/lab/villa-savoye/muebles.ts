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
const Y_PISO = 3.6; // yLosaPiso + media losa (espejo de villaModel)
// espejo de villaModel: LIFT del paso 1 y DRAWER del paso 3
const OFFSETS_NOBILE = [
  { step: 1, delta: new THREE.Vector3(0, 2.6, 0) },
  { step: 3, delta: new THREE.Vector3(16, 0, 0) },
];

type Pieza = { archivo: string; x: number; z: number; rotY: number };
const PIEZAS: Pieza[] = [
  // dos lounge de espaldas a la cinta oeste, mirando al centro
  { archivo: "mid_century_lounge_chair", x: -8.3, z: 1.2, rotY: Math.PI / 2 },
  { archivo: "mid_century_lounge_chair", x: -8.3, z: -1.4, rotY: Math.PI / 2 },
  { archivo: "modern_coffee_table_01", x: -6.9, z: -0.1, rotY: 0 },
  { archivo: "modern_arm_chair_01", x: -6.2, z: 2.4, rotY: -Math.PI * 0.78 },
  // el comedor, junto a la cinta norte
  { archivo: "dining_table", x: -4.5, z: -7.6, rotY: Math.PI / 2 },
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
            g.position.set(pieza.x, Y_PISO, pieza.z);
            g.rotation.y = pieza.rotY;
            g.userData.home = new THREE.Vector3(pieza.x, Y_PISO, pieza.z);
            g.userData.offsets = OFFSETS_NOBILE;
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
