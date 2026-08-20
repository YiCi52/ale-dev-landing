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

import { RUTA } from "../src/components/lab/villa-savoye/ruta.ts";

import { HERRADURA, H_RDC, cajasTodas } from "../src/components/lab/villa-savoye/planta.ts";

const cajas = cajasTodas();

const curva = new THREE.CatmullRomCurve3(RUTA.map((p) => new THREE.Vector3(...p)), false, "centripetal");
const CLEAR = 0.35;
const N = 600;
const fallas = [];
for (let i = 0; i <= N; i++) {
  const t = i / N;
  const p = curva.getPoint(t);
  // la herradura es un cilindro: se comprueba por distancia radial al arco
  if (p.y < H_RDC + 0.1) {
    const rx = p.x - HERRADURA.cx, rz = p.z - HERRADURA.cz;
    const r = Math.hypot(rx, rz);
    let th = Math.atan2(rx, rz);
    while (th < HERRADURA.arcIni) th += Math.PI * 2;
    const dentroDelArco = th <= HERRADURA.arcIni + HERRADURA.arcLen;
    const [pa, pb] = HERRADURA.puerta;
    const enLaPuerta = th >= pa && th <= pb;
    if (dentroDelArco && !enLaPuerta && Math.abs(r - HERRADURA.r) < CLEAR) {
      fallas.push({ t: +t.toFixed(3), p: [+p.x.toFixed(2), +p.y.toFixed(2), +p.z.toFixed(2)], d: +Math.abs(r - HERRADURA.r).toFixed(2), nombre: "herradura de vidrio" });
      continue;
    }
  }
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
