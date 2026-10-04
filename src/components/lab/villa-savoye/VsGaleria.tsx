import Image from "next/image";

import type { Vista } from "./contenido";

/*
  Galería de vistas de la casa: la usan la promenade (estaciones en orden)
  y los recintos. Una tira de tarjetas con la foto del museo citada al pie.
*/

type Props = {
  id: string;
  titulo: string;
  intro: string;
  vistas: ReadonlyArray<Vista>;
};

export function VsGaleria({ id, titulo, intro, vistas }: Props) {
  return (
    <section className="vs-galeria" aria-labelledby={id}>
      <div className="vs-galeria-cabeza">
        <h2 id={id} className="vs-eyebrow">
          {titulo}
        </h2>
        <p>{intro}</p>
      </div>
      <ul className="vs-galeria-lista">
        {vistas.map((v) => (
          <li key={v.titulo} className="vs-galeria-item">
            <div className="vs-galeria-img">
              <Image src={v.imagen} alt={v.alt} fill sizes="(min-width: 960px) 33vw, 100vw" />
            </div>
            <h3>{v.titulo}</h3>
            <p>{v.texto}</p>
            <span className="vs-ref">Ref. foto {v.foto}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
