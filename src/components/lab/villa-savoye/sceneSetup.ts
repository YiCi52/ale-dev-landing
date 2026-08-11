import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { buildVilla } from "./villaModel";
import type { VillaBuild } from "./villaModel";

/*
  Bootstrap compartido de las DOS escenas del lab (desarme y promenade):
  renderer + luces + sombras + entorno de reflejos + niebla + el modelo.
  Reglas v10: DPR capeado por ÁREA de pantalla; render on demand lo maneja
  cada componente (aquí solo se arma el escenario).
*/

export type VillaStage = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  villa: VillaBuild;
  resize: () => void;
  dispose: () => void;
};

export function createVillaStage(host: HTMLElement, fov = 34): VillaStage {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const small = window.innerWidth < 1024;
  renderer.setPixelRatio(small ? Math.min(window.devicePixelRatio, 2) : Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  // sombras suaves: el salto de realismo más barato que existe
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  // niebla al tono del papel: da profundidad atmosférica sin tocar el fondo CSS
  scene.fog = new THREE.Fog(0xf4f3ec, 95, 210);

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.4, 260);

  // reflejos de entorno (RoomEnvironment de three, sin HDRI externo):
  // el vidrio cobra vida y el blanco gana ese brillo de maqueta lacada
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.55;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xdcd8cd, 0.75));
  const sol = new THREE.DirectionalLight(0xfff4e4, 2.2);
  sol.position.set(26, 34, 16);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  sol.shadow.camera.left = -34;
  sol.shadow.camera.right = 34;
  sol.shadow.camera.top = 34;
  sol.shadow.camera.bottom = -34;
  sol.shadow.camera.far = 120;
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.02;
  scene.add(sol);
  const contra = new THREE.DirectionalLight(0xe8ecf2, 0.35);
  contra.position.set(-18, 12, -20);
  scene.add(contra);

  const villa = buildVilla();
  scene.add(villa.root);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  const dispose = () => {
    villa.dispose();
    envTex.dispose();
    pmrem.dispose();
    renderer.dispose();
    if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
  };

  return { renderer, scene, camera, villa, resize, dispose };
}
