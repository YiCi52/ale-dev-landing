import { Cruce } from "@/components/lab/v4/Cruce";
import { ObjetoPlano } from "@/components/lab/v4/ObjetoPlano";
import { Portada } from "@/components/lab/v4/Portada";
import { RioLuna } from "@/components/lab/v4/RioLuna";

/*
  Prototipo de la página v4 (13-oct-2026), para que Alejo juzgue la ESTRUCTURA:
  portada sobria → filas que se cruzan con los materiales → muestra que se vuelve
  plano → galería del río con la luna. Servicios y contacto se rediseñan después
  con la misma piel; acá solo queda marcado su lugar.
*/
export default function V4Page() {
  return (
    <main>
      <Portada />
      <Cruce />
      <ObjetoPlano />
      <RioLuna />
      <section id="v4-contacto" aria-labelledby="v4-cierre" className="v4-piedra flex min-h-[70svh] flex-col justify-center px-4 sm:px-12">
        <p className="v4-mono mb-4">Siguiente fase</p>
        <h2 id="v4-cierre" className="v4-display max-w-[16ch] text-[clamp(36px,6vw,84px)] leading-[1]">
          Servicios y contacto, con esta misma piel
        </h2>
        <p className="mt-6 max-w-[52ch]" style={{ color: "var(--cuarzo-200)" }}>
          El formulario, el aviso a tu correo y la política de datos ya funcionan en la página actual; aquí se rediseñan cuando la
          estructura de arriba quede aprobada.
        </p>
      </section>
    </main>
  );
}
