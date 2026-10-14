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
  // 14-oct: el agua a veces se "rompía" sola, sin que nadie la tocara. Tres seguros:
  //  - coeficiente 1.6 (no 2.0): 2.0 es justo el borde de estabilidad del patrón más fino (tablero de ajedrez);
  //  - un poquito de suavizado hacia el promedio, que apaga ese patrón sin tocar las ondas grandes;
  //  - tope a la altura y la velocidad, y cero si llega un valor inválido.
  // La lentitud que pidió Alejo sale de dar menos pasos por segundo (RioLuna: uno cada ~33 ms).
  info.g += (promedio - info.r) * 1.6;
  info.g *= 0.993;
  info.r += info.g;
  info.r = mix(info.r, promedio, 0.015) * 0.996;
  info.rg = clamp(info.rg, vec2(-0.3), vec2(0.3));
  if (isnan(info.r) || isnan(info.g)) info.rg = vec2(0.0);
  color = info;
}`;

/*
  Composición final (14-oct). El cuadro de Blender trae SOLO el entorno (cielo, agua quieta, muelle). La luna, su
  reflejo, el eclipse, el movimiento continuo del agua, el camino de luz y el proyecto se dibujan aquí en vivo:
  - la luna es una esfera calculada con la textura real de la NASA (borde algo más oscuro) y sigue un poco al cursor;
  - el agua se mueve sola y despacio (olas por tiempo), y el cursor suma sus ondas;
  - el camino de luz sale de las olas: brilla donde la superficie refleja la luna, como en el agua de verdad.
*/
export const FINAL = `#version 300 es
precision highp float;
uniform sampler2D uCuadro;
uniform sampler2D uSim;
uniform sampler2D uProyecto;
uniform sampler2D uLuna;
uniform vec4 uCubre;
uniform vec2 uMascara;     // y del horizonte y del borde del piso (pantalla)
uniform vec3 uLunaCielo;   // centro y radio de la luna en el cielo (pantalla; radio en alturas)
uniform vec3 uDisco;       // centro y radio del reflejo en el agua
uniform float uEclipse;    // 0 llena → 1 eclipsada
uniform float uCerca;      // cursor cerca de la luna 0-1
uniform float uAspecto;
uniform float uVisible;
uniform float uProyAspecto;
uniform vec2 uDelta;
uniform float uTiempo;
in vec2 vUv;
out vec4 color;
const float PI = 3.14159265;

float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453);
  float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
  float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float causticas(vec2 p, float t) {
  float a = ruido(p + vec2(t * 0.6, -t * 0.4));
  float b = ruido(p * 1.7 + vec2(-t * 0.5, t * 0.7));
  return pow(1.0 - abs(a - b), 9.0);
}

// luna como esfera: d = posición dentro del disco (-1..1, y hacia abajo)
vec3 luna(vec2 d, float eclipse) {
  float r2 = dot(d, d);
  if (r2 >= 1.0) return vec3(0.0);
  vec3 n = vec3(d.x, -d.y, sqrt(1.0 - r2));
  float lon = atan(n.x, n.z), lat = asin(clamp(n.y, -1.0, 1.0));
  vec3 c = texture(uLuna, vec2(lon / (2.0 * PI) + 0.5, 0.5 - lat / PI)).rgb;
  float borde = mix(0.62, 1.0, pow(n.z, 0.35));
  float sombra = smoothstep(-0.16, 0.16, d.x - mix(-1.35, 1.35, eclipse));   // la sombra barre de izquierda a derecha
  return c * 1.18 * borde * sombra;
}

// brillo parejo alrededor del disco (no "detrás"): un poco sobre la luna y un aura que cae suave hacia afuera
vec3 aura(float l, float fuerza) {
  float afuera = exp(-max(0.0, l - 1.0) * 5.0) * step(1.0, l);
  float encima = (1.0 - smoothstep(0.0, 1.0, l)) * 0.06;
  return vec3(0.92, 0.94, 1.0) * fuerza * (afuera * 0.38 + encima);
}

// anillo fino del eclipse con un aura corta
vec3 anillo(float l, float eclipse) {
  float linea = exp(-pow((l - 1.012) / 0.012, 2.0));
  float halo = exp(-max(0.0, l - 1.0) * 14.0) * step(1.0, l) * 0.35;
  return vec3(0.95, 0.96, 1.0) * smoothstep(0.55, 1.0, eclipse) * (linea * 1.4 + halo);
}

// altura de las olas en el plano del agua (perspectiva aproximada): suma de trenes de onda lentos
float olas(vec2 w, float t) {
  float h = 0.0;
  h += sin(dot(w, vec2(0.0, 1.0)) * 7.0 + t * 0.55) * 0.5;
  h += sin(dot(w, vec2(0.38, 0.92)) * 11.0 - t * 0.7) * 0.28;
  h += sin(dot(w, vec2(-0.5, 0.86)) * 17.0 + t * 0.9) * 0.16;
  h += (ruido(w * vec2(6.0, 14.0) + vec2(0.0, t * 0.25)) - 0.5) * 0.35;
  return h;
}

