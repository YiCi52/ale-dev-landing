"use client";

import { useEffect, useImperativeHandle, useRef } from "react";
import type { Ref } from "react";
import * as THREE from "three";

import { buildVilla } from "./villaModel";
import type { CapaStep } from "./villaModel";

/*
  Escenario Three.js del desarme. No sabe de scroll: expone setProgress(0..1)
  y VsDesarme lo alimenta desde ScrollTrigger. Reglas heredadas del banco de
  referencias (v10 · ciaoenergy):
  - live WebGL SOLO porque el usuario dirige el desarme; la atmósfera es CSS.
  - DPR: se capea donde el ÁREA es grande — pantallas chicas toleran más DPR
    que un monitor 1440p (píxeles totales, no "potencia del aparato").
  - render on demand: solo se pinta cuando el progreso cambió (scroll parado
    = GPU dormida).
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

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const small = window.innerWidth < 1024;
    renderer.setPixelRatio(small ? Math.min(window.devicePixelRatio, 2) : Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 220);

    // luz de museo: cielo parejo + un sol suave lateral, sin sombras (perf)
    scene.add(new THREE.HemisphereLight(0xffffff, 0xdcd8cd, 1.05));
    const sol = new THREE.DirectionalLight(0xfff6e8, 1.7);
    sol.position.set(24, 30, 14);
    scene.add(sol);
    const contra = new THREE.DirectionalLight(0xe8ecf2, 0.5);
    contra.position.set(-18, 12, -20);
    scene.add(contra);

    const villa = buildVilla();
    scene.add(villa.root);
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __vs?: object }).__vs = { scene, camera, renderer, villa };
    }

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      dirtyRef.current = true;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const tmp = new THREE.Vector3();
    const update = () => {
      const p = progressRef.current;

      // coreografía de capas: home + Σ eased(paso) · delta
      for (const m of villa.animated) {
        const home = m.userData.home as THREE.Vector3;
        tmp.copy(home);
        for (const off of m.userData.offsets as { step: CapaStep; delta: THREE.Vector3 }[]) {
          const e = easeStep(p, off.step);
          tmp.addScaledVector(off.delta, e);
        }
        m.position.copy(tmp);
      }

      // resalte verde de la capa activa: pulso que entra y sale dentro del quinto
      for (let step = 1 as CapaStep; step <= 5; step = (step + 1) as CapaStep) {
        const local = THREE.MathUtils.clamp(p * 5 - (step - 1), 0, 1);
        const pulso = Math.sin(Math.PI * local) * 0.4; // 0→pico→0
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

    // render on demand: rAF corre, pero solo pinta con progreso sucio
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
      villa.dispose();
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className="vs-scene" aria-hidden="true" />;
}
