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
uniform float uTiempo;
uniform float uLuz;       // brillo de la luna (1 llena → 0 eclipsada): manda el camino de luz
uniform vec4 uLunaCielo;  // x, y, radio de la luna en el cielo (pantalla) y cercanía del cursor (0-1)
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

// redes de luz del fondo (cáusticas): dos campos de ruido que se cruzan, como en el agua clara
float causticas(vec2 p, float t) {
  float a = ruido(p + vec2(t * 0.6, -t * 0.4));
  float b = ruido(p * 1.7 + vec2(-t * 0.5, t * 0.7));
  return pow(1.0 - abs(a - b), 9.0);
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

  // camino de luz: destellos que titilan en una columna bajo la luna, más ancha cerca del muelle
  float ancho = mix(0.02, 0.16, smoothstep(uMascara.x, 1.0, pant.y));
  float columna = exp(-pow((pant.x - uDisco.x) * uAspecto / ancho, 2.0)) * agua * uLuz;
  // destellos sueltos y alargados a lo ancho (como en el agua real), que titilan; no tapan el reflejo de la luna
  float destello = pow(ruido(vec2(pant.x * uAspecto * 70.0, pant.y * 260.0 + uTiempo * 1.3)), 30.0);
  float fueraLuna = smoothstep(uDisco.z * 0.95, uDisco.z * 1.25, length((pant - uDisco.xy) * vec2(uAspecto, 1.0)));
  col += vec3(0.9, 0.92, 1.0) * columna * (destello * 1.8 * fueraLuna + 0.02);

  // la luna del cielo responde al cursor: un resplandor suave que crece al acercarse
  float dl = length((pant - uLunaCielo.xy) * vec2(uAspecto, 1.0));
  col += vec3(0.85, 0.88, 0.95) * uLunaCielo.w * 0.35 * smoothstep(uLunaCielo.z * 2.6, uLunaCielo.z * 0.9, dl) * step(uLunaCielo.z * 0.98, dl);

  // proyecto dentro del disco del eclipse: SUBE desde el fondo (referencia NACRE, video 198) y al irse se hunde
  vec2 q = (p - uDisco.xy) * vec2(uAspecto, 1.0);
  float dentro = 1.0 - smoothstep(uDisco.z * 0.86, uDisco.z * 0.92, length(q));
  if (dentro > 0.0 && uVisible > 0.0) {
    float hondo = 1.0 - uVisible;
    vec2 pu = q / (uDisco.z * 1.84) + 0.5;
    pu.x = (pu.x - 0.5) / max(uProyAspecto, 1.0) + 0.5;          // al derecho: es una página, no un espejo
    vec2 ola = vec2(ruido(pu * 5.0 + uTiempo * 0.5), ruido(pu * 5.0 - uTiempo * 0.45)) - 0.5;
    vec3 proy = texture(uProyecto, pu + ola * 0.09 * hondo).rgb;
    proy = mix(proy, vec3(0.02, 0.07, 0.09), hondo * 0.85);        // el agua tiñe lo que está hondo
    proy += vec3(0.75, 0.9, 1.0) * causticas(pu * 7.0, uTiempo) * (0.08 + 0.35 * hondo);
    col = mix(col, proy * mix(0.3, 0.95, uVisible), smoothstep(0.0, 0.35, uVisible) * dentro);
  }
  color = vec4(col, 1.0);
}`;