void main() {
  vec2 pant = vec2(vUv.x, 1.0 - vUv.y);
  float agua = smoothstep(uMascara.x, uMascara.x + 0.015, pant.y) * (1.0 - smoothstep(uMascara.y - 0.012, uMascara.y, pant.y));
  float t = uTiempo;

  // plano del agua: cuanto más cerca del horizonte, más lejos (y las olas más chicas en pantalla)
  float prof = 1.0 / max(0.03, pant.y - uMascara.x + 0.08);
  vec2 w = vec2((pant.x - 0.5) * uAspecto * prof * 0.35, prof * 0.6);
  float e = 0.004;
  float h0 = olas(w, t);
  vec2 g = vec2(olas(w + vec2(e, 0.0), t) - h0, olas(w + vec2(0.0, e), t) - h0) / e;
  // ondas del cursor (simulación)
  float hx = texture(uSim, vUv + vec2(uDelta.x, 0.0)).r - texture(uSim, vUv - vec2(uDelta.x, 0.0)).r;
  float hy = texture(uSim, vUv + vec2(0.0, uDelta.y)).r - texture(uSim, vUv - vec2(0.0, uDelta.y)).r;
  vec2 n = (g * 0.00055 / prof + vec2(hx, -hy) * 0.5) * agua;      // inclinación total de la superficie

  vec2 p = pant + n * 0.9;
  vec3 col = texture(uCuadro, p * uCubre.xy + uCubre.zw).rgb;

  // luna en el cielo (por encima del horizonte)
  vec2 dc = (pant - uLunaCielo.xy) * vec2(uAspecto, 1.0) / max(uLunaCielo.z, 1e-4);
  float lc = length(dc);
  float cielo = 1.0 - smoothstep(uMascara.x - 0.004, uMascara.x + 0.004, pant.y);
  col += (luna(dc, uEclipse) + aura(lc, (1.0 - uEclipse) * (0.8 + uCerca * 0.9)) + anillo(lc, uEclipse)) * cielo;

  // reflejo en el agua: misma luna invertida, deformada por las olas, un poco más tenue
  // el reflejo se deforma más que el fondo (es luz sobre la superficie): de lado más que de arriba abajo, como en el agua real
  float franja = sin(w.y * 9.0 + t * 0.6) * 0.6 + sin(w.y * 23.0 - t * 0.9 + w.x * 1.5) * 0.4;
  vec2 pr = pant + n * 0.9 + vec2(franja * 0.0045 / (0.6 + prof * 0.15), 0.0) * agua;
  vec2 dr = (pr - uDisco.xy) * vec2(uAspecto, 1.0) / max(uDisco.z, 1e-4);
  dr.y = -dr.y;
  float lr = length(dr);
  vec3 refl = luna(dr, uEclipse) * 0.82 + aura(lr, (1.0 - uEclipse) * 0.55) + anillo(lr, uEclipse) * 0.9;
  col += refl * agua;

  // el agua se ve viva aunque el reflejo esté quieto: un brillo muy leve donde las olas se inclinan
  col += vec3(0.55, 0.62, 0.75) * smoothstep(0.0015, 0.006, length(n)) * 0.05 * agua;

  // proyecto dentro del disco del eclipse: sube desde el fondo (NACRE) y al irse se hunde
  vec2 q = (p - uDisco.xy) * vec2(uAspecto, 1.0);
  float dentro = 1.0 - smoothstep(uDisco.z * 0.86, uDisco.z * 0.92, length(q));
  if (dentro > 0.0 && uVisible > 0.0) {
    float hondo = 1.0 - uVisible;
    vec2 pu = q / (uDisco.z * 1.84) + 0.5;
    pu.x = (pu.x - 0.5) / max(uProyAspecto, 1.0) + 0.5;
    vec2 ola = vec2(ruido(pu * 5.0 + t * 0.35), ruido(pu * 5.0 - t * 0.3)) - 0.5;
    vec3 proy = texture(uProyecto, pu + ola * 0.09 * hondo + n * 0.3).rgb;
    proy = mix(proy, vec3(0.02, 0.07, 0.09), hondo * 0.85);
    proy += vec3(0.75, 0.9, 1.0) * causticas(pu * 7.0, t * 0.6) * (0.06 + 0.35 * hondo);
    col = mix(col, proy * mix(0.3, 0.95, uVisible), smoothstep(0.0, 0.35, uVisible) * dentro);
  }
  color = vec4(col, 1.0);
}`;
