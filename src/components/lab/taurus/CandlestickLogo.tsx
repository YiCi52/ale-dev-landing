/**
 * Logo hecho literalmente de velas japonesas dispuestas en "V"/corona — la
 * traducción directa del brief ("our logo is formed from candles of a trading
 * chart"). SVG puro con glow rojo pulsante vía CSS.
 */

type Bar = {
  x: number;
  /** Altura del cuerpo. Crecen hacia el centro para formar la corona. */
  body: number;
  /** Mecha superior + inferior sumadas. */
  wick: number;
};

// Simétrico: sube hacia el centro y baja — silueta de corona/V invertida.
const BARS: readonly Bar[] = [
  { x: 8, body: 26, wick: 16 },
  { x: 24, body: 44, wick: 20 },
  { x: 40, body: 66, wick: 24 },
  { x: 56, body: 92, wick: 28 },
  { x: 72, body: 66, wick: 24 },
  { x: 88, body: 44, wick: 20 },
  { x: 104, body: 26, wick: 16 },
];

const BAR_WIDTH = 9;
const CENTER_Y = 70;

export function CandlestickLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 132"
      role="img"
      aria-label="Logo Taurus formado por velas de trading"
      fill="none"
    >
      {BARS.map((bar, index) => {
        const bodyTop = CENTER_Y - bar.body / 2;
        const wickTop = bodyTop - bar.wick / 2;
        const wickBottom = bodyTop + bar.body + bar.wick / 2;
        const cx = bar.x + BAR_WIDTH / 2;
        // Las velas centrales (más altas) van en blanco; las de los bordes, rojas.
        const isCore = bar.body > 60;
        const fill = isCore ? "#f4f4f6" : "#e5364b";

        return (
          <g key={index} style={{ ["--i" as string]: index }}>
            <line
              x1={cx}
              y1={wickTop}
              x2={cx}
              y2={wickBottom}
              stroke={fill}
              strokeWidth={1.4}
            />
            <rect
              x={bar.x}
              y={bodyTop}
              width={BAR_WIDTH}
              height={bar.body}
              rx={1.5}
              fill={fill}
            />
          </g>
        );
      })}
    </svg>
  );
}
