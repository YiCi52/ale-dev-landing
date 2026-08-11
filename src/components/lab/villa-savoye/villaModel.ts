import * as THREE from "three";

/*
  Villa Savoye procedural — solo primitivas (cajas + cilindros), cero assets.
  Cada mesh guarda en userData su posición "home" y una lista de offsets por
  paso del desarme; VsScene interpola home + Σ eased(paso) · delta. Así los
  5 puntos de Le Corbusier son literalmente 5 movimientos de capas:
    1 pilotis (la casa se levanta)   2 cubierta-jardín (el techo despega)
    3 planta libre (el nivel se extrae como un cajón/plano)
    4 ventana corrida (la cinta de vidrio flota)   5 fachada libre (los
    paneles blancos se abren en axonometría).
  Proporciones estilizadas sobre la real (planta ~19×21.5 m, retícula 4.75 m).
*/

export type CapaStep = 1 | 2 | 3 | 4 | 5;

type ExplodeOffset = { step: CapaStep; delta: THREE.Vector3 };

export type VillaBuild = {
  root: THREE.Group;
  /** meshes que se resaltan (emissive verde) durante cada paso */
  highlights: Record<CapaStep, THREE.Mesh[]>;
  /** todos los meshes con coreografía, para el update loop */
  animated: THREE.Mesh[];
  dispose: () => void;
};

const HUESO = 0xf7f5f0;
const CARBON = 0x22221f;
const VERDE_RDC = 0x3f5c48; // el verde real de la planta baja de la Savoye
const VIDRIO = 0x2e3d3a;
const SUELO = 0xdcddcc; // salvia claro: separa la casa blanca sin robar protagonismo

// Volumen principal (piano nobile)
const W = 20; // x
const D = 20; // z
const H_PILOTIS = 3.3;
const H_BANDA_INF = 0.55;
const H_VENTANA = 1.2;
const H_BANDA_SUP = 1.5;
const H_VOLUMEN = H_BANDA_INF + H_VENTANA + H_BANDA_SUP;
const T_MURO = 0.3;

function mesh(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  offsets: ExplodeOffset[],
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.userData.home = new THREE.Vector3(x, y, z);
  m.userData.offsets = offsets;
  return m;
}

const up = (dy: number): THREE.Vector3 => new THREE.Vector3(0, dy, 0);

