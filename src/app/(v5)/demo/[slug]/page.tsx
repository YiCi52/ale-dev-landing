import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Conversacion } from "@/components/demo/Conversacion";
import { TresPreguntas } from "@/components/demo/TresPreguntas";
import { DEMOS, demoPorSlug, ofertaTexto } from "@/lib/demos";

import "./demo.css";

/*
  /demo/<slug>: la página que se manda como toque 2. Un problema (el hecho público de esa empresa), una demostración con
  una persona ficticia, tres preguntas y agendar. Sin enlace desde el sitio y sin indexar: solo la ve quien recibe el enlace.
*/
export const dynamicParams = false;

export function generateStaticParams() {
  return DEMOS.map((d) => ({ slug: d.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const demo = demoPorSlug((await params).slug);
  if (!demo) return {};
  return {
    title: `${demo.nombre}: cómo se vería`,
    description: `Una demostración preparada para ${demo.nombre}, con una persona ficticia.`,
    // la vista previa del enlace en WhatsApp lleva la imagen de la marca
    openGraph: { title: `${demo.nombre}: cómo se vería`, description: `Una demostración preparada para ${demo.nombre}.`, images: ["/opengraph-image"] },
    robots: { index: false, follow: false },
  };
}

const CAMBIOS: Record<"clinica" | "estudio", [string, string][]> = {
  clinica: [
    ["Nadie queda sin respuesta", "Cada mensaje recibe una confirmación al instante, a cualquier hora."],
    ["El equipo deja de repetir lo mismo", "Les queda una respuesta sugerida; solo la revisan y la aprueban."],
    ["Saben quién está lista para agendar", "Cada consulta queda registrada con su origen y su urgencia."],
  ],
  estudio: [
    ["Nadie queda sin respuesta", "Cada consulta recibe una confirmación al instante, a cualquier hora."],
    ["Llegan con los datos completos", "Tipo de obra, metros y presupuesto, antes de la primera llamada."],
    ["Saben cuántas llegan y de dónde", "Cada consulta queda registrada, con un resumen semanal."],
  ],
};

export default async function DemoPage({ params }: Props) {
  const demo = demoPorSlug((await params).slug);
  if (!demo) notFound();
  const cambios = CAMBIOS[demo.tipo];

  return (
    <div className="dm-pagina">
      <section className="v5-gutter dm-hero" aria-labelledby="dm-titulo">
        <div className="dm-hero-in">
          <p className="v5-mono" style={{ color: "var(--calido)" }}>Para {demo.nombre}</p>
          <h1 id="dm-titulo" className="v5-display dm-h1">
            {demo.titulo.antes}
            <span className="v5-luz">{demo.titulo.luz}</span>
          </h1>
          <p className="v5-texto dm-hecho">{demo.hecho}</p>
          <div className="dm-hero-botones">
            <a className="v5-boton v5-boton-luz" href="#demo">Ver cómo se vería</a>
            <a className="v5-boton v5-boton-linea" href="#agendar">Agendar 15 minutos</a>
          </div>
        </div>
      </section>

      <section id="demo" className="v5-gutter dm-seccion" aria-labelledby="dm-demo-t">
        <p className="v5-mono">Lo que pasa con una consulta de noche</p>
        <h2 id="dm-demo-t" className="v5-display dm-h2">Llega a las 10 p. m. <span className="v5-luz">y no se pierde.</span></h2>
        <Conversacion demo={demo} />
      </section>

      <section className="v5-gutter dm-seccion" aria-labelledby="dm-cambia-t">
        <p className="v5-mono">Qué cambia</p>
        <h2 id="dm-cambia-t" className="v5-display dm-h2">Tres cosas, <span className="v5-luz">no cuarenta herramientas.</span></h2>
        <ul className="dm-cambios">
          {cambios.map(([t, c]) => (
            <li key={t}>
              <strong>{t}</strong>
              <span>{c}</span>
            </li>
          ))}
        </ul>
        <p className="v5-texto dm-oferta">
          Ustedes no tocan nada técnico: yo me encargo de todo y ustedes aprueban en una reunión.{" "}
          <strong>{ofertaTexto(demo.tipo)}</strong>
          {demo.tipo === "clinica" ? " El siguiente paso son los recordatorios de cita, para que no se pierdan valoraciones." : ""}
        </p>
      </section>

      <section id="agendar" className="v5-gutter dm-seccion dm-seccion--cierre" aria-labelledby="dm-agendar-t">
        <p className="v5-mono">Antes de agendar</p>
        <h2 id="dm-agendar-t" className="v5-display dm-h2">Tres preguntas, <span className="v5-luz">y hablamos 15 minutos.</span></h2>
        <TresPreguntas demo={demo} />
        <p className="dm-firma">Alejandro Díaz del Castillo · Castillo Studio, Bogotá</p>
      </section>
    </div>
  );
}
