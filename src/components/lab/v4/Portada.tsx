/*
  Portada sobria (referencia: Zentro / StringTune): piedra negra de fondo,
  el nombre gigante en Marcellus y una línea que dice qué se hace y para quién.
*/
export function Portada() {
  return (
    <section aria-labelledby="v4-titulo" className="v4-piedra relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-4 pb-10 sm:px-12">
      <header className="v4-cab">
        <span className="v4-mono" style={{ color: "var(--cuarzo-50)" }}>
          Castillo Studio
        </span>
        <nav aria-label="Secciones" className="flex gap-6">
          <a className="v4-mono" href="#v4-proyectos" style={{ color: "var(--cuarzo-50)" }}>
            Proyectos
          </a>
          <a className="v4-mono" href="#v4-contacto" style={{ color: "var(--cuarzo-50)" }}>
            Contacto
          </a>
        </nav>
      </header>
      <p className="v4-mono mb-6 max-w-[34ch]">Para estudios de arquitectura e interiorismo</p>
      <h1 id="v4-titulo" className="v4-display text-[clamp(56px,17vw,260px)] leading-[0.82] tracking-[-0.01em]">
        CASTILLO
      </h1>
      <div className="mt-8 flex flex-col gap-6 border-t pt-6 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: "var(--linea)" }}>
        <p className="max-w-[46ch] text-lg leading-relaxed" style={{ color: "var(--cuarzo-200)" }}>
          Sitios donde el proyecto se recorre, y cada consulta llega registrada a tu correo.
        </p>
        <span className="v4-mono">Baja ↓</span>
      </div>
    </section>
  );
}
