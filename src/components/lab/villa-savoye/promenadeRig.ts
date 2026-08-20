import * as THREE from "three";

import { MIRADA, RUTA } from "./ruta";
import { createVillaStage } from "./sceneSetup";

/*
  El rig de la PROMENADE (ronda 2b): cámara sobre Catmull-Rom dirigida por
  scroll. Como el rig del desarme, se importa dinámicamente al entrar en
  viewport — three fuera del chunk inicial, un solo contexto WebGL vivo.
*/

export type PromenadeRig = {
  markDirty: () => void;
  dispose: () => void;
};

export function mountPromenade(host: HTMLElement, getProgress: () => number): PromenadeRig {
  let dirty = true;
  const stage = createVillaStage(host, 58, () => {
    dirty = true;
  }); // FOV amplio: interior
  const { camera } = stage;

  // 'centripetal': la curva NO se sale del pasillo entre waypoints —
  // el overshoot de la catmull uniforme era lo que atravesaba muros
  const rutaCurve = new THREE.CatmullRomCurve3(RUTA.map((p) => new THREE.Vector3(...p)), false, "centripetal");
  const miradaCurve = new THREE.CatmullRomCurve3(MIRADA.map((p) => new THREE.Vector3(...p)), false, "centripetal");

  const eye = new THREE.Vector3();
  const target = new THREE.Vector3();
  const update = () => {
    // getPoint (parámetro uniforme), NO getPointAt (longitud de arco):
    // ambas curvas tienen 18 puntos pareados — con arc-length se
    // desincronizan y la mirada queda apuntando a cualquier muro
    const progress = getProgress();
    rutaCurve.getPoint(Math.min(progress, 0.999), eye);
    miradaCurve.getPoint(Math.min(progress, 0.999), target);
    camera.position.copy(eye);
    camera.lookAt(target);
    stage.render();
  };

  const ro = new ResizeObserver(() => {
    stage.resize();
    dirty = true;
  });
  ro.observe(host);

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
      ro.disconnect();
      stage.dispose();
    },
  };
}
