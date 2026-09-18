"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

import {
  ENCUADRE_BASE,
  LOOK_PRODUCCION,
  type Encuadre,
  type LookCristal,
} from "./encuadre";

/* El encuadre y el look viven en ./encuadre, que no importa three, para que las
   escenas puedan usarlos sin arrastrar el motor 3D al bundle de movil. Se
   re-exportan desde aqui para no romper a quien ya los importaba. */
export {
  DISTANCIA_MINIMA_ENTERO,
  ENCUADRE_BASE,
  LOOK_PRODUCCION,
  LOOK_VOLUMEN,
  altoVisible,
  distanciaParaFraccion,
} from "./encuadre";
export type { Encuadre, LookCristal } from "./encuadre";

function entornoLila(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d");
  if (!g) return CRYSTAL_BG as unknown as THREE.Texture;
  const v = g.createLinearGradient(0, 0, 0, 128);
  v.addColorStop(0.0, "#6a5aa8");
  v.addColorStop(0.32, "#3b3558");
  v.addColorStop(0.6, "#2b2740");
  v.addColorStop(1.0, "#15121f");
  g.fillStyle = v;
  g.fillRect(0, 0, 256, 128);
  const acentos = [
    [70, 44, 46, "rgba(205,188,255,0.55)"],
    [196, 62, 38, "rgba(167,139,250,0.34)"],
  ] as const;
  for (const [x, y, r, col] of acentos) {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, col);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = rg;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}


type CrystalProps = {
  reduce: boolean;
  pointerRef: React.RefObject<Pointer>;
  encuadreRef?: React.RefObject<Encuadre | null>;
  look: LookCristal;
};

function Crystal({ reduce, pointerRef, encuadreRef, look }: CrystalProps) {
  const group = useRef<Group>(null);
  const camera = useThree((s) => s.camera);
  // la textura solo se crea si el look la pide; produccion sigue con el color plano
  const entorno = useMemo(
    () => (look.entornoDegradado ? entornoLila() : CRYSTAL_BG),
    [look.entornoDegradado],
  );

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    // El encuadre se lee de un ref, no de props: dirigirlo desde el scroll
    // significa cambiarlo ~60 veces por segundo, y hacerlo por props volvería a
    // renderizar React en cada fotograma. El ref lo mantiene fuera de React.
    const e = encuadreRef?.current;
    if (e) {
      g.position.set(e.x, e.y, e.z);
      if (camera.position.z !== e.distancia) {
        camera.position.z = e.distancia;
        camera.updateProjectionMatrix();
      }
    }

    if (reduce) return;
    g.rotation.y += delta * 0.22;
    const p = pointerRef.current;
    // inclina el cristal hacia el cursor (con lag → se siente líquido)
    g.rotation.x += (p.y * 0.35 - g.rotation.x) * 0.05;
    g.rotation.z += (-p.x * 0.22 - g.rotation.z) * 0.05;
  });

  return (
    <Float speed={reduce ? 0 : 1.4} rotationIntensity={0.4} floatIntensity={0.7}>
      <group
        ref={group}
        position={[ENCUADRE_BASE.x, ENCUADRE_BASE.y, ENCUADRE_BASE.z]}
      >
        <mesh scale={0.98}>
          <icosahedronGeometry args={[1, 0]} />
          {/*
            samples y resolution son el costo dominante de todo el hero: este
            material re-renderiza la escena a un buffer aparte y la desenfoca
            CADA frame, y ambos números multiplican ese trabajo. 4/192 sostienen
            la refracción y la aberración cromática en un icosaedro de este
            tamaño; 6/256 gastaba de más en detalle que no se distingue.
          */}
          <MeshTransmissionMaterial
            samples={4}
            resolution={256}   /* FASE 0 (10-sep): a 192 el borde del suelo salia como banda dentada dentro del cristal (p=0.58) */
            transmission={1}
            thickness={look.thickness}
            roughness={0.04}
            ior={1.42}
            chromaticAberration={0.3}
            anisotropicBlur={0.1}
            distortion={0.12}
            distortionScale={0.3}
            temporalDistortion={0.06}
            iridescence={0.45}
            iridescenceIOR={1.3}
            color="#f0e9ff"
            background={entorno}
            backside={look.backside}
            backsideThickness={look.backsideThickness}
            backsideResolution={look.backsideResolution}
            envMapIntensity={look.envMapIntensity}
          />
        </mesh>
      </group>
    </Float>
  );
}