export function buildVilla(): VillaBuild {
  const root = new THREE.Group();
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];

  const std = (color: number, rough = 0.85, metal = 0): THREE.MeshStandardMaterial => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    mats.push(m);
    return m;
  };
  const g = <T extends THREE.BufferGeometry>(geo: T): T => {
    geos.push(geo);
    return geo;
  };

  const matBlanco = std(HUESO);
  const matPiloti = std(HUESO, 0.7);
  const matVidrio = std(VIDRIO, 0.35, 0.15);
  const matVerde = std(VERDE_RDC, 0.8);
  const matSuelo = std(SUELO, 1);
  const matLosa = std(0xefede6, 0.9);

  const animated: THREE.Mesh[] = [];
  const highlights: Record<CapaStep, THREE.Mesh[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  const add = (m: THREE.Mesh, hl?: CapaStep) => {
    root.add(m);
    animated.push(m);
    if (hl) highlights[hl].push(m);
    return m;
  };

  // ── Terreno: pradera (no se anima) — tono salvia para separar la casa blanca
  const cesped = mesh(g(new THREE.CylinderGeometry(27, 27, 0.3, 48)), matSuelo, 0, -0.15, 0, []);
  root.add(cesped);

  // ── Capa 1 · PILOTIS: retícula 5×5 de columnas (no se mueven: la casa sube)
  const pilotiGeo = g(new THREE.CylinderGeometry(0.16, 0.16, H_PILOTIS, 14));
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const x = (i - 2) * (W / 4 - 0.4);
      const z = (j - 2) * (D / 4 - 0.4);
      add(mesh(pilotiGeo, matPiloti, x, H_PILOTIS / 2, z, []), 1);
    }
  }

  // Núcleo curvo de planta baja (el vestíbulo verde real de la Savoye).
  // Sube con la casa en el paso 1 (pertenece al cuerpo, no a los pilotis).
  const LIFT = 2.6; // cuánto se levanta el cuerpo sobre los pilotis en el paso 1
  const rdc = mesh(
    g(new THREE.CylinderGeometry(5.6, 5.6, H_PILOTIS - 0.2, 40, 1, false, Math.PI * 0.15, Math.PI * 1.7)),
    matVerde,
    0,
    (H_PILOTIS - 0.2) / 2,
    -0.6,
    [{ step: 1, delta: up(LIFT) }],
  );
  add(rdc, 1);

  // ── Cuerpo del piano nobile ───────────────────────────────────────────────
  const yBase = H_PILOTIS; // cara inferior del volumen
  const yLosaPiso = yBase + 0.15;

  // Capa 3 · PLANTA LIBRE: losa + columnas interiores + tabique curvo — se
  // extrae en +X como un plano que se saca de la carpeta.
  const DRAWER = new THREE.Vector3(16, 0, 0);
  const losaPiso = mesh(g(new THREE.BoxGeometry(W - 0.7, 0.3, D - 0.7)), matLosa, 0, yLosaPiso, 0, [
    { step: 1, delta: up(LIFT) },
    { step: 3, delta: DRAWER },
  ]);
  add(losaPiso, 3);
  const colGeo = g(new THREE.CylinderGeometry(0.13, 0.13, H_VOLUMEN - 0.4, 12));
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const c = mesh(colGeo, matPiloti, (i - 1) * 6.2, yLosaPiso + (H_VOLUMEN - 0.4) / 2 + 0.15, (j - 1) * 6.2, [
        { step: 1, delta: up(LIFT) },
        { step: 3, delta: DRAWER },
      ]);
      add(c, 3);
    }
  }
  // la rampa interior, protagonista real de la promenade — un plano inclinado
  const rampa = mesh(g(new THREE.BoxGeometry(1.8, 0.12, 9)), matLosa, 2.2, yLosaPiso + 1.1, 0, [
    { step: 1, delta: up(LIFT) },
    { step: 3, delta: DRAWER },
  ]);
  rampa.rotation.x = -0.24;
  add(rampa, 3);
  const tabique = mesh(
    g(new THREE.CylinderGeometry(3.4, 3.4, H_VOLUMEN - 0.5, 32, 1, true, 0, Math.PI)),
    matBlanco,
    -3.4,
    yLosaPiso + (H_VOLUMEN - 0.5) / 2 + 0.15,
    2.2,
    [
      { step: 1, delta: up(LIFT) },
      { step: 3, delta: DRAWER },
    ],
  );
  add(tabique, 3);

  // ── Capas 4 y 5 · fachada por lados: banda inferior, cinta de vidrio, banda superior
  type Lado = { dx: number; dz: number; rotY: number; largo: number };
  const lados: Lado[] = [
    { dx: 0, dz: D / 2 - T_MURO / 2, rotY: 0, largo: W }, // frente (+z)
    { dx: 0, dz: -(D / 2 - T_MURO / 2), rotY: 0, largo: W }, // fondo (−z)
    { dx: W / 2 - T_MURO / 2, dz: 0, rotY: Math.PI / 2, largo: D }, // derecha (+x)
    { dx: -(W / 2 - T_MURO / 2), dz: 0, rotY: Math.PI / 2, largo: D }, // izquierda (−x)
  ];
  const yBandaInf = yBase + H_BANDA_INF / 2;
  const yVentana = yBase + H_BANDA_INF + H_VENTANA / 2;
  const yBandaSup = yBase + H_BANDA_INF + H_VENTANA + H_BANDA_SUP / 2;

  for (const lado of lados) {
    const normal = new THREE.Vector3(lado.dx, 0, lado.dz).normalize();
    const fan = normal.clone().multiplyScalar(5.2); // paso 5: los paneles se abren
    const float = normal.clone().multiplyScalar(1.6); // paso 4: la cinta flota
    const liftear = (extra: ExplodeOffset[]): ExplodeOffset[] => [{ step: 1, delta: up(LIFT) }, ...extra];

    const bandaInfGeo = g(new THREE.BoxGeometry(lado.largo, H_BANDA_INF, T_MURO));
    const bandaSupGeo = g(new THREE.BoxGeometry(lado.largo, H_BANDA_SUP, T_MURO));
    const ventanaGeo = g(new THREE.BoxGeometry(lado.largo - 0.5, H_VENTANA, T_MURO * 0.5));

    const bi = mesh(bandaInfGeo, matBlanco, lado.dx, yBandaInf, lado.dz, liftear([{ step: 5, delta: fan }]));
    bi.rotation.y = lado.rotY;
    add(bi, 5);
    const bs = mesh(bandaSupGeo, matBlanco, lado.dx, yBandaSup, lado.dz, liftear([{ step: 5, delta: fan }]));
    bs.rotation.y = lado.rotY;
    add(bs, 5);
    const v = mesh(ventanaGeo, matVidrio, lado.dx, yVentana, lado.dz, liftear([{ step: 4, delta: float }]));
    v.rotation.y = lado.rotY;
    add(v, 4);
  }

  // ── Capa 2 · CUBIERTA-JARDÍN: losa de techo + antepechos + solárium curvo
  const yTecho = yBase + H_VOLUMEN;
  const ROOF = up(6.5);
  const liftRoof: ExplodeOffset[] = [
    { step: 1, delta: up(LIFT) },
    { step: 2, delta: ROOF },
  ];
  const losaTecho = mesh(g(new THREE.BoxGeometry(W, 0.35, D)), matBlanco, 0, yTecho + 0.175, 0, liftRoof);
  add(losaTecho, 2);
  const antepechoLargoGeo = g(new THREE.BoxGeometry(W, 0.9, 0.22));
  const antepechoCortoGeo = g(new THREE.BoxGeometry(0.22, 0.9, D));
  const a1 = mesh(antepechoLargoGeo, matBlanco, 0, yTecho + 0.8, D / 2 - 0.11, liftRoof);
  const a2 = mesh(antepechoLargoGeo, matBlanco, 0, yTecho + 0.8, -(D / 2 - 0.11), liftRoof);
  const a3 = mesh(antepechoCortoGeo, matBlanco, W / 2 - 0.11, yTecho + 0.8, 0, liftRoof);
  const a4 = mesh(antepechoCortoGeo, matBlanco, -(W / 2 - 0.11), yTecho + 0.8, 0, liftRoof);
  [a1, a2, a3, a4].forEach((a) => add(a, 2));
  // las pantallas curvas del solárium — la silueta más reconocible de la casa
  const sol1 = mesh(
    g(new THREE.CylinderGeometry(4.6, 4.6, 2.6, 40, 1, true, Math.PI * 0.05, Math.PI * 1.15)),
    matBlanco,
    -1.5,
    yTecho + 1.65,
    -2,
    liftRoof,
  );
  add(sol1, 2);
  const sol2 = mesh(
    g(new THREE.CylinderGeometry(3.1, 3.1, 2.2, 36, 1, true, Math.PI * 1.1, Math.PI * 0.85)),
    matBlanco,
    2.4,
    yTecho + 1.45,
    2.6,
    liftRoof,
  );
  add(sol2, 2);

  const dispose = () => {
    geos.forEach((geo) => geo.dispose());
    mats.forEach((m) => m.dispose());
  };

  return { root, highlights, animated, dispose };
}
