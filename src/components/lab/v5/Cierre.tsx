import Link from "next/link";

import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site";

import { HABLEMOS, INICIO } from "./marca";

/* Cierre y pie: la invitación grande y los enlaces grandes (lo que pedía el análisis de la v4: CTA final + pie). */
export function Cierre() {
  return (
    <section className="v5-cierre v5-gutter" aria-labelledby="v5-cierre-t">
      <p className="v5-mono mb-8">Hablemos</p>
      <h2 id="v5-cierre-t" className="v5-display">¿Encendemos <span className="v5-luz">la tuya?</span></h2>
      <div className="mt-12 flex flex-wrap gap-3">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="v5-boton v5-boton-luz">Escríbeme por WhatsApp<span className="sr-only"> (se abre en una pestaña nueva)</span></a>
        <Link href={HABLEMOS} className="v5-boton v5-boton-linea">Prefiero el formulario</Link>
      </div>
      <footer className="v5-pie" role="contentinfo">
        <div className="grid gap-3">
          <span className="v5-mono">Castillo Studio</span>
          <span style={{ color: "var(--luna-300)" }}>Estudio web para arquitectura e interiorismo</span>
        </div>
        <div className="grid gap-3">
          <span className="v5-mono">Sitio</span>
          <Link className="v5-pie-grande" href={`${INICIO}/trabajo`}>Trabajo</Link>
          <Link className="v5-pie-grande" href={`${INICIO}/servicios`}>Servicios</Link>
        </div>
        <div className="grid gap-3">
          <span className="v5-mono">Contacto</span>
          <a className="v5-pie-grande" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY}<span className="sr-only"> (se abre en una pestaña nueva)</span></a>
          <Link className="v5-pie-grande" href={HABLEMOS}>Formulario</Link>
        </div>
        <div className="grid gap-3">
          <span className="v5-mono">Datos</span>
          <Link href="/privacidad">Política de privacidad</Link>
          <span style={{ color: "var(--apagado)" }}>© 2026 Castillo Studio</span>
        </div>
      </footer>
    </section>
  );
}
