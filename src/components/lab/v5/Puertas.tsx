import Link from "next/link";

/* Después del manifiesto: dos puertas grandes a las páginas de adentro (en vez de meter todo en el inicio). */
const PUERTAS = [
  { href: "/lab/v5/servicios", rotulo: "Por dentro", titulo: "Cómo funciona", texto: "De la fachada a la planta: lo que lleva cada sitio." },
  { href: "/lab/v5/trabajo", rotulo: "Trabajo", titulo: "Obras encendidas", texto: "Un sitio de cliente y un recorrido hecho desde los planos." },
];

export function Puertas() {
  return (
    <nav aria-label="Siguiente" className="v5-puertas v5-gutter">
      {PUERTAS.map((p) => (
        <Link key={p.href} href={p.href} className="v5-puerta">
          <span className="v5-mono">{p.rotulo}</span>
          <span className="v5-display v5-puerta-titulo">{p.titulo} <span aria-hidden className="v5-puerta-flecha">→</span></span>
          <span className="v5-texto">{p.texto}</span>
        </Link>
      ))}
    </nav>
  );
}
