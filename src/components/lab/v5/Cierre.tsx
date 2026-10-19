import Link from "next/link";

import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site";

import { HABLEMOS } from "./marca";
import { RAIZ, TEXTOS, type Idioma } from "./textos";

/* Cierre y pie: la invitación grande y los enlaces grandes (lo que pedía el análisis de la v4: CTA final + pie). */
export function Cierre({ idioma = "es" }: { idioma?: Idioma }) {
  const t = TEXTOS[idioma].cierre, raiz = RAIZ[idioma];
  const nueva = <span className="sr-only">{t.nueva}</span>;
  return (
    <section className="v5-cierre v5-gutter" aria-labelledby="v5-cierre-t">
      <p className="v5-mono mb-8">{t.rotulo}</p>
      <h2 id="v5-cierre-t" className="v5-display">{t.titulo} <span className="v5-luz">{t.tituloLuz}</span></h2>
      <div className="mt-12 flex flex-wrap gap-3">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="v5-boton v5-boton-luz">{t.whatsapp}{nueva}</a>
        <Link href={HABLEMOS} className="v5-boton v5-boton-linea" hrefLang="es">{t.formulario}</Link>
      </div>
      <footer className="v5-pie" role="contentinfo">
        <div className="grid gap-3">
          <span className="v5-mono">Castillo Studio</span>
          <span style={{ color: "var(--luna-300)" }}>{t.lema}</span>
        </div>
        <div className="grid gap-3">
          <span className="v5-mono">{t.sitio}</span>
          <Link className="v5-pie-grande" href={`${raiz}/trabajo`}>{TEXTOS[idioma].nav.trabajo}</Link>
          <Link className="v5-pie-grande" href={`${raiz}/servicios`}>{TEXTOS[idioma].nav.servicios}</Link>
        </div>
        <div className="grid gap-3">
          <span className="v5-mono">{t.contacto}</span>
          <a className="v5-pie-grande" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY}{nueva}</a>
          <Link className="v5-pie-grande" href={HABLEMOS} hrefLang="es">{t.formularioCorto}</Link>
        </div>
        <div className="grid gap-3">
          <span className="v5-mono">{t.datos}</span>
          <Link href="/privacidad">{t.privacidad}</Link>
          <span style={{ color: "var(--apagado)" }}>© 2026 Castillo Studio</span>
        </div>
      </footer>
    </section>
  );
}
