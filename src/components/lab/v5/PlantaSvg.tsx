import type { CSSProperties, ReactNode } from "react";

/*
  La planta en tinta (Alejo, 20-oct: "el plano de la luna de la v4 sí estaba hermoso"). Se dibuja en metros con las cajas
  reales del modelo de Blender (scripts/v5/casa_luna.py, pasada "geometria"): plinto 22,00 × 9,50, caja de vidrio
  15,50 × 7,20 y el volumen de piedra de arriba, 24,00 m, en proyección. Corte a 1,20 m sobre el piso (+0,55).
  La sección A–A' se quitó (21-oct): el corte no se muestra, así que su marca solo confundía.
  Cada trazo se dibuja solo con el scroll: el contenedor pone --trazo (0–1) y --relleno (0–1), y cada línea tiene
  su turno en --i, así el scroll no re-renderiza React.
*/

/** Rectángulo en coordenadas del mundo (x a la derecha, y al norte) pasado al SVG (y hacia abajo). */
function caja(x0: number, y0: number, x1: number, y1: number) {
  return { x: x0, y: -y1, width: x1 - x0, height: y1 - y0 };
}
const turno = (i: number): CSSProperties => ({ "--i": i } as CSSProperties);

type TrazoProps = { i: number; children?: ReactNode; className?: string; d: string };
function Trazo({ i, className = "", d }: TrazoProps) {
  return <path d={d} pathLength={1} className={`v5p-trazo ${className}`} style={turno(i)} />;
}
const marco = (x0: number, y0: number, x1: number, y1: number) => `M${x0} ${-y0}H${x1}V${-y1}H${x0}Z`;
const linea = (x0: number, y0: number, x1: number, y1: number) => `M${x0} ${-y0}L${x1} ${-y1}`;

/** Recintos que señalan cada parte del sistema; mismas posiciones que usa la pasada "planta" del render. */
export const MARCAS = [
  { id: "proyectos", x: -6, y: 4.1 },
  { id: "recorrido", x: -7.6, y: 1.4 },
  { id: "formulario", x: -3.2, y: 0.9 },
  { id: "aviso", x: 3.6, y: 2.9 },
  { id: "respaldo", x: 10.9, y: 1.4 },
] as const;

function Cota({ i, x0, x1, y, texto }: { i: number; x0: number; x1: number; y: number; texto: string }) {
  const t = 0.28;
  return (
    <g className="v5p-cota">
      <Trazo i={i} d={`${linea(x0, y, x1, y)}M${x0 - t} ${-y + t}L${x0 + t} ${-y - t}M${x1 - t} ${-y + t}L${x1 + t} ${-y - t}`} />
      <text x={(x0 + x1) / 2} y={-y - 0.3} textAnchor="middle">{texto}</text>
    </g>
  );
}

function CotaV({ i, y0, y1, x, texto }: { i: number; y0: number; y1: number; x: number; texto: string }) {
  const t = 0.28;
  return (
    <g className="v5p-cota">
      <Trazo i={i} d={`${linea(x, y0, x, y1)}M${x - t} ${-y0 + t}L${x + t} ${-y0 - t}M${x - t} ${-y1 + t}L${x + t} ${-y1 - t}`} />
      <text x={x - 0.35} y={-(y0 + y1) / 2} textAnchor="middle" transform={`rotate(-90 ${x - 0.35} ${-(y0 + y1) / 2})`}>{texto}</text>
    </g>
  );
}

