import Image from "next/image";

import { RECORRIDO } from "./contenido";

/*
  El espacio reservado del recorrido (4-oct-2026). El recorrido por la
  promenade —zonas con scroll y transiciones automáticas— se produce con
  video y llega aquí cuando esté. Mientras tanto, la llegada a la casa en
  grande y una nota honesta de estado: nada de botones de "play" muertos.
*/

export function VsRecorrido() {
  return (
    <section className="vs-recorrido" aria-labelledby="vs-recorrido-titulo">
      <div className="vs-recorrido-marco">
        <Image
          src={RECORRIDO.imagen}
          alt={RECORRIDO.alt}
          fill
          sizes="100vw"
          className="vs-recorrido-img"
        />
        <div className="vs-recorrido-nota">
          <p className="vs-eyebrow">Recorrido · en producción</p>
          <h2 id="vs-recorrido-titulo" className="vs-recorrido-titulo">
            La promenade, zona por zona
          </h2>
          <p>
            Aquí vivirá el recorrido: la llegada bajo los pilotis, la rampa, el salón y el solárium,
            con el scroll en tus manos en cada zona.
          </p>
        </div>
      </div>
      <p className="vs-pie">
        {RECORRIDO.titulo} — {RECORRIDO.texto} <span className="vs-ref">Ref. foto {RECORRIDO.foto}</span>
      </p>
    </section>
  );
}
