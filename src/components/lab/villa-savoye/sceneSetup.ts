import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import {
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  SMAAEffect,
  ToneMappingEffect,
  ToneMappingMode,
} from "postprocessing";

import { buildVilla } from "./villaModel";
import type { VillaBuild } from "./villaModel";
import { isNightMode, onNightMode } from "./nightMode";

/*
  Bootstrap compartido de las DOS escenas del lab (desarme y promenade).
  Atmósfera fotográfica sin servicios pagos: cielo HDRI real de Poly Haven
  (CC0) como fondo E iluminación (PMREM), pasto fotográfico en la pradera,
  sombras suaves. Modo noche: sol lunar frío, la cinta de vidrio emitiendo
  cálido — la casa como lámpara (ref. Pocito/v30) — y un domo de estrellas
  procedural con Vía Láctea que aparece con el anochecer.
*/

/** grain de película (ronda 1b): mata el banding de los degradados del cielo
    día/noche a la vez que da textura. 0.02-0.04 es el rango del plan; sin
    premultiply a propósito — el banding vive en las zonas OSCURAS y el
    premultiply apagaría el ruido justo ahí */
const GRANO = 0.03;

// Ronda 2: presupuesto de assets. El HDR baja a 1k y SOLO ilumina (PMREM);
// el fondo es el mismo cielo horneado a WebP LDR con el AgX de three a
// exposición de día (scripts del bake en el historial de sesión). Texturas
// 2D en WebP. Total del route: 7.03 MB → ~1.9 MB.
const SKY_URL = "/lab/villa-savoye/sky_1k.hdr"; // kloofendal_48d_partly_cloudy_puresky (Poly Haven CC0)
const BG_URL = "/lab/villa-savoye/sky_bg_2k.webp";
const GRASS_URL = "/lab/villa-savoye/grass_1k.webp";
const ARBOLES_URL = "/lab/villa-savoye/arboles.webp"; // plate Higgsfield: álamos de Poissy

/** banda de horizonte: al plate se le funde el cielo (arriba) y el pasto
    (abajo) con un degradado alfa en canvas, para que cosa con el HDRI */
function makeHorizonTexture(img: HTMLImageElement): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = "destination-out";
  const arriba = ctx.createLinearGradient(0, 0, 0, c.height * 0.42);
  arriba.addColorStop(0, "rgba(0,0,0,1)");
  arriba.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = arriba;
  ctx.fillRect(0, 0, c.width, c.height * 0.42);
  const abajo = ctx.createLinearGradient(0, c.height * 0.62, 0, c.height);
  abajo.addColorStop(0, "rgba(0,0,0,0)");
  abajo.addColorStop(1, "rgba(0,0,0,1)");
  ctx.fillStyle = abajo;
  ctx.fillRect(0, c.height * 0.62, c.width, c.height * 0.38);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.MirroredRepeatWrapping; // espejo: sin costuras al dar la vuelta
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Nebulosa de la Vía Láctea pintada por píxel (equirect 1024x512 sobre una
    esfera BackSide). Lo que la hace leerse real (referencias: astrofoto):
    la banda con GRUMOS de ruido, el bulbo cálido del núcleo galáctico en UN
    punto (no pareja), y sobre todo el Great Rift — la grieta de polvo OSCURO
    que la parte a lo largo. Los sprites aditivos de antes nunca iban a dar
    esto: 300 círculos se leen como bokeh, no como nube. Semilla fija. */
