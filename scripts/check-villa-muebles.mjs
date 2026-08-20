/*
  Verifica el recorrido contra los MUEBLES — el hueco que dejó
  check-villa-tour.mjs, que solo mira muros.

  Los muebles entraron en la ronda 8, despues de validar el tour, y nadie
  volvio a correr nada contra ellos. Resultado: la camara atraviesa el jarron,
  la poltrona, la mesa de centro, la MESA DEL COMEDOR (t=0.50) y casi todo el
  set exterior de la terraza (t=0.64-0.74). Se ve como "una pared atraviesa la
  mesa" cuando en realidad el ojo esta DENTRO del mueble.

  Correr junto con check-villa-tour.mjs cada vez que se mueva la ruta O se
  muevan los muebles. Las posiciones se copian de muebles.ts a mano: si
  cambian alla, cambiarlas aca.
*/
import * as THREE from 'three';
// muros de la planta real (portados de check-villa-tour)
const H_P=3.3, W=20, D=20, HV=3.25, T=0.3, yB=H_P, yLP=yB+0.15, yT=yB+HV;
const muros = [
  ['vidriera sur', [0.89,yLP+.15,-3.5],[1.01,yT,4.6]],
  ['vidriera norte',[0.89,yLP+.15,6.4],[1.01,yT,7.2]],
  ['muro z=-3.5 oeste',[-9.65,yLP+.15,-3.575],[-2.2,yT,-3.425]],
  ['muro z=-3.5 este',[-0.9,yLP+.15,-3.575],[1.0,yT,-3.425]],
  ['muro cocina x=-4.5',[-4.575,yLP+.15,-9.65],[-4.425,yT,-5.2]],
  ['fachada oeste',[-W/2,yB,-10],[-W/2+T,yT,10]],
  ['fachada sur',[-10,yB,D/2-T],[10,yT,D/2]],
  ['fachada norte',[-10,yB,-D/2],[10,yT,-D/2+T]],
  ['fachada este',[W/2-T,yB,-10],[W/2,yT,10]],
];
// muebles del nobile (de muebles.ts) con radio aproximado de su huella
const Y=3.625;
const piezas = [
  ['lounge chair A',-8.3,Y,1.2,0.45],['lounge chair B',-8.3,Y,-1.4,0.45],
  ['mesa centro 01',-6.9,Y,-0.1,0.55],['bowl',-6.7,Y+0.45,-0.45,0.15],
  ['arm chair',-6.2,Y,2.4,0.45],['mesa centro 02',-5.6,Y,3.35,0.5],
  ['vase',-9.0,Y,3.4,0.2],['planta salón',-8.9,Y,7.6,0.4],
  ['MESA COMEDOR',-2.4,Y,-1.6,0.9],
  ['silla com. A',-1.5,Y,-0.9,0.35],['silla com. B',-3.3,Y,-0.9,0.35],['silla com. C',-2.4,Y,-2.7,0.35],
  ['jarrón com.',-2.4,Y+0.75,-1.6,0.15],
  ['set exterior',6.4,Y,4.4,1.1],['jardinera A',8.6,Y,8.3,0.5],['jardinera B',4.6,Y,8.9,0.5],
];
const dist = (p,[mn,mx]) => {
  const dx=Math.max(mn[0]-p.x,0,p.x-mx[0]), dy=Math.max(mn[1]-p.y,0,p.y-mx[1]), dz=Math.max(mn[2]-p.z,0,p.z-mx[2]);
  return Math.hypot(dx,dy,dz);
};
console.log('=== MUEBLES QUE CHOCAN CON MUROS ===');
let n=0;
for (const [nom,x,y,z,r] of piezas){
  const p=new THREE.Vector3(x,y+0.4,z);
  for (const [mn,a,b] of muros){
    const d=dist(p,[a,b]);
    if (d < r){ console.log(`  ⚠️ ${nom.padEnd(16)} atraviesa "${mn}" (dist ${d.toFixed(2)} < radio ${r})`); n++; }
    else if (d < r+0.25) console.log(`  ~  ${nom.padEnd(16)} roza "${mn}" (holgura ${(d-r).toFixed(2)} m)`);
  }
}
if(!n) console.log('  (ninguno atraviesa)');

console.log('\n=== EL RECORRIDO CONTRA LOS MUEBLES ===');
const RUTA=[[2,2.0,34],[0.5,1.95,14],[0.3,1.9,6.9],[1.7,2.05,7.2],[1.7,3.25,1.2],[2.65,3.42,-0.5],[2.8,4.6,5.4],[2.3,5.3,6.5],[-0.5,5.4,4.9],[-4.0,5.4,3.8],[-7.4,5.4,5.8],[-9.0,5.4,3.0],[-5.0,5.4,-2.6],[-1.4,5.4,0.6],[0.0,5.4,5.2],[2.6,5.4,4.6],[5.2,5.4,3.4],[7.9,5.4,5.9],[7.4,5.4,3.6],[5.6,5.4,7.8],[1.7,5.5,3.3],[1.6,6.4,0.5],[2.8,7.6,-0.4],[2.8,8.6,5.2],[-2.2,9.1,3.7],[-5.8,9.4,2.6]];
const curva=new THREE.CatmullRomCurve3(RUTA.map(p=>new THREE.Vector3(...p)),false,'centripetal');
let choques=0;
for(let i=0;i<=400;i++){
  const p=curva.getPoint(i/400);
  for(const [nom,x,y,z,r] of piezas){
    const dh=Math.hypot(p.x-x,p.z-z);
    if (dh < r+0.3 && Math.abs(p.y-(y+0.6)) < 1.2){ console.log(`  ⚠️ t=${(i/400).toFixed(2)} la cámara pasa por dentro de ${nom}`); choques++; break; }
  }
}
if(!choques) console.log('  (el recorrido no atraviesa muebles)');
