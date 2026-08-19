import * as THREE from "three";

import type { VillaBuild } from "./villaModel";

/*
  Sombra de contacto (ronda 4): la casa "aterriza" sobre el pasto. Silueta
  cenital de la casa a un render target chico → desenfoque en canvas 2D →
  plano transparente bajo la casa. Se hornea UNA sola vez en el revelado
  (pose home): el cajón del desarme se mueve sin arrastrarla, y de eso se
  encarga la sombra PCF dinámica. Costo en runtime: un plano con textura.

  OJO G-45: nada de MultiplyBlending; el plano usa blending normal con RGB
  negro (inmune al premultiplicado del canvas: 0×alfa = 0).
*/

const CAPA_SILUETA = 1;
const RT_SIZE = 256;
const EXTENT = 17; // la ortográfica cubre ±17 — la huella de la casa es ±10

export type ContactShadow = {
  mesh: THREE.Mesh;
  dispose: () => void;
};

/** hornea la silueta y devuelve el plano ya agregado a la escena */
export function bakeContactShadow(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  villa: VillaBuild,
): ContactShadow | null {
  // solo la casa entra en la silueta (la pradera vive en villa.root pero
  // no está en `animated`)
  villa.animated.forEach((m) => m.layers.enable(CAPA_SILUETA));

  const orto = new THREE.OrthographicCamera(-EXTENT, EXTENT, EXTENT, -EXTENT, 0.1, 60);
  orto.position.set(0, 40, 0);
  orto.lookAt(0, 0, 0);
  orto.layers.set(CAPA_SILUETA);

  const rt = new THREE.WebGLRenderTarget(RT_SIZE, RT_SIZE);
  const negro = new THREE.MeshBasicMaterial({ color: 0x000000 });

  // silueta: casa negra sobre blanco, sin fondo ni override permanente
  const bgAntes = scene.background;
  const overrideAntes = scene.overrideMaterial;
  const clearAntes = new THREE.Color();
  renderer.getClearColor(clearAntes);
  const clearAlphaAntes = renderer.getClearAlpha();
  scene.background = null;
  scene.overrideMaterial = negro;
  renderer.setRenderTarget(rt);
  renderer.setClearColor(0xffffff, 1);
  renderer.clear();
  renderer.render(scene, orto);
  renderer.setRenderTarget(null);
  renderer.setClearColor(clearAntes, clearAlphaAntes);
  scene.background = bgAntes;
  scene.overrideMaterial = overrideAntes;

  const px = new Uint8Array(RT_SIZE * RT_SIZE * 4);
  renderer.readRenderTargetPixels(rt, 0, 0, RT_SIZE, RT_SIZE, px);
  rt.dispose();
  negro.dispose();

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = RT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const img = ctx.createImageData(RT_SIZE, RT_SIZE);
  for (let y = 0; y < RT_SIZE; y++) {
    // readPixels devuelve las filas de abajo hacia arriba: voltear
    const src = (RT_SIZE - 1 - y) * RT_SIZE;
    for (let x = 0; x < RT_SIZE; x++) {
      const o = (y * RT_SIZE + x) * 4;
      img.data[o] = 255 - px[(src + x) * 4]; // silueta → blanco = sombra
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  // el desenfoque lo hace el canvas (una vez, CPU): dos pasadas apiladas
  ctx.filter = "blur(7px)";
  ctx.drawImage(canvas, 0, 0);
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = "none";

  // alfa final: intensidad de sombra × viñeta radial (el borde del plano
  // jamás se marca sobre el pasto)
  const blurred = ctx.getImageData(0, 0, RT_SIZE, RT_SIZE);
  const salida = ctx.createImageData(RT_SIZE, RT_SIZE);
  const C = RT_SIZE / 2;
  for (let i = 0; i < RT_SIZE * RT_SIZE; i++) {
    const x = (i % RT_SIZE) - C;
    const y = Math.floor(i / RT_SIZE) - C;
    const d = Math.sqrt(x * x + y * y) / C;
    const vineta = THREE.MathUtils.clamp((1 - d) / 0.25, 0, 1);
    salida.data[i * 4 + 3] = Math.round((blurred.data[i * 4] / 255) * 0.42 * vineta * 255);
  }
  ctx.putImageData(salida, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(EXTENT * 2, EXTENT * 2),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, color: 0x000000 }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.14; // sobre la plataforma de concreto (top 0.12)
  scene.add(mesh);

  return {
    mesh,
    dispose: () => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.MeshBasicMaterial).dispose();
      tex.dispose();
    },
  };
}
