import Image from "next/image";

import { PUNTOS } from "./contenido";

/*
  Los cinco puntos de la arquitectura moderna, cada uno con el lugar de la
  casa donde se ve. Reemplaza al "desarme" 3D de agosto: el contenido es el
  mismo, la evidencia ahora es la casa reconstruida.
*/

export function VsPuntos() {
  return (
    <section className="vs-puntos" aria-labelledby="vs-puntos-titulo">
      <h2 id="vs-puntos-titulo" className="vs-eyebrow">
        Los cinco puntos
      </h2>
      <ol className="vs-puntos-lista">
        {PUNTOS.map((p) => (
          <li key={p.n} className="vs-puntos-item">
            <div className="vs-puntos-img">
              <Image src={p.imagen} alt={p.alt} fill sizes="(min-width: 960px) 50vw, 100vw" />
            </div>
            <div className="vs-puntos-texto">
              <span className="vs-punto-n">{p.n}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
              <span className="vs-ref">Ref. foto {p.foto}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
