import type { Metadata } from "next";
import Link from "next/link";

import { Constelacion } from "@/components/lab/v4/constelacion/Constelacion";
import { Proyectos } from "@/components/lab/v4/Proyectos";
import { ESTRATOS } from "@/components/lab/v4/luna/tiempos";

/*
  Trabajo (Alejo, 15-oct): los servicios en detalle —con la constelación de las 14 capas, que pidió usar aquí— y
  los proyectos, como la página /work de fiddle.digital.
*/
export const metadata: Metadata = { title: "Trabajo · Castillo Studio", robots: { index: false, follow: false } };

export default function TrabajoPage() {
  return (
    <main className="v4-pagina" style={{ background: "var(--piedra-950)" }}>
      <section className="px-4 pb-10 pt-36 sm:px-12">
        <div className="mx-auto max-w-[1240px]">
          <p className="v4-mono" style={{ color: "var(--veta-oro)" }}>Trabajo</p>
          <h1 className="v4-display mt-5 max-w-[18ch] text-[clamp(44px,6.4vw,104px)] leading-[0.98]">Sitios para estudios de arquitectura e interiorismo.</h1>
          <p className="mt-7 max-w-[52ch] text-lg leading-relaxed" style={{ color: "var(--cuarzo-200)" }}>
            Diseño a la medida de tu obra, y debajo, todo lo que hace que cada consulta llegue, se guarde y se responda.
          </p>
        </div>
      </section>
      <Constelacion encabezado="h2" etiqueta="Servicios · la constelación" />
      <section aria-labelledby="v4-servicios-t" className="px-4 py-20 sm:px-12">
        <div className="mx-auto max-w-[1240px]">
          <h2 id="v4-servicios-t" className="v4-mono">Lo que incluye cada sitio</h2>
          <ol className="mt-8 grid gap-px overflow-hidden rounded-[18px] sm:grid-cols-2 lg:grid-cols-5" style={{ background: "var(--linea)" }}>
            {ESTRATOS.map((e, i) => (
              <li key={e.nombre} className="p-6" style={{ background: "var(--piedra-950)" }}>
                <p className="v4-mono" style={{ color: "var(--veta-oro)" }}>{String(i + 1).padStart(2, "0")}</p>
                <h3 className="v4-display mt-3 text-[24px] leading-tight">{e.nombre}</h3>
                <ul className="mt-4 grid gap-1.5 text-[15px]" style={{ color: "var(--cuarzo-200)" }}>
                  {e.capas.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Proyectos />
      <section className="px-4 pb-32 sm:px-12">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-6 border-t pt-10" style={{ borderColor: "var(--linea)" }}>
          <p className="v4-display text-[clamp(32px,4vw,60px)] leading-none">¿Tu estudio es el siguiente?</p>
          <Link href="/lab/v4/hablemos" className="v4-boton v4-boton-lleno">Hablemos</Link>
        </div>
      </section>
    </main>
  );
}
