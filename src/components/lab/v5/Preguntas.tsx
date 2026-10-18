/* Preguntas frecuentes (lo que le faltaba a la v4 según el análisis del 17-oct: precio, plazo, qué incluye). */
const PREGUNTAS = [
  { q: "¿Cuánto cuesta?", a: "Un sitio parte de $3.600.000 COP. El precio exacto va en la propuesta, después de la llamada, con el alcance por escrito." },
  { q: "¿Cuánto se demora?", a: "Cinco semanas desde el anticipo. Si hay recorridos en 3D, el plazo se define en la propuesta." },
  { q: "¿Qué tengo que darte?", a: "Fotos de tus obras y, si quieres mostrarlos, los planos. Los textos los trabajamos juntos." },
  { q: "¿Tengo que saber de tecnología?", a: "No. Yo me encargo de todo; tú revisas y apruebas en una reunión." },
  { q: "¿Qué pasa después de la entrega?", a: "Tienes 30 días de soporte incluidos. Después puedes seguir con un plan mensual de cambios, respaldo y resumen de consultas." },
  { q: "¿Y los datos de mis clientes?", a: "El formulario pide consentimiento, los datos se guardan protegidos y se tratan según la Ley 1581 de Colombia." },
];

export function Preguntas() {
  return (
    <section id="v5-preguntas" className="v5-preguntas v5-gutter" aria-labelledby="v5-preguntas-t">
      <div className="v5-preguntas-grilla">
        <div>
          <p className="v5-mono mb-5">Preguntas</p>
          <h2 id="v5-preguntas-t" className="v5-display text-[clamp(36px,4.6vw,72px)]">Antes de <span className="v5-luz">escribir</span></h2>
        </div>
        <div>
          {PREGUNTAS.map((p) => (
            <details key={p.q} className="v5-pregunta">
              <summary>{p.q}</summary>
              <p className="v5-texto">{p.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
