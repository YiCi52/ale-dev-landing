/**
 * Grano cinematográfico — overlay estático a pantalla completa (SVG feTurbulence).
 * Sin JS ni deps; sube la sensación premium por poca opacidad. pointer-none.
 */
export function Grain() {
  return (
    <div aria-hidden="true" className="grain-overlay">
      <svg xmlns="http://www.w3.org/2000/svg">
        <filter id="grain-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-noise)" />
      </svg>
    </div>
  );
}
