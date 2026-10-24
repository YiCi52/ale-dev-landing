"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { idiomaDe, rutaEnOtro } from "./idioma";
import { pedirIntro } from "./Intro";
import { C_LOGO, HABLEMOS } from "./marca";
import { Tema } from "./Tema";
import { RAIZ, TEXTOS } from "./textos";

/*
  Cabecera v5: la C y el nombre juntos son el botón de inicio; a la derecha, una píldora de vidrio con las páginas, el
  cambio de tema, el cambio de idioma y "Hablemos" encendido. En celular quedan la marca, el tema, el idioma y "Hablemos".
*/
export function Cabecera() {
  const ruta = usePathname();
  const idioma = idiomaDe(ruta);
  const t = TEXTOS[idioma].nav, raiz = RAIZ[idioma];
  const hablemos = idioma === "es" ? HABLEMOS : `${raiz}/hablemos`;
  return (
    <header className="v5-cabecera v5-gutter" lang={idioma}>
      <Link href={raiz} className="v5-marca" aria-label={t.inicio} onClick={pedirIntro}>
        <svg viewBox="-110 -110 220 220" aria-hidden>
          <path d={C_LOGO} fill="currentColor" />
        </svg>
        <span className="v5-marca-texto">Castillo Studio</span>
      </Link>
      <nav aria-label={t.secciones} className="v5-nav">
        <Link href={`${raiz}/trabajo`}>{t.trabajo}</Link>
        <Link href={`${raiz}/servicios`}>{t.servicios}</Link>
        <Link href={`${raiz}/sobre-mi`}>{t.sobre}</Link>
        <Tema etiqueta={t.tema} />
        <Link href={rutaEnOtro(ruta)} className="v5-idioma" aria-label={t.otroNombre} hrefLang={idioma === "es" ? "en" : "es"}>{t.otro}</Link>
        <Link href={hablemos} className="v5-nav-hablemos" prefetch={false}>{t.hablemos}</Link>
      </nav>
    </header>
  );
}
