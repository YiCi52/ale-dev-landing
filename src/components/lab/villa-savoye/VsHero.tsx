/*
  Hero tipográfico puro — la página es el museo, la casa llega después.
  Sin imágenes: tipo gigante + cotas mono, como lámina de publicación de
  arquitectura. El único color es el verde corbusiano en la regla y el hint.
*/

export function VsHero() {
  return (
    <header className="vs-hero">
      <p className="vs-eyebrow">Castillo · Lab — Casas icónicas, Nº 1</p>
      <h1 className="vs-hero-titulo">
        Villa
        <br />
        Savoye
      </h1>
      <div className="vs-hero-meta">
        <div className="vs-cota">
          <span>Ubicación</span>
          <b>Poissy, Francia</b>
        </div>
        <div className="vs-cota">
          <span>Proyecto</span>
          <b>1928 — 1931</b>
        </div>
        <div className="vs-cota">
          <span>Arquitectos</span>
          <b>Le Corbusier &amp; Pierre Jeanneret</b>
        </div>
      </div>
      <p className="vs-hero-lede">
        Una «máquina de habitar» que resume en un solo volumen blanco los cinco puntos de la
        arquitectura moderna. Aquí, la casa se desarma capa por capa — cada punto es una pieza.
      </p>
      <p className="vs-hero-hint" aria-hidden="true">
        Desplázate para desarmar <span className="vs-hint-flecha">↓</span>
      </p>
    </header>
  );
}
