import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

import { buildVilla } from "./villaModel";
import type { VillaBuild } from "./villaModel";
import { isNightMode, onNightMode } from "./nightMode";

/*
  Bootstrap compartido de las DOS escenas del lab (desarme y promenade).
  Atmósfera fotográfica sin servicios pagos: cielo HDRI real de Poly Haven
  (CC0) como fondo E iluminación (PMREM), pasto fotográfico en la pradera,
  sombras suaves. Modo noche: mismo cielo atenuado, sol lunar frío y la
  cinta de vidrio emitiendo cálido — la casa como lámpara (ref. Pocito/v30).
*/

const SKY_URL = "/lab/villa-savoye/sky_2k.hdr";
const GRASS_URL = "/lab/villa-savoye/grass_diff_1k.jpg";

export type VillaStage = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  villa: VillaBuild;
  resize: () => void;
  dispose: () => void;
};

export function createVillaStage(host: HTMLElement, fov = 34, onDirty?: () => void): VillaStage {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const small = window.innerWidth < 1024;
  renderer.setPixelRatio(small ? Math.min(window.devicePixelRatio, 2) : Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.15, 320);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xdcd8cd, 0.55);
  scene.add(hemi);
  const sol = new THREE.DirectionalLight(0xfff4e4, 2.4);
  sol.position.set(26, 34, 16);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  sol.shadow.camera.left = -34;
  sol.shadow.camera.right = 34;
  sol.shadow.camera.top = 34;
  sol.shadow.camera.bottom = -34;
  sol.shadow.camera.far = 130;
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.02;
  scene.add(sol);

  const villa = buildVilla();
  scene.add(villa.root);

  // ── Cielo HDRI: fondo + iluminación de una sola fuente ──────────────────
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envTex: THREE.Texture | null = null;
  let skyTex: THREE.DataTexture | null = null;
  new RGBELoader().load(SKY_URL, (hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    skyTex = hdr;
    envTex = pmrem.fromEquirectangular(hdr).texture;
    scene.background = hdr;
    scene.environment = envTex;
    aplicarModo(isNightMode());
    onDirty?.();
  });

  // pasto fotográfico sobre la pradera (reemplaza el moteado procedural)
  new THREE.TextureLoader().load(GRASS_URL, (tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(26, 26);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    villa.materials.suelo.map = tex;
    villa.materials.suelo.color.set(0xa9c08c); // tinte verde pradera
    villa.materials.suelo.needsUpdate = true;
    onDirty?.();
  });

  // ── Día / noche ─────────────────────────────────────────────────────────
  const aplicarModo = (night: boolean) => {
    if (night) {
      renderer.toneMappingExposure = 0.9;
      scene.backgroundIntensity = 0.055;
      scene.environmentIntensity = 0.12;
      sol.color.set(0x9db4e0); // luna
      sol.intensity = 0.5;
      hemi.intensity = 0.1;
      // la casa se vuelve lámpara: la cinta emite cálido desde adentro
      villa.materials.vidrio.emissive.set(0xffb163);
      villa.materials.vidrio.emissiveIntensity = 1.15;
      villa.materials.vidrio.opacity = 0.85;
      scene.fog = null;
    } else {
      renderer.toneMappingExposure = 1.05;
      scene.backgroundIntensity = 1;
      scene.environmentIntensity = 0.85;
      sol.color.set(0xfff4e4);
      sol.intensity = 2.4;
      hemi.intensity = 0.55;
      villa.materials.vidrio.emissive.set(0x000000);
      villa.materials.vidrio.emissiveIntensity = 1;
      villa.materials.vidrio.opacity = 0.42;
      scene.fog = null;
    }
    onDirty?.();
  };
  aplicarModo(isNightMode());
  const offNight = onNightMode(aplicarModo);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  const dispose = () => {
    offNight();
    villa.dispose();
    envTex?.dispose();
    skyTex?.dispose();
    pmrem.dispose();
    renderer.dispose();
    if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
  };

  return { renderer, scene, camera, villa, resize, dispose };
}
