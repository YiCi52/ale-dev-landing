import Image from "next/image";
import Link from "next/link";

import { CASE_MH_INTERIOR } from "@/lib/site";

import { Registro } from "./Registro";
import "./caso.css";

/*
  Caso MH Interior Design con la piel de la v5 (24-oct: Alejo, "cuando se entra al proyecto de Mari sigue con el tema
  anterior"). Mismo contenido que el caso anterior; el testimonio es el texto de Maria palabra por palabra (2026-07-11).
*/
const DECISIONES = [
  ["Dark editorial como firma", "Las competidoras del nicho se ven demasiado blancas y genéricas. La dirección visual parte de la paleta propia de la marca — carbón, crema cálida — con tipografía en mayúsculas y peso medio que deja que los renders protagonicen."],
  ["Bilingüe desde el día uno", "Español e inglés con detección automática del idioma del visitante. La diseñadora ya trabajó con clientes en Florida, USA — el sitio no podía cerrarle esa puerta."],
  ["Cada proyecto con su propia galería", "Seis proyectos, cuatro sistemas de galería distintos: doble columna día/noche para un DJ booth, sub-enlaces por tipología de habitación para un hotel, obra ejecutada vs renders para una colaboración internacional. El contenido manda sobre el template."],
] as const;

const CAPTURAS = [
  ["/casos/mhinterior/shot-1-hero.png", "Hero del sitio MH Interior Design con carrusel de proyectos a pantalla completa", "Carrusel editorial a pantalla completa"],
  ["/casos/mhinterior/shot-2-portafolio.png", "Grilla de portafolio borde a borde con proyectos personales", "Portafolio borde a borde"],
  ["/casos/mhinterior/shot-3-proyecto.png", "Detalle de proyecto Akanti con galería de renders", "Detalle de proyecto con galería propia"],
  ["/casos/mhinterior/shot-4-servicios.png", "Página de servicios con cuatro etapas e iconografía lineal", "Servicios en cuatro etapas con iconografía propia"],
] as const;

const STACK = ["Next.js 16", "React 19", "TypeScript", "Tailwind 4", "Supabase", "Make", "Vercel"];

export function CasoMH() {
  return (
    <article className="v5-caso v5-gutter" aria-labelledby="v5-caso-t">
      <nav aria-label="Migas de pan">
        <Link href="/trabajo" className="v5-mono v5-caso-volver">← Trabajo</Link>
      </nav>

      <header className="v5-caso-cabeza">
        <p className="v5-mono">Caso · Diseño interior</p>
        <h1 id="v5-caso-t" className="v5-display">MH Interior <span className="v5-luz">Design.</span></h1>
        <p className="v5-mono v5-caso-meta">Portafolio bilingüe para diseñadora de interiores · Bogotá · 2026</p>
        <div className="v5-caso-intro">
          <p className="v5-texto">Maria Hernández tenía obra de primer nivel y ningún lugar donde aterrizar a quien la buscaba. No quería “una página”: quería que su trabajo se viera como lo que vale.</p>
          <p className="v5-texto">Mientras tanto, cada interesado le llegaba por mensaje directo y se perdía entre conversaciones. Sin registro, sin seguimiento, y sin forma de saber cuántos se habían ido. Por eso no construimos una vitrina: construimos un sistema.</p>
        </div>
      </header>

      <section className="v5-caso-dos" aria-label="El encargo y las decisiones">
        <div>
          <p className="v5-mono">El encargo</p>
          <p className="v5-caso-grande">Seis proyectos, dos idiomas, y una regla: que nada se vea a plantilla.</p>
          <p className="v5-texto">Renders fotorrealistas, fotos de obra real y conceptos académicos conviviendo en un mismo sitio, cada uno con la estructura que su contenido pedía. Más un canal de contacto que le avisa a Maria en el momento en que alguien deja sus datos.</p>
        </div>
        <div>
          <p className="v5-mono">Decisiones</p>
          <ol className="v5-caso-decisiones">
            {DECISIONES.map(([titulo, texto], i) => (
              <li key={titulo}>
                <span className="v5-mono">{String(i + 1).padStart(2, "0")}</span>
                <h2>{titulo}</h2>
                <p className="v5-texto">{texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="v5-caso-sitio">
        <p id="v5-caso-sitio" className="v5-mono">El sitio</p>
        <div className="v5-caso-capturas">
          {CAPTURAS.map(([src, alt, pie], i) => (
            <figure key={src} className="v5-marco">
              <div className="v5-marco-foto">
                <Registro />
                <div className="v5-foto v5-caso-captura">
                  <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover object-top" />
                </div>
              </div>
              <figcaption className="v5-marco-pie v5-mono">{String(i + 1).padStart(2, "0")} · {pie}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="v5-caso-cita" aria-labelledby="v5-caso-testimonio">
        <p id="v5-caso-testimonio" className="v5-mono">Testimonio</p>
        <blockquote>
          <p className="v5-luz">“Trabajar con Alejandro fue una experiencia excelente. Su compromiso fue total, pendiente a cada detalle. Como diseñadora de interiores necesitaba una página web que reflejara mi estilo y él supo entender perfectamente mis necesidades. Supo manejar el proceso con paciencia, profesionalismo y una gran capacidad de adaptación. Gracias a su trabajo, hoy tengo una página funcional, estética y alineada con mi identidad profesional que me ha ayudado a conectar con nuevas oportunidades. Recomiendo su trabajo por su creatividad, compromiso y capacidad de transformar ideas en resultados que superan tus expectativas.”</p>
          <footer className="v5-mono">Maria Hernández · MH Interior Design</footer>
        </blockquote>
      </section>

      <section className="v5-caso-dos" aria-label="Stack, estado y sitio en vivo">
        <div>
          <p className="v5-mono">Stack</p>
          <ul className="v5-caso-stack">{STACK.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="v5-mono mt-12">Estado</p>
          <p className="v5-texto mt-4">Entregado y en producción. Form de contacto con notificación inmediata a la diseñadora, base de leads propia con retención definida y resumen semanal automático. La cliente aprobó cada fase sobre el sitio en vivo, no sobre mockups.</p>
        </div>
        <div className="v5-caso-vivo">
          <p className="v5-mono">En vivo</p>
          <p className="v5-texto">Recórrelo como lo haría un cliente de Maria: proyectos, galerías y contacto — en español o inglés.</p>
          <a href={CASE_MH_INTERIOR} target="_blank" rel="noopener noreferrer" className="v5-boton v5-boton-luz">Ver MH Interior Design ↗<span className="sr-only"> (se abre en una pestaña nueva)</span></a>
        </div>
      </section>
    </article>
  );
}
