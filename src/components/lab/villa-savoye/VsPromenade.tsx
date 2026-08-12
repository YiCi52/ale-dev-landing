"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

import { createVillaStage } from "./sceneSetup";
import { VsToggleNoche } from "./VsToggleNoche";

/*
  LA PROMENADE ARCHITECTURALE — el tour interior. Le Corbusier diseñó la
  Savoye para recorrerse en pendiente continua: aquí el scroll ES la rampa.
  Cámara sobre una Catmull-Rom que entra bajo los pilotis, cruza el vestíbulo
  verde, sube los dos tramos, barre el salón junto a la cinta de vidrio y
  desemboca en el solárium. La mirada (lookAt) viaja por su propia curva con
  paradas dirigidas (la cinta, las curvas del techo).
  El modelo es el MISMO del desarme, ensamblado (progreso 0 = home).
*/

const PARADAS = [
  {
    n: "I",
    titulo: "El umbral",
    texto: "Se llega por debajo de la casa. El vestíbulo curvo de vidrio verde recibe entre los pilotis — la puerta está donde llega el auto.",
  },
  {
    n: "II",
    titulo: "La rampa",
    texto: "Nada de escaleras como protagonista: una pendiente suave que se sube caminando sin pensar. La casa se revela en movimiento, no en fotos.",
  },
  {
    n: "III",
    titulo: "El salón y la cinta",
    texto: "Arriba, la ventana corrida hace lo prometido: la luz entra pareja y el paisaje de Poissy se vuelve un panorama continuo.",
  },
  {
    n: "IV",
    titulo: "El solárium",
    texto: "La promenade termina en el cielo: las pantallas curvas enmarcan el sol. El techo devuelve el jardín que la casa tomó prestado.",
  },
];

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

export function VsPromenade() {
  const wrapRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const host = hostRef.current;
    const cards = cardsRef.current;
    if (!wrap || !host) return;

    let dirty = true;
    const stage = createVillaStage(host, 58, () => {
      dirty = true;
    }); // FOV amplio: interior
    const { renderer, camera } = stage;

    // 'centripetal': la curva NO se sale del pasillo entre waypoints —
    // el overshoot de la catmull uniforme era lo que atravesaba muros
    const rutaCurve = new THREE.CatmullRomCurve3(RUTA.map((p) => new THREE.Vector3(...p)), false, "centripetal");
    const miradaCurve = new THREE.CatmullRomCurve3(MIRADA.map((p) => new THREE.Vector3(...p)), false, "centripetal");
    let progress = reduced ? 0.62 : 0; // estático: parada del salón

    const eye = new THREE.Vector3();
    const target = new THREE.Vector3();
    const update = () => {
      // getPoint (parámetro uniforme), NO getPointAt (longitud de arco):
      // ambas curvas tienen 18 puntos pareados — con arc-length se
      // desincronizan y la mirada queda apuntando a cualquier muro
      rutaCurve.getPoint(Math.min(progress, 0.999), eye);
      miradaCurve.getPoint(Math.min(progress, 0.999), target);
      camera.position.copy(eye);
      camera.lookAt(target);
      renderer.render(stage.scene, camera);
    };

    const onResize = () => {
      stage.resize();
      dirty = true;
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(host);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!dirty) return;
      dirty = false;
      update();
    };
    loop();

    let st: ScrollTrigger | undefined;
    if (!reduced && cards) {
      gsap.registerPlugin(ScrollTrigger);
      const fichas = Array.from(cards.querySelectorAll<HTMLElement>(".vs-punto"));
      const contador = wrap.querySelector<HTMLElement>(".vs-hud b");
      st = ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "+=380%",
        pin: true,
        scrub: 0.7,
        onUpdate: (self) => {
          progress = self.progress;
          dirty = true;
          fichas.forEach((el, i) => {
            const a = i / 4;
            const b = (i + 1) / 4;
            const enter = gsap.utils.clamp(0, 1, (progress - a) / 0.03);
            const exit = i === 3 ? 1 : gsap.utils.clamp(0, 1, (b - progress) / 0.03);
            const o = Math.min(enter, exit);
            gsap.set(el, { opacity: o, y: (1 - enter) * 22 });
          });
          if (contador) contador.textContent = ["I", "II", "III", "IV"][Math.min(3, Math.floor(progress * 4))];
        },
      });
      if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => {
      st?.kill();
      cancelAnimationFrame(raf);
      ro.disconnect();
      stage.dispose();
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section ref={wrapRef} className="vs-desarme vs-desarme--static" aria-labelledby="vs-prom-titulo">
        <h2 id="vs-prom-titulo" className="vs-eyebrow">
          La promenade, por dentro
        </h2>
        <div ref={hostRef} className="vs-scene" aria-hidden="true" />
        <div className="vs-static-list">
          {PARADAS.map((p) => (
            <article key={p.n} className="vs-punto vs-punto--static">
              <span className="vs-punto-n">{p.n}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={wrapRef} className="vs-desarme vs-promenade" aria-labelledby="vs-prom-titulo">
      <h2 id="vs-prom-titulo" className="vs-visually-hidden">
        La promenade architecturale: el recorrido interior de la casa
      </h2>
      <div ref={hostRef} className="vs-scene" aria-hidden="true" />
      <div className="vs-hud">
        <VsToggleNoche />
        <span aria-hidden="true">
          <b>I</b>
          <i>/ IV</i>
        </span>
      </div>
      <div ref={cardsRef} className="vs-fichas">
        {PARADAS.map((p) => (
          <article key={p.n} className="vs-punto">
            <span className="vs-punto-n">{p.n}</span>
            <h3>{p.titulo}</h3>
            <p>{p.texto}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
