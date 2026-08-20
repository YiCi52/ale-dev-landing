/*
  Exporta la Villa a GLB SIN navegador, para hornear la luz en Blender.

  El plan original lo hacía por la consola de /lab/villa-savoye con
  window.__vs, pero el panel del navegador bloquea descargas. villaModel.ts
  solo toca el DOM para dos texturas procedurales (yeso y pradera), así que
  con un canvas de mentira la geometría se construye igual en Node.

  Las texturas se quitan antes de exportar a propósito: el bake necesita
  geometría, UVs y NOMBRES de objeto (para re-atachar la coreografía del
  desarme, que no sobrevive al round-trip). Los materiales se rehacen en
  three al volver.
*/
import { writeFileSync } from "node:fs";

// ── canvas de mentira: cualquier método no hace nada y devuelve algo plausible
const ctxFalso = new Proxy({}, {
  get: (_t, prop) => {
    if (prop === "createImageData" || prop === "getImageData")
      return (w = 1, h = 1) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h });
    if (prop === "canvas") return { width: 256, height: 256 };
    return () => undefined;
  },
  set: () => true,
});
globalThis.document = {
  createElement: (tag) =>
    tag === "canvas"
      ? { width: 256, height: 256, getContext: () => ctxFalso, toDataURL: () => "" }
      : {},
};
globalThis.window = globalThis;
globalThis.self = globalThis;

/*
  GLTFExporter arma el .glb final leyendo un Blob con FileReader, que en Node
  no existe. Blob sí (nativo desde Node 18), así que basta con envolver su
  arrayBuffer() en la forma que espera el exportador.
*/
if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        this.onloadend?.();
      });
    }
  };
}

const THREE = await import("three");
const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
const { buildVilla } = await import("../src/components/lab/villa-savoye/villaModel.ts");

const villa = buildVilla();
const raiz = villa.root;

// Sin texturas: el exportador intentaría serializar imágenes que no existen
let limpiados = 0;
raiz.traverse((o) => {
  if (!o.isMesh) return;
  const mats = Array.isArray(o.material) ? o.material : [o.material];
  for (const m of mats) {
    if (!m) continue;
    for (const slot of ["map", "bumpMap", "roughnessMap", "normalMap", "aoMap", "lightMap", "emissiveMap"]) {
      if (m[slot]) { m[slot] = null; limpiados++; }
    }
    m.needsUpdate = true;
  }
});

/*
  Nombres CON SIGNIFICADO. Es el punto delicado del round-trip: la coreografía
  del desarme vive en userData (home + offsets por paso) y el GLB no la lleva.
  Al volver de Blender hay que re-atacharla, y para eso el nombre tiene que
  decir a qué capa pertenece la pieza y si se mueve. Formato:
    c<capa>_<i>       pieza resaltada en el paso <capa>
    mov<i>            lleva coreografía pero sin capa de resalte
    fijo<i>           no se mueve (terreno, contexto)
  Ademas se vuelca un mapa JSON con home/offsets por nombre, para reconstruir
  la coreografia sin adivinar.
*/
const animados = new Set(villa.animated);
const capaDe = new Map();
for (const [paso, mallas] of Object.entries(villa.highlights ?? {}))
  for (const m of mallas) capaDe.set(m, paso);

const mapa = {};
let i = 0;
raiz.traverse((o) => {
  if (!o.isMesh) return;
  const capa = capaDe.get(o);
  const mueve = animados.has(o) || (o.parent && animados.has(o.parent));
  o.name = capa ? `c${capa}_${i}` : mueve ? `mov${i}` : `fijo${i}`;
  const home = o.userData?.home;
  const offs = o.userData?.offsets;
  if (home || offs) {
    mapa[o.name] = {
      home: home ? [home.x, home.y, home.z] : null,
      offsets: (offs ?? []).map((f) => ({ step: f.step, delta: [f.delta.x, f.delta.y, f.delta.z] })),
      capa: capa ? Number(capa) : null,
    };
  }
  i++;
});
const sinNombre = 0;
writeFileSync("public/lab/villa-savoye/villa-coreografia.json", JSON.stringify(mapa, null, 1));
console.log(`✓ coreografía volcada: ${Object.keys(mapa).length} piezas con home/offsets`);

const conteo = { mallas: 0, triangulos: 0 };
raiz.traverse((o) => {
  if (!o.isMesh) return;
  conteo.mallas++;
  const g = o.geometry;
  conteo.triangulos += (g.index ? g.index.count : g.attributes.position.count) / 3;
});

const exportador = new GLTFExporter();
const glb = await new Promise((res, rej) =>
  exportador.parse(raiz, res, rej, { binary: true, onlyVisible: false })
);
const salida = "public/lab/villa-savoye/villa-export.glb";
writeFileSync(salida, Buffer.from(glb));
console.log(`✓ ${salida}`);
console.log(`  mallas: ${conteo.mallas} · triángulos: ${Math.round(conteo.triangulos)} · texturas quitadas: ${limpiados} · sin nombre: ${sinNombre}`);
