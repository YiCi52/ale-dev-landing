import * as THREE from "three";

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

// Recorrido del ojo (alturas = piso + ~1.6 de estatura) — LA PLANTA REAL:
// cruza la puerta de la vidriera al salón, rodea el estar y el comedor,
// vuelve por la MISMA puerta, sale a la TERRAZA abierta al cielo y sube la
// rampa exterior al solárium. Verificado contra check-villa-tour: 0 choques.
const RUTA: [number, number, number][] = [
  [2, 2.0, 34], // llegando por el jardín
  [0.5, 1.95, 14], // bajo el volumen, entre pilotis
  [0.3, 1.9, 6.9], // el vestíbulo verde a la izquierda (se mira, no se roza)
  [1.7, 2.05, 7.2], // pie de la rampa (tramo A)
  [1.7, 3.25, 1.2], // subiendo A — el ojo ya libra el muro curvo
  [2.65, 3.42, -0.5], // giro en el descanso, pegado al eje del corredor
  [2.8, 4.6, 5.4], // subiendo B
  [2.3, 5.3, 6.5], // llegada al nobile, frente a la vidriera
  [-0.5, 5.4, 4.9], // CRUZA la puerta de la vidriera
  [-4.0, 5.4, 3.8], // el salón se abre en diagonal
  [-7.4, 5.4, 5.8], // por el claro sur, hacia el grupo de estar
  [-9.0, 5.4, 3.0], // pegado a la cinta oeste: el paisaje
  [-5.0, 5.4, -2.6], // cruza el salón junto al comedor
  [-1.4, 5.4, 0.6], // rodea el comedor hacia la vidriera
  [0.0, 5.4, 5.2], // re-cruza la puerta
  [2.6, 5.4, 4.6], // el corredor
  [5.2, 5.4, 3.4], // ENTRA a la terraza abierta al cielo
  [7.9, 5.4, 5.9], // el fondo de la terraza, junto al estar exterior
  [5.6, 5.4, 7.8], // giro junto a las jardineras
  [1.7, 5.5, 3.3], // vuelve al pie de la rampa C
  [1.6, 6.4, 0.5], // subiendo C, ya a cielo abierto
  [2.8, 7.6, -0.4], // giro alto
  [2.8, 8.6, 5.2], // subiendo D
  [-2.2, 9.1, 3.7], // desemboca al solárium
  [-5.8, 9.4, 2.6], // remate: las curvas en diagonal
];

// La mirada: va adelante del ojo, NIVELADA en las subidas, con desvíos
// dirigidos (la puerta, el paisaje de la cinta, el estar de la terraza)
const MIRADA: [number, number, number][] = [
  [0, 3.5, 20],
  [0, 3.2, 4],
  [-2.5, 2.2, 0.5], // la curva verde del vestíbulo
  [1.6, 2.6, 2], // pie de rampa: la pendiente por delante
  [1.6, 3.3, -4.5], // subiendo A: el descanso al fondo
  [2.8, 3.9, 2], // giro: el tramo B por delante
  [0.8, 5.1, 5.6], // subiendo B: la vidriera y su puerta aparecen
  [-0.3, 5.4, 5.1], // la puerta por delante
  [-4.0, 5.3, 3.0], // el salón se abre
  [-7.8, 5.3, 1.6], // hacia el grupo de estar
  [-9.6, 5.3, 2.0], // hacia la cinta
  [-9.7, 5.3, -1.5], // pegado al vidrio: el paisaje
  [-2.2, 5.2, -1.4], // el comedor
  [0.4, 5.4, 4.6], // hacia la puerta de vuelta
  [2.6, 5.4, 4.8], // el corredor por delante
  [5.8, 5.3, 3.8], // la terraza se abre
  [8.3, 5.2, 6.0], // el estar exterior
  [5.4, 5.3, 8.8], // las jardineras contra la fachada sur
  [2.2, 5.6, 4.0], // de vuelta a la rampa
  [1.6, 6.2, -2.5], // la pendiente C por delante
  [1.6, 6.9, -4.5], // subiendo C: nivelada al descanso
  [2.8, 7.9, 2], // giro alto: el tramo final
  [2.7, 9.0, 8], // subiendo D: se abre el cielo
  [-1.6, 8.8, -0.6], // la pantalla curva grande
  [0.4, 8.3, -1.4], // remate: las curvas en diagonal
];

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
