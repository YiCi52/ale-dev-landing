import Link from "next/link";

import { C_LOGO, HABLEMOS, INICIO } from "./marca";

/*
  Cabecera v5: la C y el nombre juntos son el botón de inicio; a la derecha, una píldora de vidrio con las secciones y
  "Hablemos" encendido. En celular quedan solo la marca y "Hablemos".
*/
export function Cabecera() {
  return (
    <header className="v5-cabecera v5-gutter">
      <Link href={INICIO} className="v5-marca" aria-label="Castillo Studio, inicio">
        <svg viewBox="-110 -110 220 220" aria-hidden>
          <path d={C_LOGO} fill="currentColor" />
        </svg>
        Castillo Studio
      </Link>
      <nav aria-label="Secciones" className="v5-nav">
        <a href={`${INICIO}#v5-trabajo`}>Trabajo</a>
        <a href={`${INICIO}#v5-servicios`}>Servicios</a>
        <a href={`${INICIO}#v5-preguntas`}>Preguntas</a>
        <Link href={HABLEMOS} className="v5-nav-hablemos">Hablemos</Link>
      </nav>
    </header>
  );
}
