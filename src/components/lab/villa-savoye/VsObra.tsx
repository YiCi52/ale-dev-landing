import Image from "next/image";

/*
  Cómo se construyó (4-oct-2026). Es la parte que más dice de Castillo: la
  casa no se "modeló a ojo", se reconstruyó desde el plano y se cerró
  recinto por recinto contra fotografías. Cifras verificadas el 4-oct contra
  el expediente del lab (inventario de fotos y log de Blender).
*/

const CIFRAS = [
  { n: "1", k: "Plano DWG", v: "Los muros salen del archivo del plano, no de una imagen calcada." },
  { n: "107", k: "Fotografías revisadas", v: "Una por una, contra el modelo, para cada recinto y cada color." },
  { n: "2.419", k: "Piezas del modelo", v: "Muros, carpinterías, muebles y luminarias construidos por código." },
];

const METODO = [
  "Planta: los muros salen del DWG en metros reales.",
  "Sección: nada se extruye a techo sin ver el corte; las alturas se midieron en la fachada.",
  "Foto: cada color y cada mueble necesita una foto que lo muestre; si no la hay, se marca como interpretación o no se agrega.",
  "Cierre: un recinto está terminado cuando su render se compara con una foto real y coincide.",
];

export function VsObra() {
  return (
    <section className="vs-obra" aria-labelledby="vs-obra-titulo">
      <div className="vs-obra-cabeza">
        <h2 id="vs-obra-titulo" className="vs-eyebrow">
          Construida desde la evidencia
        </h2>
        <p className="vs-obra-lede">
          Cada muro viene del plano y cada recinto se cerró comparándolo con fotografías del museo.
          Lo que no estaba documentado se marca como interpretación.
        </p>
      </div>
      <dl className="vs-obra-cifras">
        {CIFRAS.map((c) => (
          <div key={c.k} className="vs-obra-cifra">
            <dt>
              <b>{c.n}</b> {c.k}
            </dt>
            <dd>{c.v}</dd>
          </div>
        ))}
      </dl>
      <div className="vs-obra-cuerpo">
        <div className="vs-obra-plano">
          <Image
            src="/lab/villa-savoye/v2/planta.webp"
            alt="Las tres plantas de la Villa Savoye extraídas del plano DWG, en metros."
            fill
            sizes="(min-width: 960px) 50vw, 100vw"
          />
        </div>
        <ol className="vs-obra-metodo">
          {METODO.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
