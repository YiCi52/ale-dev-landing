import Link from "next/link";

import { C_LOGO, HABLEMOS, INICIO } from "./marca";
import { Tema } from "./Tema";

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
        <Link href={`${INICIO}/trabajo`}>Trabajo</Link>
        <Link href={`${INICIO}/servicios`}>Servicios</Link>
        <Link href={`${INICIO}/servicios#v5-preguntas`}>Preguntas</Link>
        <Tema />
        <Link href={HABLEMOS} className="v5-nav-hablemos">Hablemos</Link>
      </nav>
    </header>
  );
}
