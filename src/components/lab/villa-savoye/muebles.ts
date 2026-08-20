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
// Amoblado por HABITACIÓN sobre la planta real, minimalista (un objeto por
// superficie). El salón vive al oeste de la vidriera; la terraza abierta al
// cielo recibe el estar exterior y las jardineras — como en la casa real.
/*
  PURGA DE TIPOLOGÍA (20-ago). Alejandro, viendo el render: "objetos genéricos
  como esa maceta horrible de madera en vez de hacerlo fiel". Tenía razón y el
  análisis por ambientes ya lo había medido:

  · planter_box_02 (×4) — cajones de huerta de madera envejecida, de una
    colección de galpón. En una casa de Le Corbusier las jardineras son de
    HORMIGÓN BLANCO EMPOTRADO (verificado en las fotos del jardín suspendido).
  · potted_plant_04 (×3) — mide 17 × 27 cm REALES. Es una macetita de
    escritorio suelta en un salón de 14 × 6 m: no lee como planta, lee como
    basura fuera de escala. Es lo que se veía "flotando".
  · dining_table + dining_chair_02 (×3) — la mesa trae un MANTEL A CUADROS en
    una sola malla texturizada, imposible de quitar, y las sillas son de cuero
    capitoneado. Nada que ver con esta casa.
  · outdoor_table_chair_set_01 — además de ajeno, la cámara lo atravesaba con
    holgura NEGATIVA de −0.89 m.
  · brass_vase_02 — la cámara le pasaba por el centro (holgura 0.00).
  · modern_coffee_table_01 — redundante con la 02, que es la cuadrada.

  Lo que queda es lo defendible mientras conseguimos las piezas reales: LC2 y
  LC4 de Le Corbusier/Perriand, que son las que muestran las fotos. Prefiero
  un salón con tres piezas correctas que uno lleno de objetos de catálogo.
*/
const PIEZAS: Pieza[] = [
  // ── SALÓN · grupo de estar contra la cinta oeste
  { archivo: "mid_century_lounge_chair", x: -8.3, y: Y_NOBILE, z: 1.2, rotY: Math.PI / 2, offsets: OFFSETS_NOBILE },
  { archivo: "mid_century_lounge_chair", x: -8.3, y: Y_NOBILE, z: -1.4, rotY: Math.PI / 2, offsets: OFFSETS_NOBILE },
  { archivo: "wooden_bowl_01", x: -6.7, y: Y_NOBILE + 0.45, z: -0.45, rotY: 0.7, offsets: OFFSETS_NOBILE },
  { archivo: "modern_arm_chair_01", x: -6.2, y: Y_NOBILE, z: 2.4, rotY: -Math.PI * 0.78, offsets: OFFSETS_NOBILE },
  { archivo: "modern_coffee_table_02", x: -5.6, y: Y_NOBILE, z: 3.35, rotY: 0.4, offsets: OFFSETS_NOBILE },
  // ── SALÓN · comedor al noreste, junto a la puerta de la franja norte
  { archivo: "ceramic_vase_01", x: -2.4, y: Y_NOBILE + 0.75, z: -1.6, rotY: 0, offsets: OFFSETS_NOBILE },
  // ── TERRAZA (abierta al cielo, misma losa del nobile: viaja en el cajón)
  // ── TOIT-JARDIN: jardinera + verde junto al solárium
  // ── PLANTA BAJA: una maceta en la explanada
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
