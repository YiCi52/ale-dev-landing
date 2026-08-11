/*
  Cierre editorial + declaración de ficción (regla de labs: la pieza se
  declara homenaje, los CTA están muertos a propósito).
*/

export function VsHomenaje() {
  return (
    <footer className="vs-homenaje">
      <div className="vs-homenaje-texto">
        <h2 className="vs-eyebrow">Por qué esta casa</h2>
        <p>
          Casi un siglo después, la Villa Savoye sigue siendo la demostración más limpia de que una
          idea clara vale más que mil ornamentos: cinco decisiones, un volumen, y la arquitectura
          moderna entera cabe adentro.
        </p>
        <p>
          Este microsite aplica su propia lección — cada capa existe por una razón, y se puede
          explicar en una frase. Así diseñamos también las páginas: por capas que se sostienen
          solas.
        </p>
      </div>
      <div className="vs-declaracion">
        <p>
          Pieza de estudio de <b>Castillo Studio</b> — homenaje no afiliado a la Fondation Le
          Corbusier ni al Centre des monuments nationaux. La Villa Savoye real está en Poissy y se
          puede visitar. Modelo 3D procedural propio, estilizado sobre la obra original.
        </p>
        <p className="vs-declaracion-refs">
          Referencias de construcción: ensamblaje por scroll (igloo.inc) · verde de la planta baja:
          polychromie de Le Corbusier · tipografía grotesca en homenaje al estilo internacional.
        </p>
      </div>
    </footer>
  );
}
