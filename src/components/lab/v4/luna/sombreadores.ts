/*
  Sombreadores de la luna 3D y de su polvo (GLSL 3, three.js ShaderMaterial).
  La luna usa la ley de Lommel-Seeliger (la del polvo lunar: por eso la luna llena se
  ve como un disco parejo y no como una bola con degradé) y el relieve sale de la misma
  textura de la NASA. (14-oct: se quitó el polvo que escribía las capas; Alejo lo rechazó.)
*/

const COMUN = /* glsl */ `
const float PI = 3.14159265;
vec2 equi(vec3 d) { return vec2(atan(d.x, d.z) / (2.0 * PI) + 0.5, asin(clamp(d.y, -1.0, 1.0)) / PI + 0.5); }
`;

export const LUNA_VERTICE = /* glsl */ `
out vec3 vLocal; out vec3 vN; out vec3 vT; out vec3 vB;
void main() {
  vLocal = normalize(position);
  vec3 este = normalize(cross(vec3(0.0, 1.0, 0.0), vLocal + vec3(1e-4, 0.0, 0.0)));
  vN = normalize(normalMatrix * normal);
  vT = normalize(normalMatrix * este);
  vB = normalize(normalMatrix * cross(vLocal, este));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const LUNA_FRAGMENTO = /* glsl */ `
precision highp float;
uniform sampler2D uMapa; uniform vec3 uLuz; uniform float uOpacidad;
in vec3 vLocal; in vec3 vN; in vec3 vT; in vec3 vB;
out vec4 color;
${COMUN}
float alto(vec2 uv) { return dot(texture(uMapa, uv).rgb, vec3(0.333)); }
void main() {
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
