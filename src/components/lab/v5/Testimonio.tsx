import Link from "next/link";

import { TEXTOS, type Idioma } from "./textos";

/* Texto verbatim de María Hernández (11-jul-2026), las dos frases que usa la página actual; en inglés va traducido y lo dice. */
export function Testimonio({ idioma = "es" }: { idioma?: Idioma }) {
  const t = TEXTOS[idioma].testimonio;
  return (
    <section className="v5-testimonio v5-gutter" aria-labelledby="v5-testimonio-t">
      <figure>
        <p id="v5-testimonio-t" className="v5-mono mb-10">{t.rotulo}</p>
        <blockquote lang="es-CO">
          <p className="v5-luz" lang={idioma === "en" ? "en" : "es-CO"}>{t.cita}</p>
        </blockquote>
        <figcaption className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span style={{ color: "var(--luna-300)" }}>María Hernández · MH Interior Design{t.nota ? ` · ${t.nota}` : ""}</span>
          <Link href="/trabajo/mh-interior" className="v5-enlace v5-mono">{t.caso}</Link>
        </figcaption>
      </figure>
    </section>
  );
}
