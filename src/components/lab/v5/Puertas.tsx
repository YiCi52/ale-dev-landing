import Link from "next/link";

import { RAIZ, TEXTOS, type Idioma } from "./textos";

/* Después del manifiesto: dos puertas grandes a las páginas de adentro (en vez de meter todo en el inicio). */
export function Puertas({ idioma = "es" }: { idioma?: Idioma }) {
  return (
    <nav aria-label={idioma === "es" ? "Siguiente" : "Next"} className="v5-puertas v5-gutter">
      {TEXTOS[idioma].puertas.map((p) => (
        <Link key={p.ruta} href={RAIZ[idioma] + p.ruta} className="v5-puerta">
          <span className="v5-mono">{p.rotulo}</span>
          <span className="v5-display v5-puerta-titulo">{p.titulo} <span aria-hidden className="v5-puerta-flecha">→</span></span>
          <span className="v5-texto">{p.texto}</span>
        </Link>
      ))}
    </nav>
  );
}
