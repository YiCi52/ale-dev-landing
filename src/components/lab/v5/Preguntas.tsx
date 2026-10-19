import { TEXTOS, type Idioma } from "./textos";

/* Preguntas frecuentes (lo que le faltaba a la v4 según el análisis del 17-oct: precio, plazo, qué incluye). */
export function Preguntas({ idioma = "es" }: { idioma?: Idioma }) {
  const t = TEXTOS[idioma].preguntas;
  return (
    <section id="v5-preguntas" className="v5-preguntas v5-gutter" aria-labelledby="v5-preguntas-t">
      <div className="v5-preguntas-grilla">
        <div>
          <p className="v5-mono mb-5">{t.rotulo}</p>
          <h2 id="v5-preguntas-t" className="v5-display text-[clamp(36px,4.6vw,72px)]">{t.titulo} <span className="v5-luz">{t.tituloLuz}</span></h2>
        </div>
        <div>
          {t.lista.map(([q, a]) => (
            <details key={q} className="v5-pregunta">
              <summary>{q}</summary>
              <p className="v5-texto">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
