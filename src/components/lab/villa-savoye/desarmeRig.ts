import * as THREE from "three";

import { createVillaStage } from "./sceneSetup";
import type { VillaBuild } from "./villaModel";
import type { CapaStep } from "./villaModel";
import { isNightMode } from "./nightMode";

/*
  El rig del DESARME (ronda 2b): todo lo que toca three vive aquí y el
  componente lo importa DINÁMICAMENTE al entrar en viewport — three y
  postprocessing quedan fuera del chunk inicial del route, y el contexto
  WebGL se crea/destruye con la visibilidad (nunca dos vivos de fondo).
  El componente React solo guarda el progreso y llama markDirty.
*/

export type DesarmeRig = {
  markDirty: () => void;
  dispose: () => void;
};

const VERDE = new THREE.Color(0x3f5c48);
const NEGRO = new THREE.Color(0x000000);

/** easing por paso: entra suave, se queda (el desarme es acumulativo) */
const easeStep = (p: number, step: CapaStep): number => {
  const local = THREE.MathUtils.clamp(p * 5 - (step - 1), 0, 1);
  return local * local * (3 - 2 * local); // smoothstep
};

/** arrastrar orbita, hover enciende capas (ref. Pocito/v30) */
function attachInteraccion(
  canvas: HTMLCanvasElement,
  camera: THREE.PerspectiveCamera,
  villa: VillaBuild,
  onDirty: () => void,
) {
  const orbit = { extra: 0, down: false, lastX: 0 };
  let hovered = 0;
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  canvas.style.touchAction = "pan-y"; // el scroll vertical sigue vivo en táctil
  canvas.style.cursor = "grab";
  const onDown = (e: PointerEvent) => {
    orbit.down = true;
    orbit.lastX = e.clientX;
    canvas.style.cursor = "grabbing";
    canvas.setPointerCapture(e.pointerId);
  };
  const onUp = (e: PointerEvent) => {
    orbit.down = false;
    canvas.style.cursor = hovered ? "pointer" : "grab";
    canvas.releasePointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (orbit.down) {
      orbit.extra = THREE.MathUtils.clamp(orbit.extra + (e.clientX - orbit.lastX) * 0.004, -0.9, 0.9);
      orbit.lastX = e.clientX;
      onDirty();
      return;
    }
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(villa.animated, false)[0];
    const capa = (hit?.object.userData.capa as number | undefined) ?? 0;
    if (capa !== hovered) {
      hovered = capa;
      canvas.style.cursor = capa ? "pointer" : "grab";
      onDirty();
    }
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointermove", onMove);
  return {
    getOrbit: () => orbit.extra,
    getHovered: () => hovered,
    detach: () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointermove", onMove);
    },
  };
}

export function mountDesarme(host: HTMLElement, getProgress: () => number): DesarmeRig {
  let dirty = true;
  const stage = createVillaStage(host, 34, () => {
    dirty = true;
  });
  const { renderer, scene, camera, villa } = stage;

  const ro = new ResizeObserver(() => {
    stage.resize();
    dirty = true;
  });
  ro.observe(host);

  const inter = attachInteraccion(renderer.domElement, camera, villa, () => {
    dirty = true;
  });

  if (process.env.NODE_ENV !== "production") {
    (window as unknown as { __vs?: object }).__vs = { scene, camera, renderer, villa };
  }

  const tmp = new THREE.Vector3();
  const update = () => {
    const p = getProgress();

    // coreografía de capas: home + Σ eased(paso) · delta
    for (const m of villa.animated) {
      const home = m.userData.home as THREE.Vector3;
      tmp.copy(home);
      for (const off of m.userData.offsets as { step: CapaStep; delta: THREE.Vector3 }[]) {
        tmp.addScaledVector(off.delta, easeStep(p, off.step));
      }
      m.position.copy(tmp);
    }

    // resalte verde: pulso de la capa activa del scroll + la capa bajo el cursor
    const hov = inter.getHovered();
    for (let step = 1 as CapaStep; step <= 5; step = (step + 1) as CapaStep) {
      const local = THREE.MathUtils.clamp(p * 5 - (step - 1), 0, 1);
      const pulso = Math.max(Math.sin(Math.PI * local) * 0.4, hov === step ? 0.5 : 0);
      for (const m of villa.highlights[step]) {
        const mat = m.material as THREE.MeshStandardMaterial;
        // de noche la cinta conserva su brillo cálido (lo maneja el escenario)
        if (mat === villa.materials.vidrio && isNightMode()) continue;
        mat.emissive.copy(NEGRO).lerp(VERDE, pulso);
      }
    }

    // cámara: órbita del scroll + la órbita manual del arrastre
    const ang = THREE.MathUtils.lerp(-0.62, 0.55, p) + inter.getOrbit();
    // en viewport angosto (móvil) la cámara se retira para no cortar la casa
    const ajusteAngosto = camera.aspect < 1 ? 1.45 : 1;
    const radio = THREE.MathUtils.lerp(58, 72, p * p) * ajusteAngosto;
    const altura = THREE.MathUtils.lerp(13, 26, p);
    camera.position.set(Math.sin(ang) * radio, altura, Math.cos(ang) * radio);
    camera.lookAt(0, THREE.MathUtils.lerp(5.5, 9.5, p), 0);

    stage.render();
  };

  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!dirty) return;
    dirty = false;
    update();
  };
  loop();

  return {
    markDirty: () => {
      dirty = true;
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      inter.detach();
      ro.disconnect();
      stage.dispose();
    },
  };
}
