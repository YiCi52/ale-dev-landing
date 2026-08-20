/*
  Verifica que el recorrido no atraviese MUROS.

  Lee la planta desde `src/components/lab/villa-savoye/planta.ts` — la MISMA
  fuente desde la que se construye el modelo. Antes este script tenía su
  propia copia de los muros escrita a mano, la planta cambió, y el script
  siguió midiendo la planta vieja: reportó "0 colisiones" mientras la cámara
  atravesaba media casa. Un verificador desincronizado da falsa confianza,
  que es peor que no tenerlo.

  Correr junto con check-villa-muebles.mjs:
    npx tsx scripts/check-villa-tour.mjs
*/
import * as THREE from "three";

import { D, W, cajasNobile } from "../src/components/lab/villa-savoye/planta.ts";
import { RUTA } from "../src/components/lab/villa-savoye/ruta.ts";

const H_PILOTIS = 3.3, H_BANDA_INF = 0.55, H_VENTANA = 1.2, H_BANDA_SUP = 1.5;
const H_VOLUMEN = H_BANDA_INF + H_VENTANA + H_BANDA_SUP;
const T_MURO = 0.3;
const yBase = H_PILOTIS;
const yLosa = yBase + 0.15;
const yTecho = yBase + H_VOLUMEN;

const cajas = [
  ...cajasNobile(yLosa, yTecho).map(([mn, mx]) => ["tabique", mn, mx]),
  // fachadas: banda inferior y superior, con la cinta de ventanas en medio
  ["fachada +z inf", [-W / 2, yBase, D / 2 - T_MURO], [W / 2, yBase + H_BANDA_INF, D / 2]],
  ["fachada +z sup", [-W / 2, yBase + H_BANDA_INF + H_VENTANA, D / 2 - T_MURO], [W / 2, yTecho, D / 2]],
  ["fachada -z inf", [-W / 2, yBase, -D / 2], [W / 2, yBase + H_BANDA_INF, -D / 2 + T_MURO]],
  ["fachada -z sup", [-W / 2, yBase + H_BANDA_INF + H_VENTANA, -D / 2], [W / 2, yTecho, -D / 2 + T_MURO]],
  ["fachada +x inf", [W / 2 - T_MURO, yBase, -D / 2], [W / 2, yBase + H_BANDA_INF, D / 2]],
  ["fachada +x sup", [W / 2 - T_MURO, yBase + H_BANDA_INF + H_VENTANA, -D / 2], [W / 2, yTecho, D / 2]],
  ["fachada -x inf", [-W / 2, yBase, -D / 2], [-W / 2 + T_MURO, yBase + H_BANDA_INF, D / 2]],
  ["fachada -x sup", [-W / 2, yBase + H_BANDA_INF + H_VENTANA, -D / 2], [-W / 2 + T_MURO, yTecho, D / 2]],
];

const curva = new THREE.CatmullRomCurve3(RUTA.map((p) => new THREE.Vector3(...p)), false, "centripetal");
const CLEAR = 0.35;
const N = 600;
const fallas = [];
for (let i = 0; i <= N; i++) {
  const t = i / N;
  const p = curva.getPoint(t);
  for (const [nombre, mn, mx] of cajas) {
    const dx = Math.max(mn[0] - p.x, 0, p.x - mx[0]);
    const dy = Math.max(mn[1] - p.y, 0, p.y - mx[1]);
    const dz = Math.max(mn[2] - p.z, 0, p.z - mx[2]);
    const d = Math.hypot(dx, dy, dz);
    if (d < CLEAR) {
      fallas.push({ t: +t.toFixed(3), p: [+p.x.toFixed(2), +p.y.toFixed(2), +p.z.toFixed(2)], d: +d.toFixed(2), nombre });
      break;
    }
  }
}
console.log(`muros comprobados: ${cajas.length} · muestras: ${N + 1} · holgura exigida: ${CLEAR} m`);
console.log(`violaciones: ${fallas.length}`);
for (const f of fallas.slice(0, 16)) console.log(`  t=${f.t} pos ${JSON.stringify(f.p)} d=${f.d} → ${f.nombre}`);
if (fallas.length > 16) console.log(`  … y ${fallas.length - 16} más`);
