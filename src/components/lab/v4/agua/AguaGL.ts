import { FINAL, GOTA, PASO, VERTICE } from "./shaders";

/*
  Motor del agua de la galería v4 (WebGL2, sin librerías). Dibuja el cuadro
  pre-renderizado del río, lo deforma con una simulación de ondas que mueve el
  cursor y mete el proyecto dentro del disco negro del eclipse. Si el navegador
  no tiene WebGL2 con texturas de coma flotante, `crear()` devuelve null y la
  página cae al canvas 2D de siempre.
*/
export type Escena = {
  cubre: [number, number, number, number];
  mascara: [number, number];
  /** reflejo de la luna en el agua: x, y, radio (pantalla) */
  disco: [number, number, number];
  /** luna en el cielo: x, y, radio (pantalla) */
  lunaCielo: [number, number, number];
  eclipse: number;
  cerca: number;
  visible: number;
};

type Programa = { prog: WebGLProgram; u: (n: string) => WebGLUniformLocation | null };
type Objetivo = { tex: WebGLTexture; fb: WebGLFramebuffer };

function compilar(gl: WebGL2RenderingContext, frag: string): Programa {
  const crearShader = (tipo: number, src: string) => {
    const s = gl.createShader(tipo)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, crearShader(gl.VERTEX_SHADER, VERTICE));
  gl.attachShader(prog, crearShader(gl.FRAGMENT_SHADER, frag));
  gl.bindAttribLocation(prog, 0, "aPos");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "programa");
  const cache = new Map<string, WebGLUniformLocation | null>();
  return { prog, u: (n) => (cache.has(n) ? cache.get(n)! : (cache.set(n, gl.getUniformLocation(prog, n)), cache.get(n)!)) };
}

function textura(gl: WebGL2RenderingContext, filtro: number): WebGLTexture {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtro);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtro);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

export class AguaGL {
  private sim: [Objetivo, Objetivo];
  private cuadro: WebGLTexture;
  private proyecto: WebGLTexture;
  private luna: WebGLTexture;
  private proyAspecto = 1.5;
  private pGota: Programa;
  private pPaso: Programa;
  private pFinal: Programa;
  private ancho = 256;
  private alto = 256;

  private constructor(private gl: WebGL2RenderingContext, private canvas: HTMLCanvasElement) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.pGota = compilar(gl, GOTA);
    this.pPaso = compilar(gl, PASO);
    this.pFinal = compilar(gl, FINAL);
    this.cuadro = textura(gl, gl.LINEAR);
    this.proyecto = textura(gl, gl.LINEAR);
    this.luna = textura(gl, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    this.sim = [this.objetivo(), this.objetivo()];
  }

  static crear(canvas: HTMLCanvasElement): AguaGL | null {
    const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: false });
    if (!gl || !gl.getExtension("EXT_color_buffer_float")) return null;
    try {
      return new AguaGL(gl, canvas);
    } catch {
      return null;
    }
  }

  private objetivo(): Objetivo {
    const gl = this.gl;
    const tex = textura(gl, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, this.ancho, this.alto, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex, fb };
  }

  /** Ajusta el lienzo al tamaño mostrado y la resolución de la simulación a su proporción. */
  ajustar(): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(this.canvas.clientWidth * dpr);
    const h = Math.round(this.canvas.clientHeight * dpr);
    if (this.canvas.width === w && this.canvas.height === h) return;
    this.canvas.width = w;
    this.canvas.height = h;
    const altoSim = Math.max(128, Math.round(256 * (h / Math.max(1, w))));
    if (altoSim !== this.alto) {
      this.alto = altoSim;
      this.sim = [this.objetivo(), this.objetivo()];
    }
  }

  ponerCuadro(img: HTMLImageElement): void {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.cuadro);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  }

  ponerLuna(img: HTMLImageElement): void {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.luna);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  }

  ponerProyecto(img: HTMLImageElement): void {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.proyecto);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    this.proyAspecto = img.naturalWidth / Math.max(1, img.naturalHeight);
  }

  private pasada(p: Programa, destino: Objetivo | null, uniformes: (p: Programa) => void): void {
    const gl = this.gl;
    gl.useProgram(p.prog);
    gl.bindFramebuffer(gl.FRAMEBUFFER, destino ? destino.fb : null);
    gl.viewport(0, 0, destino ? this.ancho : this.canvas.width, destino ? this.alto : this.canvas.height);
    uniformes(p);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private conSim(p: Programa, unidad = 0): void {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unidad);
    gl.bindTexture(gl.TEXTURE_2D, this.sim[0].tex);
    gl.uniform1i(p.u("uSim"), unidad);
  }

  /** Gota en coordenadas de pantalla (x, y en 0-1, y hacia abajo); radio en alturas de pantalla. */
  gota(x: number, y: number, radio: number, fuerza: number): void {
    const gl = this.gl;
    this.pasada(this.pGota, this.sim[1], (p) => {
      this.conSim(p);
      gl.uniform2f(p.u("uCentro"), x, 1 - y);
      gl.uniform1f(p.u("uRadio"), radio);
      gl.uniform1f(p.u("uFuerza"), fuerza);
      gl.uniform1f(p.u("uAspecto"), this.canvas.width / Math.max(1, this.canvas.height));
    });
    this.sim.reverse();
  }

  paso(): void {
    this.pasada(this.pPaso, this.sim[1], (p) => {
      this.conSim(p);
      this.gl.uniform2f(p.u("uDelta"), 1 / this.ancho, 1 / this.alto);
    });
    this.sim.reverse();
  }

  dibujar(e: Escena): void {
    const gl = this.gl;
    this.pasada(this.pFinal, null, (p) => {
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.cuadro); gl.uniform1i(p.u("uCuadro"), 1);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.proyecto); gl.uniform1i(p.u("uProyecto"), 2);
      gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, this.luna); gl.uniform1i(p.u("uLuna"), 3);
      this.conSim(p);
      gl.uniform4f(p.u("uCubre"), ...e.cubre);
      gl.uniform2f(p.u("uMascara"), ...e.mascara);
      gl.uniform3f(p.u("uDisco"), ...e.disco);
      gl.uniform1f(p.u("uVisible"), e.visible);
      gl.uniform1f(p.u("uAspecto"), this.canvas.width / Math.max(1, this.canvas.height));
      gl.uniform1f(p.u("uProyAspecto"), this.proyAspecto);
      gl.uniform2f(p.u("uDelta"), 1 / this.ancho, 1 / this.alto);
      gl.uniform1f(p.u("uTiempo"), performance.now() / 1000);
      gl.uniform3f(p.u("uLunaCielo"), ...e.lunaCielo);
      gl.uniform1f(p.u("uEclipse"), e.eclipse);
      gl.uniform1f(p.u("uCerca"), e.cerca);
    });
  }

  /*
    Libera texturas y programas pero NO pierde el contexto: en desarrollo React
    monta el efecto dos veces sobre el MISMO <canvas>, y un contexto perdido
    deja el lienzo en blanco para el segundo montaje (pasó el 13-oct).
  */
  destruir(): void {
    const gl = this.gl;
    [this.cuadro, this.proyecto, this.luna, ...this.sim.map((o) => o.tex)].forEach((t) => gl.deleteTexture(t));
    this.sim.forEach((o) => gl.deleteFramebuffer(o.fb));
    [this.pGota, this.pPaso, this.pFinal].forEach((p) => gl.deleteProgram(p.prog));
  }
}