/** Encuadre CSS de producción. Es el valor por defecto: si no se pasa nada, el
    componente se comporta exactamente igual que antes de existir estas props. */
const CAJA_PRODUCCION =
  "pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[54%] md:block";
const VELO_PRODUCCION = "linear-gradient(to bottom, #000 76%, transparent 97%)";

export type HeroCrystalProps = {
  /** clases del contenedor; por defecto, el encuadre de producción */
  className?: string;
  /** desvanecido inferior; `null` lo quita (para ver el objeto entero) */
  veloInferior?: string | null;
  /** dirige posición y distancia por fotograma, sin re-renderizar React */
  encuadreRef?: React.RefObject<Encuadre | null>;
  /** material y entorno del vidrio; por defecto, los valores de producción */
  look?: LookCristal;
};

/**
 * Cristal de vidrio 3D del hero — refracción real (MeshTransmissionMaterial) con
 * reflejos iridiscentes (lightformers cálido/violeta/teal), reactivo al cursor.
 * Solo desktop, lazy-loaded (ver HeroCrystalMount). Reduced-motion: queda quieto.
 *
 * Sin props se comporta igual que siempre. Con ellas se puede dirigir desde una
 * escena — ver `Encuadre` arriba. El material y la geometría no son
 * configurables a propósito: son parte del contrato visual del MASTER.
 */
export function HeroCrystal({
  className = CAJA_PRODUCCION,
  veloInferior = VELO_PRODUCCION,
  encuadreRef,
  look = LOOK_PRODUCCION,
}: HeroCrystalProps = {}) {
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

  // Dirigido por scroll: el bucle tiene que correr aunque no haya reduced-motion
  // que lo empuje, porque el fotograma depende de p, no del tiempo.
  // Dirigido por scroll: el bucle tiene que correr aunque reduced-motion pare el
  // giro, porque el encuadre depende de p y no del tiempo. Lo que NO se pierde es
  // la pausa por viewport: fuera de pantalla no se dibuja nada, dirigido o no.
  // Sin encuadreRef la expresion es, carácter por carácter, la de producción:
  //   reduce ? "demand" : active ? "always" : "never"
  // Con encuadreRef el bucle tiene que correr aunque reduced-motion pare el giro,
  // porque el encuadre depende de p y no del tiempo — pero la pausa por viewport
  // se conserva: fuera de pantalla no se dibuja, dirigido o no.
  const bucle = encuadreRef
    ? active
      ? "always"
      : "never"
    : reduce
      ? "demand"
      : active
        ? "always"
        : "never";

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={className}
      style={
        veloInferior
          ? { maskImage: veloInferior, WebkitMaskImage: veloInferior }
          : undefined
      }
    >
      <Canvas
        dpr={[1, 1.6]}
        frameloop={bucle}
        camera={{ position: [0, 0, ENCUADRE_BASE.distancia], fov: 30 }}
        // Sin MSAA: resolverlo cuesta cada frame y acá no compra nada — el
        // objeto es un cristal difuso sin bordes duros y el dpr ya llega a 1.6.
        gl={{ alpha: true, antialias: false }}
      >
        <ambientLight intensity={0.5} />
        <Crystal
          reduce={reduce}
          pointerRef={pointerRef}
          encuadreRef={encuadreRef}
          look={look}
        />
        {/*
          Entorno de luz en el EJE LILA del MASTER ("Lila sobre carbón": lila como
          único acento; el cyan no existe en v1). Antes había crema, ámbar #ffd9a8 y
          teal #93d8cf — los dos últimos, fuera del sistema.
          Medido en movimiento el 27-ago con iridescence 0.45: con ámbar/teal el
          verdor picaba en 6.2 y el tinte oscilaba 6.6 durante el giro; en el eje
          lila baja a 2.4 y 2.3. Las luces controlan los PICOS de color; la
          iridiscencia controla el promedio.
        */}
        <Environment resolution={256}>
          <Lightformer
            form="rect"
            intensity={5}
            position={[0, 3, 4]}
            scale={[9, 3, 1]}
            color="#f6f2ff"
          />
          <Lightformer
            intensity={3}
            position={[4, 1, 3]}
            scale={4}
            color="#cdbcff"
          />
          <Lightformer
            intensity={2.4}
            position={[-4, 0, 2]}
            scale={4}
            color="#a78bfa"
          />
          <Lightformer
            intensity={1.8}
            position={[0, -3, 2]}
            scale={6}
            color="#5b4a96"
          />
        </Environment>
      </Canvas>
    </div>
  );
}
