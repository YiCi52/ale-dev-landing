"use client";

import { useEffect, useImperativeHandle, useRef } from "react";
import type { Ref } from "react";
import * as THREE from "three";

import { createVillaStage } from "./sceneSetup";
import type { CapaStep } from "./villaModel";

/*
  Escena del DESARME. No sabe de scroll: expone setProgress(0..1) y
  VsDesarme la alimenta desde ScrollTrigger. Render on demand: solo pinta
  cuando el progreso cambió (scroll parado = GPU dormida).
*/

export type VsSceneHandle = {
  setProgress: (p: number) => void;
};

type Props = {
  ref?: Ref<VsSceneHandle>;
  /** true ⇒ arranca en axonometría explotada estática (reduced motion) */
  isStatic?: boolean;
};

const VERDE = new THREE.Color(0x3f5c48);
const NEGRO = new THREE.Color(0x000000);

/** easing por paso: entra suave, se queda (el desarme es acumulativo) */
const easeStep = (p: number, step: CapaStep): number => {
  const local = THREE.MathUtils.clamp(p * 5 - (step - 1), 0, 1);
  return local * local * (3 - 2 * local); // smoothstep
};

export function VsScene({ ref, isStatic = false }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(isStatic ? 1 : 0);
  const dirtyRef = useRef(true);

  useImperativeHandle(ref, () => ({
    setProgress: (p: number) => {
      progressRef.current = THREE.MathUtils.clamp(p, 0, 1);
      dirtyRef.current = true;
    },
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const stage = createVillaStage(host);
    const { renderer, scene, camera, villa } = stage;

    const onResize = () => {
      stage.resize();
      dirtyRef.current = true;
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(host);

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __vs?: object }).__vs = { scene, camera, renderer, villa };
    }

    const tmp = new THREE.Vector3();
    const update = () => {
      const p = progressRef.current;

      // coreografía de capas: home + Σ eased(paso) · delta
      for (const m of villa.animated) {
        const home = m.userData.home as THREE.Vector3;
        tmp.copy(home);
        for (const off of m.userData.offsets as { step: CapaStep; delta: THREE.Vector3 }[]) {
          tmp.addScaledVector(off.delta, easeStep(p, off.step));
        }
        m.position.copy(tmp);
      }

      // resalte verde de la capa activa: pulso que entra y sale dentro del quinto
      for (let step = 1 as CapaStep; step <= 5; step = (step + 1) as CapaStep) {
        const local = THREE.MathUtils.clamp(p * 5 - (step - 1), 0, 1);
        const pulso = Math.sin(Math.PI * local) * 0.4;
        for (const m of villa.highlights[step]) {
          const mat = m.material as THREE.MeshStandardMaterial;
          mat.emissive.copy(NEGRO).lerp(VERDE, pulso);
        }
      }

      // cámara: órbita lenta + leve retiro al final (la axonometría respira)
      const ang = THREE.MathUtils.lerp(-0.62, 0.55, p);
      // en viewport angosto (móvil) la cámara se retira para no cortar la casa
      const ajusteAngosto = camera.aspect < 1 ? 1.45 : 1;
      const radio = THREE.MathUtils.lerp(58, 72, p * p) * ajusteAngosto;
      const altura = THREE.MathUtils.lerp(13, 26, p);
      camera.position.set(Math.sin(ang) * radio, altura, Math.cos(ang) * radio);
      camera.lookAt(0, THREE.MathUtils.lerp(5.5, 9.5, p), 0);

      renderer.render(scene, camera);
    };

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!dirtyRef.current) return;
      dirtyRef.current = false;
      update();
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      stage.dispose();
    };
  }, []);

  return <div ref={hostRef} className="vs-scene" aria-hidden="true" />;
}
