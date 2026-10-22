import { Retrato } from "./Retrato";
import "./sobre.css";
import { TEXTOS, type Idioma } from "./textos";

/*
  Sobre mí (Alejo, 20-oct: "falta el about"). Solo hechos ya dichos en la página y en su perfil: quién está detrás, a quién
  le hace sitios, qué estudia y cómo trabaja (texto de la v4, con el aviso a WhatsApp de la v5). El retrato es la misma
  foto de la página original (luz cálida de ventana: encaja con "luz prestada").
*/
export function SobreMi({ idioma = "es" }: { idioma?: Idioma }) {
  const t = TEXTOS[idioma].sobre;
  return (
    <section className="v5-sobre v5-gutter" aria-labelledby="v5-sobre-t">
      <div className="v5-sobre-cabeza">
        <div>
          <p className="v5-mono mb-5">{t.rotulo}</p>
          <h1 id="v5-sobre-t" className="v5-display text-[clamp(40px,5.6vw,92px)]">
            {t.titulo} <span className="v5-luz">{t.tituloLuz}</span>
          </h1>
          <p className="v5-texto mt-8 max-w-[54ch] text-[clamp(17px,1.4vw,20px)]">{t.texto}</p>
          <dl className="v5-sobre-datos" aria-label={t.datosAria}>
            {t.datos.map(([dato, valor]) => (
              <div key={dato}>
                <dt className="v5-mono">{dato}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Retrato alt={t.retratoAria} />
      </div>
      <p className="v5-mono mt-28 mb-2">{t.formaRotulo}</p>
      <ol className="v5-pasos" aria-label={t.formaRotulo}>
        {t.forma.map(([titulo, texto], i) => (
          <li key={titulo} className="v5-paso">
            <span className="v5-mono">{String(i + 1).padStart(2, "0")}</span>
            <h2>{titulo}</h2>
            <p className="v5-texto">{texto}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
