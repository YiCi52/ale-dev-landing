"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

import { alcheScroll } from "./scroll-store";

/** Ángulos de las tres esquinas, con la punta hacia arriba. */
const CORNER_COUNT = 3;
const RADIUS = 1.34;
const CORNER_ROUNDING = 0.4;
const HERO_OFFSET_Y = 0.46;
const OBJECT_SCALE = 0.72;

/**
 * Silueta del logo: triángulo equilátero con esquinas redondeadas.
 * El redondeo importa — una arista viva no engancha el reflejo y el cromo se
 * lee como plástico gris.
 */
function createRoundedTriangle(radius: number, rounding: number): THREE.Shape {
  const vertices = Array.from({ length: CORNER_COUNT }, (_, index) => {
    const angle = (index / CORNER_COUNT) * Math.PI * 2 - Math.PI / 2;
    return new THREE.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius);
  });

  const shape = new THREE.Shape();

  vertices.forEach((vertex, index) => {
    const previous = vertices[(index + CORNER_COUNT - 1) % CORNER_COUNT];
    const next = vertices[(index + 1) % CORNER_COUNT];

    const entry = vertex
      .clone()
      .add(previous.clone().sub(vertex).normalize().multiplyScalar(rounding));
    const exit = vertex
      .clone()
      .add(next.clone().sub(vertex).normalize().multiplyScalar(rounding));

    if (index === 0) shape.moveTo(entry.x, entry.y);
    else shape.lineTo(entry.x, entry.y);

    shape.quadraticCurveTo(vertex.x, vertex.y, exit.x, exit.y);
  });

  shape.closePath();
  return shape;
}

type MaterialState = {
  color: THREE.Color;
  roughness: number;
  iridescence: number;
  envMapIntensity: number;
};

/** Tres estados de material, uno por sección — el objeto es el hilo conductor. */
const STATES: readonly MaterialState[] = [
  // Hero — cromo pulido con tornasol.
  {
    color: new THREE.Color("#ffffff"),
    // 0.09 en vez de espejo puro: un pelo de rugosidad suaviza el borde del
    // brillo. El espejo perfecto delata la baja resolución del entorno.
    roughness: 0.09,
    iridescence: 1,
    envMapIntensity: 3.1,
  },
  // Works — metal oscuro, deja respirar al portafolio.
  {
    color: new THREE.Color("#8f93a8"),
    roughness: 0.22,
    iridescence: 0.35,
    envMapIntensity: 1.5,
  },
  // Outline — casi grafito, el protagonismo pasa al trazo SVG.
  {
    color: new THREE.Color("#3b3f52"),
    roughness: 0.34,
    iridescence: 0,
    envMapIntensity: 1.1,
  },
];

const scratchColor = new THREE.Color();

/** Interpola entre los estados según el progreso global de scroll. */
function sampleState(progress: number) {
  const scaled = THREE.MathUtils.clamp(progress, 0, 1) * (STATES.length - 1);
  const index = Math.min(Math.floor(scaled), STATES.length - 2);
  const from = STATES[index];
  const to = STATES[index + 1];
  const t = scaled - index;

  return {
    color: scratchColor.copy(from.color).lerp(to.color, t),
    roughness: THREE.MathUtils.lerp(from.roughness, to.roughness, t),
    iridescence: THREE.MathUtils.lerp(from.iridescence, to.iridescence, t),
    envMapIntensity: THREE.MathUtils.lerp(
      from.envMapIntensity,
      to.envMapIntensity,
      t,
    ),
  };
}

type AlcheObjectProps = {
  isReducedMotion: boolean;
};

