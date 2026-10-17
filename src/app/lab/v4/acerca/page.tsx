import type { Metadata } from "next";
import Link from "next/link";

/*
  Acerca de (Alejo, 15-oct). Solo hechos que ya están dichos en la página: quién está detrás, a quién le hace sitios
  y cómo trabaja. (Falta su foto: el hueco queda marcado con un marco de piedra hasta que la mande.)
*/
export const metadata: Metadata = { title: "Acerca de · Castillo Studio", robots: { index: false, follow: false } };

const FORMA = [
  { titulo: "Primero tu obra", texto: "El sitio parte de tus proyectos: su luz, sus materiales y cómo quieres que se recorran." },
  { titulo: "Después, lo que no se ve", texto: "Formulario que filtra, base de datos propia, aviso a tu correo, respaldo semanal y seguridad desde el primer día." },
  { titulo: "Una persona, de principio a fin", texto: "Hablas conmigo en cada etapa: la propuesta, el diseño, la entrega y lo que venga después." },
];

export default function AcercaPage() {
  return (
    <main className="v4-pagina v4-piedra min-h-[100svh] px-4 pb-28 pt-36 sm:px-12">
      <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[7fr_5fr] lg:gap-24">
        <div>
          <p className="v4-mono" style={{ color: "var(--veta-oro)" }}>Acerca de</p>
          <h1 className="v4-display mt-5 text-[clamp(44px,6vw,96px)] leading-[0.98]">Castillo Studio es Alejandro Díaz del Castillo.</h1>
          <p className="mt-8 max-w-[52ch] text-lg leading-relaxed" style={{ color: "var(--cuarzo-200)" }}>
            Diseño y construyo sitios para estudios de arquitectura e interiorismo: páginas donde la obra se recorre y donde
            cada consulta llega registrada a tu correo. Estudio Ingeniería de Software y trabajo con un solo proyecto a la vez.
          </p>
        </div>
        <div className="v4-retrato" role="img" aria-label="Espacio para la foto de Alejandro" />
      </div>
      <ol className="mx-auto mt-24 grid max-w-[1240px] gap-px overflow-hidden rounded-[18px] md:grid-cols-3" style={{ background: "var(--linea)" }}>
        {FORMA.map((f, i) => (
          <li key={f.titulo} className="p-8" style={{ background: "rgba(10,11,15,.88)" }}>
            <p className="v4-mono" style={{ color: "var(--veta-oro)" }}>{String(i + 1).padStart(2, "0")}</p>
            <h2 className="v4-display mt-4 text-[28px] leading-tight">{f.titulo}</h2>
            <p className="mt-4 leading-relaxed" style={{ color: "var(--cuarzo-200)" }}>{f.texto}</p>
          </li>
        ))}
      </ol>
      <div className="mx-auto mt-20 flex max-w-[1240px] flex-wrap items-center gap-4">
        <Link href="/lab/v4/hablemos" className="v4-boton v4-boton-lleno">Hablemos</Link>
        <Link href="/lab/v4/trabajo" className="v4-boton">Ver el trabajo</Link>
      </div>
    </main>
  );
}
