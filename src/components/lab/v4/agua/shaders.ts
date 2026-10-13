/*
  Shaders del agua de la galería v4. La superficie se simula con la ecuación de
  onda clásica (el mismo método de jquery.ripples, sirxemic, MIT): cada píxel
  guarda altura y velocidad; el cursor deja "gotas" y las ondas se propagan y
  se apagan solas.
*/

export const VERTICE = `#version 300 es
in vec2 aPos;
out vec2 vUv;   // y hacia ARRIBA (convención de las texturas de render); la pantalla (y abajo) se deriva en FINAL
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/** Suma una gota redonda y suave a la altura. */
export const GOTA = `#version 300 es
precision highp float;
uniform sampler2D uSim;
uniform vec2 uCentro;
uniform float uRadio;
uniform float uFuerza;
uniform float uAspecto;
in vec2 vUv;
out vec4 color;
const float PI = 3.14159265;
void main() {
  vec4 info = texture(uSim, vUv);
  float d = length((uCentro - vUv) * vec2(uAspecto, 1.0));
  float gota = max(0.0, 1.0 - d / uRadio);
  gota = 0.5 - cos(gota * PI) * 0.5;
  info.r += gota * uFuerza;
  color = info;
}`;

/** Un paso de la ecuación de onda: r = altura, g = velocidad. */
export const PASO = `#version 300 es
precision highp float;
uniform sampler2D uSim;
uniform vec2 uDelta;
in vec2 vUv;
out vec4 color;
void main() {
  vec4 info = texture(uSim, vUv);
  float promedio = (
    texture(uSim, vUv - vec2(uDelta.x, 0.0)).r + texture(uSim, vUv + vec2(uDelta.x, 0.0)).r +
    texture(uSim, vUv - vec2(0.0, uDelta.y)).r + texture(uSim, vUv + vec2(0.0, uDelta.y)).r
  ) * 0.25;
  info.g += (promedio - info.r) * 2.0;
  info.g *= 0.993;
  info.r += info.g;
  info.r *= 0.996;
  color = info;
}`;

/*
  Composición final: el cuadro pre-renderizado (deformado por las ondas solo
  donde hay agua), un brillo especular de las crestas y, dentro del disco negro
  del eclipse, el proyecto como reflejo que aparece y se disuelve "como azúcar
  en agua" según el scroll.
*/
export const FINAL = `#version 300 es
precision highp float;
uniform sampler2D uCuadro;
uniform sampler2D uSim;
uniform sampler2D uProyecto;
uniform vec4 uCubre;      // escala.xy y desplazamiento.xy: pantalla -> cuadro (object-fit: cover)
uniform vec2 uMascara;    // y del horizonte y del borde del piso, en pantalla
uniform vec3 uDisco;      // centro.xy en pantalla y radio en alturas de pantalla
uniform float uAspecto;
uniform float uVisible;   // 0 = proyecto disuelto, 1 = entero
uniform float uProyAspecto;
uniform vec2 uDelta;
in vec2 vUv;
out vec4 color;

float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453);
  float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
  float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
  vec2 pant = vec2(vUv.x, 1.0 - vUv.y);                 // pantalla, y hacia abajo (cuadros, máscara, disco)
  float agua = smoothstep(uMascara.x, uMascara.x + 0.02, pant.y) * (1.0 - smoothstep(uMascara.y - 0.015, uMascara.y, pant.y));
  float hx = texture(uSim, vUv + vec2(uDelta.x, 0.0)).r - texture(uSim, vUv - vec2(uDelta.x, 0.0)).r;
  float hy = texture(uSim, vUv + vec2(0.0, uDelta.y)).r - texture(uSim, vUv - vec2(0.0, uDelta.y)).r;
  vec2 desvio = vec2(hx, -hy) * 0.9 * agua;
  vec2 p = pant + desvio;
  vec3 col = texture(uCuadro, p * uCubre.xy + uCubre.zw).rgb;

  vec3 n = normalize(vec3(-hx * 60.0, 1.0, hy * 60.0));
  float brillo = pow(max(0.0, dot(n, normalize(vec3(-0.5, 1.0, 0.6)))), 80.0) * agua;
  col += vec3(0.85, 0.88, 0.95) * brillo * 0.3;

  vec2 q = (p - uDisco.xy) * vec2(uAspecto, 1.0);
  float dentro = 1.0 - smoothstep(uDisco.z * 0.86, uDisco.z * 0.92, length(q));
  if (dentro > 0.0 && uVisible > 0.0) {
    vec2 pu = q / (uDisco.z * 1.84) + 0.5;
    pu.x = (pu.x - 0.5) / max(uProyAspecto, 1.0) + 0.5;
    pu.y = 1.0 - pu.y;                                   // reflejo: la imagen va invertida
    float grano = ruido(pu * 70.0) * 0.55 + ruido(pu * 9.0) * 0.45;
    float a = smoothstep(0.0, 0.06, uVisible * 1.12 - grano);
    vec3 proy = texture(uProyecto, pu).rgb * 0.78;
    col = mix(col, proy, a * dentro);
  }
  color = vec4(col, 1.0);
}`;
