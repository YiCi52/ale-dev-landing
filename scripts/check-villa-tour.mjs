import * as THREE from 'three';
// Muros/losas ENSAMBLADOS (progreso 0) portados de villaModel — AABBs {min,max}
// Actualizado con LA PLANTA REAL: vidriera salón↔corredor (con puerta z 4.6–6.4),
// muros de la franja norte, muro verde de PB, techo este recortado (terraza
// abierta al cielo) y el tour de 25 paradas que cruza puertas de verdad.
const H_P=3.3, W=20, D=20, HV=3.25, T=0.3;
const yB=H_P, yLP=yB+0.15, yT=yB+HV;
const cajas = [
  // losa nobile (4 paneles, y 3.3..3.6)
  [[-9.65,yLP-.15,-9.65],[1.0,yLP+.15,9.65]],
  [[3.4,yLP-.15,-9.65],[9.65,yLP+.15,9.65]],
  [[1.0,yLP-.15,-9.65],[3.4,yLP+.15,-7.2]],
  [[1.0,yLP-.15,7.2],[3.4,yLP+.15,9.65]],
  // techo: oeste completo, este RECORTADO (terraza z>0.15 abierta), tapa norte
  [[-10,yT,-10],[1.0,yT+.35,10]],
  [[3.4,yT,-10],[10,yT+.35,0.15]],
  [[1.0,yT,-10],[3.4,yT+.35,-4]],
  // fachadas (4 lados: inf y sup como cajas completas con hueco de ventana entre 3.85..5.05)
  [[-10,yB,D/2-T],[10,yB+.55,D/2]], [[-10,yB+1.75,D/2-T],[10,yT,D/2]],
  [[-10,yB,-D/2],[10,yB+.55,-D/2+T]], [[-10,yB+1.75,-D/2],[10,yT,-D/2+T]],
  [[W/2-T,yB,-10],[W/2,yB+.55,10]], [[W/2-T,yB+1.75,-10],[W/2,yT,10]],
  [[-W/2,yB,-10],[-W/2+T,yB+.55,10]], [[-W/2,yB+1.75,-10],[-W/2+T,yT,10]],
  // vidriera salón↔corredor en x≈0.95 (puerta z 4.6..6.4)
  [[0.89,yLP+.15,-3.5],[1.01,yT,4.6]],
  [[0.89,yLP+.15,6.4],[1.01,yT,7.2]],
  // franja norte: muro z=−3.5 (puerta x −2.2..−0.9) + muro cocina|habitación
  [[-9.65,yLP+.15,-3.575],[-2.2,yT,-3.425]],
  [[-0.9,yLP+.15,-3.575],[1.0,yT,-3.425]],
  [[-4.575,yLP+.15,-9.65],[-4.425,yT,-5.2]],
  // muro verde de PB (x 0.69..0.91, z −2..3)
  [[0.69,0,-2],[0.91,3.1,3]],
];
// cilindro RDC (r 4.3, centro (−3.1,−0.6), y 0..3.1) — chequeo radial
const RUTA = [
  [2,2.0,34],[0.5,1.95,14],[0.3,1.9,6.9],[1.7,2.05,7.2],[1.7,3.25,1.2],
  [2.65,3.42,-0.5],[2.8,4.6,5.4],[2.3,5.3,6.5],
  [-0.5,5.4,4.9],[-4.0,5.4,3.8],[-7.4,5.4,5.8],[-9.0,5.4,3.0],[-5.0,5.4,-2.6],[-1.4,5.4,0.6],
  [0.0,5.4,5.2],[2.6,5.4,4.6],
  [5.2,5.4,3.4],[7.9,5.4,5.9],[5.6,5.4,7.8],
  [1.7,5.5,3.3],[1.6,6.4,0.5],[2.8,7.6,-0.4],[2.8,8.6,5.2],
  [-2.2,9.1,3.7],[-5.8,9.4,2.6],
];
const curva = new THREE.CatmullRomCurve3(RUTA.map(p=>new THREE.Vector3(...p)), false, 'centripetal');
const CLEAR = 0.35;
let fallas = [];
for (let i=0;i<=400;i++){
  const t=i/400; const p=curva.getPoint(t);
  for (const [mn,mx] of cajas){
    const dx=Math.max(mn[0]-p.x, 0, p.x-mx[0]);
    const dy=Math.max(mn[1]-p.y, 0, p.y-mx[1]);
    const dz=Math.max(mn[2]-p.z, 0, p.z-mx[2]);
    const d=Math.hypot(dx,dy,dz);
    if (d<CLEAR){ fallas.push({t:+t.toFixed(3), p:[+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)], d:+d.toFixed(2), caja:[mn,mx]}); break; }
  }
  // cilindro rdc con y<3.1 = fachada de vidrio curva del vestíbulo
  const rx=p.x+3.1, rz=p.z+0.6; const r=Math.hypot(rx,rz);
  if (p.y<3.15 && Math.abs(r-4.3)<CLEAR+0.15) fallas.push({t:+t.toFixed(3), p:[+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)], d:'rdc'});
}
console.log('violaciones de holgura (<0.35):', fallas.length);
for (const f of fallas.slice(0,14)) console.log(' t=',f.t,'pos',f.p,'d',f.d,'caja',JSON.stringify(f.caja??''));
