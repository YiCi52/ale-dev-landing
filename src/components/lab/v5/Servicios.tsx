/*
  Servicios como lista tipográfica que se enciende al pasar (referencia: fiddle.digital y la plantilla mondragon), y el
  proceso en tres pasos (es una secuencia real, por eso va numerado). El "yo me encargo de todo, tú apruebas en una
  reunión" sale de lo que dijo Pablo Botero el 13-oct: el freno del cliente es su tiempo.
*/
const SERVICIOS = [
  { nombre: "Sitio a la medida", texto: "Diseño propio para tu estudio, con tus proyectos, tus planos y tu manera de mostrarlos.", dato: "Desde $3.600.000 COP · 5 semanas" },
  { nombre: "Captura", texto: "Formulario que filtra, aviso a tu WhatsApp y registro de cada consulta que llega.", dato: "Incluida en todo sitio" },
  { nombre: "Recorridos", texto: "La obra en secuencia o en 3D, hecha desde tus planos y tus fotos.", dato: "Se cotiza por obra" },
  { nombre: "Cuidado", texto: "Cambios, respaldo y un resumen de cuántas consultas llegaron y de dónde.", dato: "30 días incluidos · luego mensual" },
];

const PASOS = [
  { n: "01", titulo: "Quince minutos", texto: "Me cuentas de tu estudio y de la obra que quieres mostrar." },
  { n: "02", titulo: "Propuesta en 48 horas", texto: "Alcance, plazo y precio por escrito. Sin letra pequeña." },
  { n: "03", titulo: "Yo me encargo", texto: "Cinco semanas de trabajo. Tú revisas y apruebas en una reunión." },
];

export function Servicios() {
  return (
    <section id="v5-servicios" className="v5-servicios v5-gutter" aria-labelledby="v5-servicios-t">
      <p className="v5-mono mb-5">Servicios</p>
      <h2 id="v5-servicios-t" className="v5-display mb-16 text-[clamp(40px,6vw,96px)]">Lo que <span className="v5-luz">enciendo</span></h2>
      <div>
        {SERVICIOS.map((s) => (
          <div key={s.nombre} className="v5-fila" tabIndex={0}>
            <h3 className="v5-display">{s.nombre}</h3>
            <div className="grid gap-3">
              <p className="v5-texto">{s.texto}</p>
              <p className="v5-mono" style={{ color: "var(--oro)" }}>{s.dato}</p>
            </div>
          </div>
        ))}
      </div>
      <ol className="v5-pasos" aria-label="Cómo trabajamos">
        {PASOS.map((p) => (
          <li key={p.n} className="v5-paso">
            <span className="v5-mono">{p.n}</span>
            <h4>{p.titulo}</h4>
            <p className="v5-texto">{p.texto}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
