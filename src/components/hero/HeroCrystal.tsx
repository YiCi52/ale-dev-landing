"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  Lightformer,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";

type Pointer = { x: number; y: number };

// Fondo interno del vidrio: violeta MÁS TENUE → cristal más translúcido/limpio,
// menos "bola sólida". Sigue brillando algo desde adentro sobre la página oscura.
const CRYSTAL_BG = new THREE.Color("#2f2b45");

type CrystalProps = {
  reduce: boolean;
  pointerRef: React.RefObject<Pointer>;
};

function Crystal({ reduce, pointerRef }: CrystalProps) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g || reduce) return;
    g.rotation.y += delta * 0.22;
    const p = pointerRef.current;
    // inclina el cristal hacia el cursor (con lag → se siente líquido)
    g.rotation.x += (p.y * 0.35 - g.rotation.x) * 0.05;
    g.rotation.z += (-p.x * 0.22 - g.rotation.z) * 0.05;
  });

  return (
    <Float speed={reduce ? 0 : 1.4} rotationIntensity={0.4} floatIntensity={0.7}>
      <group ref={group} position={[0.5, -0.55, 0]}>
        <mesh scale={0.98}>
          <icosahedronGeometry args={[1, 0]} />
          <MeshTransmissionMaterial
            samples={6}
            resolution={256}
            transmission={1}
            thickness={0.5}
            roughness={0.04}
            ior={1.42}
            chromaticAberration={0.3}
            anisotropicBlur={0.1}
            distortion={0.12}
            distortionScale={0.3}
            temporalDistortion={0.06}
            iridescence={0.6}
            iridescenceIOR={1.3}
            color="#f0e9ff"
            background={CRYSTAL_BG}
          />
        </mesh>
      </group>
    </Float>
  );
}

/**
 * Cristal de vidrio 3D del hero — refracción real (MeshTransmissionMaterial) con
 * reflejos iridiscentes (lightformers cálido/violeta/teal), reactivo al cursor.
 * Solo desktop, lazy-loaded (ver HeroCrystalMount). Reduced-motion: queda quieto.
 */
export function HeroCrystal() {
  // Lazy init: evita el render extra + flash de motion del primer frame (ssr:false)
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

    // Pausa el render del cristal cuando el hero sale del viewport (CPU/GPU/Lighthouse)
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
      className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[54%] md:block"
      style={{
        maskImage: "linear-gradient(to bottom, #000 76%, transparent 97%)",
        WebkitMaskImage: "linear-gradient(to bottom, #000 76%, transparent 97%)",
      }}
    >
      <Canvas
        dpr={[1, 1.6]}
        frameloop={reduce ? "demand" : active ? "always" : "never"}
        camera={{ position: [0, 0, 5], fov: 30 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <Crystal reduce={reduce} pointerRef={pointerRef} />
        <Environment resolution={256}>
          <Lightformer
            form="rect"
            intensity={5}
            position={[0, 3, 4]}
            scale={[9, 3, 1]}
            color="#fff6ec"
          />
          <Lightformer
            intensity={3}
            position={[4, 1, 3]}
            scale={4}
            color="#ffd9a8"
          />
          <Lightformer
            intensity={2.4}
            position={[-4, 0, 2]}
            scale={4}
            color="#b7a3ff"
          />
          <Lightformer
            intensity={1.8}
            position={[0, -3, 2]}
            scale={6}
            color="#93d8cf"
          />
        </Environment>
      </Canvas>
    </div>
  );
}