export function PlantaSvg({ corte, nombres }: { corte: string; nombres: readonly string[] }) {
  return (
    // viewBox = el último cuadro de la subida de cámara (1440×810) en metros: 48,5 px/m, ajustado con las 5 anclas de
    // planta.json (error < 0,06 %). Con "slice" la planta queda encima del cuadro, igual que el lienzo en modo cover.
    <svg className="v5p-svg" viewBox="-14.341 -9.552 29.67 16.727" preserveAspectRatio="xMidYMid slice" role="img" aria-label={corte}>
      <defs>
        <pattern id="v5p-agua" width="1.6" height="0.55" patternUnits="userSpaceOnUse">
          <path d="M0.1 0.28h0.55M0.95 0.08h0.4" className="v5p-patron" />
        </pattern>
        <pattern id="v5p-piso" width="1.2" height="1.2" patternUnits="userSpaceOnUse">
          <path d="M1.2 0V1.2M0 1.2H1.2" className="v5p-patron v5p-patron-suave" />
        </pattern>
        <pattern id="v5p-piedra" width="0.45" height="0.45" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0V0.45" className="v5p-patron" />
        </pattern>
        <pattern id="v5p-nogal" width="0.3" height="0.3" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <path d="M0 0V0.3" className="v5p-patron v5p-patron-nogal" />
        </pattern>
      </defs>

      {/* rellenos: aparecen cuando el dibujo ya está */}
      <g className="v5p-rellenos">
        <rect {...caja(-14.4, -7.3, 15.4, -4.5)} fill="url(#v5p-agua)" />
        <rect {...caja(-11.5, -4.2, 14.5, 8.5)} fill="url(#v5p-piso)" />
        <rect {...caja(-11, -3.55, 11, 5.95)} className="v5p-plinto" />
        <rect {...caja(-8.25, -2.2, 7.25, 5)} className="v5p-interior" />
        <rect {...caja(-8.25, 4.775, 7.25, 5.025)} className="v5p-poche-nogal" />
        <rect {...caja(2, 1.3, 5.2, 4.5)} fill="url(#v5p-nogal)" className="v5p-nucleo" />
        <rect {...caja(13.8, -2.8, 14.4, 5.4)} fill="url(#v5p-piedra)" className="v5p-poche" />
        <rect {...caja(-5.3, 0.35, -1.1, 1.45)} className="v5p-cuarzo" />
        <rect {...caja(-3.5, 3.95, 2.5, 4.65)} fill="url(#v5p-piedra)" className="v5p-banca" />
      </g>

      {/* el dibujo, en el orden en que lo trazaría alguien a mano: bordes, cajas, muros, muebles, detalles */}
      <g className="v5p-tinta">
        <Trazo i={0} className="v5p-fino" d={marco(-11.5, -4.5, 14.5, 8.5)} />
        <Trazo i={0.04} d={`${linea(-14.4, -4.5, 15.4, -4.5)}${linea(-14.4, -4.2, 15.4, -4.2)}`} />
        <Trazo i={0.08} className="v5p-medio" d={marco(-11, -3.55, 11, 5.95)} />
        <Trazo i={0.14} d={marco(-8.25, -2.2, 7.25, 5)} />
        <Trazo i={0.2} className="v5p-grueso" d={marco(-8.25, 4.775, 7.25, 5.025)} />
        <Trazo i={0.24} className="v5p-grueso" d={marco(2, 1.3, 5.2, 4.5)} />
        <Trazo i={0.28} className="v5p-grueso" d={marco(13.8, -2.8, 14.4, 5.4)} />
        {/* vidrio: doble línea fina con montantes cada 2,5 m */}
        <Trazo i={0.32} className="v5p-vidrio" d={`${linea(-8.25, -2.22, 7.25, -2.22)}${linea(-8.25, -2.16, 7.25, -2.16)}${[-5.75, -3.25, -0.75, 1.75, 4.25].map((x) => linea(x, -2.25, x, -2.13)).join("")}`} />
        <Trazo i={0.36} className="v5p-vidrio" d={`${linea(-8.28, -2.2, -8.28, 5)}${linea(-8.22, -2.2, -8.22, 5)}${[0.2, 2.6].map((y) => linea(-8.31, y, -8.19, y)).join("")}`} />
        <Trazo i={0.42} d={`${marco(-5.3, 0.35, -1.1, 1.45)}M-4.6 -1.2C-3.9 -0.8 -3.2 -1.1 -2.4 -0.6M-3.6 -0.45C-3 -0.7 -2.2 -0.5 -1.5 -0.85`} />
        <Trazo i={0.46} d={marco(-3.5, 3.95, 2.5, 4.65)} />
        {/* pilotes de acero */}
        <Trazo i={0.5} className="v5p-medio" d={[[-8, -2], [-3, -2], [2, -2], [7, -2]].map(([x, y]) => marco(x - 0.09, y - 0.09, x + 0.09, y + 0.09)).join("") + marco(9.91, -2.39, 10.09, -2.21) + marco(9.91, 4.81, 10.09, 4.99)} />
        {/* corte A–A' */}
      </g>

      {/* volumen de arriba en proyección (punteado): aparece, no se traza */}
      <rect {...caja(-9.5, -2.8, 14.5, 5.4)} className="v5p-proyeccion" />

      <g className="v5p-textos">
        <Cota i={0.6} x0={-11} x1={11} y={9.3} texto="22,00" />
        <Cota i={0.64} x0={-8.25} x1={7.25} y={7.4} texto="15,50" />
        <CotaV i={0.68} y0={-3.55} y1={5.95} x={-11.9} texto="9,50" />
        <CotaV i={0.72} y0={-2.2} y1={5} x={-9.6} texto="7,20" />
        <text x={-7.6} y={-3.6} className="v5p-nivel">+0,55</text>
        <text x={-11.2} y={4.0} className="v5p-nivel">±0,00</text>
        <text x={7.6} y={3.3} className="v5p-nivel">VOLADIZO 24,00 · PISO 2</text>
        <text x={-12.2} y={5.4} className="v5p-nivel">ESPEJO DE AGUA</text>
        <g className="v5p-norte" transform="translate(13.4 -8.75)">
          <circle r={0.6} /><path d="M0 -0.45L0.22 0.3L0 0.16L-0.22 0.3Z" /><text y={-0.8} textAnchor="middle">N</text>
        </g>
        <g className="v5p-escala" transform="translate(9.2 6.1)">
          <path d="M0 0H5M0 -0.12V0.12M1 -0.08V0.08M2 -0.08V0.08M5 -0.12V0.12" /><text x={0} y={0.62}>0</text><text x={5} y={0.62} textAnchor="end">5 m</text>
        </g>
        <text x={-12.3} y={6.75} className="v5p-rotulo">{corte}</text>
      </g>

      <g className="v5p-marcas">
        {MARCAS.map((m, k) => (
          <g key={m.id} className="v5p-marca" data-llamada={m.id} style={turno(k / MARCAS.length)} transform={`translate(${m.x} ${-m.y})`}>
            <circle r={0.48} className="v5p-halo" />
            <circle r={0.48} />
            <text y={0.17} textAnchor="middle">{k + 1}</text>
            <title>{nombres[k]}</title>
          </g>
        ))}
      </g>
    </svg>
  );
}
