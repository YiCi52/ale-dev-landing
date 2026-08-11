/*
  Ficha técnica — el molde "listing" (v25 del banco): datos duros con labels
  mono estilo cota de plano. Todo dato es real y verificable.
*/

const DATOS = [
  { k: "Encargo", v: "Casa de campo para la familia Savoye" },
  { k: "Sistema", v: "Estructura Dom-ino — hormigón armado sobre pilotis" },
  { k: "Planta", v: "≈ 480 m² sobre retícula de 4,75 m" },
  { k: "Promenade", v: "Rampa interior continua, del vestíbulo al solárium" },
  { k: "Estado", v: "Monumento histórico de Francia desde 1965" },
  { k: "Custodia", v: "Centre des monuments nationaux — abierta al público" },
];

export function VsFicha() {
  return (
    <section className="vs-ficha" aria-labelledby="vs-ficha-titulo">
      <h2 id="vs-ficha-titulo" className="vs-eyebrow">
        Ficha técnica
      </h2>
      <dl className="vs-ficha-grid">
        {DATOS.map((d) => (
          <div key={d.k} className="vs-ficha-item">
            <dt>{d.k}</dt>
            <dd>{d.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
