import * as THREE from "three";
import { CRUJIA, D, T_TABIQUE, TABIQUES, VOLADIZO, W, tramosSolidos } from "./planta";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

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
  /** todo lo que lleva coreografía (meshes de la casa + grupos de muebles) */
  animated: THREE.Object3D[];
  /** materiales que el escenario ajusta (noche, texturas async) */
  materials: {
    vidrio: THREE.MeshStandardMaterial;
    suelo: THREE.MeshStandardMaterial;
  };
  dispose: () => void;
};

const HUESO = 0xf7f5f0;
const CARBON = 0x22221f;
const VERDE_RDC = 0x3f5c48; // el verde real de la planta baja de la Savoye
const VIDRIO = 0x2e3d3a;
const SUELO = 0xdcddcc; // salvia claro: separa la casa blanca sin robar protagonismo

// La huella y los tabiques viven en ./planta (traducción de PLANTA.md §1-2).
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

/** yeso con vida: ruido gris sutil para bump+roughness del blanco — contra el
    "blanco plano" (obs. de Alejandro); el bake de la ronda 5 hará el resto */
function makeYesoTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#e8e8e8";
  ctx.fillRect(0, 0, 256, 256);
  let s = 7;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < 1400; i++) {
    const g = 215 + Math.floor(rnd() * 40);
    ctx.fillStyle = `rgba(${g},${g},${g},0.5)`;
    const r = 0.6 + rnd() * 2.4;
    ctx.beginPath();
    ctx.arc(rnd() * 256, rnd() * 256, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

/** moteado de pradera: ruido suave verde-salvia dibujado en un canvas 256² */
function makeLawnTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#dcddcc";
  ctx.fillRect(0, 0, 256, 256);
  // parches pseudo-aleatorios deterministas (sin Math.random: seed fija)
  let s = 42;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < 900; i++) {
    const g = 200 + Math.floor(rnd() * 28);
    ctx.fillStyle = `rgba(${g - 22},${g - 8},${g - 40},0.35)`;
    const r = 1 + rnd() * 3.5;
    ctx.beginPath();
    ctx.arc(rnd() * 256, rnd() * 256, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

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
  // Ronda 4: TODAS las cajas llevan bisel de ~2 cm — las aristas
  // matemáticamente perfectas gritan "procedural"; el chaflán atrapa un
  // filo de luz en cada borde. El radio se acota en piezas delgadas.
  const box = (w: number, h: number, d: number): RoundedBoxGeometry =>
    g(new RoundedBoxGeometry(w, h, d, 2, Math.min(0.02, w * 0.3, h * 0.3, d * 0.3)));

  const matBlanco = std(HUESO);
  const matPiloti = std(HUESO, 0.7);
  // vidrio translúcido a dos caras: la cinta se lee desde afuera Y desde adentro
  const matVidrio = std(VIDRIO, 0.25, 0.35);
  matVidrio.transparent = true;
  matVidrio.opacity = 0.42;
  matVidrio.side = THREE.DoubleSide;
  const matVerde = std(VERDE_RDC, 0.8);
  matVerde.side = THREE.DoubleSide;
  const matSuelo = std(SUELO, 1);
  // moteado sutil de pradera (textura procedural en canvas — cero assets)
  const lawnTex = makeLawnTexture();
  if (lawnTex) {
    matSuelo.map = lawnTex;
    mats.push(matSuelo);
  }
  const matLosa = std(0xefede6, 0.9);
  matLosa.side = THREE.DoubleSide;
  // 4b-ext (referencias savoye-01/03/05): concreto pulido bajo la casa,
  // baldosa oscura en pisos habitables, carpintería café de la cinta y
  // metal de barandillas
  const matConcreto = std(0xb5a888, 0.85);
  const matPisoOscuro = std(0x393a35, 0.92);
  // foto real (LC4 en el salón): el piso INTERIOR es baldosa ocre clara;
  // la gris oscura es la de la terraza y la cubierta
  const matPisoInterior = std(0xc9b995, 0.88);
  const matCarpinteria = std(0x453c33, 0.6);
  const matMetal = std(0x8a8378, 0.35, 0.9);
  // yeso: el blanco deja de ser plano — micro-bump y roughness variada
  const yesoTex = makeYesoTexture();
  if (yesoTex) {
    for (const m of [matBlanco, matLosa]) {
      m.bumpMap = yesoTex;
      m.bumpScale = 0.03;
      m.roughnessMap = yesoTex;
    }
  }

  const animated: THREE.Object3D[] = [];
  const highlights: Record<CapaStep, THREE.Mesh[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  const add = (m: THREE.Mesh, hl?: CapaStep) => {
    // sombras en todo (el vidrio translúcido no proyecta: solo recibe)
    m.castShadow = (m.material as THREE.Material) !== matVidrio;
    m.receiveShadow = true;
    root.add(m);
    animated.push(m);
    if (hl) {
      highlights[hl].push(m);
      m.userData.capa = hl; // para el hover interactivo (raycaster)
    }
    return m;
  };

  // ── Terreno: pradera (no se anima) — tono salvia para separar la casa blanca
  // Ronda 4 (telefoto): la cámara del desarme orbita hasta r≈151 en móvil
  // vertical — la pradera crece a 180 para que nunca se vea el borde
  const cesped = mesh(g(new THREE.CylinderGeometry(180, 180, 0.3, 64)), matSuelo, 0, -0.15, 0, []);
  root.add(cesped);
  // plataforma de concreto pulido bajo la casa (ref savoye-01): el pasto NO
  // llega hasta los pilotis — la casa se posa sobre su explanada
  const plataforma = mesh(box(30, 0.12, 26), matConcreto, 0, 0.06, 0, []);
  plataforma.receiveShadow = true;
  root.add(plataforma);

  // ── Capa 1 · PILOTIS: retícula 5×5 RETRANQUEADA (4b) — en la Savoye real
  // la losa vuela ~1.5 m más allá de las columnas: ese voladizo es lo que
  // HACE posible la fachada libre (punto 5). Antes las columnas quedaban
  // casi en el borde y el voladizo no se leía.
  const pilotiGeo = g(new THREE.CylinderGeometry(0.16, 0.16, H_PILOTIS, 14));
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const x = (i - 2) * (W / 4 - 0.8);
      const z = (j - 2) * (D / 4 - 0.8);
      add(mesh(pilotiGeo, matPiloti, x, H_PILOTIS / 2, z, []), 1);
    }
  }

  /*
    ── REZ-DE-CHAUSSÉE ────────────────────────────────────────────────────
    Reconstruido 20-ago del PLANO ORIGINAL del nivel (ver PLANTA.md §"La
    planta baja"). Antes era un tambor de radio 4.3, que era el error de
    fondo: el cilindro se lo comía todo y no existía el bloque recto.

    El plano muestra dos piezas que conviven:
      · una HERRADURA acristalada de más de 180°, que sigue el radio de giro
        del automóvil — hay TRES autos dibujados dentro del arco. Es la forma
        que manda en el nivel.
      · un BLOQUE RECTO de servicio (lingerie · dos chambre · wc) apoyado en
        la esquina noroeste, que es la fachada plana con persiana que se ve
        al aproximarse, con la curva perdiéndose por los dos extremos.

    El nivel va retranqueado y en verde oscuro a propósito: desde lejos
    desaparece tras los pilotis y la caja blanca parece flotar sola. Ese es
    el gesto — si este nivel se ve demasiado, se pierde.
  */
  const LIFT = 2.6; // cuánto se levanta el cuerpo sobre los pilotis en el paso 1
  const H_RDC = H_PILOTIS - 0.2;
  const R_HERRADURA = 6.5; // medido en el plano: el arco barre ~14 m de ancho
  // La abertura mira al NOROESTE (−x, −z), que es donde encaja el bloque recto
  const ARC_INI = Math.PI * 0.62;
  const ARC_LEN = Math.PI * 1.62;
  const rdc = mesh(
    g(new THREE.CylinderGeometry(R_HERRADURA, R_HERRADURA, H_RDC, 56, 1, true, ARC_INI, ARC_LEN)),
    matVidrio,
    0.3,
    H_RDC / 2,
    1.0,
    [{ step: 1, delta: up(LIFT) }],
  );
  // montantes verticales cada ~1.4 m de arco, HIJOS del vidrio (heredan el lift)
  const montGeo = box(0.07, H_RDC, 0.12);
  const N_MONT = Math.round((R_HERRADURA * ARC_LEN) / 1.4);
  for (let k = 0; k <= N_MONT; k++) {
    const th = ARC_INI + (ARC_LEN * k) / N_MONT;
    const mont = new THREE.Mesh(montGeo, matVerde);
    mont.position.set(R_HERRADURA * Math.sin(th), 0, R_HERRADURA * Math.cos(th));
    mont.rotation.y = th;
    mont.castShadow = true;
    mont.receiveShadow = true;
    rdc.add(mont);
  }
  add(rdc, 1);

  /*
    El bloque de servicio: lingerie, dos dormitorios y el wc. En el plano es
    el único volumen de muros rectos del nivel, y cierra la herradura por el
    noroeste. Su cara larga es la fachada plana con la persiana de lamas.
  */
  const servicio = mesh(
    box(5.2, H_RDC, 6.4),
    matVerde,
    -6.1,
    H_RDC / 2,
    -3.6,
    [{ step: 1, delta: up(LIFT) }],
  );
  add(servicio, 1);

  // persiana de lamas horizontales sobre la cara de llegada (+z) del bloque
  const lamaGeo = box(4.6, 0.07, 0.06);
  for (let k = 0; k < 9; k++) {
    const lama = new THREE.Mesh(lamaGeo, matMetal);
    lama.position.set(0, -H_RDC / 2 + 0.55 + k * 0.22, 3.24);
    lama.castShadow = true;
    servicio.add(lama);
  }
  // tapa del vestíbulo: sin ella, la cámara del tour ve el interior del tubo
  const rdcTapa = mesh(g(new THREE.CylinderGeometry(4.3, 4.3, 0.12, 40)), matLosa, -3.1, H_PILOTIS - 0.2, -0.6, [
    { step: 1, delta: up(LIFT) },
  ]);
  add(rdcTapa, 1);
  // muro verde sólido del bloque de servicio (ref savoye-01): en la casa real
  // acompaña al tambor de vidrio; va al oeste del corredor de la rampa
  const muroVerde = mesh(box(0.22, H_RDC, 5), matVerde, 0.8, H_RDC / 2, 0.5, [{ step: 1, delta: up(LIFT) }]);
  add(muroVerde, 1);

  // ── Cuerpo del piano nobile ───────────────────────────────────────────────
  const yBase = H_PILOTIS; // cara inferior del volumen
  const yLosaPiso = yBase + 0.15;

  // Capa 3 · PLANTA LIBRE: losa + columnas interiores + tabique curvo — se
  // extrae en +X como un plano que se saca de la carpeta.
  const DRAWER = new THREE.Vector3(16, 0, 0);
  // La losa se compone en paneles alrededor del VACÍO de la rampa
  // (corredor x∈[1.0, 3.4], z∈[-7.2, 7.2]) — así la promenade la atraviesa.
  const losaOffsets: ExplodeOffset[] = [
    { step: 1, delta: up(LIFT) },
    { step: 3, delta: DRAWER },
  ];
  const losaPanel = (w: number, d: number, x: number, z: number, piso: THREE.MeshStandardMaterial) => {
    add(mesh(box(w, 0.3, d), matLosa, x, yLosaPiso, z, losaOffsets), 3);
    // capa fina de piso sobre la losa, viaja con ella en el cajón
    add(mesh(box(w - 0.25, 0.025, d - 0.25), piso, x, yLosaPiso + 0.165, z, losaOffsets), 3);
  };
  losaPanel(10.65, D - 0.7, -4.325, 0, matPisoInterior); // oeste: salón+norte, ocre claro
  losaPanel(6.25, D - 0.7, 6.525, 0, matPisoOscuro); // este: LA TERRAZA, baldosa gris
  losaPanel(2.4, 2.45, 2.2, -8.425, matPisoInterior); // tapa norte del corredor
  losaPanel(2.4, 2.45, 2.2, 8.425, matPisoInterior); // tapa sur del corredor
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
  // ── LA PROMENADE: rampa de 4 tramos (2 al nobile, 2 al solárium) ─────────
  // Tramos en zig-zag paralelo dentro del corredor: A/C en x=1.6, B/D en x=2.8.
  // Suben con el cuerpo en el paso 1 pero NO van en el cajón: en la axonometría
  // final la promenade queda flotando como capa propia — es la protagonista.
  const soloLift: ExplodeOffset[] = [{ step: 1, delta: up(LIFT) }];
  const RAMP_RUN = 6.6; // recorrido z de cada tramo
  const yNobile = yLosaPiso + 0.15;
  const RISE_1 = yNobile - 0.05; // planta baja → nobile (repartido en A+B)
  const tramo = (x: number, zC: number, yBase: number, rise: number, dir: 1 | -1) => {
    const largo = Math.hypot(RAMP_RUN, rise);
    const m = mesh(box(1.15, 0.1, largo), matLosa, x, yBase + rise / 2, zC, soloLift);
    m.rotation.x = dir * Math.atan2(rise, RAMP_RUN);
    add(m);
    // baranda-tabique (h 0.85) al borde exterior del tramo, mismo ángulo
    const b = mesh(
      box(0.08, 0.85, largo),
      matBlanco,
      x + (x < 2.2 ? -0.62 : 0.62),
      yBase + rise / 2 + 0.45,
      zC,
      soloLift,
    );
    b.rotation.x = m.rotation.x;
    // pasamanos tubular metálico (ref savoye-03), hijo del tabique: hereda
    // ángulo y coreografía
    const tubo = new THREE.Mesh(g(new THREE.CylinderGeometry(0.025, 0.025, largo, 10)), matMetal);
    tubo.rotation.x = Math.PI / 2;
    tubo.position.y = 0.47;
    tubo.castShadow = true;
    b.add(tubo);
    add(b);
  };
  // A: sube de la planta baja (z+) hacia el fondo (z−)
  tramo(1.6, 3.2, 0.2, RISE_1 / 2, 1);
  // descanso de giro al fondo
  add(mesh(box(2.6, 0.1, 1.3), matLosa, 2.2, 0.2 + RISE_1 / 2, -0.9, soloLift));
  // B: regresa subiendo hacia z+
  tramo(2.8, 3.2, 0.2 + RISE_1 / 2, RISE_1 / 2, -1);
  // descanso nobile (z+): conecta con la losa
  add(mesh(box(2.6, 0.1, 1.3), matLosa, 2.2, yNobile, 7.15, soloLift));
  // C y D: del nobile al solárium (misma huella, un nivel arriba)
  const RISE_2 = H_VOLUMEN + 0.25;
  tramo(1.6, 3.2, yNobile, RISE_2 / 2, 1);
  add(mesh(box(2.6, 0.1, 1.3), matLosa, 2.2, yNobile + RISE_2 / 2, -0.9, soloLift));
  tramo(2.8, 3.2, yNobile + RISE_2 / 2, RISE_2 / 2, -1);
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

  /*
    ── PIANO NOBILE ───────────────────────────────────────────────────────
    Nivel 2 de 3, levantado del PLANO ORIGINAL — los recintos y sus cotas
    viven en PLANTA.md §2, que MANDA sobre este archivo.

    Los muros se declaran como TABLA, no a mano uno por uno: cada tabique es
    un eje constante, un tramo, y sus huecos de puerta. Así el código se lee
    contra el documento sin traducir, y agregar una puerta es una línea.

    Todo vive en la capa 3: la planta libre se extrae en el cajón CON sus
    muros — el punto de Le Corbusier, literal.
  */
  const H_MURO = H_VOLUMEN - 0.35; // de piso a techo
  const yMuro = yLosaPiso + 0.15 + H_MURO / 2;
  const montCintaGeo = box(0.06, H_VENTANA, 0.1); // montante de carpintería (vidriera Y cinta)

  for (const t of TABIQUES) {
    for (const [u, w] of tramosSolidos(t.a, t.b, t.puertas)) {
      const largo = w - u;
      const centro = (u + w) / 2;
      const [dx, dz] = t.eje === "x" ? [t.v, centro] : [centro, t.v];
      const geo = t.eje === "x" ? box(T_TABIQUE, H_MURO, largo) : box(largo, H_MURO, T_TABIQUE);
      const m = mesh(geo, t.vidrio ? matVidrio : matBlanco, dx, yMuro, dz, losaOffsets);
      m.name = t.nombre;
      if (t.vidrio) {
        // montantes de carpintería cada ~1.1 m, hijos del vidrio
        const n = Math.max(2, Math.floor(largo / 1.1));
        for (let k = 0; k <= n; k++) {
          const mont = new THREE.Mesh(montCintaGeo, matCarpinteria);
          mont.scale.y = H_MURO / H_VENTANA;
          const off = -largo / 2 + (largo * k) / n;
          mont.position.set(t.eje === "x" ? 0 : off, 0, t.eje === "x" ? off : 0);
          mont.castShadow = true;
          m.add(mont);
        }
      }
      add(m, 3);
    }
  }

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

    const bandaInfGeo = box(lado.largo, H_BANDA_INF, T_MURO);
    const bandaSupGeo = box(lado.largo, H_BANDA_SUP, T_MURO);

    const bi = mesh(bandaInfGeo, matBlanco, lado.dx, yBandaInf, lado.dz, liftear([{ step: 5, delta: fan }]));
    bi.rotation.y = lado.rotY;
    add(bi, 5);
    const bs = mesh(bandaSupGeo, matBlanco, lado.dx, yBandaSup, lado.dz, liftear([{ step: 5, delta: fan }]));
    bs.rotation.y = lado.rotY;
    add(bs, 5);
    // 4b (obs. de Alejandro): en la Savoye real la cinta de los lados de la
    // TERRAZA es ABERTURA sin vidrio — aquí +z (frente) y +x (derecha).
    // Solo −x y −z (el salón, las cintas que el tour recorre por dentro)
    // llevan vidrio: de noche brillan ESAS y las de la terraza no.
    const esTerraza = lado.dz > 0 || lado.dx > 0;
    if (!esTerraza) {
      const ventanaGeo = box(lado.largo - 0.5, H_VENTANA, T_MURO * 0.5);
      const v = mesh(ventanaGeo, matVidrio, lado.dx, yVentana, lado.dz, liftear([{ step: 4, delta: float }]));
      v.rotation.y = lado.rotY;
      // carpintería café oscuro con montantes regulares (ref savoye-01):
      // hijos del vidrio — flotan con la cinta en el paso 4
      const nMont = Math.floor((lado.largo - 0.5) / 1.15);
      for (let k = 0; k <= nMont; k++) {
        const mx = -(lado.largo - 0.5) / 2 + ((lado.largo - 0.5) * k) / nMont;
        const mont = new THREE.Mesh(montCintaGeo, matCarpinteria);
        mont.position.set(mx, 0, 0);
        mont.castShadow = true;
        v.add(mont);
      }
      add(v, 4);
    }
  }

  // ── Capa 2 · CUBIERTA-JARDÍN: losa de techo + antepechos + solárium curvo
  const yTecho = yBase + H_VOLUMEN;
  const ROOF = up(6.5);
  const liftRoof: ExplodeOffset[] = [
    { step: 1, delta: up(LIFT) },
    { step: 2, delta: ROOF },
  ];
  // losa de techo en paneles: mismo vacío del corredor para que la rampa D
  // desemboque en el solárium (tapa solo al norte; al sur queda la llegada)
  const techoPanel = (w: number, d: number, x: number, z: number) => {
    add(mesh(box(w, 0.35, d), matBlanco, x, yTecho + 0.175, z, liftRoof), 2);
    // baldosa oscura de la terraza-jardín y el solárium (ref savoye-05)
    add(mesh(box(w - 0.3, 0.025, d - 0.3), matPisoOscuro, x, yTecho + 0.3625, z, liftRoof), 2);
  };
  /*
    La losa de cubierta según el PLANO DEL SOLÁRIUM (nivel 3 de 3). El plano
    marca dos "VIDE" — huecos reales en la losa que dejan ver la terraza de
    abajo — más el hueco por donde desemboca la rampa. Los tres coinciden con
    los espacios abiertos del nobile, que es la comprobación de que la lectura
    cierra: el vacío grande cae sobre la TERRASSE y el pequeño sobre la
    terraza de servicio.

    La losa se declara como rectángulos que cubren la huella MENOS esos huecos.
  */
  const VIDE_GRANDE = { x0: 1.4, x1: 9.5, z0: -4.57, z1: 4.67 }; // sobre la terrasse
  const VIDE_CHICO = { x0: -9.5, x1: -6.35, z0: 2.4, z1: 4.67 }; // sobre la terraza de servicio
  const HUECO_RAMPA = { x0: -1.5, x1: 0.1, z0: -7.0, z1: -4.57 };
  void VIDE_GRANDE;
  void VIDE_CHICO;
  void HUECO_RAMPA; // documentan los huecos; los paneles de abajo los rodean

  const LOSA: Array<[number, number, number, number]> = [
    // [x0, x1, z0, z1]
    [-9.5, -1.5, -10.625, -4.57], // norte-oeste
    [0.1, 9.5, -10.625, -4.57], // norte-este
    [-1.5, 0.1, -10.625, -7.0], // norte-centro (deja el hueco de la rampa)
    [-9.5, 9.5, 4.67, 10.625], // sur, sobre la salle y la cocina
    [-9.5, 1.4, -4.57, 2.4], // centro-oeste
    [-6.35, 1.4, 2.4, 4.67], // centro-oeste-norte, al lado del vacío chico
  ];
  for (const [x0, x1, z0, z1] of LOSA)
    techoPanel(x1 - x0, z1 - z0, (x0 + x1) / 2, (z0 + z1) / 2);

  const antepechoLargoGeo = box(W, 0.9, 0.22);
  const antepechoCortoGeo = box(0.22, 0.9, D);
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
  // sol2 se corre al panel este: su posición vieja (2.4, 2.6) quedó flotando
  // sobre la terraza ahora abierta
  const sol2 = mesh(
    g(new THREE.CylinderGeometry(3.1, 3.1, 2.2, 36, 1, true, Math.PI * 1.1, Math.PI * 0.85)),
    matBlanco,
    4.8,
    yTecho + 1.45,
    -2.2,
    liftRoof,
  );
  add(sol2, 2);

  const dispose = () => {
    geos.forEach((geo) => geo.dispose());
    mats.forEach((m) => m.dispose());
    lawnTex?.dispose();
    yesoTex?.dispose();
  };

  return { root, highlights, animated, materials: { vidrio: matVidrio, suelo: matSuelo }, dispose };
}
