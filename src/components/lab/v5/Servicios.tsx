import { TEXTOS, type Idioma } from "./textos";

/*
  Servicios como lista tipográfica que se enciende al pasar (referencia: fiddle.digital y la plantilla mondragon), y el
  proceso en tres pasos (es una secuencia real, por eso va numerado). El "yo me encargo de todo, tú apruebas en una
  reunión" sale de lo que dijo Pablo Botero el 13-oct: el freno del cliente es su tiempo.
*/
export function Servicios({ idioma = "es" }: { idioma?: Idioma }) {
  const t = TEXTOS[idioma].servicios;
  return (
    <section id="v5-servicios" className="v5-servicios v5-gutter" aria-labelledby="v5-servicios-t">
      <p className="v5-mono mb-5">{t.rotulo}</p>
      <h2 id="v5-servicios-t" className="v5-display mb-16 text-[clamp(40px,6vw,96px)]">{t.titulo} <span className="v5-luz">{t.tituloLuz}</span></h2>
      <div>
        {t.lista.map(([nombre, texto, dato]) => (
          <div key={nombre} className="v5-fila">
            <h3 className="v5-display"><span>{nombre}</span></h3>
            <div className="grid gap-3">
              <p className="v5-texto">{texto}</p>
              <p className="v5-mono" style={{ color: "var(--oro)" }}>{dato}</p>
            </div>
          </div>
        ))}
      </div>
      <ol className="v5-pasos" aria-label={t.pasosAria}>
        {t.pasos.map(([titulo, texto], i) => (
          <li key={titulo} className="v5-paso">
            <span className="v5-mono">{String(i + 1).padStart(2, "0")}</span>
            <h3>{titulo}</h3>
            <p className="v5-texto">{texto}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