function makeMilkyWayTexture(N: THREE.Vector3, e1: THREE.Vector3, e2: THREE.Vector3): THREE.CanvasTexture {
  const W = 1024;
  const H = 512;
  const hash = (x: number, y: number): number => {
    let h = (x | 0) * 374761393 + (y | 0) * 668265263 + 1013904223;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  const vnoise = (x: number, y: number): number => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = x - xi;
    const fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
  const fbm = (x: number, y: number): number => 0.6 * vnoise(x, y) + 0.3 * vnoise(x * 2.1 + 17, y * 2.1 + 31) + 0.1 * vnoise(x * 4.3 + 47, y * 4.3 + 89);

  // el bulbo del núcleo va en el punto más ALTO de la banda: visible desde
  // casi cualquier ángulo de cámara
  const tCore = Math.atan2(e2.y, e1.y);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  const dir = new THREE.Vector3();
  for (let py = 0; py < H; py++) {
    // equirect: v=0 arriba del canvas = +y (three voltea con flipY)
    const phi = ((py + 0.5) / H) * Math.PI; // 0 = polo norte
    const sinPhi = Math.sin(phi);
    for (let px = 0; px < W; px++) {
      const theta = ((px + 0.5) / W) * Math.PI * 2;
      dir.set(sinPhi * Math.cos(theta), Math.cos(phi), sinPhi * Math.sin(theta));
      const b = dir.dot(N); // distancia al plano galáctico
      const t = Math.atan2(dir.dot(e2), dir.dot(e1)); // posición a lo largo
      let dt = t - tCore;
      if (dt > Math.PI) dt -= Math.PI * 2;
      if (dt < -Math.PI) dt += Math.PI * 2;

      // banda base con grumos: el ruido al CUADRADO le quita el "piso" —
      // sin eso la banda se ve pareja como niebla, no como nube de estrellas
      const n = fbm(t * 3.2, b * 14);
      const glow = Math.exp((-b * b) / (2 * 0.09 * 0.09)) * (0.15 + 0.85 * n * n);
      // bulbo del núcleo: presente pero contenido, cálido
      const core = Math.exp((-dt * dt) / (2 * 0.45 * 0.45)) * Math.exp((-b * b) / (2 * 0.12 * 0.12)) * (0.35 + 0.65 * n);
      // Great Rift: grieta oscura que serpentea DENTRO de la banda, patchy,
      // corre por la mitad del núcleo (como en el cielo real)
      const riftOff = 0.03 * Math.sin(t * 1.7 + 1.1) + 0.012;
      const riftAmp = Math.exp((-dt * dt) / (2 * 1.4 * 1.4));
      const rift = Math.exp((-(b - riftOff) * (b - riftOff)) / (2 * 0.055 * 0.055)) * (0.45 + 0.55 * fbm(t * 4.1 + 211, b * 18 + 97)) * riftAmp;

      const I = Math.min(1, Math.max(0, (glow * 0.6 + core * 0.7) * (1 - 0.88 * Math.min(1, rift))));
      const warm = Math.min(1, core * 1.4);
      // la intensidad va EN el RGB con alfa opaco: el canvas 2D almacena
      // premultiplicado y con alfa variable el blending la multiplicaba dos
      // veces (∝ alfa²) — la nebulosa entera se aplastaba. Con aditivo,
      // negro = cero contribución, así que el alfa no hace falta.
      const o = (py * W + px) * 4;
      img.data[o] = Math.round((0.72 + 0.28 * warm) * I * 255);
      img.data[o + 1] = Math.round((0.78 + 0.1 * warm) * I * 255);
      img.data[o + 2] = Math.round((0.92 - 0.2 * warm) * I * 255);
      img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export type VillaStage = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  villa: VillaBuild;
  /** pinta un frame por el composer (escena → AgX → grain) */
  render: () => void;
  /** re-hornea el shadow map congelado — llamar SOLO cuando la geometría se mueve */
  bakeShadows: () => void;
  resize: () => void;
  dispose: () => void;
};

export function createVillaStage(host: HTMLElement, fov = 34, onDirty?: () => void): VillaStage {
  // sin alpha: el fondo siempre lo pinta el HDRI, el canal alfa solo costaba
  // blending. Sin antialias del framebuffer: la escena ya no se dibuja ahí
  // sino en los buffers del composer — el MSAA vive en el composer.
  const renderer = new THREE.WebGLRenderer({ antialias: false });
  const small = window.innerWidth < 1024;
  // El aparato DÉBIL recibe MENOS píxeles: 1.25 en móvil, 1.5 en desktop.
  // Antes estaba invertido (2 en móvil) — 2.6x de carga al hardware más lento.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // AgX y no ACES: ACES satura y tiñe los altos hacia crema — la Villa es
  // BLANCA y con ACES se veía quemada a naranja. AgX hace roll-off suave y
  // el blanco queda blanco. Las exposiciones de DIA/NOCHE compensan el
  // oscurecimiento propio de AgX (~1.33x).
  // OJO ronda 1b: el AgX ya NO va en el renderer — desde three r152 el tone
  // mapping se salta al renderizar a un render target (que es lo que hace el
  // composer), así que vive en el ToneMappingEffect del pass final. El
  // renderer queda en NoToneMapping y toneMappingExposure SIGUE mandando:
  // el AgXToneMapping del shader lee ese uniform en el pass final.
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.shadowMap.enabled = true;
  // PCF duro a propósito: PCFSoftShadowMap está deprecado (r182) y caía a PCF
  // en silencio. La suavidad de verdad llega con el AO horneado de la Ronda 5.
  renderer.shadowMap.type = THREE.PCFShadowMap;
  // Ronda 3: el shadow map se CONGELA — solo se re-hornea cuando la
  // geometría se mueve (bakeShadows, lo llama el rig del desarme al cambiar
  // el progreso). Orbitar la cámara o el tween día/noche no lo tocan:
  // -21% del frame medido en el plan.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  host.appendChild(renderer.domElement);

  // ── Ronda 3: carga con progreso real + revelado sin tirón ───────────────
  // El canvas nace transparente. Cuando las 4 cargas async terminan (o vence
  // el tope fail-open), se compila TODO (compileAsync + un render de
  // calentamiento con el canvas aún invisible, que también compila el pass
  // del composer y sube las texturas) y RECIÉN ahí se revela con un fade.
  // Nada de render a medias: stage.render() no pinta hasta estar listo.
  const PASOS = 5; // hdr · fondo · pasto · álamos · compilación
  let pasosListos = 0;
  let listo = false;
  const loader = document.createElement("div");
  loader.className = "vs-loader";
  loader.setAttribute("aria-hidden", "true");
  host.appendChild(loader);
  const pintarProgreso = () => {
    const n = Math.round((pasosListos / PASOS) * 10);
    loader.textContent = `[${"=".repeat(n)}${"-".repeat(10 - n)}]`;
  };
  pintarProgreso();
  renderer.domElement.style.opacity = "0";
  renderer.domElement.style.transition = "opacity 600ms ease";
  const cargas: Promise<void>[] = [];
  const nuevoPaso = (): (() => void) => {
    let done!: () => void;
    cargas.push(new Promise<void>((r) => (done = r)));
    let usado = false;
    return () => {
      if (usado) return;
      usado = true;
      pasosListos++;
      pintarProgreso();
      done();
    };
  };

  // Pérdida de contexto WebGL (pestaña al fondo, GPU reset): sin el
  // preventDefault el canvas queda negro para siempre; con él, el navegador
  // restaura y el onDirty repinta.
  let disposed = false;
  const canvas = renderer.domElement;
  const onContextLost = (e: Event) => e.preventDefault();
  const onContextRestored = () => onDirty?.();
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.15, 320);

  // ── Composer (ronda 1b): escena → SMAA → AgX → grain ────────────────────
  // HalfFloat para que el rango HDR llegue vivo al tone mapping. El AA es
  // SMAA y NO el multisampling del composer: MSAA sobre RGBA16F pasa la
  // consulta de formato pero el resolve falla en ANGLE/Metal (Chrome macOS)
  // con INVALID_FRAMEBUFFER_OPERATION y el canvas queda negro.
  const composer = new EffectComposer(renderer, {
    frameBufferType: THREE.HalfFloatType,
  });
  composer.addPass(new RenderPass(scene, camera));
  const grain = new NoiseEffect({ premultiply: false });
  grain.blendMode.opacity.value = GRANO;
  // orden dentro del pass: SMAA primero (sus vecinos salen del buffer de
  // entrada — después del tone mapping serían inconsistentes), luego AgX a
  // espacio de display, y el grain al final sobre el color ya cuantizable
  composer.addPass(
    new EffectPass(camera, new SMAAEffect(), new ToneMappingEffect({ mode: ToneMappingMode.AGX }), grain),
  );
  // gated (ronda 3): no se pinta nada hasta que el revelado compile y suba
  // todo — el primer frame visible ya es el definitivo, sin micro-tirón
  const render = () => {
    if (listo) composer.render();
  };

  const hemi = new THREE.HemisphereLight(0xffffff, 0xdcd8cd, 0.55);
  scene.add(hemi);
  const sol = new THREE.DirectionalLight(0xfff4e4, 2.4);
  sol.position.set(26, 34, 16);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  sol.shadow.camera.left = -34;
  sol.shadow.camera.right = 34;
  sol.shadow.camera.top = 34;
  sol.shadow.camera.bottom = -34;
  sol.shadow.camera.far = 130;
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.02;
  scene.add(sol);

  const villa = buildVilla();
  scene.add(villa.root);

  // ── Cielo: el HDR 1k SOLO ilumina; el fondo es el WebP horneado ─────────
  // Antes el 2k half-float (16.8 MB de VRAM) se quedaba vivo solo para
  // pintarse de fondo. El prefiltrado del PMREM desenfoca igual con 1k, y
  // la DataTexture se suelta apenas termina.
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envTex: THREE.Texture | null = null;
  const pasoHdr = nuevoPaso();
  new RGBELoader().load(
    SKY_URL,
    (hdr) => {
      // la carga es async: si el stage ya se desmontó, soltar el HDR y salir
      if (disposed) {
        hdr.dispose();
        pasoHdr();
        return;
      }
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      envTex = pmrem.fromEquirectangular(hdr).texture;
      hdr.dispose();
      scene.environment = envTex;
      aplicarMezcla();
      pasoHdr();
      onDirty?.();
    },
    undefined,
    pasoHdr, // fail-open: un asset caído no congela el revelado
  );

  let bgTex: THREE.Texture | null = null;
  const pasoBg = nuevoPaso();
  new THREE.TextureLoader().load(
    BG_URL,
    (tex) => {
      if (disposed) {
        tex.dispose();
        pasoBg();
        return;
      }
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      bgTex = tex;
      scene.background = tex;
      aplicarMezcla();
      pasoBg();
      onDirty?.();
    },
    undefined,
    pasoBg,
  );

  // ── Anillo de horizonte: la fila de álamos (Higgsfield) rodea la pradera ──
  let matArboles: THREE.MeshBasicMaterial | null = null;
  let ringMesh: THREE.Mesh | null = null;
  {
    const pasoArboles = nuevoPaso();
    const img = new Image();
    img.onerror = pasoArboles;
    img.onload = () => {
      if (disposed) {
        pasoArboles();
        return;
      }
      const tex = makeHorizonTexture(img);
      tex.repeat.set(4, 1); // 4 vueltas espejadas alrededor del anillo
      matArboles = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.BackSide, // se ve desde adentro
        depthWrite: false,
      });
      const alto = 26; // proporción del plate a radio 80
      ringMesh = new THREE.Mesh(new THREE.CylinderGeometry(80, 80, alto, 72, 1, true), matArboles);
      ringMesh.position.y = alto * 0.5 - 9.5; // la línea de árboles cae en el horizonte
      ringMesh.renderOrder = -1;
      scene.add(ringMesh);
      // con el lazy mount (2b) el stage puede nacer YA en modo noche: la
      // mezcla debe re-aplicarse cuando el anillo llega, o se queda de día
      aplicarMezcla();
      pasoArboles();
      onDirty?.();
    };
    img.src = ARBOLES_URL;
  }

  // pasto fotográfico sobre la pradera (reemplaza el moteado procedural)
  let grassTex: THREE.Texture | null = null;
  const pasoPasto = nuevoPaso();
  new THREE.TextureLoader().load(
    GRASS_URL,
    (tex) => {
    if (disposed) {
      tex.dispose();
      pasoPasto();
      return;
    }
    grassTex = tex;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(9, 9);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    villa.materials.suelo.map = tex;
    villa.materials.suelo.color.set(0xa9c08c); // tinte verde pradera
    villa.materials.suelo.needsUpdate = true;
    pasoPasto();
    onDirty?.();
    },
    undefined,
    pasoPasto,
  );

  // NOTA ronda 2: se intentó una capa de macro-variación multiplicativa para
  // romper el tile del pasto, pero MultiplyBlending pintaba el disco blanco
  // bajo el pipeline del composer. Con repeat 9 el patrón no se nota a la
  // distancia de cámara actual; si reaparece, se resuelve en la Ronda 5 con
  // el bake (ahí el suelo recibe su propia textura horneada).

  // ── Cielo nocturno: mar de estrellas + Vía Láctea (procedural, 0 KB) ────
  // La noche era el día con la exposición bajada. Ahora, a partir de t≈0.35
  // se funde un domo de estrellas: tres poblaciones de Points (campo, campo
  // brillante, polvo de la banda galáctica) más un halo aditivo con sprite
  // suave que hace la nebulosa. Todo generado — nada descargado, nítido a
  // cualquier DPR, y el fade viaja con el mismo t del atardecer.
  const nightSky = new THREE.Group();
  nightSky.visible = false;
  scene.add(nightSky);
  const starMats: { m: THREE.PointsMaterial | THREE.MeshBasicMaterial; base: number }[] = [];
  let milkyTex: THREE.CanvasTexture | null = null;
  {
    // plano de la banda galáctica, inclinado para que cruce el cielo en diagonal
    const N = new THREE.Vector3(0.42, 0.55, 0.72).normalize();
    const e1 = new THREE.Vector3(1, 0, 0).cross(N).normalize();
    const e2 = new THREE.Vector3().crossVectors(N, e1).normalize();
    const R = 280; // dentro del far (320), fuera de todo lo demás
    // aproximación de gaussiana (suma de uniformes): las estrellas se apiñan
    // hacia el centro de la banda como en el cielo real
    const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2;

    const dirTo = (out: THREE.Vector3, band: boolean, sigma = 0.16) => {
      if (band) {
        const th = Math.random() * Math.PI * 2;
        out.copy(e1).multiplyScalar(Math.cos(th)).addScaledVector(e2, Math.sin(th)).addScaledVector(N, gauss() * sigma);
      } else {
        out.set(gauss(), gauss(), gauss());
        if (out.lengthSq() < 1e-6) out.set(0, 1, 0);
      }
      return out.normalize();
    };

    const makeStars = (count: number, band: boolean, size: number, base: number, sigma = 0.16) => {
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const v = new THREE.Vector3();
      const c = new THREE.Color();
      for (let i = 0; i < count; i++) {
        dirTo(v, band, sigma);
        // casi todo por encima del horizonte: lo de abajo lo tapan suelo y álamos
        if (v.y < -0.12) {
          v.y = -v.y * 0.4 - 0.05;
          v.normalize();
        }
        pos.set([v.x * R, v.y * R, v.z * R], i * 3);
        const roll = Math.random();
        if (roll < 0.08) c.setHex(0xbfd4ff); // azuladas
        else if (roll < 0.16) c.setHex(0xffe3bd); // cálidas
        else c.setHex(0xffffff);
        c.multiplyScalar(0.75 + Math.random() * 0.25);
        col.set([c.r, c.g, c.b], i * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const m = new THREE.PointsMaterial({
        size,
        sizeAttenuation: false,
        vertexColors: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const points = new THREE.Points(g, m);
      points.renderOrder = -2; // los álamos (-1) siluetean por encima
      nightSky.add(points);
      starMats.push({ m, base });
    };

    makeStars(2200, false, 1.4, 0.9); // campo general
    makeStars(320, false, 2.4, 1.0); // las brillantes
    makeStars(9500, true, 1.0, 0.7); // polvo de la banda: granularidad sobre la nebulosa
    // banda apretada extra: refuerza el plano galáctico con puntos finos
    makeStars(2400, true, 1.0, 0.8, 0.055);

    // la nebulosa en sí: textura pintada sobre esfera interior (BackSide),
    // aditiva y tenue — los puntos de arriba le dan el grano de estrellas
    milkyTex = makeMilkyWayTexture(N, e1, e2);
    const milkyMat = new THREE.MeshBasicMaterial({
      map: milkyTex,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const milkyMesh = new THREE.Mesh(new THREE.SphereGeometry(276, 48, 32), milkyMat);
    milkyMesh.renderOrder = -3; // debajo de los puntos (-2) y de los álamos (-1)
    nightSky.add(milkyMesh);
    // base BAJA a propósito: el aditivo suma en lineal pre-AgX y con 0.85 el
    // bulbo se leía como un rayo de niebla que tapaba media pantalla
    starMats.push({ m: milkyMat, base: 0.3 });
  }

  // ── Día / noche: atardecer continuo, no switch ──────────────────────────
  // Un solo factor t (0=día, 1=noche) interpola exposición, cielo, sol y la
  // cinta encendiéndose — el tween de GSAP lo lleva en ~2s con easing suave.
  // bg compensa la doble exposición del fondo horneado: el WebP ya trae el
  // AgX a exp 1.4, y el composer vuelve a multiplicar por exp antes de SU
  // AgX — sin el 0.72 (≈1/1.4) el cielo se lava a blanco
  const DIA = { exp: 1.4, bg: 0.72, env: 0.85, solC: new THREE.Color(0xfff4e4), solI: 2.4, hemiI: 0.55, emC: new THREE.Color(0x000000), emI: 0, op: 0.42 };
  const NOCHE = { exp: 1.15, bg: 0.036, env: 0.12, solC: new THREE.Color(0x9db4e0), solI: 0.5, hemiI: 0.1, emC: new THREE.Color(0xffb163), emI: 1.15, op: 0.85 };
  const OCASO = new THREE.Color(0xff9e5e); // el sol pasa por naranja a mitad de camino
  const BLANCO = new THREE.Color(0xffffff);
  const NOCHE_ARBOLES = new THREE.Color(0x1c2333);
  const mezcla = { t: isNightMode() ? 1 : 0 };
  const tmpC = new THREE.Color();
  const aplicarMezcla = () => {
    const t = mezcla.t;
    const L = THREE.MathUtils.lerp;
    renderer.toneMappingExposure = L(DIA.exp, NOCHE.exp, t);
    scene.backgroundIntensity = L(DIA.bg, NOCHE.bg, t);
    scene.environmentIntensity = L(DIA.env, NOCHE.env, t);
    // el color del sol viaja día → ocaso → luna (curva por el naranja)
    if (t < 0.5) tmpC.lerpColors(DIA.solC, OCASO, t * 2);
    else tmpC.lerpColors(OCASO, NOCHE.solC, (t - 0.5) * 2);
    sol.color.copy(tmpC);
    sol.intensity = L(DIA.solI, NOCHE.solI, t);
    hemi.intensity = L(DIA.hemiI, NOCHE.hemiI, t);
    const v = villa.materials.vidrio;
    v.emissive.lerpColors(DIA.emC, NOCHE.emC, t);
    // la cinta se enciende tarde (t>0.55): primero oscurece, luego la lámpara
    v.emissiveIntensity = NOCHE.emI * THREE.MathUtils.smoothstep(t, 0.55, 1);
    v.opacity = L(DIA.op, NOCHE.op, t);
    // el anillo de álamos también anochece (material sin luz: se tinta a mano)
    if (matArboles) matArboles.color.lerpColors(BLANCO, NOCHE_ARBOLES, t);
    // las estrellas se funden con el anochecer (t 0.35→0.95) — no un switch
    const nightT = THREE.MathUtils.smoothstep(t, 0.35, 0.95);
    nightSky.visible = nightT > 0.01;
    for (const { m, base } of starMats) m.opacity = base * nightT;
    onDirty?.();
  };
  aplicarMezcla();
  let tweenRaf = 0;
  const offNight = onNightMode((night) => {
    // tween manual con rAF (sin depender de gsap acá): ~2s ease in-out
    cancelAnimationFrame(tweenRaf);
    const desde = mezcla.t;
    const hasta = night ? 1 : 0;
    const t0 = performance.now();
    const DUR = 2000;
    const paso = (now: number) => {
      const k = Math.min(1, (now - t0) / DUR);
      const e = k * k * (3 - 2 * k); // smoothstep
      mezcla.t = desde + (hasta - desde) * e;
      aplicarMezcla();
      if (k < 1) tweenRaf = requestAnimationFrame(paso);
    };
    tweenRaf = requestAnimationFrame(paso);
  });

  // ── el revelado: compilar + calentar + fundir el canvas ─────────────────
  const revelar = async () => {
    if (disposed || listo) return;
    try {
      await renderer.compileAsync(scene, camera);
    } catch {
      // contexto perdido a mitad de compilación: revelar igual, el manejo
      // de webglcontextrestored repinta
    }
    if (disposed) return;
    // calentamiento: un render REAL del composer con el canvas transparente —
    // compila también el pass de efectos y fuerza la subida de texturas
    listo = true;
    composer.render();
    pasosListos = PASOS;
    pintarProgreso();
    loader.remove();
    renderer.domElement.style.opacity = "1";
    onDirty?.();
  };
  const TOPE_MS = 8000; // fail-open: una carga colgada no deja la escena en negro
  void Promise.race([Promise.all(cargas), new Promise<void>((r) => setTimeout(r, TOPE_MS))]).then(revelar);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    // el composer redimensiona el renderer Y sus buffers internos
    composer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  const dispose = () => {
    disposed = true;
    cancelAnimationFrame(tweenRaf);
    loader.remove();
    offNight();
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", onContextRestored);
    villa.dispose();
    // el anillo y las texturas cargadas async no son de la villa: se sueltan acá
    if (ringMesh) {
      scene.remove(ringMesh);
      ringMesh.geometry.dispose();
    }
    matArboles?.map?.dispose();
    matArboles?.dispose();
    nightSky.children.forEach((p) => {
      if (p instanceof THREE.Points || p instanceof THREE.Mesh) {
        p.geometry.dispose();
        (p.material as THREE.Material).dispose();
      }
    });
    milkyTex?.dispose();
    grassTex?.dispose();
    envTex?.dispose();
    bgTex?.dispose();
    pmrem.dispose();
    composer.dispose(); // pases + buffers; el renderer se dispone aparte
    renderer.dispose();
    if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
  };

  const bakeShadows = () => {
    renderer.shadowMap.needsUpdate = true;
  };

  return { renderer, scene, camera, villa, render, bakeShadows, resize, dispose };
}
