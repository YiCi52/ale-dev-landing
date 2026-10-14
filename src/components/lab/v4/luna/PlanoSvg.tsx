import { ESTRATOS, RASGOS, enDisco } from "./tiempos";

/*
  Dibujo del plano encima de la luna: llamadas a rasgos reales (derecha) y el corte en sección de la parte de abajo
  con sus estratos (izquierda). Todo en px de pantalla; el avance lo ponen las variables CSS --llamadas y --corte
  del contenedor, así el scroll no re-renderiza React.
*/
type Props = { w: number; h: number; cx: number; cy: number; r: number; angosto: boolean };

const CUERDA = 0.5;          // el corte pasa a media altura entre el centro y el borde de abajo
const GROSOR = 0.085;        // grosor de cada estrato, en radios

/** Banda de un estrato: anillo entre r1 y r2 recortado debajo de la cuerda. */
function banda(cx: number, cy: number, r1: number, r2: number, yc: number): string {
  const ext = (r: number) => Math.sqrt(Math.max(0, r * r - (yc - cy) ** 2));
  const a1 = ext(r1), a2 = ext(r2);
  if (a2 === 0) return `M${cx - a1},${yc} A${r1},${r1} 0 0 0 ${cx + a1},${yc} Z`;
  return `M${cx - a1},${yc} A${r1},${r1} 0 0 0 ${cx + a1},${yc} L${cx + a2},${yc} A${r2},${r2} 0 0 1 ${cx - a2},${yc} Z`;
}

const paso = (i: number, total: number, v: string) => `clamp(0, calc(var(${v}) * ${total} - ${i}), 1)`;

export function PlanoSvg({ w, h, cx, cy, r, angosto }: Props) {
  const yc = cy + r * CUERDA;
  const xEtiqueta = Math.min(w - 250, cx + r + 56);
  const ancho = Math.sqrt(r * r - (yc - cy) ** 2);
  return (
    <svg className="v4-plano-svg absolute inset-0 h-full w-full" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <defs>
        {["piedra", "nogal", "cuarzo"].map((m) => (
          <pattern key={m} id={`trama-${m}`} patternUnits="userSpaceOnUse" width={m === "nogal" ? 350 : 225} height={m === "nogal" ? 350 : 450}>
            <image href={`/lab/v4/materiales/trama-${m}.webp`} width={m === "nogal" ? 350 : 225} height={m === "nogal" ? 350 : 450} preserveAspectRatio="xMidYMid slice" />
          </pattern>
        ))}
        <clipPath id="v4-corte-baja">
          <rect x={0} y={yc} width={w} height={h} className="v4-corte-cortina" />
        </clipPath>
      </defs>

      {/* llamadas: punto en el rasgo, línea quebrada y etiqueta con coordenadas (solo en pantalla ancha) */}
      {!angosto && RASGOS.map((ra, i) => {
        const [dx, dy] = enDisco(ra.lat, ra.lon);
        const px = cx + dx * r, py = cy + dy * r, ly = cy - r * 0.78 + i * (r * 0.3);
        const v = paso(i, RASGOS.length, "--llamadas");
        return (
          <g key={ra.nombre} style={{ opacity: v }}>
            <circle cx={px} cy={py} r={2.6} className="v4-plano-tinta" />
            <polyline points={`${px},${py} ${xEtiqueta - 18},${ly} ${xEtiqueta - 6},${ly}`} pathLength={1} className="v4-plano-linea" style={{ strokeDashoffset: `calc(1 - ${v})` }} />
            <text x={xEtiqueta} y={ly - 4} className="v4-plano-nombre">{ra.nombre}</text>
            <text x={xEtiqueta} y={ly + 13} className="v4-plano-coord">
              {Math.abs(ra.lat).toFixed(1).replace(".", ",")}° {ra.lat >= 0 ? "N" : "S"} · {Math.abs(ra.lon).toFixed(1).replace(".", ",")}° {ra.lon >= 0 ? "E" : "O"}
            </text>
          </g>
        );
      })}

      {/* el corte: la cuerda se traza, la tapa baja un poco (despiece) y aparecen los estratos con su material */}
      <line x1={cx - ancho} y1={yc} x2={cx + ancho} y2={yc} pathLength={1} className="v4-plano-linea v4-corte-cuerda" />
      <g className="v4-corte-tapa" clipPath="url(#v4-corte-baja)">
        {ESTRATOS.map((e, i) => (
          <path key={e.nombre} d={banda(cx, cy, r * (1 - i * GROSOR), r * (1 - (i + 1) * GROSOR), yc)} fill={`url(#trama-${e.material})`} className="v4-corte-estrato" />
        ))}
        <path d={banda(cx, cy, r * (1 - ESTRATOS.length * GROSOR), 0, yc)} className="v4-corte-nucleo" />
        {ESTRATOS.map((e, i) => (
          <path key={`l${e.nombre}`} d={banda(cx, cy, r * (1 - i * GROSOR), r * (1 - i * GROSOR) - 0.001, yc)} className="v4-plano-linea-fija" />
        ))}
      </g>
      {ESTRATOS.map((e, i) => {
        const rm = r * (1 - (i + 0.5) * GROSOR), ang = ((122 + i * 3) * Math.PI) / 180;
        const px = cx + rm * Math.cos(ang), py = cy + rm * Math.sin(ang);
        const lx = angosto ? 16 : Math.max(24, cx - r - 330), ly = angosto ? cy + r + 34 + i * 32 : yc + 18 + i * 40;
        const v = paso(i, ESTRATOS.length, "--corte-etiquetas");
        return (
          <g key={`e${e.nombre}`} style={{ opacity: v }}>
            {!angosto && <polyline points={`${px},${py} ${lx + 300},${ly} ${lx + 290},${ly}`} pathLength={1} className="v4-plano-linea" style={{ strokeDashoffset: `calc(1 - ${v})` }} />}
            <text x={lx} y={ly - 2} className="v4-plano-nombre">{String(i + 1).padStart(2, "0")} · {e.nombre}</text>
            <text x={lx} y={ly + 14} className="v4-plano-coord">{e.detalle}</text>
          </g>
        );
      })}
    </svg>
  );
}