export function AlcheObject({ isReducedMotion }: AlcheObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const shape = createRoundedTriangle(RADIUS, CORNER_ROUNDING);
    // Bisel muy grande a propósito: convierte el prisma en una forma "inflada"
    // casi sin cara plana. Una cara plana refleja un solo punto del entorno y se
    // ve como pintura gris; la superficie curva barre el entorno entero y ES
    // lo que el ojo lee como cromo.
    const extruded = new THREE.ExtrudeGeometry(shape, {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.26,
      bevelSize: 0.2,
      bevelSegments: 32,
      curveSegments: 84,
    });
    extruded.center();
    extruded.computeVertexNormals();
    return extruded;
  }, []);

  const wireframe = useMemo(
    () => new THREE.WireframeGeometry(geometry),
    [geometry],
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    if (!group || !mesh) return;

    const { progress, pointerX, pointerY } = alcheScroll;
    const elapsed = state.clock.elapsedTime;

    // Oscilación en vez de giro completo: el reflejo barre los biseles (que es
    // lo que vende el cromo) pero la silueta del triángulo nunca se pierde.
    const spin = isReducedMotion
      ? 0
      : Math.sin(elapsed * 0.28) * 0.5 + progress * 1.6;
    const targetY = spin + pointerX * 0.34;
    const targetX = (isReducedMotion ? 0 : Math.sin(elapsed * 0.4) * 0.1) - pointerY * 0.22;

    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetY, 3.5, delta);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetX, 3.5, delta);
    // Se apoya arriba del centro para que el wordmark cruce su tercio inferior,
    // como en la referencia, y el copy quede sobre fondo limpio.
    group.position.y = THREE.MathUtils.damp(
      group.position.y,
      HERO_OFFSET_Y +
        (isReducedMotion ? 0 : Math.sin(elapsed * 0.7) * 0.06) -
        progress * 0.6,
      2.5,
      delta,
    );

    const next = sampleState(progress);
    const material = mesh.material as THREE.MeshPhysicalMaterial;
    material.color.lerp(next.color, 1 - Math.exp(-6 * delta));
    material.roughness = THREE.MathUtils.damp(
      material.roughness,
      next.roughness,
      6,
      delta,
    );
    material.iridescence = THREE.MathUtils.damp(
      material.iridescence,
      next.iridescence,
      6,
      delta,
    );
    material.envMapIntensity = THREE.MathUtils.damp(
      material.envMapIntensity,
      next.envMapIntensity,
      6,
      delta,
    );

    // El wireframe se asoma al entrar en Works y se va antes del trazo SVG.
    if (wireRef.current) {
      const wireMaterial = wireRef.current.material as THREE.LineBasicMaterial;
      const peak = 1 - Math.min(Math.abs(progress - 0.5) / 0.28, 1);
      wireMaterial.opacity = THREE.MathUtils.damp(
        wireMaterial.opacity,
        peak * 0.5,
        6,
        delta,
      );
    }
  });

  return (
    <>
      {/* Estudio procedural: sin HDRI remoto, así no depende de la red. Las
          tiras finas son las que dibujan los brillos alargados del cromo. */}
      {/* 2048 no es capricho: a 512 el borde del brillo sale escalonado y el
          metal se ve renderizado en baja, que es lo primero que delata un 3D
          barato. */}
      <Environment resolution={2048} frames={1}>
        {/* Este color es lo que el metal REFLEJA, no el fondo de la página. En
            negro el cromo se lee como plástico gris: necesita un gris medio que
            haga de "pared de estudio" entre los brillos. */}
        {/* Base media-oscura: da el "cuerpo" del reflejo. El contraste real lo
            ponen las tiras, no este color — si se sube, el metal se lava. */}
        <color attach="background" args={["#3a4162"]} />

        {/* Softbox cenital: da el degradado largo sobre la cara superior. */}
        <Lightformer
          intensity={5}
          form="rect"
          position={[0, 6, 1]}
          scale={[12, 8, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        {/* Tiras verticales: son las que dibujan los brillos alargados que el
            ojo lee como cromo. Sin ellas no hay lectura metálica. */}
        <Lightformer
          intensity={14}
          form="rect"
          position={[-4.5, 0.5, 2.5]}
          scale={[0.45, 9, 1]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Lightformer
          intensity={11}
          form="rect"
          position={[4.5, -0.8, 2]}
          scale={[0.35, 8, 1]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <Lightformer
          intensity={8}
          form="rect"
          position={[0, -4.5, 2]}
          scale={[7, 0.4, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        {/* Acentos de color: el tornasol necesita fuentes cromáticas distintas
            en cada lado para que el iridiscente tenga de dónde separar tonos. */}
        <Lightformer
          intensity={6}
          color="#8b7bff"
          form="circle"
          position={[3, 3, 3.5]}
          scale={3.5}
        />
        <Lightformer
          intensity={5}
          color="#4fd8ff"
          form="circle"
          position={[-3.2, -2.2, 3]}
          scale={3}
        />
        <Lightformer
          intensity={4}
          color="#ff7ac0"
          form="circle"
          position={[0, 1.5, -4]}
          scale={4}
        />
      </Environment>

      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />

      <group ref={groupRef} scale={OBJECT_SCALE}>
        <mesh ref={meshRef} geometry={geometry} castShadow={false}>
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={1}
            roughness={0.04}
            envMapIntensity={2.4}
            iridescence={1}
            iridescenceIOR={1.9}
            iridescenceThicknessRange={[120, 520]}
            clearcoat={1}
            clearcoatRoughness={0.06}
          />
        </mesh>

        <lineSegments ref={wireRef} geometry={wireframe}>
          <lineBasicMaterial
            color="#9fb4ff"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </lineSegments>
      </group>
    </>
  );
}
