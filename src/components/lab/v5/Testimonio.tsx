import Link from "next/link";

/* Texto verbatim de María Hernández (11-jul-2026), las dos frases que usa la página actual. */
export function Testimonio() {
  return (
    <section className="v5-testimonio v5-gutter" aria-labelledby="v5-testimonio-t">
      <figure>
        <p id="v5-testimonio-t" className="v5-mono mb-10">Una clienta</p>
        <blockquote>
          <p className="v5-luz">
            “Como diseñadora de interiores necesitaba una página web que reflejara mi estilo y él supo entender perfectamente
            mis necesidades. Hoy tengo una página funcional, estética y alineada con mi identidad profesional que me ha ayudado
            a conectar con nuevas oportunidades.”
          </p>
        </blockquote>
        <figcaption className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span style={{ color: "var(--luna-300)" }}>María Hernández · MH Interior Design</span>
          <Link href="/trabajo/mh-interior" className="v5-enlace v5-mono">Ver el caso completo</Link>
        </figcaption>
      </figure>
    </section>
  );
}
