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

// Recorrido del ojo (alturas = piso + ~1.6 de estatura)
const RUTA: [number, number, number][] = [
  [2, 2.0, 34], // llegando por el jardín
  [0.5, 1.95, 14], // bajo el volumen, entre pilotis
  [0.3, 1.9, 6.9], // el vestíbulo verde a la izquierda (se mira, no se roza)
  [1.7, 2.05, 7.2], // pie de la rampa (tramo A)
  [1.7, 3.25, 1.2], // subiendo A — el ojo ya libra el muro curvo
  [2.65, 3.42, -0.5], // giro en el descanso, pegado al eje del corredor
  [2.8, 4.6, 5.4], // subiendo B
  [2.4, 5.3, 7.0], // llegada al nobile
  [-1.5, 5.4, 4.5], // entrando al salón
  [-5.5, 5.4, 0.5], // barrido junto a la cinta oeste
  [-4.0, 5.5, -5.0], // esquina: la cinta dobla
  [0.8, 5.5, -4.5], // regreso hacia la rampa alta
  [1.6, 6.4, 0.5], // subiendo C
  [2.8, 7.6, -0.4], // giro alto
  [2.8, 8.6, 5.2], // subiendo D, se abre el cielo
  [1.0, 9.0, 4.5], // desembocando al solárium
  [-3.0, 9.1, 3.8], // abriendo el ángulo hacia las dos pantallas
  [-5.8, 9.4, 2.6], // remate: las curvas en diagonal, el piso ancla el cuadro
];

// La mirada: va adelante del ojo, NIVELADA durante la subida (mirar la rampa,
// no el enredo de losas de arriba), con desvíos dirigidos en el salón y el remate
const MIRADA: [number, number, number][] = [
  [0, 3.5, 20],
  [0, 3.2, 4],
  [-2.5, 2.2, 0.5], // la curva verde del vestíbulo (ahora al oeste)
  [1.6, 2.6, 2], // pie de rampa: la pendiente por delante
  [1.6, 3.3, -4.5], // subiendo A: el descanso al fondo, a media altura
  [2.8, 3.9, 2], // giro: el tramo B por delante
  [-1.5, 4.8, 3], // subiendo B: la mirada cruza el vacío del hall
  [-3.5, 5.3, 2], // llegada al nobile: el salón ya se abre en diagonal
  [-7, 5.3, 1], // hacia la cinta oeste
  [-9.6, 5.4, -2], // pegado al vidrio: el "paisaje"
  [-2, 5.4, -9.6], // la cinta norte
  [1.7, 5.9, 2], // hacia la rampa alta
  [1.6, 6.9, -4.5], // subiendo C: nivelada al descanso
  [2.8, 7.9, 2], // giro alto: el tramo final
  [2.7, 9.0, 8], // subiendo D: se abre el cielo
  [-1.5, 8.9, 1], // el solárium por delante
  [-1.0, 8.5, -1.5], // las pantallas curvas de frente, piso a la vista
  [1.2, 8.3, -1.0], // remate: la curva grande en diagonal, anclada al suelo
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
