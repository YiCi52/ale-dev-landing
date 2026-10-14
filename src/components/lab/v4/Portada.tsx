import { ArcoLuz } from "./ArcoLuz";

/*
  Hero v4 — "el arco de luz" (plantilla 165-5, elegida por Alejo el 14-oct): piedra negra
  de base, una línea de luz como el halo del eclipse que anuncia la galería, y el nombre
  abierto en Marcellus. Las letras suben una a una cuando el arco termina de dibujarse.
*/
const NOMBRE = "CASTILLO";

export function Portada() {
  return (
    <section aria-labelledby="v4-titulo" className="v4-portada relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 text-center">
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
      <ArcoLuz />
      <div className="relative mt-[18svh] flex flex-col items-center">
        <p className="v4-mono v4-entra" style={{ animationDelay: "calc(var(--v4-intro) + 1300ms)" }}>
          Estudio web para arquitectura e interiorismo
        </p>
        <h1 id="v4-titulo" aria-label={NOMBRE} className="v4-display v4-nombre mt-6">
          {NOMBRE.split("").map((letra, i) => (
            <span key={i} aria-hidden className="v4-letra" style={{ animationDelay: `calc(var(--v4-intro) + ${950 + i * 70}ms)` }}>
              {letra}
            </span>
          ))}
        </h1>
        <p className="v4-entra mt-8 max-w-[44ch] text-balance text-lg leading-relaxed" style={{ color: "var(--cuarzo-200)", animationDelay: "calc(var(--v4-intro) + 1600ms)" }}>
          Sitios donde tu obra se recorre, y cada consulta llega a tu correo.
        </p>
        <div className="v4-entra mt-10 flex flex-wrap justify-center gap-3" style={{ animationDelay: "calc(var(--v4-intro) + 1750ms)" }}>
          <a href="#v4-contacto" className="v4-boton v4-boton-lleno">
            Agendar 15 minutos
          </a>
          <a href="#v4-proyectos" className="v4-boton">
            Ver proyectos
          </a>
        </div>
      </div>
    </section>
  );
}
