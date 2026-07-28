"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  Lightformer,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import type { Group } from "three";

type Pointer = { x: number; y: number };

type CrystalProps = { reduce: boolean; pointerRef: React.RefObject<Pointer> };

function Crystal({ reduce, pointerRef }: CrystalProps) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g || reduce) return;
    // Rotación viva (rápida + multi-eje) → dinámico.
    g.rotation.y += delta * 0.45;
    g.rotation.x += delta * 0.13;
    const p = pointerRef.current;
    // El cristal PERSIGUE el cursor (posición + tilt) → muy reactivo.
    g.position.x += (p.x * 0.22 - g.position.x) * 0.045;
    g.position.y += (0.1 + p.y * 0.2 - g.position.y) * 0.045;
    g.rotation.z += (p.x * 0.25 - g.rotation.z) * 0.05;
  });

  return (
    <Float speed={reduce ? 0 : 2.2} rotationIntensity={0.6} floatIntensity={1.1}>
      <group ref={group} scale={0.92}>
        <mesh>
          <icosahedronGeometry args={[1, 0]} />
          <MeshTransmissionMaterial
            samples={16}
            resolution={1024}
            transmission={1}
            thickness={0.85}
            roughness={0}
            ior={2.2}
            chromaticAberration={0.9}
            anisotropicBlur={0.15}
            distortion={0.1}
            distortionScale={0.2}
            temporalDistortion={0.08}
            clearcoat={1}
            clearcoatRoughness={0}
            attenuationDistance={3}
            color="#ffffff"
          />
        </mesh>
      </group>
    </Float>
  );
}

export function LabGlass() {
  const [reduce, setReduce] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [active, setActive] = useState(true);
  const pointerRef = useRef<Pointer>({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReduce = () => setReduce(mq.matches);
    mq.addEventListener("change", onReduce);

    const onMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    const el = wrapRef.current;
    if (el) io.observe(el);

    return () => {
      mq.removeEventListener("change", onReduce);
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      <Canvas
        dpr={[1, 2]}
        frameloop={reduce ? "demand" : active ? "always" : "never"}
        camera={{ position: [0, 0, 6], fov: 28 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.3} />
        <Crystal reduce={reduce} pointerRef={pointerRef} />
        {/* Env procedural (sin HDRI externo, bloqueado acá): lightformers brillantes
            y de color → el cristal claro los refracta con dispersión = gema HD que
            chispea sobre el fondo oscuro. */}
        <Environment resolution={512}>
          <Lightformer form="rect" intensity={4} position={[0, 4, 3]} scale={[7, 3, 1]} color="#ffffff" />
          <Lightformer form="circle" intensity={7} position={[4, 1, 4]} scale={2.4} color="#7cc4ff" />
          <Lightformer form="circle" intensity={7} position={[-4, 0, 4]} scale={2.4} color="#ff9ecb" />
          <Lightformer form="circle" intensity={6} position={[2, -3, 3]} scale={2} color="#a78bfa" />
          <Lightformer form="ring" intensity={5} position={[-3, 3, 2]} scale={3} color="#ffe9a8" />
          <Lightformer form="rect" intensity={2} position={[0, 0, -6]} scale={10} color="#2a3550" />
        </Environment>
      </Canvas>
    </div>
  );
}
