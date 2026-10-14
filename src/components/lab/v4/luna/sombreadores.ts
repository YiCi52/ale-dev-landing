/*
  Sombreadores de la luna 3D y de su polvo (GLSL 3, three.js ShaderMaterial).
  La luna usa la ley de Lommel-Seeliger (la del polvo lunar: por eso la luna llena se
  ve como un disco parejo y no como una bola con degradé) y el relieve sale de la misma
  textura de la NASA. El viento la erosiona de izquierda a derecha; cada grano que se
  suelta es una partícula que viaja hasta su lugar en el texto de las 14 capas.
*/

const COMUN = /* glsl */ `
const float PI = 3.14159265;
vec2 equi(vec3 d) { return vec2(atan(d.x, d.z) / (2.0 * PI) + 0.5, asin(clamp(d.y, -1.0, 1.0)) / PI + 0.5); }
float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float ruido(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
// cuándo se suelta un punto de la superficie: primero el borde izquierdo (de donde viene el viento)
float retraso(vec3 dirMundo, float azar) { return (dirMundo.x + 1.0) * 0.5 * 0.45 + azar * 0.15; }
`;

export const LUNA_VERTICE = /* glsl */ `
out vec3 vLocal; out vec3 vN; out vec3 vT; out vec3 vB; out vec3 vMundo;
void main() {
  vLocal = normalize(position);
  vec3 este = normalize(cross(vec3(0.0, 1.0, 0.0), vLocal + vec3(1e-4, 0.0, 0.0)));
  vN = normalize(normalMatrix * normal);
  vT = normalize(normalMatrix * este);
  vB = normalize(normalMatrix * cross(vLocal, este));
  vMundo = normalize(mat3(modelMatrix) * vLocal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const LUNA_FRAGMENTO = /* glsl */ `
precision highp float;
uniform sampler2D uMapa; uniform vec3 uLuz; uniform float uPolvo; uniform float uOpacidad;
in vec3 vLocal; in vec3 vN; in vec3 vT; in vec3 vB; in vec3 vMundo;
out vec4 color;
${COMUN}
float alto(vec2 uv) { return dot(texture(uMapa, uv).rgb, vec3(0.333)); }
void main() {
  float azar = ruido(vLocal * 9.0) * 0.7 + ruido(vLocal * 40.0) * 0.3;
  float suelta = retraso(vMundo, azar) + 0.02;
  if (uPolvo > suelta) discard;
  vec2 uv = equi(vLocal);
  vec2 e = vec2(1.0 / 2048.0, 1.0 / 1024.0);
  float du = alto(uv + vec2(e.x, 0.0)) - alto(uv - vec2(e.x, 0.0));
  float dv = alto(uv + vec2(0.0, e.y)) - alto(uv - vec2(0.0, e.y));
  vec3 n = normalize(normalize(vN) - (du * normalize(vT) + dv * normalize(vB)) * 3.5);
  vec3 v = vec3(0.0, 0.0, 1.0);
  float mu0 = max(dot(n, uLuz), 0.0), mu = max(dot(n, v), 0.05);
  float brillo = mu0 / (mu0 + mu) * 1.9;              // Lommel-Seeliger
  vec3 albedo = pow(texture(uMapa, uv).rgb, vec3(1.1));
  vec3 c = albedo * brillo + albedo * 0.025;
  // el borde que el viento está por soltar se ve un poco más claro (polvo levantándose)
  float borde = 1.0 - smoothstep(0.0, 0.03, suelta - uPolvo);
  c += vec3(0.85, 0.82, 0.76) * borde * step(0.001, uPolvo) * 0.6;
  color = vec4(c * uOpacidad, uOpacidad);
}`;

export const AURA_FRAGMENTO = /* glsl */ `
precision highp float;
uniform float uFuerza; in vec2 vUv; out vec4 color;
void main() {
  float d = length(vUv - 0.5) * 2.0 * 1.6;          // 1.0 = borde de la luna
  float a = d < 1.0 ? 0.0 : exp(-(d - 1.0) * 5.5) * 0.55 + exp(-(d - 1.0) * 1.6) * 0.12;
  color = vec4(vec3(0.86, 0.88, 0.93) * a * uFuerza, 0.0);
}`;

export const AURA_VERTICE = /* glsl */ `
out vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

export const POLVO_VERTICE = /* glsl */ `
uniform sampler2D uMapa; uniform mat3 uRotInv; uniform vec3 uCentro; uniform float uRadio;
uniform float uPolvo; uniform float uTiempo; uniform float uTam;
in vec3 aInicio; in vec3 aDestino; in vec4 aAzar; in vec3 aTinta;
out vec3 vColor; out float vVivo;
${COMUN}
void main() {
  float r = retraso(aInicio, aAzar.x);
  float k = clamp((uPolvo - r) / 0.4, 0.0, 1.0);
  float e = k * k * (3.0 - 2.0 * k);
  float arco = sin(PI * e);
  vec3 pos = mix(uCentro + aInicio * uRadio, aDestino, e);
  pos += vec3((0.5 + aAzar.y * 1.3) * uRadio, (aAzar.z - 0.5) * 0.7 * uRadio, aAzar.w * 0.6 * uRadio) * arco;
  pos.y += sin(uTiempo * 0.8 + aAzar.w * 6.28) * 0.012 * uRadio * arco;
  pos.xy += vec2(sin(uTiempo * 0.9 + aAzar.x * 40.0), cos(uTiempo * 0.7 + aAzar.y * 30.0)) * 0.0015 * step(0.999, e);
  vec3 gris = pow(textureLod(uMapa, equi(uRotInv * aInicio), 0.0).rgb, vec3(1.1)) * 1.2;
  vColor = mix(gris, aTinta, e);
  vVivo = step(0.0001, k);
  gl_PointSize = uTam * (1.0 + arco * 0.8);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;

export const POLVO_FRAGMENTO = /* glsl */ `
precision highp float;
in vec3 vColor; in float vVivo; out vec4 color;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float a = (1.0 - smoothstep(0.32, 0.5, length(c))) * vVivo;
  if (a <= 0.01) discard;
  color = vec4(vColor * a, a);
}`;
