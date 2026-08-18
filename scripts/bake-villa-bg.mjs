// Bake del fondo de la Villa Savoye: sky_2k.hdr (Radiance RGBE) → AgX(exp 1.4) → PPM.
// AgX portado 1:1 de three/src/renderers/shaders/ShaderChunk/tonemapping_pars_fragment.glsl.js
import { readFileSync, writeFileSync } from "node:fs";

const HDR = process.argv[2];
const OUT = process.argv[3];

const buf = readFileSync(HDR);

// ── parse header ──
let pos = 0;
const readLine = () => {
  let end = pos;
  while (buf[end] !== 0x0a) end++;
  const line = buf.toString("ascii", pos, end);
  pos = end + 1;
  return line;
};
let line = readLine();
if (!line.startsWith("#?")) throw new Error("no es Radiance");
while ((line = readLine()) !== "") { /* headers */ }
const dims = readLine().match(/-Y (\d+) \+X (\d+)/);
if (!dims) throw new Error("orientacion no soportada: " + line);
const H = parseInt(dims[1], 10);
const W = parseInt(dims[2], 10);

// ── decode scanlines (nuevo RLE de Radiance) ──
const rgbe = new Uint8Array(W * H * 4);
for (let y = 0; y < H; y++) {
  const rowStart = y * W * 4;
  if (buf[pos] === 2 && buf[pos + 1] === 2 && ((buf[pos + 2] << 8) | buf[pos + 3]) === W) {
    pos += 4;
    for (let c = 0; c < 4; c++) {
      let x = 0;
      while (x < W) {
        let count = buf[pos++];
        if (count > 128) {
          count -= 128;
          const v = buf[pos++];
          for (let i = 0; i < count; i++) rgbe[rowStart + (x + i) * 4 + c] = v;
        } else {
          for (let i = 0; i < count; i++) rgbe[rowStart + (x + i) * 4 + c] = buf[pos++];
        }
        x += count;
      }
    }
  } else {
    // scanline plana (sin RLE)
    for (let x = 0; x < W; x++) for (let c = 0; c < 4; c++) rgbe[rowStart + x * 4 + c] = buf[pos++];
  }
}

// ── AgX (three r160+) ──
const IN = [0.856627153315983, 0.137318972929847, 0.11189821299995, 0.0951212405381588, 0.761241990602591, 0.0767994186031903, 0.0482516061458583, 0.101439036467562, 0.811302368396859];
const OUTM = [1.1271005818144368, -0.1413297634984383, -0.14132976349843826, -0.11060664309660323, 1.157823702216272, -0.11060664309660294, -0.016493938717834573, -0.016493938717834257, 1.2519364065950405];
const TO2020 = [0.6274, 0.0691, 0.0164, 0.3293, 0.9195, 0.0880, 0.0433, 0.0113, 0.8956];
const TOSRGB = [1.6605, -0.1246, -0.0182, -0.5876, 1.1329, -0.1006, -0.0728, -0.0083, 1.1187];
const mul = (m, v) => [m[0] * v[0] + m[3] * v[1] + m[6] * v[2], m[1] * v[0] + m[4] * v[1] + m[7] * v[2], m[2] * v[0] + m[5] * v[1] + m[8] * v[2]];
const sig = (x) => { const x2 = x * x, x4 = x2 * x2; return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232; };
const MinEv = -12.47393, MaxEv = 4.026069, EXP = 1.4;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const oetf = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

const out = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  const e = rgbe[i * 4 + 3];
  let r = 0, g = 0, b = 0;
  if (e !== 0) {
    const f = Math.pow(2, e - 136); // 2^(e-128) / 256
    r = rgbe[i * 4] * f;
    g = rgbe[i * 4 + 1] * f;
    b = rgbe[i * 4 + 2] * f;
  }
  // SIN tone mapping: lineal/2.5 + OETF. El AgX lo aplica el runtime UNA
  // sola vez (doble AgX = cielo gris desaturado). backgroundIntensity 2.5
  // recupera la escala: AgX(exp*2.5*stored) == AgX(exp*hdr) para hdr<2.5.
  const SCALE = 2.5;
  out[i * 3] = Math.round(oetf(clamp01(r / SCALE)) * 255);
  out[i * 3 + 1] = Math.round(oetf(clamp01(g / SCALE)) * 255);
  out[i * 3 + 2] = Math.round(oetf(clamp01(b / SCALE)) * 255);
}

writeFileSync(OUT, Buffer.concat([Buffer.from(`P6\n${W} ${H}\n255\n`, "ascii"), out]));
console.log(`ok: ${W}x${H} → ${OUT}`);
