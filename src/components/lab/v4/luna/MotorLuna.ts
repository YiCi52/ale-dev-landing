/*
  Motor 3D de la sección de la luna (three.js, cargado bajo demanda). Coordenadas:
  la pantalla se mapea al plano z = 0 de una cámara de perspectiva estrecha, así un
  punto en fracciones de pantalla cae exacto donde lo dibujan el SVG y el canvas 2D.
*/
import * as THREE from "three";

import { AURA_FRAGMENTO, AURA_VERTICE, LUNA_FRAGMENTO, LUNA_VERTICE, POLVO_FRAGMENTO, POLVO_VERTICE } from "./sombreadores";
import type { Punto } from "./textos";

const DISTANCIA = 10;
const FOV = 18;
const ALTO_VISIBLE = 2 * DISTANCIA * Math.tan((FOV * Math.PI) / 360);
const ORO = new THREE.Color("#b89c6e");
const CUARZO = new THREE.Color("#f3f0ea");

export type Cuadro = { x: number; y: number; radio: number; solida: number; polvo: number; tiempo: number };

export class MotorLuna {
  private render: THREE.WebGLRenderer;
  private escena = new THREE.Scene();
  private camara = new THREE.PerspectiveCamera(FOV, 1, 1, 40);
  private luna: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
  private aura: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private polvo: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null;
  private mapa: THREE.Texture;
  private giro = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.06, 0.12, 0));
  private vel = new THREE.Vector2(0, 0);
  private pendiente = new THREE.Vector2(0, 0);
  private arrastre: { x: number; y: number; id: number } | null = null;

  constructor(private lienzo: HTMLCanvasElement, rutaMapa: string) {
    this.render = new THREE.WebGLRenderer({ canvas: lienzo, alpha: true, antialias: true, premultipliedAlpha: true });
    this.render.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.render.setClearColor(0x000000, 0);
    this.camara.position.set(0, 0, DISTANCIA);
    this.mapa = new THREE.TextureLoader().load(rutaMapa);
    this.mapa.colorSpace = THREE.NoColorSpace;
    this.mapa.anisotropy = 8;
    const comunes = { glslVersion: THREE.GLSL3, transparent: true, depthWrite: false };
    this.luna = new THREE.Mesh(
      new THREE.SphereGeometry(1, 160, 96),
      new THREE.ShaderMaterial({
        ...comunes,
        premultipliedAlpha: true,
        vertexShader: LUNA_VERTICE,
        fragmentShader: LUNA_FRAGMENTO,
        uniforms: { uMapa: { value: this.mapa }, uLuz: { value: new THREE.Vector3(-0.32, 0.22, 0.92).normalize() }, uPolvo: { value: 0 }, uOpacidad: { value: 0 } },
      }),
    );
    this.aura = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 3.2),
      new THREE.ShaderMaterial({ ...comunes, blending: THREE.AdditiveBlending, vertexShader: AURA_VERTICE, fragmentShader: AURA_FRAGMENTO, uniforms: { uFuerza: { value: 0 } } }),
    );
    this.aura.position.z = -1.5;
    this.escena.add(this.aura, this.luna);
    lienzo.addEventListener("pointerdown", this.bajar);
    window.addEventListener("pointermove", this.mover);
    window.addEventListener("pointerup", this.soltar);
    window.addEventListener("pointercancel", this.soltar);
  }

  /** Pantalla (fracciones 0-1, y hacia abajo) → mundo en el plano z = 0. */
  private aMundo(fx: number, fy: number): THREE.Vector3 {
    return new THREE.Vector3((fx - 0.5) * ALTO_VISIBLE * this.camara.aspect, (0.5 - fy) * ALTO_VISIBLE, 0);
  }

  medir(): void {
    const w = this.lienzo.clientWidth, h = this.lienzo.clientHeight;
    this.render.setSize(w, h, false);
    this.camara.aspect = w / Math.max(1, h);
    this.camara.updateProjectionMatrix();
  }

  /** Arma el polvo: un grano por cada punto del texto, que sale de la cara visible de la luna. */
  ponerTexto(puntos: Punto[], ancho: number, alto: number, paso: number): void {
    if (this.polvo) { this.escena.remove(this.polvo); this.polvo.geometry.dispose(); this.polvo.material.dispose(); }
    const n = puntos.length;
    const inicio = new Float32Array(n * 3), destino = new Float32Array(n * 3), azar = new Float32Array(n * 4), tinta = new Float32Array(n * 3);
    puntos.forEach((p, i) => {
      const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      inicio.set([s * Math.cos(a), u, Math.abs(s * Math.sin(a)) * 0.98 + 0.02], i * 3);   // hemisferio que mira a la cámara
      const m = this.aMundo(p.x / ancho, p.y / alto);
      destino.set([m.x, m.y, 0], i * 3);
      azar.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      const c = p.oro ? ORO : CUARZO;
      tinta.set([c.r, c.g, c.b], i * 3);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(destino, 3));
    g.setAttribute("aInicio", new THREE.BufferAttribute(inicio, 3));
    g.setAttribute("aDestino", new THREE.BufferAttribute(destino, 3));
    g.setAttribute("aAzar", new THREE.BufferAttribute(azar, 4));
    g.setAttribute("aTinta", new THREE.BufferAttribute(tinta, 3));
    const dpr = this.render.getPixelRatio();
    const m = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, transparent: true, depthWrite: false, depthTest: false, premultipliedAlpha: true,
      vertexShader: POLVO_VERTICE, fragmentShader: POLVO_FRAGMENTO,
      uniforms: { uMapa: { value: this.mapa }, uRotInv: { value: new THREE.Matrix3() }, uCentro: { value: new THREE.Vector3() }, uRadio: { value: 1 }, uPolvo: { value: 0 }, uTiempo: { value: 0 }, uTam: { value: (paso * 0.9 + 0.6) * dpr } },
    });
    this.polvo = new THREE.Points(g, m);
    this.polvo.frustumCulled = false;
    this.escena.add(this.polvo);
  }

  /** ¿El punto (px CSS) cae sobre el disco de la luna? Para el cursor de "agarrar". */
  sobreLaLuna(px: number, py: number, c: Cuadro): boolean {
    const h = this.lienzo.clientHeight, w = this.lienzo.clientWidth;
    return Math.hypot(px - c.x * w, py - c.y * h) < c.radio * h && c.solida > 0.5 && c.polvo < 0.05;
  }

  dibujar(c: Cuadro, dt: number): void {
    // mientras se arrastra, la luna sigue al dedo; al soltar conserva el impulso y frena sola (inercia)
    let giro: THREE.Vector2;
    if (this.arrastre) {
      giro = this.pendiente.clone();
      this.pendiente.set(0, 0);
      this.vel.multiplyScalar(Math.pow(0.7, dt * 60));
    } else {
      this.vel.multiplyScalar(Math.pow(0.92, dt * 60));
      this.vel.x += 0.00009 * dt * 60;            // gira sola, muy despacio, cuando nadie la toca
      giro = this.vel;
    }
    const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), giro.x);
    const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), giro.y);
    this.giro.premultiply(qy).premultiply(qx).normalize();
    const centro = this.aMundo(c.x, c.y), radio = c.radio * ALTO_VISIBLE;
    this.luna.position.copy(centro);
    this.luna.scale.setScalar(radio);
    this.luna.quaternion.copy(this.giro);
    this.luna.material.uniforms.uOpacidad.value = c.solida;
    this.luna.material.uniforms.uPolvo.value = c.polvo;
    this.aura.position.set(centro.x, centro.y, -1.5);
    this.aura.scale.setScalar(radio * ((DISTANCIA + 1.5) / DISTANCIA));
    this.aura.material.uniforms.uFuerza.value = c.solida * (1 - c.polvo);
    if (this.polvo) {
      const u = this.polvo.material.uniforms;
      u.uCentro.value.copy(centro);
      u.uRadio.value = radio;
      u.uPolvo.value = c.polvo;
      u.uTiempo.value = c.tiempo;
      u.uRotInv.value.setFromMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(this.giro.clone().invert()));
    }
    this.render.render(this.escena, this.camara);
  }

  private bajar = (e: PointerEvent) => {
    this.arrastre = { x: e.clientX, y: e.clientY, id: e.pointerId };
    this.lienzo.style.cursor = "grabbing";
  };

  private mover = (e: PointerEvent) => {
    if (!this.arrastre || e.pointerId !== this.arrastre.id) return;
    const dx = e.clientX - this.arrastre.x, dy = e.clientY - this.arrastre.y;
    this.arrastre = { ...this.arrastre, x: e.clientX, y: e.clientY };
    const d = new THREE.Vector2(dx * 0.006, e.pointerType === "touch" ? 0 : dy * 0.006);   // con el dedo, vertical es scroll
    this.pendiente.add(d);
    this.vel.copy(d);
  };

  private soltar = () => {
    this.arrastre = null;
    this.lienzo.style.cursor = "";
  };

  destruir(): void {
    this.lienzo.removeEventListener("pointerdown", this.bajar);
    window.removeEventListener("pointermove", this.mover);
    window.removeEventListener("pointerup", this.soltar);
    window.removeEventListener("pointercancel", this.soltar);
    this.polvo?.geometry.dispose();
    this.polvo?.material.dispose();
    this.luna.geometry.dispose();
    this.luna.material.dispose();
    this.aura.geometry.dispose();
    this.aura.material.dispose();
    this.mapa.dispose();
    this.render.dispose();
  }
}
