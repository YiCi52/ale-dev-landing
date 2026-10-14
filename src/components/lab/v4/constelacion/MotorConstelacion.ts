/*
  Motor 3D de la prueba de la constelación (three.js, cargado bajo demanda): estrellas con halo suave, líneas
  finas, un cielo de fondo muy tenue, giro lento y arrastre con inercia. Las etiquetas son HTML: el motor
  devuelve en cada cuadro dónde cae cada estrella en pantalla y la página las coloca.
*/
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { CENTRO, ESTRELLAS, LINEAS, type Estrella } from "./estrellas";

const VERTICE = /* glsl */ `
attribute float aBrillo; attribute float aGrupo;
uniform float uDpr; uniform float uActivo; uniform float uTiempo;
varying float vBrillo; varying float vActiva;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float activa = (uActivo < -1.5 || aGrupo == uActivo || aGrupo < -0.5) ? 1.0 : 0.25;
  vActiva = activa;
  vBrillo = aBrillo * (0.9 + 0.1 * sin(uTiempo * 1.3 + position.x * 7.0));   // titila apenas
  gl_PointSize = (14.0 + 22.0 * aBrillo) * uDpr * (8.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;

const FRAGMENTO = /* glsl */ `
varying float vBrillo; varying float vActiva;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float nucleo = exp(-d * d * 9.0), halo = exp(-d * 2.6) * 0.55;
  float a = (nucleo + halo) * vBrillo * vActiva;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vec3(0.96, 0.95, 0.92) * a, a);
}`;

export type EnPantalla = { estrella: Estrella; x: number; y: number; z: number };

export class MotorConstelacion {
  private render: THREE.WebGLRenderer;
  private escena = new THREE.Scene();
  private camara = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  private controles: OrbitControls;
  private estrellas: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private lineas: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private todas = [CENTRO, ...ESTRELLAS];

  constructor(private lienzo: HTMLCanvasElement) {
    this.render = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true });
    this.render.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.camara.position.set(0, 0.6, 9.5);
    this.controles = new OrbitControls(this.camara, lienzo);
    Object.assign(this.controles, { enableDamping: true, dampingFactor: 0.06, enableZoom: false, enablePan: false, autoRotate: true, autoRotateSpeed: 0.35, rotateSpeed: 0.6 });

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.todas.flatMap((s) => s.pos), 3));
    g.setAttribute("aBrillo", new THREE.Float32BufferAttribute(this.todas.map((s) => s.brillo), 1));
    g.setAttribute("aGrupo", new THREE.Float32BufferAttribute(this.todas.map((s) => s.grupo), 1));
    this.estrellas = new THREE.Points(g, new THREE.ShaderMaterial({
      vertexShader: VERTICE, fragmentShader: FRAGMENTO, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uDpr: { value: this.render.getPixelRatio() }, uActivo: { value: -2 }, uTiempo: { value: 0 } },
    }));
    const gl = new THREE.BufferGeometry();
    gl.setAttribute("position", new THREE.Float32BufferAttribute(LINEAS.flatMap(([a, b]) => [...a.pos, ...b.pos]), 3));
    this.lineas = new THREE.LineSegments(gl, new THREE.LineBasicMaterial({ color: 0xb89c6e, transparent: true, opacity: 0.35 }));
    this.escena.add(this.lineas, this.estrellas, this.cielo());
  }

  /** Polvo de estrellas lejanas, muy tenue (Alejo pidió pocas estrellas: son 260 y casi no se ven). */
  private cielo(): THREE.Points {
    const n = 260, p: number[] = [];
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      p.push(s * Math.cos(a) * 30, u * 30, s * Math.sin(a) * 30);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9a978f, size: 0.05, transparent: true, opacity: 0.5 }));
  }

  medir(): void {
    const w = this.lienzo.clientWidth, h = this.lienzo.clientHeight;
    this.render.setSize(w, h, false);
    this.camara.aspect = w / Math.max(1, h);
    // la constelación se corre fuera del título: a la derecha en pantalla ancha, hacia abajo en celular
    const angosto = w < 720;
    this.camara.position.setLength(angosto ? 20 : 11);
    this.camara.setViewOffset(w, h, angosto ? 0 : -w * 0.14, angosto ? -h * 0.2 : 0, w, h);
    this.camara.updateProjectionMatrix();
  }

  /** Grupo resaltado (-2 = ninguno). */
  resaltar(grupo: number): void {
    this.estrellas.material.uniforms.uActivo.value = grupo;
    this.lineas.material.opacity = grupo < -1.5 ? 0.35 : 0.2;
  }

  dibujar(tiempo: number): EnPantalla[] {
    this.controles.update();
    this.estrellas.material.uniforms.uTiempo.value = tiempo;
    this.render.render(this.escena, this.camara);
    const w = this.lienzo.clientWidth, h = this.lienzo.clientHeight, v = new THREE.Vector3();
    return this.todas.map((s) => {
      v.set(...s.pos).project(this.camara);
      return { estrella: s, x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, z: v.z };
    });
  }

  destruir(): void {
    this.controles.dispose();
    this.estrellas.geometry.dispose(); this.estrellas.material.dispose();
    this.lineas.geometry.dispose(); this.lineas.material.dispose();
    this.render.dispose();
  }
}
