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
const ARBOLES_URL = "/lab/villa-savoye/arboles.jpg"; // plate Higgsfield: álamos de Poissy

/** banda de horizonte: al plate se le funde el cielo (arriba) y el pasto
    (abajo) con un degradado alfa en canvas, para que cosa con el HDRI */
function makeHorizonTexture(img: HTMLImageElement): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = "destination-out";
  const arriba = ctx.createLinearGradient(0, 0, 0, c.height * 0.42);
  arriba.addColorStop(0, "rgba(0,0,0,1)");
  arriba.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = arriba;
  ctx.fillRect(0, 0, c.width, c.height * 0.42);
  const abajo = ctx.createLinearGradient(0, c.height * 0.62, 0, c.height);
  abajo.addColorStop(0, "rgba(0,0,0,0)");
  abajo.addColorStop(1, "rgba(0,0,0,1)");
  ctx.fillStyle = abajo;
  ctx.fillRect(0, c.height * 0.62, c.width, c.height * 0.38);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.MirroredRepeatWrapping; // espejo: sin costuras al dar la vuelta
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export type VillaStage = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  villa: VillaBuild;
  resize: () => void;
  dispose: () => void;
};

export function createVillaStage(host: HTMLElement, fov = 34, onDirty?: () => void): VillaStage {
  // sin alpha: el fondo siempre lo pinta el HDRI, el canal alfa solo costaba blending
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const small = window.innerWidth < 1024;
  // El aparato DÉBIL recibe MENOS píxeles: 1.25 en móvil, 1.5 en desktop.
  // Antes estaba invertido (2 en móvil) — 2.6x de carga al hardware más lento.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  // PCF duro a propósito: PCFSoftShadowMap está deprecado (r182) y caía a PCF
  // en silencio. La suavidad de verdad llega con el AO horneado de la Ronda 5.
  renderer.shadowMap.type = THREE.PCFShadowMap;
  host.appendChild(renderer.domElement);

  // Pérdida de contexto WebGL (pestaña al fondo, GPU reset): sin el
  // preventDefault el canvas queda negro para siempre; con él, el navegador
  // restaura y el onDirty repinta.
  let disposed = false;
  const canvas = renderer.domElement;
  const onContextLost = (e: Event) => e.preventDefault();
  const onContextRestored = () => onDirty?.();
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

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
    // la carga es async: si el stage ya se desmontó, soltar el HDR y salir
    if (disposed) {
      hdr.dispose();
      return;
    }
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    skyTex = hdr;
    envTex = pmrem.fromEquirectangular(hdr).texture;
    scene.background = hdr;
    scene.environment = envTex;
    aplicarMezcla();
    onDirty?.();
  });

  // ── Anillo de horizonte: la fila de álamos (Higgsfield) rodea la pradera ──
  let matArboles: THREE.MeshBasicMaterial | null = null;
  let ringMesh: THREE.Mesh | null = null;
  {
    const img = new Image();
    img.onload = () => {
      if (disposed) return;
      const tex = makeHorizonTexture(img);
      tex.repeat.set(4, 1); // 4 vueltas espejadas alrededor del anillo
      matArboles = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.BackSide, // se ve desde adentro
        depthWrite: false,
      });
      const alto = 26; // proporción del plate a radio 80
      ringMesh = new THREE.Mesh(new THREE.CylinderGeometry(80, 80, alto, 72, 1, true), matArboles);
      ringMesh.position.y = alto * 0.5 - 9.5; // la línea de árboles cae en el horizonte
      ringMesh.renderOrder = -1;
      scene.add(ringMesh);
      onDirty?.();
    };
    img.src = ARBOLES_URL;
  }

  // pasto fotográfico sobre la pradera (reemplaza el moteado procedural)
  let grassTex: THREE.Texture | null = null;
  new THREE.TextureLoader().load(GRASS_URL, (tex) => {
    if (disposed) {
      tex.dispose();
      return;
    }
    grassTex = tex;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(26, 26);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    villa.materials.suelo.map = tex;
    villa.materials.suelo.color.set(0xa9c08c); // tinte verde pradera
    villa.materials.suelo.needsUpdate = true;
    onDirty?.();
  });

  // ── Día / noche: atardecer continuo, no switch ──────────────────────────
  // Un solo factor t (0=día, 1=noche) interpola exposición, cielo, sol y la
  // cinta encendiéndose — el tween de GSAP lo lleva en ~2s con easing suave.
  const DIA = { exp: 1.05, bg: 1, env: 0.85, solC: new THREE.Color(0xfff4e4), solI: 2.4, hemiI: 0.55, emC: new THREE.Color(0x000000), emI: 0, op: 0.42 };
  const NOCHE = { exp: 0.9, bg: 0.055, env: 0.12, solC: new THREE.Color(0x9db4e0), solI: 0.5, hemiI: 0.1, emC: new THREE.Color(0xffb163), emI: 1.15, op: 0.85 };
  const OCASO = new THREE.Color(0xff9e5e); // el sol pasa por naranja a mitad de camino
  const BLANCO = new THREE.Color(0xffffff);
  const NOCHE_ARBOLES = new THREE.Color(0x1c2333);
  const mezcla = { t: isNightMode() ? 1 : 0 };
  const tmpC = new THREE.Color();
  const aplicarMezcla = () => {
    const t = mezcla.t;
    const L = THREE.MathUtils.lerp;
    renderer.toneMappingExposure = L(DIA.exp, NOCHE.exp, t);
    scene.backgroundIntensity = L(DIA.bg, NOCHE.bg, t);
    scene.environmentIntensity = L(DIA.env, NOCHE.env, t);
    // el color del sol viaja día → ocaso → luna (curva por el naranja)
    if (t < 0.5) tmpC.lerpColors(DIA.solC, OCASO, t * 2);
    else tmpC.lerpColors(OCASO, NOCHE.solC, (t - 0.5) * 2);
    sol.color.copy(tmpC);
    sol.intensity = L(DIA.solI, NOCHE.solI, t);
    hemi.intensity = L(DIA.hemiI, NOCHE.hemiI, t);
    const v = villa.materials.vidrio;
    v.emissive.lerpColors(DIA.emC, NOCHE.emC, t);
    // la cinta se enciende tarde (t>0.55): primero oscurece, luego la lámpara
    v.emissiveIntensity = NOCHE.emI * THREE.MathUtils.smoothstep(t, 0.55, 1);
    v.opacity = L(DIA.op, NOCHE.op, t);
    // el anillo de álamos también anochece (material sin luz: se tinta a mano)
    if (matArboles) matArboles.color.lerpColors(BLANCO, NOCHE_ARBOLES, t);
    onDirty?.();
  };
  aplicarMezcla();
  let tweenRaf = 0;
  const offNight = onNightMode((night) => {
    // tween manual con rAF (sin depender de gsap acá): ~2s ease in-out
    cancelAnimationFrame(tweenRaf);
    const desde = mezcla.t;
    const hasta = night ? 1 : 0;
    const t0 = performance.now();
    const DUR = 2000;
    const paso = (now: number) => {
      const k = Math.min(1, (now - t0) / DUR);
      const e = k * k * (3 - 2 * k); // smoothstep
      mezcla.t = desde + (hasta - desde) * e;
      aplicarMezcla();
      if (k < 1) tweenRaf = requestAnimationFrame(paso);
    };
    tweenRaf = requestAnimationFrame(paso);
  });

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  const dispose = () => {
    disposed = true;
    cancelAnimationFrame(tweenRaf);
    offNight();
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", onContextRestored);
    villa.dispose();
    // el anillo y las texturas cargadas async no son de la villa: se sueltan acá
    if (ringMesh) {
      scene.remove(ringMesh);
      ringMesh.geometry.dispose();
    }
    matArboles?.map?.dispose();
    matArboles?.dispose();
    grassTex?.dispose();
    envTex?.dispose();
    skyTex?.dispose();
    pmrem.dispose();
    renderer.dispose();
    if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
  };

  return { renderer, scene, camera, villa, resize, dispose };
}
